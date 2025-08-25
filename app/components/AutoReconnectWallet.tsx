import { toast } from "sonner";
import { address } from "gill";
import { useEffect } from "react";
import { UiWallet, useConnect, useWallets } from "@wallet-standard/react";

import { abbreviateAddress } from "~/lib/address";
import { LSWallet, useWalletStore } from "~/state/wallet";
import { isKeyMember } from "~/program/multisig/utils/member";
import { SOLANA_SIGN_AND_SEND_TRANSACTION_FEATURE } from "~/hooks/wallet";

export default function AutoReconnectWallet() {
  const walletName = useWalletStore((state) => state.walletStorage?.name);
  const _wallets = useWallets();
  const wallets = _wallets?.filter((w) =>
    w.features.includes(SOLANA_SIGN_AND_SEND_TRANSACTION_FEATURE),
  );
  const wallet = wallets.find((w) => w?.name === walletName);

  if (!wallet) {
    return null;
  }

  return (
    <WalletAccount
      wallets={wallets}
      currentWallet={wallet}
      name={wallet.name}
    />
  );
}

function WalletAccount({
  name,
  wallets,
  currentWallet,
}: {
  name: string;
  wallets: UiWallet[];
  currentWallet: UiWallet;
}) {
  const [, connect] = useConnect(currentWallet);

  const walletHistory = useWalletStore((state) => state.walletHistory);
  const walletStorage = useWalletStore((state) => state.walletStorage);
  const updateHistory = useWalletStore((state) => state.updateHistory);
  const multisigStorage = useWalletStore((state) => state.multisigStorage);
  const addwalletStorage = useWalletStore((state) => state.addwalletStorage);
  const selectWalletName = useWalletStore((state) => state.selectWalletName);
  const removewalletStorage = useWalletStore(
    (state) => state.removewalletStorage,
  );

  const members = multisigStorage?.account?.members || [];

  // Update walletHistory with latest wallets
  useEffect(() => {
    const updatedHistory = walletHistory
      .map((wHistory) => {
        const wallet = wallets.find((w) => w.name === wHistory.name);
        const account = wallet?.accounts[0];

        if (account?.address) {
          const isMember = isKeyMember(members, address(account.address));

          if (!isMember) {
            console.log("AutoReconnectWallet rerendered");
            // TODO: Remove wallet from history
            console.error("not a member", account.address);
            toast.error(
              abbreviateAddress(address(account.address)) + " is not a member",
            );
            return null;
          }
        }

        return {
          name: wallet?.name || wHistory.name,
          icon: wallet?.icon || wHistory.icon,
          address: account?.address
            ? address(account.address)
            : wHistory.address,
        };
      })
      .filter(Boolean) as LSWallet[];

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
      const updatedWallet = updatedHistory.find((w) => w?.name === name);

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
              addwalletStorage({
                name: currentWallet.name,
                icon: currentWallet.icon,
                address: address(account.address),
              });
            }
          }

          if (!isMember) {
            removewalletStorage(currentWallet.name);
            toast.error(
              "Can't find multisig wallet for " +
                abbreviateAddress(address(account.address)),
            );
          }
        }
      } catch (e) {
        console.error(e);
        removewalletStorage(currentWallet.name);
        toast.error(`Failed to connect to ${currentWallet.name} wallet`);
      }
    };

    connectWallet();
  }, [currentWallet]);

  return null;
}
