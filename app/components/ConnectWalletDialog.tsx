import { toast } from "sonner";
import { Address, address } from "gill";
import { motion, AnimatePresence } from "motion/react";
import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  UiWallet,
  useConnect,
  useWallets,
  uiWalletAccountsAreSame,
} from "@wallet-standard/react";

import { Dialog, DialogContent } from "~/components/ui/dialog";

import { useMultisigWallets } from "~/hooks/resources";
import { SOLANA_SIGN_AND_SEND_TRANSACTION_FEATURE } from "~/hooks/wallet";

import { useWalletStore } from "~/state/wallet";
import { abbreviateAddress } from "~/lib/address";
import { isKeyMember } from "~/program/multisig/utils/member";

export default function ConnectWalletDialog({
  children,
}: {
  children: ReactNode;
}) {
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
              <motion.span
                // TODO: Check Animation
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center py-8"
              >
                <span>No supported wallets found</span>
              </motion.span>
            )}
            {supportedWallets.map((wallet) => (
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
      setConnectionInitiated(false);
      setAccountAddress(null);
      onOpenChange(false);
    }
  }, [accountAddress]);

  return (
    <button
      tabIndex={-1}
      onClick={handleConnectClick}
      className="relative flex flex-row items-center gap-4"
    >
      <span className="w-[40px] h-[40px] flex items-center justify-center rounded-xl overflow-hidden">
        <img src={wallet.icon} alt={wallet.name} />
      </span>
      <AnimatePresence initial={false} mode="wait">
        {isConnecting ? (
          <motion.span
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            Wallet connecting...
          </motion.span>
        ) : isConnectionInitiated && accountAddress ? (
          <ConnectMultisig
            walletIcon={wallet.icon}
            walletName={wallet.name}
            accountAddress={accountAddress}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <motion.span
            key="connect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="font-semibold"
          >
            {wallet.name}
          </motion.span>
        )}
      </AnimatePresence>
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
  const addMultisig = useWalletStore((state) => state.addMultisig);
  const multisigStorage = useWalletStore((state) => state.multisigStorage);
  const addwalletStorage = useWalletStore((state) => state.addwalletStorage);
  const selectWalletName = useWalletStore((state) => state.selectWalletName);

  const hasMultisig = !!multisigStorage;

  const {
    isLoading,
    isFetched,
    data: multisigWallets,
  } = useMultisigWallets(hasMultisig ? null : accountAddress) || {};

  const isMultisigFetched = hasMultisig || isFetched;
  const multisig = multisigStorage || multisigWallets?.[0];

  useEffect(() => {
    if (isMultisigFetched) {
      if (!multisig) {
        toast.error(
          "Can't find multisig for " + abbreviateAddress(accountAddress),
        );
      } else if (!isKeyMember(multisig?.account?.members, accountAddress)) {
        toast.error(abbreviateAddress(accountAddress) + " is not a member");
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
  }, [isMultisigFetched, accountAddress]);

  if (isLoading) {
    // TODO: Add shine text for loading
    return (
      <motion.span
        key="connect"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="text-base"
      >
        Validating account...
      </motion.span>
    );
  }

  return walletName;
}
