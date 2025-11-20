import { toast } from "sonner";
import { address, type Address } from "gill";
import { AnimatePresence } from "motion/react";
import { type ReactNode, useMemo, useState } from "react";
import { type UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSigner } from "@solana/react";

import {
  sendAndConfirmAccountsCloseMessage,
  sendAndConfirmProposalCancelMessage,
  sendAndConfirmProposalRejectMessage,
  sendAndConfirmProposalApproveMessage,
  sendAndConfirmExecuteAndCloseAccountsMessage,
} from "~/program/multisig/message";
import { hasCloudPermission } from "~/program/multisig/utils/member";

import { useWalletStore } from "~/state/wallet";
import {
  useMemberBalance,
  useRefetchBalance,
  useRefetchTransactions,
} from "~/hooks/resources";

import TextShimmer from "~/components/ui/text-shimmer";
import Button, { type ButtonVariant } from "~/components/ui/button";
import { type Status } from "~/components/dialogs/TransactionDialog/TransactionProgress";

export default function TransactionFooter({
  status,
  approved,
  rejected,
  cancelled,
  threshold,
  onCloseDialog,
  vaultAddress,
  walletAccount,
  transactionIndex,
  rentCollectorAddress,
  staleTransactionIndex,
}: {
  status: Status;
  threshold: number;
  approved: Address[];
  rejected: Address[];
  cancelled: Address[];
  vaultAddress: Address;
  transactionIndex: number;
  onCloseDialog: () => void;
  staleTransactionIndex: number;
  rentCollectorAddress: Address;
  walletAccount: UiWalletAccount;
}) {
  const [isSubmitting, setIsSubmitting] = useState({
    reject: false,
    cancel: false,
    approve: false,
    execute: false,
    closeAccounts: false,
  });

  const multisigStorage = useWalletStore((s) => s.multisigStorage);

  const walletAddress = walletAccount?.address;
  const multisigAddress = multisigStorage?.address as Address;
  const refetchBalance = useRefetchBalance(vaultAddress);
  const refetchTransactions = useRefetchTransactions(multisigAddress);

  const { data: isMinRentBalance, isFetched } = useMemberBalance(
    address(walletAddress || ""),
  );

  const feePayer = useWalletAccountTransactionSigner(
    walletAccount,
    "solana:mainnet",
  );

  const isStaleTransaction = useMemo(() => {
    if (!staleTransactionIndex) {
      return false;
    }

    return transactionIndex <= staleTransactionIndex;
  }, [staleTransactionIndex, transactionIndex]);

  const rejectionCutoff = useMemo(() => {
    const totalMembers = multisigStorage?.account?.members?.length || 0;
    return totalMembers - threshold + 1;
  }, [multisigStorage?.account?.members?.length, threshold]);

  const isCloudKey = hasCloudPermission(
    multisigStorage?.account?.members || [],
    address(walletAddress),
  );

  const canVote = useMemo(() => {
    const member = multisigStorage?.account?.members?.find(
      (m) => m.key === walletAddress,
    );
    return member && (member.permissions.mask & 2) !== 0;
  }, [multisigStorage?.account?.members, walletAddress]);

  const canExecute = useMemo(() => {
    const member = multisigStorage?.account?.members?.find(
      (m) => m.key === walletAddress,
    );
    return member && (member.permissions.mask & 4) !== 0;
  }, [multisigStorage?.account?.members, walletAddress]);

  const hasUserApproved = useMemo(
    () => approved.some((a) => a === walletAddress),
    [approved, walletAddress],
  );
  const hasUserRejected = useMemo(
    () => rejected.some((a) => a === walletAddress),
    [rejected, walletAddress],
  );
  const hasUserCancelled = useMemo(
    () => cancelled.some((a) => a === walletAddress),
    [cancelled, walletAddress],
  );

  const canApprove =
    canVote && !hasUserApproved && !isStaleTransaction && status === "Active";
  const canReject =
    canVote && !hasUserRejected && !isStaleTransaction && status === "Active";
  const canCancel =
    canVote &&
    !hasUserCancelled &&
    (status === "Approved" || (status === "Active" && isStaleTransaction));
  const canExecuteTransaction =
    canExecute && status === "Approved" && !isStaleTransaction;

  const getWarningMessage = () => {
    if (isStaleTransaction && status === "Active") {
      if (!canVote) {
        return "This proposal is stale and cannot be approved or rejected. Connect Recovery Key to cancel it and reclaim rent.";
      }
      return "This proposal is stale and cannot be approved or rejected. You can cancel it to reclaim rent.";
    }

    if (isStaleTransaction && status === "Approved") {
      if (!canVote) {
        return "This proposal is stale and cannot be executed. Connect Recovery Key to cancel it and reclaim rent.";
      }
      return "This proposal is stale and cannot be executed. You can cancel it to reclaim rent.";
    }

    if (!canVote && status === "Active") {
      return "Connect Recovery Key to approve or reject this proposal.";
    }

    if (!canExecute && status === "Approved" && !isStaleTransaction) {
      return "Connect Cloud Key to execute this proposal, or use a Recovery Key to cancel it.";
    }

    if (
      status === "Approved" &&
      !isStaleTransaction &&
      !canVote &&
      !canExecute
    ) {
      return "Connect Cloud Key to execute this proposal, or a key with voting permissions to cancel it.";
    }

    if (["Cancelled", "Rejected", "Executed"].includes(status)) {
      return "This proposal is complete. You can reclaim rent from the proposal accounts.";
    }

    return null;
  };

  const cancelHandler = async () => {
    try {
      setIsSubmitting({ ...isSubmitting, cancel: true });
      const signature = await sendAndConfirmProposalCancelMessage({
        feePayer,
        memberAddress: address(walletAddress),
        multisigAddress: address(multisigAddress),
        transactionIndex: BigInt(transactionIndex),
      });

      console.log("Signature [Cancel Proposal]: ", signature);
      await refetchTransactions();
    } catch (e) {
      console.error("Error [Cancel Proposal]: ", e);
      toast.error("Failed to Cancel Proposal");
    } finally {
      setIsSubmitting({ ...isSubmitting, cancel: false });
      onCloseDialog();
    }
  };

  const approveHandler = async () => {
    try {
      setIsSubmitting({ ...isSubmitting, approve: true });
      const signature = await sendAndConfirmProposalApproveMessage({
        memo: "Approved by a Member",
        feePayer,
        memberAddress: address(walletAddress),
        multisigAddress: address(multisigAddress),
        transactionIndex: BigInt(transactionIndex),
      });

      console.log("Signature [Approve Proposal]: ", signature);
      await refetchTransactions();
    } catch (e) {
      console.error("Error [Approve Proposal]: ", e);
      toast.error("Failed to Approve Proposal");
    } finally {
      setIsSubmitting({ ...isSubmitting, approve: false });
      onCloseDialog();
    }
  };

  const executeHandler = async () => {
    try {
      setIsSubmitting({ ...isSubmitting, execute: true });
      const signature = await sendAndConfirmExecuteAndCloseAccountsMessage({
        feePayer,
        rentCollectorAddress,
        memberAddress: address(walletAddress),
        multisigAddress: multisigAddress,
        transactionIndex: BigInt(transactionIndex),
      });

      console.log("Signature [Execute, Close Accounts]: ", signature);
      await refetchTransactions();
      await refetchBalance();
    } catch (e) {
      console.error("Error [Execute, Close Accounts]: ", e);
      toast.error("Failed to Execute Vault Transaction");
    } finally {
      setIsSubmitting({ ...isSubmitting, execute: false });
      onCloseDialog();
    }
  };

  const rejectHandler = async () => {
    try {
      setIsSubmitting({ ...isSubmitting, reject: true });
      const signature = await sendAndConfirmProposalRejectMessage({
        feePayer,
        memberAddress: address(walletAddress),
        multisigAddress: address(multisigAddress),
        transactionIndex: BigInt(transactionIndex),
      });

      console.log("Signature [Reject Proposal]: ", signature);
      await refetchTransactions();
    } catch (e) {
      console.error("Error [Reject Proposal]: ", e);
      toast.error("Failed to Reject Proposal");
    } finally {
      setIsSubmitting({ ...isSubmitting, reject: false });
      onCloseDialog();
    }
  };

  const closeAccounts = async () => {
    try {
      setIsSubmitting({ ...isSubmitting, closeAccounts: true });
      const signature = await sendAndConfirmAccountsCloseMessage({
        feePayer,
        rentCollectorAddress,
        multisigAddress: address(multisigAddress),
        transactionIndex: BigInt(transactionIndex),
      });

      console.log("Signature [Close Accounts]: ", signature);
      await refetchTransactions();
    } catch (e) {
      console.error("Error [Close Accounts]: ", e);
      toast.error("Failed to Close Accounts");
    } finally {
      setIsSubmitting({ ...isSubmitting, closeAccounts: false });
      onCloseDialog();
    }
  };

  if (isFetched && !isMinRentBalance) {
    return (
      <div className="flex justify-center">
        <Button disabled className="pointer-events-none text-destructive">
          Insufficient SOL balance
        </Button>
      </div>
    );
  }

  const warningMessage = getWarningMessage();

  return (
    <>
      {warningMessage && (
        <p className="text-sm text-warning text-center -my-4">
          {warningMessage}
        </p>
      )}

      {["Cancelled", "Rejected"].includes(status) && (
        <div className="relative flex flex-row justify-center gap-2">
          <LoadingButton
            onClick={closeAccounts}
            isSubmitting={isSubmitting.closeAccounts}
          >
            Reclaim rent
          </LoadingButton>
        </div>
      )}

      {status === "Active" && (
        <div className="relative flex flex-row justify-center gap-2">
          {canReject && (
            <LoadingButton
              variant="secondary"
              onClick={rejectHandler}
              isSubmitting={isSubmitting.reject}
            >
              Reject ({rejected.length}/{rejectionCutoff})
            </LoadingButton>
          )}
          {canApprove && (
            <LoadingButton
              onClick={approveHandler}
              isSubmitting={isSubmitting.approve}
            >
              Approve ({approved.length}/{threshold})
            </LoadingButton>
          )}
          {isStaleTransaction && canCancel && (
            <LoadingButton
              variant="secondary"
              onClick={cancelHandler}
              isSubmitting={isSubmitting.cancel}
            >
              Cancel (Stale)
            </LoadingButton>
          )}
        </div>
      )}

      {status === "Approved" && (
        <div className="relative flex flex-row justify-center gap-2">
          {canCancel && (
            <LoadingButton
              variant="secondary"
              onClick={cancelHandler}
              isSubmitting={isSubmitting.cancel}
            >
              Cancel ({cancelled.length}/{threshold})
            </LoadingButton>
          )}
          {canExecuteTransaction && (
            <LoadingButton
              onClick={executeHandler}
              isSubmitting={isSubmitting.execute}
            >
              Execute
            </LoadingButton>
          )}
        </div>
      )}
    </>
  );
}

function LoadingButton({
  onClick,
  disabled,
  variant,
  children,
  isSubmitting,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  isSubmitting: boolean;
}) {
  return (
    <AnimatePresence>
      {isSubmitting ? (
        <Button
          variant={variant}
          onClick={onClick}
          className="pointer-events-none"
        >
          <TextShimmer spread={3}>{children}</TextShimmer>
        </Button>
      ) : (
        <Button variant={variant} onClick={onClick} disabled={disabled}>
          {children}
        </Button>
      )}
    </AnimatePresence>
  );
}
