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

  // TODO: Animate with motion
  const statusColor = cn({
    "text-success": status === "Active",
    "text-warning": status === "Approved",
    "text-destructive": ["Cancelled", "Rejected"].includes(status),
  });

  return (
    <div className="flex flex-col items-center justify-between gap-2 rounded-xl">
      <AnimatePresence initial={false}>
        <motion.div
          initial={{
            x: -10,
            filter: "blur(6px)",
            backgroundColor: isOpen
              ? "var(--color-ring)"
              : "var(--color-background)",
          }}
          whileInView={{
            x: 0,
            filter: "blur(0px)",
          }}
          exit={{
            x: -10,
            filter: "blur(6px)",
          }}
          transition={{ duration: 0.4 }}
          onClick={() => onOpenChange(!isOpen)}
          className="w-full flex items-center justify-between rounded-xl p-3"
        >
          <div className="flex flex-row items-center gap-4">
            <span className="relative w-12 h-12 rounded-xl border border-ring  flex shrink-0 items-center justify-center">
              <ArrowUp />
              <img
                alt={name}
                src={logoURI}
                className="w-5 h-5 rounded-full absolute -top-1 -right-1"
              />
            </span>
            <span className="flex items-start flex-col gap-0">
              <span className="capitalize text-base">Send</span>
              <span className="flex gap-1 text-sm font-medium">
                {amount?.toFixed(9).replace(/\.?0+$/, "")}{" "}
                <span className="uppercase">{symbol?.toLowerCase()}</span>
              </span>
            </span>
          </div>
          <div className="w-full flex flex-row mt-auto items-end justify-between gap-2 max-w-[300px]">
            <div className="font-medium text-sm flex flex-row gap-2">
              <span className="">To</span>
              <span>{abbreviateAddress(toAccount)}</span>
            </div>
            {timestamp && (
              <span className="font-medium text-sm">{formattedDate}</span>
            )}
            <span
              className={cn(statusColor, "w-18 text-sm text-right capitalize")}
            >
              {status === "Approved" ? "Ready" : status}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {isOpen && walletAccount && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full overflow-hidden !bg-background"
          >
            <div className="flex flex-1 flex-col p-6 justify-end w-full">
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
