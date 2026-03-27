import { createContext } from "react";

export interface WalletContextValue {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isFreighterInstalled: boolean | null;
  errorMessage: string | null;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  clearError: () => void;
}

export const WalletContext = createContext<WalletContextValue | undefined>(
  undefined,
);
