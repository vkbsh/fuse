import { useState } from "react";
import { type Address } from "gill";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import { ChevronUp } from "~/components/ui/icons/ChevronUp";
import { ChevronDown } from "~/components/ui/icons/ChevronDown";

import { cn } from "~/lib/utils";
import { abbreviateAddress } from "~/lib/address";
import { useWalletStore } from "~/state/wallet";

export default function VaultDropdown() {
  const [isOpen, onOpenChange] = useState(false);
  const multisigList = useWalletStore((s) => s.multisigList);
  const selectMultisig = useWalletStore((s) => s.selectMultisig);
  const multisigStorage = useWalletStore((s) => s.multisigStorage);

  const vaultAddress = multisigStorage?.defaultVault as Address;

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger>
        <span className="flex gap-2.5 items-center justify-center text-foreground h-[34px] rounded-2xl bg-accent-background px-3.5 font-semibold text-sm">
          {abbreviateAddress(vaultAddress)}
          {multisigList?.length && multisigList.length > 1 ? (
            <span className="text-placeholder">
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </span>
          ) : null}
        </span>
      </DropdownMenuTrigger>
      {multisigList?.length && multisigList.length > 1 && (
        <DropdownMenuContent
          align="start"
          isOpen={isOpen}
          className="flex flex-col p-3 gap-0.5  scroll-smooth overflow-y-auto scrollbar-hidden border border-white/30"
        >
          {multisigList?.map((multisig) => (
            <DropdownMenuItem
              key={multisig.defaultVault}
              onClick={() => selectMultisig(multisig.address)}
              className="relative flex flex-row gap-2 items-center justify-between p-2 rounded-2xl font-semibold text-sm border border-white/0 hover:bg-white/15 hover:text-white/30 hover:border-white/15 duration-300 transition-colors"
            >
              {abbreviateAddress(multisig.defaultVault)}
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full duration-300 transition-colors",
                  multisig.defaultVault === vaultAddress && "bg-placeholder",
                )}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
