import { useWalletStore } from "~/state/wallet";
import { abbreviateAddress } from "~/utils/address";
import { IconLogo } from "~/components/ui/icons/IconLogo";

export default function VaultAccount() {
  const { currentMultisigWallet } = useWalletStore();

  return (
    <div className="flex items-center gap-2.5">
      <span className="w-[42px] h-[42px] rounded-full bg-[#EBEBEB] flex items-center justify-center text-black">
        <IconLogo />
      </span>

      <div className="flex flex-row gap-3 items-center min-h-8 py-1 px-4 rounded-2xl  bg-foreground">
        <span className="w-20 font-semibold text-sm text-primary-text">
          {currentMultisigWallet?.defaultVault
            ? abbreviateAddress(currentMultisigWallet?.defaultVault)
            : null}
        </span>
      </div>
    </div>
  );
}
