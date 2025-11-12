import { useState } from "react";
import { type Address } from "gill";
import { motion } from "motion/react";
import { type UiWalletAccount } from "@wallet-standard/react";

import motionProps from "~/lib/motion";
import { formatUSD, formatDecimal } from "~/lib/amount";
import { type EarnCoin } from "~/hooks/resources";

import SelectTokenDropdown from "~/components/SelectTokenDropdown";

import InitiateWithdrawEarnButton from "./InitiateWithdrawEarnButton";

export default function WithdrawEarnForm({
  earnCoins,
  initEarnCoin,
  vaultAddress,
  onCloseDialog,
  walletAccount,
  multisigAddress,
  transactionIndex,
}: {
  initEarnCoin: EarnCoin;
  earnCoins: EarnCoin[];
  vaultAddress: Address;
  transactionIndex: number;
  multisigAddress: Address;
  onCloseDialog: () => void;
  walletAccount: UiWalletAccount | undefined;
}) {
  const [earnCoin, setToken] = useState<EarnCoin | null>(
    initEarnCoin || earnCoins?.[0] || null,
  );

  const maxAmount = !earnCoin?.usdAmount ? 0 : earnCoin?.usdAmount;

  const tokens = earnCoins.map((coin) => {
    return { ...coin, amount: formatDecimal(coin.usdAmount) };
  });

  return (
    <div className="relative flex flex-col gap-4">
      <SelectTokenDropdown
        token={earnCoin}
        tokens={tokens}
        setToken={setToken}
      />

      <motion.span
        key={maxAmount}
        {...motionProps.global.numbers}
        className="absolute top-4 right-4 text-placeholder"
      >
        {formatUSD(maxAmount)}
      </motion.span>
      <span className="text-sm text-warning text-center">
        Full amount will be withdrawn to your Wallet
      </span>
      <InitiateWithdrawEarnButton
        data={{
          token: earnCoin,
          amount: maxAmount,
          toAddress: vaultAddress,
        }}
        vaultAddress={vaultAddress}
        walletAccount={walletAccount}
        onCloseDialog={onCloseDialog}
        multisigAddress={multisigAddress}
        transactionIndex={transactionIndex}
      />
    </div>
  );
}
