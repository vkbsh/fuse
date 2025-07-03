import { Address, address } from "gill";
import { useState } from "react";
import { AnimatePresence } from "motion/react";

import Animate from "~/components/animated/Animate";
import { IconLogo } from "~/components/ui/icons/IconLogo";
import AnimateString from "~/components/animated/AnimateString";

import { useTokenInfo } from "~/hooks/resources";
import { getRoundedUSD } from "~/utils/amount";
import { useWithdrawStore } from "~/state/withdraw";
import { abbreviateAddress } from "~/utils/address";

const ChooseWallet = ({ vaultAddress }: { vaultAddress: Address }) => {
  const { totalAmount } = useTokenInfo(vaultAddress);
  const { toAddress, removeError, errors, set } = useWithdrawStore();
  const [value, setValue] = useState<string | Address>(toAddress || "");

  const handleFocus = () => removeError("toAddress");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    set("toAddress", address(e.target.value));
  };

  return (
    <>
      <div className="bg-white-20  h-14 border border-white-30 rounded-[20px] px-4 py-2.5 flex flex-row gap-2 items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <span className="font-semibold opacity-40">From</span>
          <span className="flex flex-row items-center gap-3">
            <span className="flex w-8 h-8 rounded-full justify-center items-center text-black bg-white">
              <IconLogo />
            </span>
            <span className="font-semibold text-base">
              {abbreviateAddress(vaultAddress)}
            </span>
          </span>
        </div>
        <span className="flex flex-row font-semibold text-base">
          <span>$</span>
          <AnimateString string={getRoundedUSD(totalAmount) + ""} />
        </span>
      </div>
      <div className="relative h-14 border border-white-30 rounded-[20px] px-4 py-2.5 flex flex-row gap-2 items-center">
        <div>
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold opacity-40">To:</span>
          </div>
        </div>
        <input
          value={value}
          tabIndex={-1}
          onFocus={handleFocus}
          onChange={handleChange}
          placeholder="Enter wallet address"
          className="w-full text-sm outline-0"
        />
        <AnimatePresence>
          {errors?.toAddress && (
            <Animate
              variant="slideDown"
              className="absolute text-xs -bottom-5 w-full text-status-error"
            >
              {errors.toAddress}
            </Animate>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ChooseWallet;
