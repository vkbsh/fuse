import { motion } from "motion/react";

import { cn } from "~/lib/utils";
import { abbreviateAddress } from "~/lib/address";

import { Status } from "~/components/dialog/TransactionDialog/TransactionProgress";
import { ArrowUpIcon } from "~/components/ui/icons/ArrowUp";

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

  let statusColor = "var(--color-default)";

  if (status === "Approved") {
    statusColor = "var(--color-warning)";
  }
  if (["Cancelled", "Rejected"].includes(status)) {
    statusColor = "var(--color-destructive)";
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-between w-full">
        <div className="w-full flex flex-row items-center gap-4">
          <span className="relative w-[42px] h-[42px] rounded-2xl bg-accent-background flex shrink-0 items-center justify-center">
            <ArrowUpIcon size={12} />
            <span className="absolute -top-1 -right-1 rounded-full">
              {logoURI ? (
                <img
                  alt={name}
                  src={logoURI}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <span className="flex w-5 h-5 rounded-full bg-placeholder" />
              )}
            </span>
          </span>
          <div className="w-full flex items-start flex-col">
            <span className="capitalize text-base font-semibold">Send</span>
            <div className="w-full flex flex-row justify-end gap-6 text-sm font-medium">
              <div className="flex flex-row gap-1 mr-auto">
                <span>
                  {Number(amount)
                    ?.toFixed(9)
                    .replace(/\.?0+$/, "")}
                </span>
                <span className="uppercase text-placeholder">
                  {symbol?.toLowerCase()}
                </span>
              </div>
              <div className="font-medium text-sm flex flex-row gap-2">
                <span className="text-placeholder">To</span>
                <span>{abbreviateAddress(toAccount)}</span>
              </div>
              <span className="font-medium text-sm whitespace-nowrap">
                {formattedDate}
              </span>
              <motion.span
                key={status}
                animate={{ color: statusColor }}
                className="w-16 text-sm text-right capitalize"
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
