import { Address } from "gill";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { IconArrowUp } from "~/components/ui/icons/IconArrowUp";

import { useWalletStore } from "~/state/wallet";

import { cn } from "~/utils/tw";
import { abbreviateAddress } from "~/utils/address";

import Footer from "./TransactionFooter";
import Progress, { Status } from "./TransactionProgress";

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
  cancelled,
  transactionIndex,
  rentCollectorAddress,
}: {
  message: any;
  status: Status;
  creator: Address;
  timestamp: number;
  rejected: Address[];
  approved: Address[];
  cancelled: Address[];
  transactionIndex: number;
  rentCollectorAddress: Address;
}) {
  const { multisigStorage } = useWalletStore();
  const [isOpen, onOpenChange] = useState(false);

  const statusColor = cn({
    "text-status-primary": status === "Active",
    "text-status-warning": status === "Approved",
    "text-status-success": status === "Executed",
    "text-status-error": ["Cancelled", "Rejected"].includes(status),
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
                cancelled={cancelled}
              />

              <Footer
                status={status}
                approved={approved}
                rejected={rejected}
                cancelled={cancelled}
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
