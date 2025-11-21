import { toast } from "sonner";
import { address, type Address } from "gill";
import { AnimatePresence } from "motion/react";
import { type ReactNode, useMemo, useState } from "react";
import { type UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSigner } from "@solana/react";

import {
  sendAndConfirmAccountsCloseMessage,
  sendAndConfirmProposalApproveMessage,
  sendAndConfirmExecuteAndCloseAccountsMessage,
  sendAndConfirmProposalCancelMessage,
  sendAndConfirmProposalCancelAndCloseAccountsMessage,
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
  cancelled: Address[];
  vaultAddress: Address;
  transactionIndex: number;
  onCloseDialog: () => void;
  staleTransactionIndex: number;
  rentCollectorAddress: Address;
  walletAccount: UiWalletAccount;
}) {
  const [isSubmitting, setIsSubmitting] = useState({
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

  const isCloudKey = hasCloudPermission(
    multisigStorage?.account?.members || [],
    address(walletAddress),
  );

  const hasUserApproved = useMemo(
    () => approved.some((a) => a === walletAddress),
    [approved, walletAddress],
  );
  const hasUserCancelled = useMemo(
    () => cancelled.some((a) => a === walletAddress),
    [cancelled, walletAddress],
  );

  const canApprove =
    !hasUserApproved && !isStaleTransaction && status === "Active";
  const canCancel =
    !hasUserCancelled &&
    (status === "Approved" || (status === "Active" && isStaleTransaction));
  const canExecuteTransaction =
    isCloudKey && status === "Approved" && !isStaleTransaction;

  const cancelHandler = async () => {
    try {
      setIsSubmitting({ ...isSubmitting, cancel: true });

      if (cancelled.length === 1) {
        const signature =
          await sendAndConfirmProposalCancelAndCloseAccountsMessage({
            feePayer,
            rentCollectorAddress,
            memberAddress: address(walletAddress),
            multisigAddress: address(multisigAddress),
            transactionIndex: BigInt(transactionIndex),
          });
        console.log("Signature [Cancel Proposal, Close Accounts]: ", signature);
      } else {
        const signature = await sendAndConfirmProposalCancelMessage({
          feePayer,
          memberAddress: address(walletAddress),
          multisigAddress: address(multisigAddress),
          transactionIndex: BigInt(transactionIndex),
        });
        console.log("Signature [Cancel Proposal]: ", signature);
      }

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

  if (isStaleTransaction || status === "Cancelled") {
    return (
      <div className="flex flex-row justify-center gap-2">
        <LoadingButton
          onClick={closeAccounts}
          isSubmitting={isSubmitting.closeAccounts}
        >
          Reclaim rent
        </LoadingButton>
      </div>
    );
  }

  if (status === "Active") {
    return (
      <div className="relative flex flex-row justify-center gap-2">
        {!canApprove && (
          <span className="absolute -top-7.5 text-sm text-warning text-center">
            Please connect a Recovery Key to Approve transaction
          </span>
        )}
        <LoadingButton
          disabled={!canApprove}
          onClick={approveHandler}
          isSubmitting={isSubmitting.approve}
        >
          {`Approve (${approved.length}/${threshold})`}
        </LoadingButton>
      </div>
    );
  }

  if (status === "Approved") {
    let approveWarningMessage = "";

    if (!canExecuteTransaction && canCancel) {
      approveWarningMessage =
        "Please connect Cloud Key to Execute the transaction";
    } else if (canExecuteTransaction && !canCancel) {
      approveWarningMessage =
        "Please connect Recovery Key to Cancel the transaction";
    } else if (!canExecuteTransaction && !canCancel) {
      approveWarningMessage = "Please connect Cloud Key";
    }

    return (
      <div className="relative flex flex-row justify-center gap-2">
        {approveWarningMessage && (
          <span className="absolute -top-7.5 text-sm text-warning text-center">
            {approveWarningMessage}
          </span>
        )}
        <LoadingButton
          variant="secondary"
          disabled={!canCancel}
          onClick={cancelHandler}
          isSubmitting={isSubmitting.cancel}
        >
          {`Cancel (${cancelled.length}/${threshold})`}
        </LoadingButton>
        <LoadingButton
          onClick={executeHandler}
          disabled={!canExecuteTransaction}
          isSubmitting={isSubmitting.execute}
        >
          Execute
        </LoadingButton>
      </div>
    );
  }

  return null;
}

function LoadingButton({
  onClick,
  disabled,
  variant,
  children,
  isSubmitting,
}: {
  children: string;
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
        <Button
          variant={variant}
          onClick={onClick}
          disabled={disabled}
          className={disabled ? "pointer-events-none" : ""}
        >
          {children}
        </Button>
      )}
    </AnimatePresence>
  );
}
