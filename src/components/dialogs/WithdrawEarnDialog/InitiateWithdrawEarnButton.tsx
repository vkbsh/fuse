import { toast } from "sonner";
import { useState } from "react";
import { address, type Address } from "gill";
import { AnimatePresence, motion } from "motion/react";
import { type UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSigner } from "@solana/react";
import { DRIFT_PROGRAM_ID } from "@drift-labs/sdk";
import { KVAULT_PROGRAM_ID_MAINNET as KAMINO_PROGRAM_ID } from "~/program/kamino/address";

import {
  type EarnCoin,
  useMemberBalance,
  useRefetchTransactions,
} from "~/hooks/resources";
import { cn } from "~/lib/utils";
import motionProps from "~/lib/motion";

import Button from "~/components/ui/button";
import TextShimmer from "~/components/ui/text-shimmer";

import { createDriftWithdrawLegacyMessage } from "~/program/drift/instruction";
import { createKaminoWithdrawLegacyMessage } from "~/program/kamino/instruction";
import { sendAndConfirmTransferWithProposalApproveMessage } from "~/program/multisig/message";
import { type LegacyTransactionMessage } from "~/program/multisig/legacy";

export default function InitiateWithdrawEarnButton({
  data,
  vaultAddress,
  walletAccount,
  onCloseDialog,
  multisigAddress,
  transactionIndex,
}: {
  data: {
    amount: number;
    toAddress: string;
    token: EarnCoin | null;
  };
  vaultAddress: Address;
  onCloseDialog: () => void;
  transactionIndex: number;
  multisigAddress: Address;
  walletAccount: UiWalletAccount | undefined;
}) {
  return (
    <div className="flex flex-row gap-2 justify-center">
      {!walletAccount ? (
        <Button
          disabled
          onClick={() => toast.error("Please connect Member Key Wallet")}
        >
          Initiate
        </Button>
      ) : (
        <InitiateButtonWithAccount
          data={data}
          vaultAddress={vaultAddress}
          walletAccount={walletAccount}
          onCloseDialog={onCloseDialog}
          multisigAddress={multisigAddress}
          transactionIndex={transactionIndex}
        />
      )}
    </div>
  );
}

function InitiateButtonWithAccount({
  data,
  vaultAddress,
  walletAccount,
  onCloseDialog,
  multisigAddress,
  transactionIndex,
}: {
  data: {
    amount: number;
    toAddress: string;
    token: EarnCoin | null;
  };
  vaultAddress: Address;
  onCloseDialog: () => void;
  transactionIndex: number;
  multisigAddress: Address;
  walletAccount: UiWalletAccount;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: isMinRentBalance, isFetched } = useMemberBalance(
    address(walletAccount?.address || ""),
  );
  const refetchTransactions = useRefetchTransactions(multisigAddress);
  const signer = useWalletAccountTransactionSigner(
    walletAccount,
    "solana:mainnet",
  );

  const disabled =
    !walletAccount || isSubmitting || (isFetched && !isMinRentBalance);

  const onInitiate = async () => {
    if (disabled || !data.token) return;

    const nextTxIndex = BigInt(transactionIndex + 1);
    const memberAddress = address(walletAccount.address);
    const creatorAddress = address(walletAccount.address);

    let transactionMessage: LegacyTransactionMessage | null = null;

    if (data.token.programId === DRIFT_PROGRAM_ID) {
      transactionMessage = await createDriftWithdrawLegacyMessage({
        vaultAddress,
        symbol: data.token.symbol || "",
        mintAddress: data.token.id || "",
      });
    } else if (data.token.programId === KAMINO_PROGRAM_ID) {
      if (!data.token.kaminoVaultUSDCAddress) {
        const errorMessage = "Kamino vault USDC address not found";

        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      transactionMessage = await createKaminoWithdrawLegacyMessage({
        vaultAddress,
        amount: data.amount,
        vaultUSDCAddress: data.token.kaminoVaultUSDCAddress,
      });
    } else {
      toast.error("Failed to initiate withdraw");
      throw new Error("Invalid program ID to create Yield Instruction");
    }

    try {
      setIsSubmitting(true);
      const signature = await sendAndConfirmTransferWithProposalApproveMessage({
        memo: "auto approve",
        memberAddress,
        creatorAddress,
        multisigAddress,
        feePayer: signer,
        transactionMessage,
        transactionIndex: nextTxIndex,
      });

      console.log("Signature [Initiate, Proposal, Approve]: ", signature);
      toast.success("Transfer initiated");

      await refetchTransactions();
      setIsSubmitting(false);
    } catch (e) {
      toast.error("Failed to initiate withdraw");
      console.error("Error [Initiate, Proposal, Approve]: ", e);
    } finally {
      onCloseDialog();
    }
  };

  return (
    <>
      <Button
        onClick={onInitiate}
        disabled={disabled}
        className={cn({ "pointer-events-none": disabled })}
      >
        <AnimatePresence>
          {isSubmitting ? (
            <TextShimmer>Initiating</TextShimmer>
          ) : isFetched && !isMinRentBalance ? (
            <motion.span
              className="text-destructive"
              {...motionProps.global.fadeIn}
            >
              Insufficient SOL balance
            </motion.span>
          ) : (
            <motion.span {...motionProps.global.fadeIn}>Initiate</motion.span>
          )}
        </AnimatePresence>
      </Button>
    </>
  );
}
