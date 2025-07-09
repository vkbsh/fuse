import { toast } from "sonner";
import { motion } from "motion/react";
import { Address, address } from "gill";
import { useCallback, useEffect, useState } from "react";

import {
  UiWallet,
  useConnect,
  useWallets,
  uiWalletAccountsAreSame,
} from "@wallet-standard/react";

import Dialog from "~/components/Dialog";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { useMultisigWallets } from "~/hooks/resources";
import { SOLANA_SIGN_AND_SEND_TRANSACTION_FEATURE } from "~/hooks/wallet";

import { abbreviateAddress } from "~/lib/address";

export default function ConnectWalletDialog() {
  const { onOpenChange } = useDialog("connectWallet");

  const wallets = useWallets();
  const supportedWallets = wallets.filter((w) =>
    w.features.includes(SOLANA_SIGN_AND_SEND_TRANSACTION_FEATURE),
  );

  return (
    <Dialog title="Select wallet" name="connectWallet">
      <div className="flex flex-col gap-6 w-60">
        <div className="flex flex-col gap-6">
          {!supportedWallets.length && (
            // TODO: Animate
            <div className="flex justify-center items-center py-8">
              <span>No supported wallets found</span>
            </div>
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

      //     // Try to choose the first never-before-seen account.
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
    <>
      {isConnectionInitiated && accountAddress && (
        <ConnectMultisig
          walletIcon={wallet.icon}
          walletName={wallet.name}
          accountAddress={accountAddress}
          onClose={() => onOpenChange(false)}
        />
      )}
      <button
        onClick={handleConnectClick}
        className="cursor-pointer flex flex-row items-center gap-6"
      >
        <span className="w-[40px] h-[40px] rounded-[13px] bg-white flex items-center justify-center">
          <img width={24} height={24} src={wallet.icon} alt={wallet.name} />
        </span>
        <span className="font-semibold text-base">{wallet.name}</span>
      </button>
    </>
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

  return null;
}
