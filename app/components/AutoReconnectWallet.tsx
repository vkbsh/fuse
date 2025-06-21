import { address } from "gill";
import { useEffect } from "react";
import { useConnect, useWallets } from "@wallet-standard/react";

import { toast } from "~/state/toast";
import { useWalletStore } from "~/state/wallet";
import { abbreviateAddress } from "~/utils/address";
import { isKeyMember } from "~/program/multisig/utils/member";
import { SOLANA_SIGN_AND_SEND_TRANSACTION_FEATURE } from "~/hooks/wallet";

export default function AutoReconnectWallet({ name }: { name: string }) {
  const {
    walletHistory,
    walletStorage,
    updateHistory,
    multisigStorage,
    addwalletStorage,
    selectWalletName,
    removewalletStorage,
  } = useWalletStore();
  const _wallets = useWallets();
  const wallets = _wallets?.filter((w) =>
    w.features.includes(SOLANA_SIGN_AND_SEND_TRANSACTION_FEATURE),
  );
  const wallet = wallets.find((w) => w?.name === name);
  const members = multisigStorage?.account?.members || [];

  const [, connect] = useConnect(wallet);

  // Update walletHistory with latest wallets
  useEffect(() => {
    const updatedHistory = walletHistory.map((wHistory) => {
      const wallet = wallets.find((w) => w.name === wHistory.name);
      const account = wallet?.accounts[0];

      if (account?.address) {
        const isMember = isKeyMember(members, address(account.address));

        if (!isMember) {
          console.log("not a member", account.address);
        }
      }

      return {
        name: wallet?.name || wHistory.name,
        icon: wallet?.icon || wHistory.icon,
        address: account?.address ? address(account.address) : wHistory.address,
      };
    });

    const isUpdatedEqual = updatedHistory.every((w, i) => {
      return (
        w.name === walletHistory[i].name &&
        w.icon === walletHistory[i].icon &&
        w.address === walletHistory[i].address
      );
    });

    if (!isUpdatedEqual) {
      updateHistory(updatedHistory);
      const updatedWallet = updatedHistory.find((w) => w.name === name);

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

        if (wallet && account?.address) {
          const isMember = isKeyMember(members, address(account.address));

          if (isMember) {
            if (account.address !== walletStorage?.address) {
              addwalletStorage({
                name: wallet.name,
                icon: wallet.icon,
                address: address(account.address),
              });
            }
          }

          if (!isMember) {
            removewalletStorage(wallet.name);
            toast.error(
              "Can't find multisig wallet for " +
                abbreviateAddress(address(account.address)),
            );
          }
        }
      } catch (e) {
        console.error(e);
        removewalletStorage(wallet.name);
        toast.error(`Failed to connect to ${wallet.name} wallet`);
      }
    };

    connectWallet();
  }, [wallet]);

  return null;
}
