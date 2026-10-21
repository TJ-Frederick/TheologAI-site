export const txHash = `0x${'a'.repeat(64)}`;
export const account = '0x1111111111111111111111111111111111111111';
export const recipient = '0xf2BE3382cF48ef5CAf21Ca3B01C4e6fC3Ea04B04';

export async function installWallet(page) {
  await page.addInitScript(({ account, txHash }) => {
    let chainId = '0x2105';
    let connected = false;
    const listeners = new Map();
    window.__walletRequests = [];
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      window.__cspViolations.push({ directive: event.violatedDirective, blocked: event.blockedURI });
    });
    const emit = (event, value) => listeners.get(event)?.forEach((handler) => handler(value));
    const provider = {
      isMetaMask: true,
      on(event, handler) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(handler); },
      removeListener(event, handler) { listeners.get(event)?.delete(handler); },
      async request({ method, params }) {
        window.__walletRequests.push({ method, params });
        switch (method) {
          case 'eth_chainId': return chainId;
          case 'eth_accounts': return connected ? [account] : [];
          case 'eth_requestAccounts': connected = true; return [account];
          case 'wallet_getPermissions': return connected ? [{ parentCapability: 'eth_accounts' }] : [];
          case 'wallet_requestPermissions': connected = true; return [{ parentCapability: 'eth_accounts' }];
          case 'wallet_getCapabilities': return {};
          case 'wallet_switchEthereumChain': chainId = params[0].chainId; emit('chainChanged', chainId); return null;
          case 'eth_getBalance': return '0x8ac7230489e80000';
          case 'eth_getCode': return '0x';
          case 'eth_sendTransaction':
            while (window.__holdTransaction) await new Promise((resolve) => setTimeout(resolve, 20));
            if (window.__rejectTransaction) throw Object.assign(new Error('User rejected the request.'), { code: 4001 });
            return txHash;
          default: throw Object.assign(new Error(`Unsupported test wallet method: ${method}`), { code: -32601 });
        }
      },
    };
    window.ethereum = provider;
    const announce = () => window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail: {
      info: { uuid: '11111111-1111-4111-8111-111111111111', name: 'Test Wallet', rdns: 'com.theologai.testwallet', icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>' },
      provider,
    } }));
    window.addEventListener('eip6963:requestProvider', announce);
    announce();
  }, { account, txHash });

  const state = { status: '0x1', rpcRequests: [] };
  await page.route('https://**/*', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    let payload;
    try { payload = route.request().postDataJSON(); } catch { return route.continue(); }
    if (!payload?.method && !Array.isArray(payload)) return route.continue();
    const response = (rpc) => {
      state.rpcRequests.push({ method: rpc.method, url: route.request().url() });
      let result;
      switch (rpc.method) {
        case 'eth_chainId': result = '0x2105'; break;
        case 'eth_blockNumber': result = '0x10'; break;
        case 'eth_getBalance': result = '0x8ac7230489e80000'; break;
        case 'eth_getCode': result = '0x'; break;
        case 'eth_call': result = state.status === '0x0'
          ? `0x08c379a0${(32).toString(16).padStart(64, '0')}${(20).toString(16).padStart(64, '0')}${Buffer.from('Transaction reverted').toString('hex').padEnd(64, '0')}`
          : `0x${'0'.repeat(63)}1`; break;
        case 'eth_getTransactionReceipt': result = {
          transactionHash: txHash, transactionIndex: '0x0', blockHash: txHash, blockNumber: '0x10',
          from: account, to: recipient, status: state.status, type: '0x2',
          cumulativeGasUsed: '0x5208', gasUsed: '0x5208', effectiveGasPrice: '0x1', logs: [],
          logsBloom: `0x${'0'.repeat(512)}`, contractAddress: null,
        }; break;
        case 'eth_getTransactionByHash': result = {
          hash: txHash, blockHash: txHash, blockNumber: '0x10', transactionIndex: '0x0', from: account,
          to: recipient, value: '0x0', input: '0x', gas: '0x5208', gasPrice: '0x1',
          nonce: '0x0', type: '0x2', chainId: '0x2105', accessList: [], maxFeePerGas: '0x1', maxPriorityFeePerGas: '0x1',
        }; break;
        default: result = '0x1';
      }
      return { jsonrpc: '2.0', id: rpc.id, result };
    };
    await route.fulfill({ json: Array.isArray(payload) ? payload.map(response) : response(payload) });
  });
  return state;
}

export async function openDonation(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Support TheologAI', exact: true }).click();
  return page.getByRole('dialog', { name: 'Support TheologAI', exact: true });
}

export async function connectWallet(page, dialog) {
  await dialog.getByRole('button', { name: 'Connect Wallet', exact: true }).click();
  await page.getByRole('button', { name: 'Test Wallet', exact: true }).click();
}
