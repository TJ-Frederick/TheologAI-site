import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { config } from "../wagmiConfig";
import DonateModal from "./DonateModal";

const queryClient = new QueryClient();

export default function DonationExperience({ onClose }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#d4a843",
            accentColorForeground: "#1a1a1a",
            borderRadius: "medium",
          })}
        >
          <DonateModal onClose={onClose} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
