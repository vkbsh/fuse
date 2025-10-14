import { useState } from "react";
import { motion } from "motion/react";

import { cn } from "~/lib/utils";
import { abbreviateAddress } from "~/lib/address";
import { type LSWallet, useWalletStore } from "~/state/wallet";

import { HotspotSlash } from "~/components/ui/icons/HotspotSlash";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MemberKey({
  wallet,
  isConnected,
  closeDropdown,
}: {
  wallet: LSWallet;
  isConnected: boolean;
  closeDropdown: () => void;
}) {
  const removeWalletStorage = useWalletStore((s) => s.removeWalletStorage);
  const walletHistory = useWalletStore((s) => s.walletHistory);
  const selectWalletName = useWalletStore((s) => s.selectWalletName);
  const [isHoveringDisconnect, setIsHoveringDisconnect] = useState(false);

  const disconnect = async () => {
    if (walletHistory.length === 1) {
      closeDropdown();
    }
    await sleep(300);
    removeWalletStorage(wallet.name);
  };

  return (
    <span
      className={cn(
        "relative flex flex-row gap-2 items-center p-2 rounded-2xl border text-white border-transparent bg-transparent duration-300 transition-colors hover:bg-white/12 hover:border-white/6",
        isConnected && "text-white/30",
        isHoveringDisconnect &&
          "hover:bg-destructive/12 hover:text-destructive",
      )}
      onClick={() => selectWalletName(wallet.name)}
    >
      <motion.img
        src={wallet.icon}
        alt={wallet.name}
        className="rounded-full w-5 h-5"
      />
      <span className="text-sm font-semibold">
        {abbreviateAddress(wallet?.address)}
      </span>
      <span
        onClick={() => disconnect()}
        onMouseEnter={() => setIsHoveringDisconnect(true)}
        onMouseLeave={() => setIsHoveringDisconnect(false)}
        className="absolute w-6 h-6 right-4 flex gap-1 items-center justify-center"
      >
        <HotspotSlash
          className={cn(
            "flex shrink-0 duration-300 transition-colors",
            isHoveringDisconnect ? "text-destructive" : "text-white",
          )}
        />
        <span
          className={cn(
            "flex shrink-0 w-2.5 h-2.5 rounded-full duration-300 transition-colors bg-placeholder",
            isConnected && !isHoveringDisconnect && "bg-success",
            isHoveringDisconnect && "bg-destructive",
          )}
        />
      </span>
    </span>
  );
}
