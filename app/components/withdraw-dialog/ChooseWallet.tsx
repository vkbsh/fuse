import { address } from "gill";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import Input from "~/components/ui/Input";
import { IconLogo } from "~/components/ui/icons/IconLogo";

import { useTokenInfo } from "~/hooks/resources";
import { useWithdrawStore } from "~/state/withdraw";

import { Address } from "~/model/web3js";
import { getRoundedUSD } from "~/utils/amount";
import { abbreviateAddress } from "~/utils/address";

const ChooseWallet = ({ vaultAddress }: { vaultAddress: Address }) => {
  const { toAddress, set } = useWithdrawStore();
  const { totalAmount } = useTokenInfo(vaultAddress);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState<string | Address>(toAddress || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    if (!value) return;

    try {
      Address.parse(value);
      setError("");
      set("toAddress", address(value));
    } catch (e: any) {
      setError("Invalid address");
    }
  }, [value]);

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
          placeholder="Enter wallet address"
          className="text-sm"
        />
        <AnimatePresence>
          {error && (
            <motion.span
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute text-xs -bottom-5 w-full text-red-500"
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ChooseWallet;
