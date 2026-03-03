import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { WALLETCONNECT_PROJECT_ID } from './config';

export const config = getDefaultConfig({
  appName: 'TheologAI',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [base],
});
