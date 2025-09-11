import { toast } from "sonner";
import { useMemo } from "react";
import { address, type Address } from "gill";
import { type UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSigner } from "@solana/react";

import Button from "~/components/ui/button";

import {
  sendAndConfirmAccountsCloseMessage,
  sendAndConfirmProposalCancelMessage,
  sendAndConfirmProposalRejectMessage,
  sendAndConfirmProposalApproveMessage,
  sendAndConfirmExecuteAndCloseAccountsMessage,
} from "~/program/multisig/message";
import { hasCloudPermission } from "~/program/multisig/utils/member";

import { useWalletStore } from "~/state/wallet";
import { useRefetchTransactions, useRefetchBalance } from "~/hooks/resources";
import { type Status } from "~/components/dialogs/TransactionDialog/TransactionProgress";

export default function TransactionFooter({
  status,
  approved,
  rejected,
  cancelled,
  onCloseDialog,
  vaultAddress,
  walletAccount,
  transactionIndex,
  rentCollectorAddress,
}: {
  status: Status;
  approved: Address[];
  rejected: Address[];
  cancelled: Address[];
  vaultAddress: Address;
  transactionIndex: number;
  onCloseDialog: () => void;
  rentCollectorAddress: Address;
  walletAccount: UiWalletAccount;
}) {
  const multisigStorage = useWalletStore((s) => s.multisigStorage);

  const walletAddress = walletAccount?.address;
  const multisigAddress = multisigStorage?.address as Address;
  const refetchBalance = useRefetchBalance(vaultAddress);
  const refetchTransactions = useRefetchTransactions(multisigAddress);

  const feePayer = useWalletAccountTransactionSigner(
    walletAccount,
    "solana:mainnet",
  );

  const isCloudKey = hasCloudPermission(
    multisigStorage?.account?.members || [],
    address(walletAddress),
  );
  const isExecuteDisabled = !isCloudKey || status !== "Approved";
  const isRejectDisabled = useMemo(
    () => rejected.some((a) => a === walletAddress),
    [rejected, walletAddress],
  );
  const isApproveDisabled = useMemo(
    () => approved.some((a) => a === walletAddress),
    [approved, walletAddress],
  );
  const isCancelDisabled = useMemo(
    () => cancelled.some((a) => a === walletAddress),
    [cancelled, walletAddress],
  );

  const cancelHandler = async () => {
    try {
      await sendAndConfirmProposalCancelMessage({
        feePayer,
        memberAddress: address(walletAddress),
        multisigAddress: address(multisigAddress),
        transactionIndex: BigInt(transactionIndex),
      });

      await refetchTransactions();
    } catch (e) {
      console.error("Error [Cancel Proposal]: ", e);
      toast.error("Failed to Cancel Proposal");
    } finally {
      onCloseDialog();
    }
  };

  const approveHandler = async () => {
    try {
      await sendAndConfirmProposalApproveMessage({
        memo: "Approved by a Member",
        feePayer,
        memberAddress: address(walletAddress),
        multisigAddress: address(multisigAddress),
        transactionIndex: BigInt(transactionIndex),
      });

      await refetchTransactions();
    } catch (e) {
      console.error("Error [Approve Proposal]: ", e);
      toast.error("Failed to Approve Proposal");
    } finally {
      onCloseDialog();
    }
  };

  const executeHandler = async () => {
    try {
      await sendAndConfirmExecuteAndCloseAccountsMessage({
        feePayer,
        rentCollectorAddress,
        memberAddress: address(walletAddress),
        multisigAddress: multisigAddress,
        transactionIndex: BigInt(transactionIndex),
      });

      await refetchTransactions();
      await refetchBalance();
    } catch (e) {
      console.error("Error [Execute, Close Accounts]: ", e);
      toast.error("Failed to Execute Vault Transaction");
    } finally {
      onCloseDialog();
    }
  };

  const rejectHandler = async () => {
    try {
      await sendAndConfirmProposalRejectMessage({
        feePayer,
        memberAddress: address(walletAddress),
        multisigAddress: address(multisigAddress),
        transactionIndex: BigInt(transactionIndex),
      });

      await refetchTransactions();
    } catch (e) {
      console.error("Error [Reject Proposal]: ", e);
      toast.error("Failed to Reject Proposal");
    } finally {
      onCloseDialog();
    }
  };

  const closeAccounts = async () => {
    try {
      await sendAndConfirmAccountsCloseMessage({
        feePayer,
        rentCollectorAddress,
        multisigAddress: address(multisigAddress),
        transactionIndex: BigInt(transactionIndex),
      });

      await refetchTransactions();
    } catch (e) {
      console.error("Error [Close Accounts]: ", e);
      toast.error("Failed to Close Accounts");
    } finally {
      onCloseDialog();
    }
  };

  return (
    <>
      {["Cancelled", "Rejected"].includes(status) && (
        <div className="flex flex-row justify-center gap-2">
          <Button onClick={closeAccounts}>Reclaim rent</Button>
        </div>
      )}
      {status === "Active" && (
        <div className="flex flex-row justify-center gap-2">
          <Button
            variant="secondary"
            onClick={rejectHandler}
            disabled={isRejectDisabled}
          >
            Reject
          </Button>
          <Button onClick={approveHandler} disabled={isApproveDisabled}>
            Approve
          </Button>
        </div>
      )}
      {status === "Approved" && (
        <div className="flex flex-row justify-center gap-2">
          <Button
            variant="secondary"
            onClick={cancelHandler}
            disabled={isCancelDisabled}
          >
            Cancel
          </Button>
          <Button onClick={executeHandler} disabled={isExecuteDisabled}>
            Execute
          </Button>
        </div>
      )}
    </>
  );
}
