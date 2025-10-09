import { type UiWallet, useWallets } from "@wallet-standard/react";

export const SOLANA_SIGN_AND_SEND_TRANSACTION_FEATURE =
  "solana:signAndSendTransaction";

export function useWalletByName(
  walletName: string,
): UiWallet | undefined | null {
  const supportedWallets = useSupportedWallets();

  return supportedWallets?.find((w) => w?.name === walletName);
}

export function useSupportedWallets(): UiWallet[] | null {
  const wallets = useWallets();

  const supportedWallets = wallets.filter((w) =>
    w.features.includes(SOLANA_SIGN_AND_SEND_TRANSACTION_FEATURE),
  );

  return supportedWallets
    ? supportedWallets.sort((a, b) => a.name.localeCompare(b.name))
    : null;
}
