import { ExternalLink, Wallet, X } from "lucide-react";
import { useWallet } from "../../context/useWallet";

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletConnectionModal({
  isOpen,
  onClose,
}: WalletConnectionModalProps) {
  const {
    connectWallet,
    isConnecting,
    isFreighterInstalled,
    errorMessage,
    clearError,
  } = useWallet();

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    clearError();
    onClose();
  };

  const handleConnect = async () => {
    const didConnect = await connectWallet();
    if (didConnect) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="glass-panel relative w-full max-w-md p-6 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-white"
          aria-label="Close wallet dialog"
        >
          <X size={18} />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-[#6C5DD3]/20 p-3 text-[#8f81f5]">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
              Stellar Wallet
            </p>
            <h2 className="text-2xl font-bold text-white">Connect Freighter</h2>
          </div>
        </div>

        <p className="mb-5 text-sm leading-6 text-gray-300">
          Connect your Freighter wallet to access Soroban-powered vault actions
          and persist your session across the dashboard.
        </p>

        {errorMessage ? (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}

        {isFreighterInstalled === false ? (
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary flex w-full items-center justify-center gap-2 py-3"
          >
            Install Freighter
            <ExternalLink size={16} />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => void handleConnect()}
            disabled={isConnecting}
            className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </div>
  );
}
