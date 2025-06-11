import { address } from "gill";
import { UiWallet } from "@wallet-standard/react";
import { toast } from "~/state/toast";
import { abbreviateAddress } from "~/utils/address";
import { LSWallet } from "~/state/wallet";

export async function connectAndValidateMember({
  wallet,
  members,
  addwalletStorage,
  removewalletStorage,
  silent = true,
  onError,
}: {
  wallet: UiWallet;
  members: any[];
  addwalletStorage: (wallet: LSWallet) => void;

  removewalletStorage: (name: string) => void;
  silent?: boolean;
  onError?: (message: string) => void;
}) {
  try {
    const [account] = await wallet.features["standard:connect"].connect({
      silent,
    });

    if (!account?.address) return null;

    const accountAddress = address(account.address);
    const isMember = members.some((m) => m.key === accountAddress);

    if (isMember) {
      addwalletStorage({
        name: wallet.name,
        icon: wallet.icon,
        address: accountAddress,
      });

      return account;
    } else {
      removewalletStorage(wallet.name);
      const errorMessage = `Can't find multisig wallet for ${abbreviateAddress(accountAddress)}`;
      if (onError) {
        onError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
      return null;
    }
  } catch (e) {
    const errorMessage = "Failed to connect to wallet";
    if (onError) {
      onError(errorMessage);
    } else {
      toast.error(errorMessage);
    }
    console.error(e);
    return null;
  }
}
