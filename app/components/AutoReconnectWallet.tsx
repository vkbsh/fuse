import { address } from "gill";
import { useEffect } from "react";
import { useConnect, useWallets } from "@wallet-standard/react";

import { useWalletStore } from "~/state/wallet";
import { useWalletByName } from "~/hooks/wallet";

import { toast } from "~/state/toast";
import { abbreviateAddress } from "~/utils/address";

export default function AutoReconnectWallet({ name }: { name: string }) {
  const wallet = useWalletByName(name);
  // TODO: Cover use case when wallet is not matched and it's null or undefined
  const [, connect] = useConnect(wallet);
  const {
    storageWallet,
    saveStorageWallet,
    selectStorageWallet,
    removeStorageWallet,
    storageMultisigWallet,
  } = useWalletStore();

  const members = storageMultisigWallet?.account?.members || [];

  useEffect(() => {
    const connectWallet = async () => {
      const [account] = await connect({ silent: true });

      if (wallet && account?.address) {
        const isMember = members.some((m) => m.key === account.address);

        if (isMember) {
          if (account.address !== storageWallet?.address) {
            saveStorageWallet({
              name: wallet.name,
              icon: wallet.icon,
              address: address(account.address),
            });
            selectStorageWallet(wallet.name);
          }
        }

        // Remove wallet from history if it's not a member
        if (!isMember) {
          removeStorageWallet(wallet.name);
          toast.error(
            "Can't find multisig wallet for " +
              abbreviateAddress(account.address),
          );
        }
      }
    };

    connectWallet();
  }, [wallet]);

  return null;
}
