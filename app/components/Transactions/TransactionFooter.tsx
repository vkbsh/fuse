import { address, Address } from "gill";
import { AnimatePresence, motion } from "motion/react";
import { UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSigner } from "@solana/react";

import Button from "~/components/ui/Button";

import { useWalletByName } from "~/hooks/wallet";
import { useUpdateTransaction } from "~/hooks/resources";

import {
  sendAndConfirmAccountsCloseMessage,
  sendAndConfirmProposalCancelMessage,
  sendAndConfirmProposalRejectMessage,
  sendAndConfirmProposalApproveMessage,
  sendAndConfirmExecuteAndCloseAccountsMessage,
} from "~/program/multisig/message";
import { hasCloudPermission } from "~/program/multisig/utils/member";

import { useWalletStore } from "~/state/wallet";
import { toast } from "~/state/toast";

export default function Footer({
  status,
  approved,
  rejected,
  cancelled,
  transactionIndex,
  rentCollectorAddress,
  multisigStorageAddress,
}: {
  status: any;
  approved: Address[];
  rejected: Address[];
  cancelled: Address[];
  transactionIndex: number;
  rentCollectorAddress: Address;
  multisigStorageAddress: Address;
}) {
  const { walletStorage, multisigStorage } = useWalletStore();
  const wallet = useWalletByName(walletStorage?.name as Address);
  const walletAccount = wallet?.accounts[0] as UiWalletAccount;
  const walletAddress = walletAccount?.address;

  const feePayer = useWalletAccountTransactionSigner(
    walletAccount,
    "solana:mainnet",
  );

  const updateTransaction = useUpdateTransaction(
    multisigStorageAddress,
    transactionIndex,
  );
  const isCloudKey = hasCloudPermission(
    multisigStorage?.account?.members || [],
    address(walletAddress),
  );
  const isExecuteDisabled = !isCloudKey || status !== "Approved";
  const isRejectDisabled = rejected.some((a) => a === walletAddress);
  const isApproveDisabled = approved.some((a) => a === walletAddress);
  const isCancelDisabled = cancelled.some((a) => a === walletAddress);

  const cancelHandler = async () => {
    try {
      const signature = await sendAndConfirmProposalCancelMessage({
        feePayer,
        memberAddress: address(walletAddress),
        multisigAddress: address(multisigStorageAddress),
        transactionIndex: BigInt(transactionIndex),
      });

      await updateTransaction();
      console.log("CancelProposal signature: ", signature);
    } catch (e) {
      console.error("Error [Cancel Proposal]: ", e);
      toast.error("Failed to Cancel Proposal");
    }
  };

  const approveHandler = async () => {
    try {
      const signature = await sendAndConfirmProposalApproveMessage({
        memo: "Approved by a Member",
        feePayer,
        memberAddress: address(walletAddress),
        multisigAddress: address(multisigStorageAddress),
        transactionIndex: BigInt(transactionIndex),
      });

      console.log("ApproveProposal signature: ", signature);
      await updateTransaction();
    } catch (e) {
      console.error("Error [Approve Proposal]: ", e);
      toast.error("Failed to Approve Proposal");
    }
  };

  const executeHandler = async () => {
    try {
      console.log(
        "Executing transaction: ",
        feePayer.address === walletAddress,
      );
      const signature = await sendAndConfirmExecuteAndCloseAccountsMessage({
        feePayer,
        rentCollectorAddress,
        memberAddress: address(walletAddress),
        multisigAddress: multisigStorageAddress,
        transactionIndex: BigInt(transactionIndex),
      });

      console.log("ExecuteAndCloseAccounts signature: ", signature);
      await updateTransaction();
    } catch (e) {
      console.error("Error [Execute, Close Accounts]: ", e);
      toast.error("Failed to Execute Vault Transaction");
    }
  };

  const rejectHandler = async () => {
    try {
      const signature = await sendAndConfirmProposalRejectMessage({
        feePayer,
        memberAddress: address(walletAddress),
        multisigAddress: address(multisigStorageAddress),
        transactionIndex: BigInt(transactionIndex),
      });

      console.log("RejectProposal signature: ", signature);
      await updateTransaction();
    } catch (e) {
      console.error("Error [Reject Proposal]: ", e);
      toast.error("Failed to Reject Proposal");
    }
  };

  const closeAccounts = async () => {
    try {
      const signature = await sendAndConfirmAccountsCloseMessage({
        feePayer,
        rentCollectorAddress,
        multisigAddress: address(multisigStorageAddress),
        transactionIndex: BigInt(transactionIndex),
      });

      console.log("CloseAccounts signature: ", signature);
      await updateTransaction();
    } catch (e) {
      console.error("Error [Close Accounts]: ", e);
      toast.error("Failed to Close Accounts");
    }
  };

  return (
    <AnimatePresence>
      {["Cancelled", "Rejected"].includes(status) && (
        <motion.div key={status} className="flex flex-row justify-center gap-4">
          <Button size="md" variant="bordered" onClick={closeAccounts}>
            Reclaim rent
          </Button>
        </motion.div>
      )}
      {status === "Active" && (
        <motion.div key={status} className="flex flex-row justify-center gap-4">
          <Button
            size="md"
            variant="bordered"
            onClick={rejectHandler}
            disabled={isRejectDisabled}
          >
            Reject
          </Button>
          <Button
            size="md"
            variant="bordered"
            onClick={approveHandler}
            disabled={isApproveDisabled}
          >
            Approve
          </Button>
        </motion.div>
      )}

      {status === "Approved" && (
        <motion.div key={status} className="flex flex-row justify-center gap-4">
          <Button
            size="md"
            variant="bordered"
            onClick={cancelHandler}
            disabled={isCancelDisabled}
          >
            Cancel
          </Button>
          <Button
            size="md"
            variant="bordered"
            onClick={executeHandler}
            disabled={isExecuteDisabled}
          >
            Execute
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
