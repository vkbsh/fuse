import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useState } from "react";
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

import { cn } from "~/utils/tw";
import { toast } from "~/state/toast";
import { Address } from "~/model/web3js";
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
  refetch,
  approved,
  cancelled,
  timestamp,
  transactionIndex,
  rentCollectorAddress,
}: {
  status: any;
  message: any;
  creator: Address;
  timestamp: number;
  refetch: () => Promise<void>;
  rentCollectorAddress: Address;
  approved: Address[];
  cancelled: Address[];
  transactionIndex: number;
}) {
  const { storageWallet, storageMultisigWallet } = useWalletStore();
  const wallet = useWalletByName(storageWallet?.name as Address);
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
        whileHover={{
          backgroundColor: "var(--color-trn-hover)",
          transition: { duration: 0.6, delay: 0 },
        }}
        onClick={() => onOpenChange(!isOpen)}
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
            className="origin-top overflow-hidden w-full rounded-[20px] bg-amber-950"
          >
            <div className="w-full h-[220px] grow-0 flex-1 shrink-0 flex flex-col p-4 justify-between">
              <Progress
                status={status}
                approved={approved}
                initiated={creator}
              />
              {walletAccount && (
                <Footer
                  status={status}
                  creator={creator}
                  refetch={refetch}
                  approved={approved}
                  walletAccount={walletAccount}
                  onClose={() => onOpenChange(false)}
                  transactionIndex={transactionIndex}
                  rentCollectorAddress={rentCollectorAddress}
                  storageWalletAddress={walletAccount.address as Address}
                  storageMultisigWalletAddress={
                    storageMultisigWallet?.address as Address
                  }
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
      className="px-2 py-4 pt-3 pb-0"
    >
      <div className="flex flex-row gap-4 justify-center text-sm font-semibold">
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
      </div>
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
    <div className="w-full flex flex-col items-center gap-5 text-white/40">
      <motion.span
        animate={{ color: active ? "#fff" : "rgba(255, 255, 255, 0.3)" }}
      >
        {icon}
      </motion.span>
      <div className="flex flex-col gap-1 items-center">
        <span className="text-white">{label}</span>
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
  refetch,
  creator,
  onClose,
  approved,
  walletAccount,
  transactionIndex,
  rentCollectorAddress,
  storageWalletAddress,
  storageMultisigWalletAddress,
}: {
  status: any;
  creator: Address;
  approved: Address[];
  onClose: () => void;
  refetch: () => Promise<void>;
  transactionIndex: number;
  storageWalletAddress: Address;
  rentCollectorAddress: Address;
  walletAccount: UiWalletAccount;
  storageMultisigWalletAddress: Address;
}) {
  const feePayer = useWalletAccountTransactionSendingSigner(
    walletAccount,
    "solana:mainnet",
  );

  // TODO: Check if Voter permission
  // TODO: CHeck if Account already did approve or cancel
  const isApproveDisabled = approved.some((a) => a === walletAccount.address);
  // TODO: Check if All permission (Cloud Key)
  const isExecuteDisabled = creator !== walletAccount.address;

  const cancelHandler = async () => {
    try {
      const message = await createMessageWithSigner({
        feePayer,
        instructions: [
          await createProposalCancelInstruction({
            memo: "Approved by a Member",
            proposalPda: await getProposalPda({
              multisigAddress: storageMultisigWalletAddress,
              transactionIndex: BigInt(transactionIndex),
            }),
            memberAddress: address(storageWalletAddress),
            multisigPda: address(storageMultisigWalletAddress),
          }),
        ],
      });

      await signAndSendTransactionMessageWithSigners(message);
      refetch().then((index) => {
        console.log("Refetch", index);
        onClose();
      });
    } catch (error) {
      console.error("Error [Cancel]:", error);
      toast.error(error.message);
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
            memberAddress: address(storageWalletAddress),
            multisigPda: address(storageMultisigWalletAddress),
          }),
        ],
      });

      await signAndSendTransactionMessageWithSigners(message);
      refetch().then((index) => {
        console.log("Refetch", index);
        onClose();
      });
    } catch (error) {
      console.error("Error [Approve]:", error);
      toast.error(error.message);
    }
  };

  const executeHandler = async () => {
    try {
      const message = await createMessageExecuteAndCloseAccounts({
        feePayer,
        memberAddress: storageWalletAddress,
        multisigPda: storageMultisigWalletAddress,
        transactionIndex: BigInt(transactionIndex),
        rentCollectorPda: address(rentCollectorAddress),
      });
      await signAndSendTransactionMessageWithSigners(message);
      refetch().then((index) => {
        console.log("Refetch", index);
        onClose();
      });
    } catch (error) {
      console.error("Error [Execute, Close Accounts]:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-row justify-center gap-1.5">
      {status === "Active" && (
        <>
          <Button
            size="md"
            variant="cancel"
            onClick={cancelHandler}
            disabled={isApproveDisabled}
          >
            Cancel
          </Button>
          <Button
            size="md"
            variant="secondary"
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
          variant="secondary"
          onClick={executeHandler}
          disabled={isExecuteDisabled}
        >
          Execute
        </Button>
      )}

      {["Executed", "Canceled", "Rejected"].includes(status) && (
        <Button size="md" variant="secondary" onClick={onClose}>
          Ok
        </Button>
      )}
    </div>
  );
}
