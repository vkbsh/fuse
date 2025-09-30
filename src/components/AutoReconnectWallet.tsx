import { toast } from "sonner";
import { address } from "gill";
import { useEffect } from "react";
import { type UiWallet, useConnect } from "@wallet-standard/react";

import { useSupportedWallets } from "~/hooks/wallet";

import { abbreviateAddress } from "~/lib/address";
import { type LSWallet, useWalletStore } from "~/state/wallet";
import { isKeyMember } from "~/program/multisig/utils/member";

export default function AutoReconnectWallet() {
  const wallets = useSupportedWallets();
  const currentWalletName = useWalletStore((s) => s.walletStorage?.name);
  const wallet = wallets?.find((w) => w?.name === currentWalletName);

  if (!wallet) {
    return null;
  }

  return <WalletAccount wallets={wallets} currentWallet={wallet} />;
}

function WalletAccount({
  wallets,
  currentWallet,
}: {
  wallets: UiWallet[] | null;
  currentWallet: UiWallet;
}) {
  const [, connect] = useConnect(currentWallet);

  const walletHistory = useWalletStore((s) => s.walletHistory);
  const walletStorage = useWalletStore((s) => s.walletStorage);
  const updateHistory = useWalletStore((s) => s.updateHistory);
  const multisigStorage = useWalletStore((s) => s.multisigStorage);
  const addWalletStorage = useWalletStore((s) => s.addWalletStorage);
  const selectWalletName = useWalletStore((s) => s.selectWalletName);
  const removeWalletStorage = useWalletStore((s) => s.removeWalletStorage);

  const members = multisigStorage?.account?.members || [];

  // Update walletHistory with latest wallets
  useEffect(() => {
    let updatedHistory: LSWallet[] = [];

    walletHistory.forEach((wHistory) => {
      const wallet = wallets?.find((w) => w.name === wHistory.name);
      const account = wallet?.accounts[0];

      if (account?.address) {
        const isMember = isKeyMember(members, address(account.address));

        if (!isMember) {
          removeWalletStorage(wallet?.name as string);
          toast.error(
            abbreviateAddress(address(account.address)) + " is not a member",
          );
          return null;
        }
      }
    });

    updatedHistory = updatedHistory.filter(Boolean) as LSWallet[];

    const isUpdatedEqual =
      updatedHistory.length === walletHistory.length &&
      updatedHistory.every((w, i) => {
        const existing = walletHistory[i];
        return (
          w &&
          existing &&
          w.name === existing.name &&
          w.icon === existing.icon &&
          w.address === existing.address
        );
      });

    if (!isUpdatedEqual && updatedHistory.length) {
      updateHistory(updatedHistory);
      const updatedWallet = updatedHistory.find(
        (w) => w?.name === currentWallet.name,
      );

      if (updatedWallet && updatedWallet?.address !== walletStorage?.address) {
        selectWalletName(updatedWallet.name);
      }
    }
  }, [wallets]);

  // Connect to wallet
  useEffect(() => {
    const connectWallet = async () => {
      try {
        const [account] = await connect({ silent: true });

        if (currentWallet && account?.address) {
          const isMember = isKeyMember(members, address(account.address));

          if (isMember) {
            if (account.address !== walletStorage?.address) {
              addWalletStorage({
                name: currentWallet.name,
                icon: currentWallet.icon,
                address: address(account.address),
              });
              selectWalletName(currentWallet.name);
            }
          }

          if (!isMember) {
            removeWalletStorage(currentWallet.name);
            toast.error(
              "Can't find multisig wallet for " +
                abbreviateAddress(address(account.address)),
            );
          }
        }
      } catch (e) {
        console.error(e);
        removeWalletStorage(currentWallet.name);
        toast.error(`Failed to connect to ${currentWallet.name} wallet`);
      }
    };

    connectWallet();
  }, [currentWallet]);

  return null;
}
