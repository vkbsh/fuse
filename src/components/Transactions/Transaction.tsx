import { motion } from "motion/react";

import { ArrowUpIcon } from "~/components/ui/icons/ArrowUp";
import { type Status } from "~/components/dialogs/TransactionDialog/TransactionProgress";
import { type ParsedVaultTransactionMessageWithCreator } from "~/program/multisig/utils/parseTransferTransaction";

import { roundToken } from "~/lib/amount";
import { convertSecondsToDate } from "~/lib/date";
import { abbreviateAddress } from "~/lib/address";

export type Token = {
  name: string;
  symbol: string;
  amount: number;
  icon: string;
};

export default function Transaction({
  status,
  message,
  timestamp,
}: {
  status: Status;
  timestamp: number;
  message: ParsedVaultTransactionMessageWithCreator & { mint: Token };
}) {
  const { amount, toAccount, mint } = message || {};
  const { icon, name, symbol } = mint || {};

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
          <span className="relative w-[42px] h-[42px] rounded-2xl bg-[rgb(179,179,179)]/30 flex shrink-0 items-center justify-center">
            <ArrowUpIcon size={12} />
            <span className="absolute -top-1 -right-1 rounded-full">
              {icon ? (
                <img alt={name} src={icon} className="w-4 h-4 rounded-full" />
              ) : (
                <span className="flex w-5 h-5 rounded-full bg-placeholder" />
              )}
            </span>
          </span>
          <div className="w-full flex items-start flex-col">
            <span className="capitalize text-base font-semibold">Send</span>
            <div className="flex flex-row gap-6 w-full">
              <div className="flex flex-row gap-0 text-sm justify-between font-medium w-full">
                <div className="flex flex-row gap-1">
                  <span className="truncate max-w-[60px]">
                    {roundToken(Number(amount))}
                  </span>
                  <span className="uppercase text-placeholder">
                    {symbol?.toLowerCase()}
                  </span>
                </div>
                <div className="font-medium text-sm flex flex-row gap-1">
                  <span className="text-placeholder">To</span>
                  <span>{abbreviateAddress(toAccount)}</span>
                </div>
              </div>
              <span className="font-medium text-sm whitespace-nowrap">
                {convertSecondsToDate(timestamp)}
              </span>
              <motion.span
                key={status}
                initial={{ color: "var(--color-default)" }}
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
