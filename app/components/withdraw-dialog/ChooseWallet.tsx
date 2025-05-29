import { address } from "gill";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import Input from "~/components/ui/Input";
import Button from "~/components/ui/Button";
import Dropdown from "~/components/ui/Dropdown";
import { IconLogo } from "~/components/ui/icons/IconLogo";

import { Address } from "~/model/web3js";
import { useWalletStore } from "~/state/wallet";
import { useWithdrawStore } from "~/state/withdraw";

import { getRoundedUSD } from "~/utils/amount";
import { abbreviateAddress } from "~/utils/address";
import { useTokenInfo } from "~/hooks/resources";

const ChooseWallet = ({
  onClose,
  nextStep,
}: {
  onClose: () => void;
  nextStep: () => void;
}) => {
  const { toAddress, set } = useWithdrawStore();
  const [error, setError] = useState<string | null>(null);
  const { storageMultisigWallet, history } = useWalletStore();
  const [value, setValue] = useState<string | Address>(toAddress || "");
  const { data, totalAmount, isLoading } = useTokenInfo(
    storageMultisigWallet?.defaultVault as Address,
  );

  const handleFocus = () => setError("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setValue(e.target.value);
  };

  const handleNextStep = () => {
    const { success } = Address.safeParse(value);

    if (!success) {
      return setError("Provided address is invalid");
    }

    set("toAddress", address(value));
    nextStep();
  };

  return (
    <>
      <h3 className="text-center font-bold text-xl">Choose Wallet</h3>
      <div className="h-14 border border-white/30 rounded-[20px] px-4 py-2.5 flex flex-row gap-2 items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <span className="font-semibold opacity-40">From</span>
          <span className="flex flex-row items-center gap-3">
            <span className="flex w-8 h-8 rounded-full justify-center items-center text-black bg-white">
              <IconLogo />
            </span>
            <span className="font-semibold text-base">
              {abbreviateAddress(storageMultisigWallet?.defaultVault)}
            </span>
          </span>
        </div>
        <span className="font-semibold text-base">
          ${getRoundedUSD(totalAmount)}
        </span>
      </div>
      <div className="bg-white/20 relative h-14 border border-white/30 rounded-[20px] px-4 py-2.5 flex flex-row gap-2 items-center">
        <Dropdown
          trigger={
            <div>
              <div className="flex flex-row items-center gap-2">
                <span className="font-semibold opacity-40">To:</span>
              </div>
            </div>
          }
          items={
            history?.map((w) => {
              return (
                <div
                  key={w.address}
                  onClick={() => {
                    setError("");
                    setValue(w.address);
                  }}
                  className="flex flex-row items-center gap-2 p-2 cursor-pointer hover:bg-primary"
                >
                  <span className=" ">
                    <img
                      src={w.icon}
                      alt={w.name}
                      className="w-6 h-6 p-1 rounded-full"
                    />
                  </span>
                  <span>{abbreviateAddress(w.address)}</span>
                </div>
              );
            }) || []
          }
        />
        <Input
          value={value}
          tabIndex={-1}
          onFocus={handleFocus}
          onChange={handleChange}
          placeholder="Enter wallet address"
          className="text-sm"
        />
        <AnimatePresence>
          {error && (
            <motion.span
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

      <div className="flex flex-row gap-2 justify-center">
        <Button size="md" onClick={onClose} variant="cancel">
          Cancel
        </Button>
        <Button size="md" onClick={handleNextStep} variant="secondary">
          Next
        </Button>
      </div>
    </>
  );
};

export default ChooseWallet;
