import { address, Address, LAMPORTS_PER_SOL } from "gill";
import { UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSigner } from "@solana/react";

import Button from "~/components/ui/Button";

import {
  createTransferSolMessage,
  createTransferTokenMessage,
  sendAndConfirmTransferWithProposalApproveMessage,
} from "~/program/multisig/message";

import { toast } from "~/state/toast";
import { useWithdrawStore } from "~/state/withdraw";
import { SOL_MINT_ADDRESS } from "~/service/balance";
import { useFetchLatestTransaction } from "~/hooks/resources";

const Review = ({
  onClose,
  walletAccount,
  multisigAddress,
  transactionIndex,
}: {
  onClose: () => void;
  multisigAddress: Address;
  transactionIndex: number;
  walletAccount: UiWalletAccount;
}) => {
  const { toAddress, token, amount, addError, reset } = useWithdrawStore();
  const fetchLastTransaction = useFetchLatestTransaction(
    multisigAddress,
    transactionIndex,
  );

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

      return;
    }

    const nextTxIndex = BigInt(transactionIndex + 1);
    const memberAddress = address(walletAccount.address);
    const creatorAddress = address(walletAccount.address);

    let transactionMessage = null;
    const memo = "auto approve";
    const isNative = token?.mint === SOL_MINT_ADDRESS;

    if (isNative) {
      transactionMessage = await createTransferSolMessage({
        signer,
        toAddress,
        amount: amount * LAMPORTS_PER_SOL,
      });
    } else {
      transactionMessage = await createTransferTokenMessage({
        signer,
        toAddress,
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

      console.log("TransferWithProposalApprove confirmed: ", signature);

      reset();
      await fetchLastTransaction();
    } catch (e: any) {
      toast.error("Failed to initiate transfer");
      console.error("Error [Initiate, Proposal, Approve]: ", e);
    } finally {
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
      <Button size="md" variant="secondary" onClick={handleTx}>
        Initiate
      </Button>
    </div>
  );
};

export default Review;
