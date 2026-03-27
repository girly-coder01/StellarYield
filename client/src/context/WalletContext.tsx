import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getAddress, isConnected, requestAccess } from "@stellar/freighter-api";
import { WalletContext } from "./WalletContextObject";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState<
    boolean | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const connectionResult = await isConnected();

        if (connectionResult.error || !connectionResult.isConnected) {
          setIsFreighterInstalled(false);
          return;
        }

        setIsFreighterInstalled(true);

        const addressResult = await getAddress();
        if (!addressResult.error) {
          setWalletAddress(addressResult.address);
        }
      } catch (error) {
        console.error("Unable to inspect Freighter connection", error);
        setIsFreighterInstalled(false);
      }
    }

    void checkConnection();
  }, []);

  async function connectWallet() {
    setIsConnecting(true);
    setErrorMessage(null);

    try {
      const connectionResult = await isConnected();

      if (connectionResult.error || !connectionResult.isConnected) {
        setIsFreighterInstalled(false);
        setErrorMessage(
          "Freighter extension was not detected. Install it to continue.",
        );
        return false;
      }

      setIsFreighterInstalled(true);

      const accessResult = await requestAccess();
      if (accessResult.error) {
        setErrorMessage(accessResult.error);
        return false;
      }

      const addressResult = await getAddress();
      if (addressResult.error) {
        setErrorMessage(addressResult.error);
        return false;
      }

      setWalletAddress(addressResult.address);
      return true;
    } catch (error) {
      console.error("Wallet connection failed", error);
      setErrorMessage("Wallet connection failed. Please try again.");
      return false;
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnectWallet() {
    setWalletAddress(null);
    setErrorMessage(null);
  }

  function clearError() {
    setErrorMessage(null);
  }

  const value = useMemo(
    () => ({
      walletAddress,
      isConnected: Boolean(walletAddress),
      isConnecting,
      isFreighterInstalled,
      errorMessage,
      connectWallet,
      disconnectWallet,
      clearError,
    }),
    [walletAddress, isConnecting, isFreighterInstalled, errorMessage],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
