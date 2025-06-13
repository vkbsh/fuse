import { address } from "gill";
import { useEffect } from "react";
import { useConnect, useWallets } from "@wallet-standard/react";

import { toast } from "~/state/toast";
import { useWalletStore } from "~/state/wallet";
import { useWalletByName } from "~/hooks/wallet";
import { abbreviateAddress } from "~/utils/address";

import { isKeyMember } from "~/program/multisig/utils/member";

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
  const wallets = useWallets();
  const wallet = useWalletByName(name);

  if (!wallet) {
    return null;
  }

  const [, connect] = useConnect(wallet);

  const members = multisigStorage?.account?.members || [];

  // Update walletHistory with latest wallets
  useEffect(() => {
    const updatedHistory = walletHistory.map((wHistory) => {
      const wallet = wallets.find((w) => w.name === wHistory.name);
      const account = wallet?.accounts[0];

      // TODO: Need to check if the account is a member
      // TODO: if not a member, remove from history

      return {
        name: wallet?.name || wHistory.name,
        icon: wallet?.icon || wHistory.icon,
        address: account?.address ? address(account.address) : wHistory.address,
      };
    });

    updateHistory(updatedHistory);
    selectWalletName(wallet.name);
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
