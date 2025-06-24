import { Address } from "gill";
import { ReactNode } from "react";
import { AnimatePresence } from "motion/react";

import Animate from "~/components/animated/Animate";
import { IconSquareDot } from "~/components/ui/icons/IconSquareDot";
import { IconCircleDot } from "~/components/ui/icons/IconCircleDot";
import { IconCirclePlus } from "~/components/ui/icons/IconCirclePlus";

import { cn } from "~/utils/tw";
import { abbreviateAddress } from "~/utils/address";

export type Status =
  | "Active"
  | "Approved"
  | "Rejected"
  | "Executed"
  | "Cancelled";

export default function TransactionProgress({
  status,
  approved,
  rejected,
  cancelled,
  initiated,
}: {
  status: Status;
  initiated: Address;
  approved: Address[];
  rejected: Address[];
  cancelled: Address[];
}) {
  const isRejected = status === "Rejected";
  const isExecuted = status === "Executed";
  const isCancelled = status === "Cancelled";
  const isAllApproved = status === "Approved";

  // // TODO: Add tx execute/*cancel loading state + animation
  const executed = "" as Address;
  const isExecuting = false;

  return (
    <Animate
      variant="collapse"
      className="flex flex-row justify-between gap-4 text-sm font-semibold mx-auto"
    >
      <AnimatePresence>
        <ProgressStatus
          key="Initiated"
          label="Initiated"
          active={true}
          icon={<IconCirclePlus />}
          addresses={[initiated]}
        />
        <ProgressStatus
          key="Approved"
          label="Approved"
          active={isAllApproved}
          icon={<IconSquareDot />}
          addresses={approved}
        />
        <ProgressStatus
          key="Cancelled"
          label="Cancelled"
          active={isCancelled}
          icon={<IconCircleDot />}
          addresses={cancelled}
        />
        <ProgressStatus
          key="Rejected"
          label="Rejected"
          active={isRejected}
          icon={<IconCircleDot />}
          addresses={rejected}
        />
        <ProgressStatus
          key="Executed"
          label="Executed"
          active={isExecuting || isExecuted}
          icon={<IconCircleDot />}
          addresses={[executed]}
        />
      </AnimatePresence>
    </Animate>
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
    addresses?.[0] && (
      <Animate
        variant="fadeIn"
        className="w-[130px] flex flex-col items-center gap-5 text-black-30"
      >
        <span
          className={cn("text-black-30 duration-500", active && "text-black")}
        >
          {icon}
        </span>
        <div className="flex flex-col gap-1 items-center">
          <span className="text-black">{label}</span>
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
      </Animate>
    )
  );
}
