export type WalletProviderId = "freighter" | "email" | "google" | "github";

export type WalletAddressType = "account" | "contract";

export type VerificationStatus = "verified" | "degraded";

export interface WalletSession {
  walletAddress: string;
  walletAddressType: WalletAddressType;
  providerId: WalletProviderId;
  providerLabel: string;
  sessionKeyAddress?: string;
  sessionSecret?: string;
  loginHint?: string;
  verificationStatus: VerificationStatus;
}

export interface ConnectWalletOptions {
  providerId?: WalletProviderId;
  identifier?: string;
}
