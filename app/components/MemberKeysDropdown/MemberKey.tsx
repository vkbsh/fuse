import Tooltip from "~/components/ui/Tooltip";
import { IconConnect } from "~/components/ui/icons/IconConnect";
import { IconDisconnect } from "~/components/ui/icons/IconDisconnect";

import { cn } from "~/utils/tw";
import { abbreviateAddress } from "~/utils/address";
import { LSWallet, useWalletStore } from "~/state/wallet";

export default function MemberKey({
  active,
  wallet,
  permissionLabel,
}: {
  active: boolean;
  wallet: LSWallet;
  permissionLabel: string;
}) {
  const { removewalletStorage, selectWalletName } = useWalletStore();

  return (
    <div className="flex flex-col">
      <span className="text-white-60 text-sm">{permissionLabel}</span>
      <div className="flex flex-row items-center py-2 gap-6 justify-between">
        <div className="w-[132px] flex flex-row gap-2 items-center">
          <img
            src={wallet.icon}
            alt={wallet.name}
            className="rounded-full w-5 h-5"
          />
          <span className="text-sm">{abbreviateAddress(wallet?.address)}</span>

          <div
            className={cn(
              "flex w-3 h-3 bg-transparent rounded-full ml-auto opacity-0 duration-500",
              {
                "opacity-100 bg-status-success": active,
              },
            )}
          />
        </div>
        <div className="flex flex-row gap-2">
          <Tooltip text="Disconnect">
            <button
              onClick={() => removewalletStorage(wallet.name)}
              className="cursor-pointer ml-auto hover:text-status-error duration-500"
            >
              <IconDisconnect />
            </button>
          </Tooltip>
          <Tooltip text="Connect">
            <button
              onClick={() => selectWalletName(wallet.name)}
              className="cursor-pointer ml-auto hover:text-status-success duration-500"
            >
              <IconConnect />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
