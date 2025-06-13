import { useState } from "react";
import { Address, isAddress } from "gill";
import { motion, AnimatePresence } from "motion/react";

import Input from "~/components/ui/Input";
import { IconLogo } from "~/components/ui/icons/IconLogo";

import { useTokenInfo } from "~/hooks/resources";
import { getRoundedUSD } from "~/utils/amount";
import { useWithdrawStore } from "~/state/withdraw";
import { abbreviateAddress } from "~/utils/address";

const ChooseWallet = ({ vaultAddress }: { vaultAddress: Address }) => {
  const { toAddress, addError, set, removeError, errors } = useWithdrawStore();
  const { totalAmount } = useTokenInfo(vaultAddress);
  const [value, setValue] = useState<string | Address>(toAddress || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    removeError("toAddress");
  };

  const handleBlur = () => {
    if (isAddress(value)) {
      removeError("toAddress");
      set("toAddress", value);
    } else {
      addError("toAddress", "Invalid address");
    }
  };

  return (
    <>
      <div className="bg-white/20  h-14 border border-white/30 rounded-[20px] px-4 py-2.5 flex flex-row gap-2 items-center justify-between">
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
        <span className="font-semibold text-base">
          ${getRoundedUSD(totalAmount)}
        </span>
      </div>
      <div className="relative h-14 border border-white/30 rounded-[20px] px-4 py-2.5 flex flex-row gap-2 items-center">
        <div>
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold opacity-40">To:</span>
          </div>
        </div>
        <Input
          value={value}
          tabIndex={-1}
          onChange={handleChange}
          className="text-sm"
          onBlur={handleBlur}
          error={!!errors?.toAddress}
          placeholder="Enter wallet address"
        />
        <AnimatePresence>
          {errors?.toAddress && (
            <motion.span
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute text-xs -bottom-5 w-full text-status-error"
            >
              {errors.toAddress}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ChooseWallet;
