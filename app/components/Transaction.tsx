import { Address } from "gill";
import { ReactNode, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";
import { address, signAndSendTransactionMessageWithSigners } from "gill";

import Button from "~/components/ui/Button";
import { IconArrowUp } from "~/components/ui/icons/IconArrowUp";
import { IconSquareDot } from "~/components/ui/icons/IconSquareDot";
import { IconCircleDot } from "~/components/ui/icons/IconCircleDot";
import { IconCirclePlus } from "~/components/ui/icons/IconCirclePlus";

import { useWalletStore } from "~/state/wallet";
import { useWalletByName } from "~/hooks/wallet";

import {
  createProposalCancelInstruction,
  createProposalApproveInstruction,
} from "~/program/multisig/instruction";
import { getProposalPda } from "~/program/multisig/pda";
import { createMessageWithSigner } from "~/program/multisig/transaction";
import { createMessageExecuteAndCloseAccounts } from "~/program/multisig/utils/message";

import { refetchTransactions } from "~/hooks/resources";

import { cn } from "~/utils/tw";
import { toast } from "~/state/toast";
import { abbreviateAddress } from "~/utils/address";

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
  cancelled,
  rejected,
  timestamp,
  transactionIndex,
  rentCollectorAddress,
}: {
  status: any;
  message: any;
  creator: Address;
  timestamp: number;
  rentCollectorAddress: Address;
  approved: Address[];
  cancelled: Address[];
  rejected: Address[];
  transactionIndex: number;
}) {
  const { walletStorage, multisigStorage } = useWalletStore();
  const wallet = useWalletByName(walletStorage?.name as Address);
  const walletAccount = wallet?.accounts[0];

  const [isOpen, onOpenChange] = useState(false);
  const statusColor = cn({
    "": status === "Approved",
    "text-status-primary": ["Active", "Approved"].includes(status),
    "text-status-success": status === "Executed",
    "text-status-error": status === "Cancelled",
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
                initiated={creator}
              />
              {walletAccount && (
                <Footer
                  status={status}
                  creator={creator}
                  approved={approved}
                  walletAccount={walletAccount}
                  onClose={() => onOpenChange(false)}
                  transactionIndex={transactionIndex}
                  rentCollectorAddress={rentCollectorAddress}
                  walletStorageAddress={walletAccount.address as Address}
                  multisigStorageAddress={multisigStorage?.address as Address}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Progress({
  status,
  initiated,
  approved,
}: {
  status: "Approved" | "Executed";
  initiated: Address;
  approved: Address[];
}) {
  const isExecuted = status === "Executed";
  const isAllApproved = approved.length === 2;

  // // TODO: Add tx execute/*cancel loading state + animation

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
      <ProgressStatus
        label="Executed"
        active={isExecuted}
        icon={<IconCircleDot />}
        addresses={[initiated]}
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
  creator,
  onClose,
  approved,
  walletAccount,
  transactionIndex,
  rentCollectorAddress,
  walletStorageAddress,
  multisigStorageAddress,
}: {
  status: any;
  creator: Address;
  approved: Address[];
  onClose: () => void;
  transactionIndex: number;
  walletStorageAddress: Address;
  rentCollectorAddress: Address;
  walletAccount: UiWalletAccount;
  multisigStorageAddress: Address;
}) {
  const feePayer = useWalletAccountTransactionSendingSigner(
    walletAccount,
    "solana:mainnet",
  );

  const refetch = refetchTransactions(multisigStorageAddress);

  // TODO: Check if Voter permission
  // TODO: CHeck if Account already  approved
  const isApproveDisabled = approved.some((a) => a === walletAccount.address);
  // TODO: Check if All permission (Cloud Key)
  const isExecuteDisabled = !walletAccount.address;

  const cancelHandler = async () => {
    try {
      const message = await createMessageWithSigner({
        feePayer,
        instructions: [
          await createProposalCancelInstruction({
            memo: "Approved by a Member",
            proposalPda: await getProposalPda({
              multisigAddress: multisigStorageAddress,
              transactionIndex: BigInt(transactionIndex),
            }),
            memberAddress: address(walletStorageAddress),
            multisigPda: address(multisigStorageAddress),
          }),
        ],
      });

      await signAndSendTransactionMessageWithSigners(message);
      await refetch();
      onClose();
    } catch (e: any) {
      console.error("Error [Cancel]:", e);
      toast.error(e.message);
    }
  };

  const approveHandler = async () => {
    try {
      const message = await createMessageWithSigner({
        feePayer,
        instructions: [
          await createProposalApproveInstruction({
            memo: "Approved by a Member",
            transactionIndex: BigInt(transactionIndex),
            memberAddress: address(walletStorageAddress),
            multisigPda: address(multisigStorageAddress),
          }),
        ],
      });

      await signAndSendTransactionMessageWithSigners(message);
      await refetch();
      onClose();
    } catch (e: any) {
      console.error("Error [Approve]:", e);
      toast.error(e.message);
    }
  };

  const executeHandler = async () => {
    console.log({
      feePayer,
      memberAddress: walletStorageAddress,
      multisigPda: multisigStorageAddress,
      transactionIndex,
      rentCollectorAddress,
    });

    try {
      const message = await createMessageExecuteAndCloseAccounts({
        feePayer,
        memberAddress: walletStorageAddress,
        multisigPda: multisigStorageAddress,
        transactionIndex: BigInt(transactionIndex),
        rentCollectorPda: address(rentCollectorAddress),
      });
      await signAndSendTransactionMessageWithSigners(message);
      await refetch();
      onClose();
    } catch (e: any) {
      console.error("Error [Execute, Close Accounts]:", e);
      toast.error(e.message);
    }
  };

  return (
    <div className="flex flex-row justify-center gap-4">
      {status === "Active" && (
        <>
          <Button
            size="md"
            variant="bordered"
            onClick={cancelHandler}
            disabled={isApproveDisabled}
          >
            Cancel
          </Button>
          <Button
            size="md"
            variant="bordered"
            onClick={approveHandler}
            disabled={isApproveDisabled}
          >
            Approve
          </Button>
        </>
      )}

      {status === "Approved" && (
        <Button
          size="md"
          variant="bordered"
          onClick={executeHandler}
          disabled={isExecuteDisabled}
        >
          Execute
        </Button>
      )}

      {["Executed", "Canceled", "Rejected"].includes(status) && (
        <Button size="md" variant="bordered" onClick={onClose}>
          Ok
        </Button>
      )}
    </div>
  );
}
