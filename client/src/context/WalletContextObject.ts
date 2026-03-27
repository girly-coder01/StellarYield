import { createContext } from "react";
import type { ConnectWalletOptions, WalletAddressType } from "../auth/types";

export interface WalletContextValue {
  walletAddress: string | null;
  walletAddressType: WalletAddressType | null;
  providerLabel: string | null;
  sessionKeyAddress: string | null;
  verificationStatus: "verified" | "degraded" | null;
  isConnected: boolean;
  isConnecting: boolean;
  isFreighterInstalled: boolean | null;
  errorMessage: string | null;
  connectWallet: (options?: ConnectWalletOptions) => Promise<boolean>;
  disconnectWallet: () => void;
  clearError: () => void;
}

export const WalletContext = createContext<WalletContextValue | undefined>(
  undefined,
);
