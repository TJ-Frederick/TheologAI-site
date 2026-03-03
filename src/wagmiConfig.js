import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, mainnet } from 'wagmi/chains';
import { WALLETCONNECT_PROJECT_ID } from './config';

const radius = {
  id: 723,
  name: 'Radius',
  nativeCurrency: { name: 'RUSD', symbol: 'RUSD', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.radiustech.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Radius Explorer', url: 'https://network.radiustech.xyz' },
  },
};

export const config = getDefaultConfig({
  appName: 'TheologAI',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [base, mainnet, radius],
});
