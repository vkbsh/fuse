import { UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSigner } from "@solana/react";
import { address, Address, assertIsAddress, LAMPORTS_PER_SOL } from "gill";

import Button from "~/components/ui/Button";

import {
  createTransferSolMessage,
  createTransferTokenMessage,
  sendAndConfirmTransferWithProposalApproveMessage,
} from "~/program/multisig/message";

import { toast } from "~/state/toast";
import { useWithdrawStore } from "~/state/withdraw";
import { SOL_MINT_ADDRESS } from "~/service/balance";
import { useRefetchTransactions } from "~/hooks/resources";

export default function Review({
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
}) {
  const refetchTransactions = useRefetchTransactions(multisigAddress);
  const { toAddress, token, amount, addError, reset } = useWithdrawStore();

  const signer = useWalletAccountTransactionSigner(
    walletAccount,
    "solana:mainnet",
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

      return false;
    }

    try {
      assertIsAddress(toAddress);
    } catch (e) {
      addError("toAddress", "Invalid address");
      return false;
    }

    const nextTxIndex = BigInt(transactionIndex + 1);
    const memberAddress = address(walletAccount.address);
    const creatorAddress = address(walletAccount.address);

    const memo = "auto approve";
    const isSolTransfer = token.mint === SOL_MINT_ADDRESS;

    let transactionMessage = null;

    if (isSolTransfer) {
      transactionMessage = await createTransferSolMessage({
        signer,
        toAddress,
        amount: amount * LAMPORTS_PER_SOL,
      });
    } else {
      transactionMessage = await createTransferTokenMessage({
        signer,
        toAddress,
        vaultAddress,
        fromToken: token,
        amount: amount * 10 ** token.decimals,
      });
    }

    try {
      const signature = await sendAndConfirmTransferWithProposalApproveMessage({
        memo,
        memberAddress,
        creatorAddress,
        multisigAddress,
        feePayer: signer,
        transactionMessage,
        transactionIndex: nextTxIndex,
      });

      reset();
      console.log("TransferWithProposalApprove confirmed: ", signature);
    } catch (e: any) {
      toast.error("Failed to initiate transfer");
      console.error("Error [Initiate, Proposal, Approve]: ", e);
    } finally {
      await refetchTransactions();
      onClose();
    }
  };

  return (
    <div className="flex flex-row gap-2 justify-center">
      <Button size="md" onClick={onClose} variant="cancel">
        Cancel
      </Button>
      <Button size="md" variant="secondary" onClick={handleTx}>
        Initiate
      </Button>
    </div>
  );
}
