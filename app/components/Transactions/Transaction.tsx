import { ArrowUp } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "~/lib/utils";
import { abbreviateAddress } from "~/lib/address";

import { Status } from "./TransactionProgress";

export type Token = {
  name: string;
  symbol: string;
  amount: number;
  logoURI: string;
};

export default function Transaction({
  status,
  message,
  timestamp,
}: {
  message: any;
  status: Status;
  timestamp: number;
}) {
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
    <div className="rounded-2xl">
      <div className="flex items-center justify-between rounded-xl p-3">
        <div className="w-full flex flex-row items-center gap-4">
          <span className="relative w-12 h-12 rounded-2xl flex shrink-0 items-center justify-center">
            <ArrowUp />
            <span className="absolute -top-1 -right-1 rounded-full">
              <img alt={name} src={logoURI} className="w-5 h-5 rounded-full" />
            </span>
          </span>
          <div className="w-full flex items-start flex-col">
            <span className="capitalize text-base">Send</span>
            <div className="w-full flex flex-row justify-between text-sm font-medium">
              <div className="flex flex-row gap-2">
                <span>
                  {Number(amount)
                    ?.toFixed(9)
                    .replace(/\.?0+$/, "")}
                </span>
                <span className="uppercase">{symbol?.toLowerCase()}</span>
              </div>

              <div className="font-medium text-sm flex flex-row gap-2">
                <span className="">To</span>
                <span>{abbreviateAddress(toAccount)}</span>
              </div>
              <span className="font-medium text-sm">{formattedDate}</span>
              <motion.span
                className={cn(
                  statusColor,
                  "w-18 text-sm text-right capitalize",
                )}
              >
                {status === "Approved" ? "Ready" : status}
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
