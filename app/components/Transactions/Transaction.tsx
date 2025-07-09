import { Address } from "gill";
import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { useWalletStore } from "~/state/wallet";

import { cn } from "~/lib/utils";
import { abbreviateAddress } from "~/lib/address";
import { useWalletByName } from "~/hooks/wallet";

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
  const { walletStorage } = useWalletStore();
  const [isOpen, onOpenChange] = useState(false);
  const wallet = useWalletByName(walletStorage?.name as Address);

  const walletAccount = wallet?.accounts[0];
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

  const statusColor = cn({
    "text-status-primary": status === "Active",
    "text-status-warning": status === "Approved",
    "text-status-success": status === "Executed",
    "text-status-error": ["Cancelled", "Rejected"].includes(status),
  });

  return (
    <div className="flex flex-col items-center justify-between gap-2 select-none">
      <div
        onClick={() => onOpenChange(!isOpen)}
        className={cn(
          "flex flex-row items-center justify-between w-full rounded-[20px] p-3 cursor-pointer h-[72px] bg-white  hover:bg-trn-hover duration-500",
          {
            "bg-trn-hover": isOpen,
          },
        )}
      >
        <div className="flex flex-row items-center gap-4">
          <span className="relative w-[42px] h-[42px] bg-foreground text-foreground-text rounded-[14px] flex shrink-0 items-center justify-center">
            <ArrowUp />
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
      </div>
      <AnimatePresence>
        {isOpen && walletAccount && (
          <motion.div
            layout
            className="w-full overflow-hidden bg-trn-hover rounded-[20px]"
          >
            <div className="flex flex-1 flex-col gap-6 justify-end w-full p-6">
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
                walletAccount={walletAccount}
                transactionIndex={transactionIndex}
                rentCollectorAddress={rentCollectorAddress}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
