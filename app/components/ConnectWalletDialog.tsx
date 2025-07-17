import { toast } from "sonner";
import { motion } from "motion/react";
import { Address, address } from "gill";
import { ReactNode, useCallback, useEffect, useState } from "react";

import {
  UiWallet,
  useConnect,
  useWallets,
  uiWalletAccountsAreSame,
} from "@wallet-standard/react";

import { Dialog, DialogContent } from "~/components/ui/dialog";

import { useWalletStore } from "~/state/wallet";
import { useMultisigWallets } from "~/hooks/resources";
import { SOLANA_SIGN_AND_SEND_TRANSACTION_FEATURE } from "~/hooks/wallet";

import { abbreviateAddress } from "~/lib/address";

export default function ConnectWalletDialog({
  children,
}: {
  children: ReactNode;
}) {
  const { walletHistory } = useWalletStore();

  const wallets = useWallets();
  const supportedWallets = wallets.filter((w) =>
    w.features.includes(SOLANA_SIGN_AND_SEND_TRANSACTION_FEATURE),
  );

  const [isOpen, onOpenChange] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children}
      <DialogContent isOpen={isOpen} title="Select wallet">
        <div className="flex flex-col gap-6 w-60">
          <div className="flex flex-col gap-6">
            {!supportedWallets.length && (
              // TODO: Animate
              <div className="flex justify-center items-center py-8">
                <span>No supported wallets found</span>
              </div>
            )}
            {supportedWallets
              .filter(
                (w) =>
                  !walletHistory.some(
                    (wHistory) =>
                      wHistory.name.toLowerCase() === w.name.toLowerCase(),
                  ),
              )
              .map((wallet) => (
                <WalletOption
                  wallet={wallet}
                  key={wallet.name}
                  onOpenChange={onOpenChange}
                />
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WalletOption({
  wallet,
  onOpenChange,
}: {
  wallet: UiWallet;
  onOpenChange: (open: boolean) => void;
}) {
  const [isConnecting, connect] = useConnect(wallet);
  const [isConnectionInitiated, setConnectionInitiated] = useState(false);
  const [accountAddress, setAccountAddress] = useState<Address | null>(null);

  const handleConnectClick = useCallback(async () => {
    try {
      const existingAccounts = [...wallet.accounts];
      const nextAccounts = await connect();

      // Try to choose the first never-before-seen account.
      for (const nextAccount of nextAccounts) {
        if (
          !existingAccounts.some((existingAccount) =>
            uiWalletAccountsAreSame(nextAccount, existingAccount),
          )
        ) {
          setAccountAddress(address(nextAccount.address));
          return;
        }
      }
      // Failing that, choose the first account in the list.
      if (nextAccounts[0]) {
        setAccountAddress(address(nextAccounts[0].address));
      }

      setConnectionInitiated(() => true);
    } catch (e) {
      toast.error("Failed to connect to wallet");
      console.error(e);
      onOpenChange(false);
    }
  }, [accountAddress]);

  if (isConnecting) {
    return (
      <motion.div
        key={wallet.name}
        className="flex flex-row items-center gap-6"
      >
        <span className="h-[40px]">Connecting...</span>
      </motion.div>
    );
  }

  return (
    <button
      onClick={handleConnectClick}
      className="relative flex flex-row items-center gap-4"
    >
      {isConnectionInitiated && accountAddress && (
        <ConnectMultisig
          walletIcon={wallet.icon}
          walletName={wallet.name}
          accountAddress={accountAddress}
          onClose={() => onOpenChange(false)}
        />
      )}
      <span className="w-[30px] h-[30px] flex items-center justify-center rounded-full overflow-hidden">
        <img src={wallet.icon} alt={wallet.name} />
      </span>
      <span className="text-base">{wallet.name}</span>
    </button>
  );
}

function ConnectMultisig({
  onClose,
  walletName,
  walletIcon,
  accountAddress,
}: {
  onClose: () => void;
  walletName: string;
  walletIcon: string;
  accountAddress: Address;
}) {
  const {
    isLoading,
    isFetched,
    data: multisigWallets,
  } = useMultisigWallets(accountAddress) || {};

  // TODO: Affect loading state

  const { addwalletStorage, addMultisig, selectWalletName } = useWalletStore();

  const multisig = multisigWallets?.[0];

  useEffect(() => {
    if (isFetched && accountAddress) {
      if (!multisig) {
        toast.error(
          "Can't find multisig wallet for " + abbreviateAddress(accountAddress),
        );
      } else {
        addwalletStorage({
          icon: walletIcon,
          name: walletName,
          address: accountAddress,
        });
        addMultisig(multisig);
        selectWalletName(walletName);
      }

      onClose();
    }
  }, [multisig, isFetched, accountAddress, multisigWallets]);

  if (isLoading) {
    return (
      <motion.div
        key={walletName}
        className="absolute flex flex-row items-center gap-6"
      >
        <span className="h-[40px]">Connecting...</span>
      </motion.div>
    );
  }

  return null;
}
