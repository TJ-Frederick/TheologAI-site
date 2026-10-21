import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { encodeEventTopics, encodeAbiParameters, parseAbi } from 'viem';
import { onRequest } from '../functions/api/verify-payment.js';
import { onRequest as secureResponse } from '../functions/api/_middleware.js';

const hash = `0x${'a'.repeat(64)}`;
const recipient = '0xf2BE3382cF48ef5CAf21Ca3B01C4e6fC3Ea04B04';
const sender = '0x1111111111111111111111111111111111111111';
const token = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const abi = parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)']);
let rpcCalls;
let result;
const realFetch = globalThis.fetch;

function transfer(value = 5_000_000n, to = recipient, address = token) {
  return {
    address,
    topics: encodeEventTopics({ abi, eventName: 'Transfer', args: { from: sender, to } }),
    data: encodeAbiParameters([{ type: 'uint256' }], [value]),
    logIndex: '0x0', transactionIndex: '0x0', transactionHash: hash,
    blockHash: hash, blockNumber: '0x10', removed: false,
  };
}

function request(body = JSON.stringify({ txHash: hash }), headers = {}, method = 'POST') {
  return new Request('https://theologai.xyz/api/verify-payment', {
    method, headers: { 'Content-Type': 'application/json', ...headers },
    ...(method === 'POST' ? { body } : {}),
  });
}

beforeEach(() => {
  rpcCalls = 0;
  result = {
    transactionHash: hash, blockHash: hash, blockNumber: '0x10', transactionIndex: '0x0',
    from: sender, to: token, status: '0x1', type: '0x2',
    cumulativeGasUsed: '0x5208', gasUsed: '0x5208', effectiveGasPrice: '0x1',
    logsBloom: `0x${'0'.repeat(512)}`, contractAddress: null, logs: [transfer()],
  };
  globalThis.fetch = async (_url, init) => {
    rpcCalls++;
    const rpc = JSON.parse(init.body);
    assert.equal(rpc.method, 'eth_getTransactionReceipt');
    assert.deepEqual(rpc.params, [hash]);
    return Response.json({ jsonrpc: '2.0', id: rpc.id, result });
  };
});
afterEach(() => { globalThis.fetch = realFetch; });

for (const invalid of [{}, null, [], { txHash: 123 }, { txHash: '0x' }, { txHash: `0x${'g'.repeat(64)}` }, { txHash: `${hash}00` }]) {
  test(`rejects invalid input before RPC: ${JSON.stringify(invalid)}`, async () => {
    const response = await onRequest({ request: request(JSON.stringify(invalid)) });
    assert.equal(response.status, 400);
    assert.equal(rpcCalls, 0);
  });
}

test('rejects malformed JSON, wrong media type, cross-site requests and unsupported methods', async () => {
  for (const [req, status] of [
    [request('{'), 400], [request('{}', { 'Content-Type': 'text/plain' }), 415],
    [request('{}', { Origin: 'https://evil.example' }), 403],
    [request('{}', { 'Sec-Fetch-Site': 'cross-site' }), 403], [request(undefined, {}, 'GET'), 405],
  ]) {
    const response = await onRequest({ request: req });
    assert.equal(response.status, status);
    if (status === 405) assert.equal(response.headers.get('Allow'), 'POST');
  }
  assert.equal(rpcCalls, 0);
});

test('enforces body byte limit with or without Content-Length and for split chunks', async () => {
  for (const headers of [{}, { 'Content-Length': '2048' }, { 'Content-Length': '1' }]) {
    assert.equal((await onRequest({ request: request(' '.repeat(1025), headers) })).status, 413);
  }
  const body = new ReadableStream({ start(controller) {
    controller.enqueue(new TextEncoder().encode(' '.repeat(600)));
    controller.enqueue(new TextEncoder().encode(' '.repeat(600)));
    controller.close();
  } });
  const streamed = new Request('https://theologai.xyz/api/verify-payment', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body, duplex: 'half',
  });
  assert.equal((await onRequest({ request: streamed })).status, 413);
  assert.equal(rpcCalls, 0);
});

test('verifies a successful Base USDC transfer and preserves exact amounts', async () => {
  result.logs = [transfer(9_007_199_254_740_993n), transfer(7n)];
  const response = await onRequest({ request: request(undefined, { Origin: 'https://theologai.xyz' }) });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { verified: true, amount: '9007199254.741', txHash: hash });
  assert.equal(rpcCalls, 1);
});

for (const [label, logs] of [
  ['wrong token', [transfer(5_000_000n, recipient, sender)]],
  ['wrong recipient', [transfer(5_000_000n, sender)]],
  ['zero value', [transfer(0n)]], ['missing transfer', []],
  ['malformed event', [{ address: token, topics: [], data: '0x' }]],
]) {
  test(`does not verify ${label}`, async () => {
    result.logs = logs;
    const response = await onRequest({ request: request() });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).verified, false);
  });
}

test('does not verify a reverted transaction or missing receipt', async () => {
  result.status = '0x0';
  assert.equal((await onRequest({ request: request() })).status, 400);
  result = null;
  assert.equal((await onRequest({ request: request() })).status, 404);
});

test('RPC failures have a controlled response and do not retry', async (t) => {
  const log = t.mock.method(console, 'error', () => {});
  globalThis.fetch = async () => { rpcCalls++; throw new Error('private upstream detail'); };
  const response = await onRequest({ request: request() });
  assert.equal(response.status, 502);
  assert.equal(rpcCalls, 1);
  assert.doesNotMatch(await response.text(), /private upstream detail|Version:|mainnet\.base/);
  assert.equal(log.mock.calls.length, 1);
  assert.doesNotMatch(log.mock.calls[0].arguments[0], /private upstream detail|0x[a-f0-9]{64}|https:/i);
});

test('API middleware secures successful and failed responses without changing their body/status', async () => {
  for (const status of [200, 400, 404, 405, 413, 415, 502]) {
    const response = await secureResponse({ next: async () => Response.json({ status }, { status }) });
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { status });
    assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
    assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.match(response.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
    assert.match(response.headers.get('Strict-Transport-Security'), /max-age=/);
  }
});

test('unexpected API failures retain security headers and a controlled error', async (t) => {
  t.mock.method(console, 'error', () => {});
  const response = await secureResponse({ next: async () => { throw new Error('internal detail'); } });
  assert.equal(response.status, 500);
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.deepEqual(await response.json(), { error: 'Request failed' });
});
