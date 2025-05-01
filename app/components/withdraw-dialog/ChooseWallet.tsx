import { address } from "gill";
import { useState } from "react";
import { motion } from "motion/react";

import Input from "~/components/ui/Input";
import Button from "~/components/ui/Button";

import { IconLogo } from "~/components/icons/IconLogo";
import Dropdown from "~/components/ui/Dropdown";

import { Address } from "~/model/web3js";
import { useWalletStore } from "~/state/wallet";
import { useWithdrawStore } from "~/state/withdraw";
import { useVaultTokens } from "~/state/totalBalance";

import { getRoundedUSD } from "~/utils/amount";
import { abbreviateAddress } from "~/utils/address";

const ChooseWallet = ({
  onClose,
  nextStep,
}: {
  onClose: () => void;
  nextStep: () => void;
}) => {
  const { toAddress, set } = useWithdrawStore();
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentMultisigWallet, history } = useWalletStore();
  const [value, setValue] = useState<string | Address>(toAddress || "");
  const { totalAmount } = useVaultTokens({
    address: address(currentMultisigWallet?.defaultVault as Address),
  });

  const handleFocus = () => {
    setError("");
    setShowHistory(true);
  };

  const handleBlur = () => {
    // setShowHistory(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              {abbreviateAddress(currentMultisigWallet?.defaultVault)}
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
                    setValue(w.address);
                    setShowHistory(false);
                  }}
                  className="flex flex-row items-center gap-2 p-2 cursor-pointer hover:bg-primary"
                >
                  <span className=" ">
                    <img
                      className="w-6 h-6 p-1 rounded-full"
                      src={w.icon}
                      alt={w.name}
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
          onBlur={handleBlur}
          onFocus={handleFocus}
          onChange={handleChange}
          placeholder="Enter wallet address"
          className="text-sm"
        />
      </div>

      {error && (
        <span className="absolute text-xs -bottom-5 w-full text-red-500">
          {error}
        </span>
      )}
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
