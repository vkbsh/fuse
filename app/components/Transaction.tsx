import { cn } from "~/utils/tw";

import { IconArrowUp } from "~/components/icons/IconArrowUp";
import { IconArrowDown } from "~/components/icons/IconArrowDown";
import { Address } from "~/model/web3js";
import { abbreviateAddress } from "~/utils/address";
import { useWalletStore } from "~/state/wallet";

export type Status =
  | "Active"
  | "Rejected"
  | "Approved"
  | "Executed"
  | "Cancelled";

export type Transaction = {
  message: {
    txType: string;
    fromAccount: Address;
    toAccount: Address;
    amount: number;
  };
  approved: Address[];
  rejected: Address[];
  cancelled: Address[];
  transactionIndex: number;
  status: string;
  timestamp: number;
};

export default function Transaction({
  message,
  status,
  timestamp,
}: Transaction) {
  // TODO: Add custom status names

  const statusColor = cn({
    "": status === "Approved",
    "text-status-primary": ["Active", "Approved"].includes(status),
    "text-status-success": status === "Executed",
    "text-status-error": status === "Cancelled",
  });

  const milliseconds = Number(timestamp) * 1000;
  const dateStamp = new Date(milliseconds);
  const userLocale = new Intl.DateTimeFormat().resolvedOptions().locale;

  const formattedDate = dateStamp.toLocaleString(userLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const { logoURI, name, symbol } = message?.mint || {};

  return (
    <div className="flex justify-between items-center gap-4">
      <div className="flex flex-row items-center gap-4">
        <span className="relative w-[42px] h-[42px] bg-foreground text-foreground-text rounded-[14px] flex items-center justify-center">
          <IconArrowUp />
          <img
            src={logoURI}
            alt={name}
            className="w-[20px] h-[20px] rounded-full absolute -top-1 -right-1"
          />
        </span>
        <span className="flex items-start flex-col gap-0">
          <span className="capitalize font-semibold text-base">Send</span>
          <span className="text-sm font-medium">
            {message?.amount.toFixed(9).replace(/\.?0+$/, "")}{" "}
            <span className="text-foreground-text  uppercase">
              {symbol?.toLowerCase()}
            </span>
          </span>
        </span>
      </div>
      <div className="flex flex-row mt-auto items-end  gap-6">
        <div className="font-medium text-sm flex flex-row gap-2">
          <span className="text-foreground-text">To</span>
          <span className="font-semibold">
            {message?.toAccount ? abbreviateAddress(message?.toAccount) : null}
          </span>
        </div>
        {timestamp && (
          <span className="w-18 text-foreground-text font-medium text-sm">
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
  );
}
