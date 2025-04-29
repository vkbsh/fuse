import {
  UiWallet,
  useConnect,
  useWallets,
  UiWalletAccount,
  uiWalletAccountsAreSame,
} from "@wallet-standard/react";
import { address } from "gill";
import { useCallback } from "react";
import { motion } from "motion/react";

import Dialog from "~/components/ui/Dialog";

import { useWalletStore } from "~/state/wallet";

export function ConnectWalletDialog({
  isOpen,
  children,
  onOpenChange,
}: {
  isOpen?: boolean;
  children?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog trigger={children} isOpen={isOpen} onOpenChange={onOpenChange}>
      <WalletOptions />
    </Dialog>
  );
}

function WalletOptions() {
  const wallets = useWallets();
  const { addWallet } = useWalletStore();

  // TODO: add message for no wallets found

  return (
    <div className="flex flex-col gap-6 w-80 p-8 m-auto bg-black text-white rounded-[40px]">
      <span className="text-xl font-bold text-center">Select wallet</span>
      <hr className=" opacity-20" />
      <div className="flex flex-col gap-6">
        {wallets
          .filter(
            (wallet) =>
              wallet.chains.includes("solana:mainnet") &&
              wallet.features.includes("solana:signAndSendTransaction"),
          )
          .map((wallet) => (
            <WalletOption
              key={wallet.name}
              wallet={wallet}
              onError={(err) => {
                console.error(err);
              }}
              onAccountSelect={(walletAccount) => {
                if (walletAccount) {
                  addWallet({
                    name: wallet.name,
                    icon: wallet.icon,
                    address: address(walletAccount.address),
                  });
                }
              }}
            />
          ))}
      </div>
    </div>
  );
}

function WalletOption({
  wallet,
  onError,
  onAccountSelect,
}: {
  wallet: UiWallet;
  onError(err: unknown): void;
  onAccountSelect(account: UiWalletAccount | null): void;
}) {
  const [isConnecting, connect] = useConnect(wallet);

  const handleConnectClick = useCallback(async () => {
    try {
      const existingAccounts = [...wallet.accounts];
      const nextAccounts = await connect();

      // Filter to accounts that support the features we need.
      const withSignAndSendTransaction = nextAccounts.filter(
        (nextAccount) =>
          nextAccount.features.includes("solana:signAndSendTransaction") &&
          nextAccount.chains.includes("solana:mainnet"),
      );

      // Try to choose the first never-before-seen account.
      for (const nextAccount of withSignAndSendTransaction) {
        if (
          !existingAccounts.some((existingAccount) =>
            uiWalletAccountsAreSame(nextAccount, existingAccount),
          )
        ) {
          onAccountSelect(nextAccount);
          return;
        }
      }
      // Failing that, choose the first account in the list.
      if (withSignAndSendTransaction[0]) {
        onAccountSelect(withSignAndSendTransaction[0]);
      }
    } catch (e) {
      onError(e);
    }
  }, [connect, onAccountSelect, onError, wallet.accounts]);

  if (isConnecting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-row items-center gap-6"
      >
        <span>Connecting...</span>
      </motion.div>
    );
  }

  return (
    <button
      onClick={handleConnectClick}
      className="cursor-pointer flex flex-row items-center gap-6"
    >
      <span className="w-[40px] h-[40px] rounded-[13px] bg-white flex items-center justify-center">
        <img width={24} height={24} src={wallet.icon} alt={wallet.name} />
      </span>
      <span className="font-semibold text-base">{wallet.name}</span>
    </button>
  );
}
