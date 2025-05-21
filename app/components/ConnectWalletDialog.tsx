import { address } from "gill";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { UiWallet, useConnect, useWallets } from "@wallet-standard/react";

import Dialog from "~/components/ui/Dialog";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { useMultisigWallets } from "~/hooks/resources";
import { SOLANA_SIGN_AND_SEND_TRANSACTION } from "~/hooks/wallet";
import { Address } from "~/model/web3js";

export function ConnectWalletDialog() {
  const { isOpen, onOpenChange } = useDialog("connectWallet");

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <WalletOptions close={() => onOpenChange(false)} />
    </Dialog>
  );
}

function WalletOptions({
  close,
}: {
  close: () => void;
  setWalletAddress?: (address: Address) => void;
  setNoMultisigFound?: (value: boolean) => void;
}) {
  const wallets = useWallets();
  const supportedWallets = wallets.filter((w) =>
    w.features.includes(SOLANA_SIGN_AND_SEND_TRANSACTION),
  );

  return (
    <div className="flex flex-col gap-6 w-80 p-8 m-auto bg-black text-white rounded-[40px]">
      <span className="text-xl font-bold text-center">Select wallet</span>
      <hr className=" opacity-20" />
      <div className="flex flex-col gap-6">
        {supportedWallets.map((wallet) => (
          <WalletOption key={wallet.name} close={close} wallet={wallet} />
        ))}
      </div>
    </div>
  );
}

function WalletOption({
  wallet,
  close,
}: {
  wallet: UiWallet;
  close: () => void;
}) {
  const [isConnecting, connect] = useConnect(wallet);
  const [accountAddress, saveStorageAccountAddress] = useState<Address | null>(
    null,
  );
  const { saveStorageWallet, selectStorageWallet, saveMultisigWallets } =
    useWalletStore();

  const { data: multisig, isLoading } = useMultisigWallets(accountAddress);

  const hasMultisigWallets = multisig?.length;

  const handleConnectClick = useCallback(async () => {
    try {
      const [account] = await connect();

      if (account) {
        saveStorageAccountAddress(address(account.address));
      }
    } catch (e) {
      console.log(e);
    } finally {
      close && close();
    }
  }, [wallet.accounts]);

  useEffect(() => {
    if (hasMultisigWallets && accountAddress) {
      saveStorageWallet({
        name: wallet.name,
        icon: wallet.icon,
        address: accountAddress,
      });
      selectStorageWallet(wallet.name);
      saveMultisigWallets(multisig);
    }
  }, [accountAddress, wallet]);

  if (isConnecting) {
    return (
      // TODO: make it animated
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
