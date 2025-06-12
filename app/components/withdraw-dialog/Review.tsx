import { UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";
import {
  address,
  Address,
  LAMPORTS_PER_SOL,
  signAndSendTransactionMessageWithSigners,
} from "gill";

import {
  createTransferSolMessage,
  createTransferTokenMessage,
} from "~/program/multisig/utils/message";

import Button from "~/components/ui/Button";

import { refetchTransactions } from "~/hooks/resources";

import { toast } from "~/state/toast";
import { Token, useWithdrawStore } from "~/state/withdraw";

const Review = ({
  onClose,
  vaultAddress,
  walletAccount,
  multisigAddress,
  transactionIndex,
}: {
  onClose: () => void;
  vaultAddress: Address;
  multisigAddress: Address;
  transactionIndex: number;
  walletAccount: UiWalletAccount;
}) => {
  const { toAddress, token, amount, errors, reset } = useWithdrawStore();

  const refetch = refetchTransactions(multisigAddress);

  const signer = useWalletAccountTransactionSendingSigner(
    walletAccount,
    "solana:mainnet", // TODO: Get from .env
  );

  const handleTx = async () => {
    if (errors.length || !toAddress || !token || !amount) {
      // TODO: add validation
      return;
    }

    const nextTxIndex = BigInt(transactionIndex + 1);

    let message = null;
    const memo = "auto approve";
    const isNative =
      token?.mint === "So11111111111111111111111111111111111111112";

    if (!isNative) {
      message = await createTransferTokenMessage({
        memo,
        feePayer: signer,
        authority: vaultAddress,
        fromToken: token as Token,
        multisigPda: multisigAddress,
        transactionIndex: nextTxIndex,
        toAddress: address(toAddress as string),
        creator: address(walletAccount.address),
        amount: Math.round(amount * 10 ** token.decimals),
      });
    } else {
      message = await createTransferSolMessage({
        memo,
        feePayer: signer,
        multisigPda: multisigAddress,
        transactionIndex: nextTxIndex,
        toAddress: address(toAddress as string),
        creator: address(walletAccount.address),
        amount: Math.round(amount * LAMPORTS_PER_SOL),
      });
    }

    try {
      const signature = await signAndSendTransactionMessageWithSigners(message);
      // TODO: Check status of transaction
      console.log("Signature", signature);
      reset();
      await refetch();
      onClose();
    } catch (e: any) {
      toast.error(e?.message);
      console.error("Error [Initiate, Proposal, Approve]:", e.message);
      onClose();
    }
  };

  return (
    <div className="flex flex-row gap-2 justify-center">
      <Button
        size="md"
        onClick={() => {
          reset();
          onClose();
        }}
        variant="cancel"
      >
        Cancel
      </Button>
      <Button size="md" onClick={() => handleTx()} variant="secondary">
        Initiate
      </Button>
    </div>
  );
};

export default Review;
