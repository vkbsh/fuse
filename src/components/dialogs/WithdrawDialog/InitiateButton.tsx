import { toast } from "sonner";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { address, LAMPORTS_PER_SOL, type Address } from "gill";
import { type UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSigner } from "@solana/react";

import {
  type TokenData,
  useMemberBalance,
  useRefetchTransactions,
} from "~/hooks/resources";
import { cn } from "~/lib/utils";
import motionProps from "~/lib/motion";

import Button from "~/components/ui/button";
import TextShimmer from "~/components/ui/text-shimmer";

import {
  createTransferSolMessage,
  createTransferTokenMessage,
  sendAndConfirmTransferWithProposalApproveMessage,
} from "~/program/multisig/message";
import { SOL_MINT_ADDRESS } from "~/program/multisig/address";

export default function InitiateButton({
  data,
  validate,
  hasError,
  vaultAddress,
  walletAccount,
  onCloseDialog,
  multisigAddress,
  transactionIndex,
}: {
  data: {
    amount: number;
    toAddress: string;
    token: TokenData | null;
  };
  hasError: boolean;
  vaultAddress: Address;
  validate: () => boolean;
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
          validate={validate}
          hasError={hasError}
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
  validate,
  hasError,
  vaultAddress,
  walletAccount,
  onCloseDialog,
  multisigAddress,
  transactionIndex,
}: {
  data: {
    amount: number;
    toAddress: string;
    token: TokenData | null;
  };
  hasError: boolean;
  vaultAddress: Address;
  validate: () => boolean;
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

  const onInitiate = async () => {
    const hasError = validate();

    if (hasError || !walletAccount || !data.token) return;

    const nextTxIndex = BigInt(transactionIndex + 1);
    const memberAddress = address(walletAccount.address);
    const creatorAddress = address(walletAccount.address);
    const isSolTransfer = data.token.mint === SOL_MINT_ADDRESS;

    let transactionMessage = null;

    if (isSolTransfer) {
      transactionMessage = await createTransferSolMessage({
        // @ts-expect-error (expect signer)
        source: vaultAddress,
        toAddress: address(data.toAddress),
        amount: data.amount * LAMPORTS_PER_SOL,
      });
    } else {
      transactionMessage = await createTransferTokenMessage({
        // @ts-expect-error (expect signer)
        signer: vaultAddress,
        fromToken: data.token,
        authorityAddress: vaultAddress,
        toAddress: address(data.toAddress),
        amount: data.amount * 10 ** data.token.decimals,
      });
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
      toast.error("Failed to initiate transfer");
      console.error("Error [Initiate, Proposal, Approve]: ", e);
    } finally {
      onCloseDialog();
    }
  };

  const disabled = isSubmitting || hasError || (isFetched && !isMinRentBalance);

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
          ) : !isMinRentBalance ? (
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
