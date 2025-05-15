import { UiWallet, useWallets } from "@wallet-standard/react";

export const SOLANA_SIGN_AND_SEND_TRANSACTION = "solana:signAndSendTransaction";

export function getWalletByName(walletName: string): UiWallet | undefined {
  const wallets = useWallets();

  const wallet = wallets
    .filter((w) => w.features.includes(SOLANA_SIGN_AND_SEND_TRANSACTION))
    .find((w) => w.name === walletName);

  return wallet;
}
