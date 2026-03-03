export const RECIPIENT_ADDRESS = '0xf2BE3382cF48ef5CAf21Ca3B01C4e6fC3Ea04B04';

export const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const USDC_DECIMALS = 6;
export const USDC_SYMBOL = 'USDC';

export const BASE_CHAIN_ID = 8453;

export const WALLETCONNECT_PROJECT_ID = '53d0806b15e2bdacc58c0eeab63b1c5e';

export const SUGGESTED_AMOUNTS = [5, 10, 25, 50];

export const BASESCAN_TX_URL = 'https://basescan.org/tx/';

export const USDC_ABI = [
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
