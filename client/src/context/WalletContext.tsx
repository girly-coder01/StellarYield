import { useEffect, useMemo, useState, type ReactNode } from "react";
import { isConnected } from "@stellar/freighter-api";
import {
  clearStoredSession,
  connectWalletSession,
  loadStoredSession,
} from "../auth/session";
import type { ConnectWalletOptions, WalletSession } from "../auth/types";
import { WalletContext } from "./WalletContextObject";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState<
    boolean | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSession(loadStoredSession());
  }, []);

  useEffect(() => {
    async function checkConnection() {
      try {
        const connectionResult = await isConnected();

        if (connectionResult.error || !connectionResult.isConnected) {
          setIsFreighterInstalled(false);
          return;
        }

        setIsFreighterInstalled(true);
      } catch (error) {
        console.error("Unable to inspect Freighter connection", error);
        setIsFreighterInstalled(false);
      }
    }

    void checkConnection();
  }, []);

  async function connectWallet(options?: ConnectWalletOptions) {
    setIsConnecting(true);
    setErrorMessage(null);

    try {
      const nextSession = await connectWalletSession(options);
      setSession(nextSession);
      return true;
    } catch (error) {
      console.error("Wallet connection failed", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Wallet connection failed. Please try again.",
      );
      return false;
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnectWallet() {
    clearStoredSession();
    setSession(null);
    setErrorMessage(null);
  }

  function clearError() {
    setErrorMessage(null);
  }

  const value = useMemo(
    () => ({
      walletAddress: session?.walletAddress ?? null,
      walletAddressType: session?.walletAddressType ?? null,
      providerLabel: session?.providerLabel ?? null,
      sessionKeyAddress: session?.sessionKeyAddress ?? null,
      verificationStatus: session?.verificationStatus ?? null,
      isConnected: Boolean(session?.walletAddress),
      isConnecting,
      isFreighterInstalled,
      errorMessage,
      connectWallet,
      disconnectWallet,
      clearError,
    }),
    [session, isConnecting, isFreighterInstalled, errorMessage],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
