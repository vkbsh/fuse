import { Address } from "gill";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { useWithdrawStore } from "~/state/withdraw";
import { useTokenInfo } from "~/hooks/resources";

import { hasCloudPermission } from "~/program/multisig/utils/member";

import AnimateList from "~/components/animated/AnimateList";
import Coin from "./Coin";

export default function Coins({ vaultAddress }: { vaultAddress: Address }) {
  const { set } = useWithdrawStore();
  const { onOpenChange } = useDialog("withdraw");
  const { walletStorage, multisigStorage } = useWalletStore();
  const { data, isLoading, isError } = useTokenInfo(vaultAddress);

  // Prevent user from clicking on coin if they don't have all permissions
  const hasAllPermissions = hasCloudPermission(
    multisigStorage?.account?.members || [],
    walletStorage?.address,
  );

  return (
    <div className="flex flex-1 flex-col gap-0 overflow-y-auto scroll-smooth scrollbar-hidden">
      <AnimateList
        variant="slideDown"
        list={data.map((token) => {
          const handleClick = () => {
            if (!hasAllPermissions) return;

            set("token", token);
            onOpenChange(true);
          };

          return (
            <Coin
              token={token}
              key={token.mint}
              onClick={handleClick}
              isLoading={isLoading || isError}
            />
          );
        })}
      />
    </div>
  );
}
