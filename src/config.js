export const RECIPIENT_ADDRESS = '0xf2BE3382cF48ef5CAf21Ca3B01C4e6fC3Ea04B04';

export const WALLETCONNECT_PROJECT_ID = '53d0806b15e2bdacc58c0eeab63b1c5e';

export const SUGGESTED_AMOUNTS = [1, 5, 10, 25];

export const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
];

export const SUPPORTED_TOKENS = [
  // Row 1 — Ethereum
  {
    id: 'usdc-ethereum',
    symbol: 'USDC',
    chain: 'Ethereum',
    chainId: 1,
    type: 'erc20',
    decimals: 6,
    contract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    explorerTxUrl: 'https://etherscan.io/tx/',
  },
  {
    id: 'eth-ethereum',
    symbol: 'ETH',
    chain: 'Ethereum',
    chainId: 1,
    type: 'native',
    decimals: 18,
    explorerTxUrl: 'https://etherscan.io/tx/',
  },
  // Row 2 — Base
  {
    id: 'usdc-base',
    symbol: 'USDC',
    chain: 'Base',
    chainId: 8453,
    type: 'erc20',
    decimals: 6,
    contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    explorerTxUrl: 'https://basescan.org/tx/',
  },
  {
    id: 'eth-base',
    symbol: 'ETH',
    chain: 'Base',
    chainId: 8453,
    type: 'native',
    decimals: 18,
    explorerTxUrl: 'https://basescan.org/tx/',
  },
  // Row 3 — Radius
  {
    id: 'sbc-radius',
    symbol: 'SBC',
    chain: 'Radius',
    chainId: 723,
    type: 'erc20',
    decimals: 6,
    contract: '0x33ad9e4bd16b69b5bfded37d8b5d9ff9aba014fb',
    explorerTxUrl: 'https://network.radiustech.xyz/tx/',
  },
];
