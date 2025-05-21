import { UiWallet, useWallets } from "@wallet-standard/react";

export const SOLANA_SIGN_AND_SEND_TRANSACTION = "solana:signAndSendTransaction";

export function useWalletByName(
  walletName: string | null | undefined,
): UiWallet | undefined | null {
  if (!walletName) {
    return null;
  }

  const wallets = useWallets();

  if (!wallets) {
    return null;
  }

  const wallet = wallets
    .filter((w) => w.features.includes(SOLANA_SIGN_AND_SEND_TRANSACTION))
    .find((w) => w.name === walletName);

  return wallet;
}
