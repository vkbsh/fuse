import { address } from "gill";
import { motion } from "motion/react";
import { useCallback, useEffect, useState, useRef } from "react";
import { UiWallet, useConnect, useWallets } from "@wallet-standard/react";

import Dialog from "~/components/ui/Dialog";

import { toast } from "~/state/toast";
import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { useMultisigWallets } from "~/hooks/resources";
import { abbreviateAddress } from "~/program/multisig/legacy";
import { SOLANA_SIGN_AND_SEND_TRANSACTION } from "~/hooks/wallet";

export function ConnectWalletDialog() {
  const { isOpen, onOpenChange } = useDialog("connectWallet");

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <WalletOptions />
    </Dialog>
  );
}

function WalletOptions() {
  const wallets = useWallets();

  const supportedWallets = wallets.filter((w) =>
    w.features.includes(SOLANA_SIGN_AND_SEND_TRANSACTION),
  );

  return (
    <div className="flex flex-col gap-6 w-80 p-8 m-auto bg-black text-white rounded-[40px]">
      <span className="text-xl font-bold text-center">Select wallet</span>
      <hr className=" opacity-20" />
      <div className="flex flex-col gap-6">
        {/* TODO: if (supportedWallets.length === 0) return "No supported wallets found"  */}
        {supportedWallets.map((wallet) => (
          <WalletOption key={wallet.name} wallet={wallet} />
        ))}
      </div>
    </div>
  );
}

function WalletOption({ wallet }: { wallet: UiWallet }) {
  const { onOpenChange } = useDialog("connectWallet");
  const [isConnecting, connect] = useConnect(wallet);
  const [isConnectionInitiated, setConnectionInitiated] = useState(false);
  const account = wallet.accounts[0];
  const accountAddress = account?.address && address(account?.address);

  const handleConnectClick = useCallback(async () => {
    try {
      await connect();
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
    <>
      {isConnectionInitiated && account && (
        <WithAccount
          walletWithAccount={wallet}
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

function WithAccount({
  onClose,
  walletWithAccount,
}: {
  onClose: () => void;
  walletWithAccount: UiWallet;
}) {
  const account = walletWithAccount.accounts[0];
  const accountAddress = address(account?.address);

  const { saveStorageWallet, selectStorageWallet, saveMultisigWallets } =
    useWalletStore();
  const { isLoading, data: multisigWallets } =
    useMultisigWallets(accountAddress) || {};

  const multisig = multisigWallets?.[0];

  useEffect(() => {
    console.log(accountAddress, isLoading, multisig);

    if (multisigWallets && accountAddress && !isLoading) {
      if (!multisig) {
        toast.error(
          "Can't find multisig wallet for " + abbreviateAddress(accountAddress),
        );
      } else {
        saveStorageWallet({
          address: accountAddress,
          name: walletWithAccount.name,
          icon: walletWithAccount.icon,
        });
        selectStorageWallet(walletWithAccount.name);
        saveMultisigWallets(multisigWallets);
      }

      onClose();
    }
  }, [
    multisig,
    isLoading,
    accountAddress,
    multisigWallets,
    saveStorageWallet,
    selectStorageWallet,
    saveMultisigWallets,
    walletWithAccount.name,
    walletWithAccount.icon,
  ]);

  return null;
}
