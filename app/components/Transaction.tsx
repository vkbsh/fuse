import { cn } from "~/utils/tw";

import { IconArrowUp } from "~/components/icons/IconArrowUp";
import { IconArrowDown } from "~/components/icons/IconArrowDown";
import { Address } from "@solana/web3.js";
import { abbreviateAddress } from "~/utils/address";
import { useWalletStore } from "~/state/wallet";

export type TransactionType = "send" | "receive";
export type Status = "ready" | "executed" | "cancelled";

export type Transaction = {
  message: {
    instructionType: string;
    fromAccount: Address;
    toAccount: Address;
    lamports: number;
  };
  approved: Address[];
  rejected: Address[];
  cancelled: Address[];
  transactionIndex: number;
  status: string;
  timestamp: number;
};

const getIconByType = (type: TransactionType) => {
  switch (type) {
    case "send":
      return <IconArrowUp />;
    case "receive":
      return <IconArrowDown />;
    default:
      return <span className="w-4 h-4 bg-black rounded-full" />;
  }
};

export default function Transaction({
  message,
  status,
  timestamp,
}: Transaction) {
  // TODO: Add custom status names

  const statusColor = cn({
    "text-status-primary": status === "Active",
    "text-status-success": status === "Executed",
    "text-status-error": status === "Cancelled",
  });

  const { currentWallet } = useWalletStore();

  const isReceiver = currentWallet?.address === message.toAccount;
  const type = isReceiver ? "receive" : "send";
  const milliseconds = Number(timestamp) * 1000;
  const dateStamp = new Date(milliseconds);
  const userLocale = new Intl.DateTimeFormat().resolvedOptions().locale;

  const formattedDate = dateStamp.toLocaleString(userLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex justify-between items-center gap-4">
      <div className="flex flex-row items-center gap-4">
        <span className="relative w-[42px] h-[42px] bg-foreground text-foreground-text rounded-[14px] flex items-center justify-center">
          {getIconByType(type)}
          <span className="absolute -top-1 -right-1 w-[20px] h-[20px] rounded-full overflow-hidden flex items-center justify-center border-2 border-background">
            {/* {icon} */}
            {/* TODO: Get token icon */}
          </span>
        </span>
        <span className="flex flex-col gap-0">
          <span className="capitalize font-semibold text-base">{type}</span>
          <span className="text-sm font-medium">
            {message.lamports}{" "}
            <span className="text-foreground-text  uppercase">
              {/* {code} */}
              {/* TODO: Get token code */}
            </span>
          </span>
        </span>
      </div>
      <div className="flex flex-row items-center gap-6">
        <div className="font-medium text-sm flex flex-row gap-2">
          <span className="text-foreground-text">To</span>
          <span className="font-semibold">
            {abbreviateAddress(message.toAccount)}
          </span>
        </div>
        {timestamp && (
          <span className="shrink-0 text-foreground-text font-medium text-sm">
            {formattedDate}
          </span>
        )}

        <span
          className={cn(
            statusColor,
            "w-18 font-semibold text-sm text-right capitalize",
          )}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
