import {
  address,
  Address,
  LAMPORTS_PER_SOL,
  signAndSendTransactionMessageWithSigners,
} from "gill";
import { UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";

import Button from "~/components/ui/Button";

import {
  createTransferSolMessage,
  createTransferTokenMessage,
} from "~/program/multisig/utils/message";

import { toast } from "~/state/toast";
import { refetchTransactions } from "~/hooks/resources";
import { useWithdrawStore } from "~/state/withdraw";
import { SOL_MINT_ADDRESS } from "~/service/balance";

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
  const { toAddress, token, amount, addError, reset } = useWithdrawStore();

  const refetch = refetchTransactions(multisigAddress);

  const signer = useWalletAccountTransactionSendingSigner(
    walletAccount,
    "solana:mainnet", // TODO: Get from .env
  );

  const handleTx = async () => {
    if (!toAddress || !token || !amount) {
      if (!toAddress) {
        addError("toAddress", "Invalid address");
      }
      if (!token) {
        addError("token", "Invalid token");
      }
      if (!amount) {
        addError("amount", "Invalid amount");
      }

      return;
    }

    const nextTxIndex = BigInt(transactionIndex + 1);

    let message = null;
    const memo = "auto approve";
    const isNative = token?.mint === SOL_MINT_ADDRESS;

    if (!isNative) {
      message = await createTransferTokenMessage({
        memo,
        feePayer: signer,
        fromToken: token,
        authority: vaultAddress,
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
        vaultPda: vaultAddress,
        multisigPda: multisigAddress,
        transactionIndex: nextTxIndex,
        toAddress: address(toAddress as string),
        creator: address(walletAccount.address),
        amount: Math.round(amount * LAMPORTS_PER_SOL),
      });
    }

    try {
      const signature = await signAndSendTransactionMessageWithSigners(message);
      // TODO: *Check status of transaction
      console.log("Signature", signature);
      reset();
      await refetch();
      onClose();
    } catch (e: any) {
      toast.error("Failed to initiate transaction");
      console.error("Error [Initiate, Proposal, Approve]:", e);
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
