import { address } from "@solana/web3.js";

import Dropdown from "~/components/ui/Dropdown";
import { IconChevronDown } from "~/components/icons/IconChevronDown";

import { Address } from "~/model/web3js";
import { useWalletStore } from "~/state/wallet";
import { abbreviateAddress } from "~/utils/address";

export default function SelectMultisigAccount() {
  const { currentMultisigWallet, multisigWallets, selectMultisigWallet } =
    useWalletStore();

  const itemsComponent =
    multisigWallets?.map((multisig) => {
      const addr = address(multisig.defaultVault);

      return (
        <div
          key={multisig.defaultVault}
          onClick={() => selectMultisigWallet(multisig.address)}
          className="flex items-center cursor-pointer w-[131px] h-8 p-4 rounded-[14px] hover:bg-primary hover:bg-amber-700"
        >
          <span className="font-semibold text-xs text-white">
            {abbreviateAddress(addr)}
          </span>
        </div>
      );
    }) || [];

  return (
    <Dropdown
      items={itemsComponent}
      trigger={
        <SelectedAccount
          address={
            currentMultisigWallet?.defaultVault
              ? address(currentMultisigWallet?.defaultVault)
              : null
          }
        />
      }
    />
  );
}

const SelectedAccount = ({ address }: { address: Address | null }) => {
  return (
    <div className="cursor-pointer flex flex-row gap-3 items-center min-h-8 py-1 px-4 rounded-2xl  bg-foreground">
      <span className="w-20 font-semibold text-xs text-primary-text">
        {address ? abbreviateAddress(address) : "Select Account"}
      </span>
      <span>
        <IconChevronDown />
      </span>
    </div>
  );
};
