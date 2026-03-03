import { Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { config } from './wagmiConfig';
import Home from './pages/Home';
import Donate from './pages/Donate';

const queryClient = new QueryClient();

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#d4a843',
            accentColorForeground: '#1a1a1a',
            borderRadius: 'medium',
          })}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/donate" element={<Donate />} />
          </Routes>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
