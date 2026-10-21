import { createPublicClient, http, decodeEventLog, formatUnits } from 'viem';
import { base } from 'viem/chains';

const RECIPIENT = '0xf2BE3382cF48ef5CAf21Ca3B01C4e6fC3Ea04B04';
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const MAX_BODY_BYTES = 1024;

const TRANSFER_EVENT_ABI = [
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
];

const client = createPublicClient({
  chain: base,
  transport: http('https://base.drpc.org', { timeout: 8000, retryCount: 0 }),
});

function failure(error, status, headers) {
  return Response.json({ verified: false, error }, { status, headers });
}

export async function onRequest(context) {
  const { request } = context;
  if (request.method !== 'POST') {
    return failure('Method not allowed', 405, { Allow: 'POST' });
  }

  // Browser requests must originate on the site. Direct API clients need no cookies or credentials.
  const origin = request.headers.get('Origin');
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') {
    return failure('Cross-site requests are not allowed', 403);
  }
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return failure('Content-Type must be application/json', 415);
  }
  if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) {
    return failure('Request body is too large', 413);
  }

  let body;
  const reader = request.body?.getReader();
  try {
    // Enforce the limit while reading, including requests without a trustworthy Content-Length.
    const decoder = new TextDecoder();
    let size = 0;
    let text = '';
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BODY_BYTES) {
          await reader.cancel();
          return failure('Request body is too large', 413);
        }
        text += decoder.decode(value, { stream: true });
      }
    }
    body = JSON.parse(text + decoder.decode());
  } catch {
    return failure('Invalid JSON body', 400);
  } finally {
    reader?.releaseLock();
  }

  const txHash = body?.txHash;
  if (typeof txHash !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return failure('Invalid transaction hash', 400);
  }

  try {
    const receipt = await client.getTransactionReceipt({ hash: txHash });

    if (receipt.status !== 'success') {
      return Response.json(
        { verified: false, error: 'Transaction failed on-chain' },
        { status: 400 }
      );
    }

    // Find the USDC Transfer event log directed at our recipient
    let verifiedAmount = 0n;

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== USDC_CONTRACT.toLowerCase()) continue;

      try {
        const decoded = decodeEventLog({
          abi: TRANSFER_EVENT_ABI,
          data: log.data,
          topics: log.topics,
        });

        if (
          decoded.eventName === 'Transfer' &&
          decoded.args.to.toLowerCase() === RECIPIENT.toLowerCase() &&
          decoded.args.value > 0n
        ) {
          verifiedAmount += decoded.args.value;
        }
      } catch {
        // Not a matching event, skip
      }
    }

    if (verifiedAmount === 0n) {
      return Response.json(
        { verified: false, error: 'No matching USDC transfer to recipient found' },
        { status: 400 }
      );
    }

    return Response.json({
      verified: true,
      amount: formatUnits(verifiedAmount, 6),
      txHash,
    });
  } catch (err) {
    if (err?.name === 'TransactionReceiptNotFoundError') {
      return failure('Transaction receipt not found. Try again shortly.', 404);
    }
    console.error(JSON.stringify({
      event: 'donation_verification_failed',
      error: err?.name || 'UnknownError',
      status: typeof err?.status === 'number' ? err.status : null,
      cause: err?.cause?.name || null,
    }));
    return failure('Verification is temporarily unavailable. Check your transaction in the block explorer.', 502);
  }
}
