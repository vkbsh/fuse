import { IconArrowUp } from "~/components/ui/icons/IconArrowUp";

import { cn } from "~/utils/tw";
import { abbreviateAddress } from "~/utils/address";

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
  status: any;
  timestamp: number;
}) {
  // TODO: Add custom status names
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
    <div className="w-full flex justify-between items-center gap-2">
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
          <span className="font-semibold">{abbreviateAddress(toAccount)}</span>
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
  );
}
