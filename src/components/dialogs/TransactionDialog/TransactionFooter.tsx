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

import { cn } from "~/lib/utils";
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
      setIsSubmitting({ ...isSubmitting, approve: true });
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
      setIsSubmitting({ ...isSubmitting, reject: true });
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

  return (
    <>
      {["Cancelled", "Rejected"].includes(status) && (
        <div className="flex flex-row justify-center gap-2">
          <LoadingButton
            onClick={closeAccounts}
            isSubmitting={isSubmitting.closeAccounts}
          >
            Reclaim rent
          </LoadingButton>
        </div>
      )}
      {status === "Active" && (
        <div className="flex flex-row justify-center gap-2">
          <LoadingButton
            variant="secondary"
            onClick={
              isRejectDisabled
                ? () => toast.error("Connect another Member Key")
                : rejectHandler
            }
            disabled={isRejectDisabled}
            isSubmitting={isSubmitting.reject}
          >
            Reject
          </LoadingButton>

          <LoadingButton
            isSubmitting={isSubmitting.approve}
            onClick={
              isApproveDisabled
                ? () => toast.error("Connect another Member Key")
                : approveHandler
            }
            disabled={isApproveDisabled}
          >
            Approve
          </LoadingButton>
        </div>
      )}
      {status === "Approved" && (
        <div className="flex flex-row justify-center gap-2">
          <LoadingButton
            variant="secondary"
            onClick={
              isCancelDisabled
                ? () => toast.error("Connect another Member Key")
                : cancelHandler
            }
            disabled={isCancelDisabled}
            isSubmitting={isSubmitting.cancel}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            isSubmitting={isSubmitting.execute}
            onClick={
              isExecuteDisabled
                ? () =>
                    toast.error("Connect Recovery Key to execute transaction")
                : executeHandler
            }
            disabled={isExecuteDisabled}
          >
            Execute
          </LoadingButton>
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
          disabled
          variant={variant}
          onClick={onClick}
          className="pointer-events-none"
        >
          <TextShimmer>{children}</TextShimmer>
        </Button>
      ) : (
        <Button variant={variant} onClick={onClick} disabled={disabled}>
          {children}
        </Button>
      )}
    </AnimatePresence>
  );
}
