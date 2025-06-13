import { ReactNode, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";
import {
  address,
  Address,
  signAndSendTransactionMessageWithSigners,
} from "gill";

import Button from "~/components/ui/Button";
import { IconArrowUp } from "~/components/ui/icons/IconArrowUp";
import { IconSquareDot } from "~/components/ui/icons/IconSquareDot";
import { IconCircleDot } from "~/components/ui/icons/IconCircleDot";
import { IconCirclePlus } from "~/components/ui/icons/IconCirclePlus";

import { useWalletStore } from "~/state/wallet";
import { useWalletByName } from "~/hooks/wallet";
import { refetchTransactions } from "~/hooks/resources";

import {
  createProposalRejectInstruction,
  createProposalCancelInstruction,
  createProposalApproveInstruction,
  createVaultTransactionAccountsCloseInstruction,
} from "~/program/multisig/instruction";
import { hasCloudPermission } from "~/program/multisig/utils/member";
import { createMessageWithSigner } from "~/program/multisig/transaction";
import { createMessageExecuteAndCloseAccounts } from "~/program/multisig/utils/message";

import { cn } from "~/utils/tw";
import { toast } from "~/state/toast";
import { abbreviateAddress } from "~/utils/address";

import { Signer } from "~/program/multisig/transaction";

export type Token = {
  name: string;
  symbol: string;
  amount: number;
  logoURI: string;
};

export default function Transaction({
  status,
  creator,
  message,
  approved,
  rejected,
  timestamp,
  transactionIndex,
  rentCollectorAddress,
}: {
  status: any;
  message: any;
  creator: Address;
  timestamp: number;
  approved: Address[];
  cancelled: Address[];
  rejected: Address[];
  transactionIndex: number;
  rentCollectorAddress: Address;
}) {
  const { multisigStorage } = useWalletStore();
  const [isOpen, onOpenChange] = useState(false);

  const statusColor = cn({
    "text-status-primary": status === "Active",
    "text-status-warning": status === "Approved",
  });

  const { amount, toAccount, mint } = message || {};
  const { logoURI, name, symbol } = mint || {};

  const milliseconds = Number(timestamp) * 1000;
  const dateStamp = new Date(milliseconds);
  const formattedDate = dateStamp.toLocaleString(
    new Intl.DateTimeFormat().resolvedOptions().locale,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div className="flex flex-col items-center justify-between gap-2 select-none">
      <motion.div
        onClick={() => onOpenChange(!isOpen)}
        animate={{
          backgroundColor: isOpen
            ? "var(--color-trn-hover)"
            : "rgba(0, 0, 0, 0)",
        }}
        whileHover={{
          backgroundColor: "var(--color-trn-hover)",
          transition: { duration: 0.6, delay: 0 },
        }}
        className="flex flex-row items-center justify-between w-full rounded-[20px] p-3 cursor-pointer h-[72px]"
      >
        <div className="flex flex-row items-center gap-4">
          <span className="relative w-[42px] h-[42px] bg-foreground text-foreground-text rounded-[14px] flex shrink-0 items-center justify-center">
            <IconArrowUp />
            <img
              alt={name}
              src={logoURI}
              className="w-[20px] h-[20px] rounded-full absolute -top-1 -right-1"
            />
          </span>
          <span className="flex items-start flex-col gap-0">
            <span className="capitalize font-semibold text-base">Send</span>
            <span className="flex gap-1 text-sm font-medium">
              {amount?.toFixed(9).replace(/\.?0+$/, "")}{" "}
              <span className="text-foreground-text  uppercase">
                {symbol?.toLowerCase()}
              </span>
            </span>
          </span>
        </div>
        <div className="w-full flex flex-row mt-auto items-end justify-between gap-2 max-w-[300px]">
          <div className="font-medium text-sm flex flex-row gap-2">
            <span className="text-foreground-text">To</span>
            <span className="font-semibold">
              {abbreviateAddress(toAccount)}
            </span>
          </div>
          {timestamp && (
            <span className="text-foreground-text font-medium text-sm">
              {formattedDate}
            </span>
          )}
          <span
            className={cn(
              statusColor,
              "w-18 font-semibold text-sm text-right capitalize",
            )}
          >
            {status === "Approved" ? "Ready" : status}
          </span>
        </div>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
            }}
            className="overflow-hidden w-full rounded-[20px] bg-trn-hover"
          >
            <div className="flex flex-col gap-6 p-6 justify-end">
              <Progress
                status={status}
                approved={approved}
                rejected={rejected}
                initiated={creator}
              />

              <Footer
                status={status}
                approved={approved}
                initiated={creator}
                onClose={() => onOpenChange(false)}
                transactionIndex={transactionIndex}
                rentCollectorAddress={rentCollectorAddress}
                multisigStorageAddress={multisigStorage?.address as Address}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Progress({
  status,
  approved,
  rejected,
  initiated,
}: {
  initiated: Address;
  approved: Address[];
  rejected: Address[];
  status: "Approved";
}) {
  const isAllApproved = approved.length === 2;

  // // TODO: Add tx execute/*cancel loading state + animation
  const executed = "" as Address;
  const isExecuting = false;
  const isExecuted = false;

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      exit={{ height: 0 }}
      className="flex flex-row gap-20 justify-center text-sm font-semibold mx-auto"
    >
      <ProgressStatus
        label="Initiated"
        active={true}
        icon={<IconCirclePlus />}
        addresses={[initiated]}
      />
      <ProgressStatus
        label="Approved"
        active={isAllApproved}
        icon={<IconSquareDot />}
        addresses={approved}
      />
      {/* <ProgressStatus
        label="Rejected"
        active={null}
        icon={<span />}
        addresses={rejected}
      /> */}
      <ProgressStatus
        label="Executed"
        active={isExecuting || isExecuted}
        icon={<IconCircleDot />}
        addresses={[executed]}
      />
    </motion.div>
  );
}

function ProgressStatus({
  icon,
  label,
  active,
  addresses,
}: {
  label: string;
  active: boolean;
  icon: ReactNode;
  addresses: Address[];
}) {
  return (
    <div className="w-full flex flex-col items-center gap-5 text-black/30">
      <motion.span animate={{ color: active ? "#000" : "rgba(0, 0, 0, 0.3)" }}>
        {icon}
      </motion.span>
      <div className="flex flex-col gap-1 items-center">
        <span className="text-black">{label}</span>
        <div className="flex flex-row gap-1">
          <div className="flex flex-col">
            <span>With</span>
          </div>
          <div className="flex flex-col">
            {addresses.map((address) => {
              if (!address) return null;
              return <span key={address}>{abbreviateAddress(address)}</span>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer({
  status,
  onClose,
  approved,
  initiated,
  transactionIndex,
  rentCollectorAddress,
  multisigStorageAddress,
}: {
  status: any;
  approved: Address[];
  onClose: () => void;
  transactionIndex: number;
  initiated: Address;
  rentCollectorAddress: Address;
  multisigStorageAddress: Address;
}) {
  const { walletStorage, multisigStorage } = useWalletStore();
  const wallet = useWalletByName(walletStorage?.name as Address);
  const walletAccount = wallet?.accounts[0];
  const walletAddress = walletAccount?.address;

  if (!walletAccount || !walletAddress) return null;

  const feePayer: Signer = useWalletAccountTransactionSendingSigner(
    walletAccount as UiWalletAccount,
    "solana:mainnet",
  );

  const refetch = refetchTransactions(multisigStorageAddress);

  const isCloudKey = hasCloudPermission(
    multisigStorage?.account?.members || [],
    address(walletAddress),
  );

  const isApproveDisabled =
    (isCloudKey && initiated === walletAddress) ||
    approved.some((a) => a === walletAddress);
  const isExecuteDisabled = !isCloudKey;

  const cancelHandler = async () => {
    try {
      const message = await createMessageWithSigner({
        feePayer,
        instructions: [
          await createProposalCancelInstruction({
            memo: "Cancelled by a Member",
            memberAddress: address(walletAddress),
            transactionIndex: BigInt(transactionIndex),
            multisigPda: address(multisigStorageAddress),
          }),
          // await createVaultTransactionAccountsCloseInstruction({
          //   transactionIndex: BigInt(transactionIndex),
          //   multisigPda: address(multisigStorageAddress),
          //   rentCollectorPda: address(rentCollectorAddress),
          // }),
        ],
      });

      await signAndSendTransactionMessageWithSigners(message);
      await refetch();
      onClose();
    } catch (e: any) {
      console.error("Error [Cancel]:", e);
      toast.error("Failed to cancel transaction");
    }
  };

  const approveHandler = async () => {
    try {
      const message = await createMessageWithSigner({
        feePayer,
        instructions: [
          await createProposalApproveInstruction({
            memo: "Approved by a Member",
            memberAddress: address(walletAddress),
            transactionIndex: BigInt(transactionIndex),
            multisigPda: address(multisigStorageAddress),
          }),
        ],
      });

      await signAndSendTransactionMessageWithSigners(message);
      await refetch();
      onClose();
    } catch (e: any) {
      console.error("Error [Approve]:", e);
      toast.error("Failed to approve transaction");
    }
  };

  const executeHandler = async () => {
    try {
      const message = await createMessageExecuteAndCloseAccounts({
        feePayer,
        multisigPda: multisigStorageAddress,
        memberAddress: address(walletAddress),
        transactionIndex: BigInt(transactionIndex),
        rentCollectorPda: address(rentCollectorAddress),
      });
      await signAndSendTransactionMessageWithSigners(message);
      await refetch();
      onClose();
    } catch (e: any) {
      console.error("Error [Execute, Close Accounts]:", e);
      toast.error("Failed to execute transaction");
    }
  };

  const rejectHandler = async () => {
    try {
      const message = await createMessageWithSigner({
        feePayer,
        instructions: [
          await createProposalRejectInstruction({
            memo: "Rejected by a Member",
            memberAddress: address(walletAddress),
            transactionIndex: BigInt(transactionIndex),
            multisigPda: address(multisigStorageAddress),
          }),
        ],
      });

      await signAndSendTransactionMessageWithSigners(message);
      await refetch();
      onClose();
    } catch (e) {
      console.error("Error [Reject]:", e);
      toast.error("Failed to reject transaction");
    }
  };

  return (
    <AnimatePresence>
      {status === "Active" && (
        <motion.div key={status} className="flex flex-row justify-center gap-4">
          {/* <Button
            size="md"
            variant="bordered"
            onClick={rejectHandler}
            disabled={isApproveDisabled}
          >
            Reject
          </Button> */}
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
          <Button size="md" variant="bordered" onClick={cancelHandler}>
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
