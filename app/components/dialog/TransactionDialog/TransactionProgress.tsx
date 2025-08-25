import { Address } from "gill";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

import { SquareDotIcon } from "~/components/ui/icons/SquareDot";
import { CircleDotIcon } from "~/components/ui/icons/CircleDot";
import { CirclePlusIcon } from "~/components/ui/icons/CirclePlus";
import { CircleXIcon } from "~/components/ui/icons/CircleX";
import { SquareXIcon } from "~/components/ui/icons/SquareX";

import { abbreviateAddress } from "~/lib/address";

export type Status =
  | "Active"
  | "Approved"
  | "Rejected"
  | "Executed"
  | "Cancelled";

export default function TransactionProgress({
  status,
  executed,
  approved,
  rejected,
  cancelled,
  initiated,
}: {
  status: Status;
  executed: Address;
  initiated: Address;
  approved: Address[];
  rejected: Address[];
  cancelled: Address[];
}) {
  const isRejected = status === "Rejected";
  const isCancelled = status === "Cancelled";
  const isAllApproved = status === "Approved";

  return (
    <div className="flex flex-row justify-between text-sm mx-auto">
      <AnimatePresence initial={false}>
        <ProgressStatus
          key="Initiated"
          label="Initiated"
          active={true}
          icon={<CirclePlusIcon size={25} />}
          addresses={[initiated]}
        />
        {approved.length > 0 && (
          <Line key="line-approved" active={isAllApproved} />
        )}
        <ProgressStatus
          key="Approved"
          label="Approved"
          active={isAllApproved}
          icon={<SquareDotIcon size={25} />}
          addresses={approved}
        />
        {cancelled.length > 0 && (
          <Line key="line-cancelled" active={isCancelled} />
        )}
        <ProgressStatus
          key="Cancelled"
          label="Cancelled"
          active={isCancelled}
          icon={<SquareXIcon size={25} />}
          addresses={cancelled}
        />
        {rejected.length > 0 && (
          <Line key="line-rejected" active={isRejected} />
        )}
        <ProgressStatus
          key="Rejected"
          label="Rejected"
          active={isRejected}
          icon={<CircleXIcon size={25} />}
          addresses={rejected}
        />
        {executed && <Line key="line-executed" active={false} />}
        <ProgressStatus
          key="Executed"
          label="Executed"
          active={false}
          icon={<CircleDotIcon size={25} />}
          addresses={[executed]}
        />
      </AnimatePresence>
    </div>
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
      <motion.div className="w-[130px] flex flex-col items-center gap-4">
        <motion.span
          animate={{
            color: active
              ? "var(--color-secondary)"
              : "var(--color-placeholder)",
          }}
        >
          {icon}
        </motion.span>
        <div className="flex flex-col gap-1 items-center font-semibold">
          <span className="">{label}</span>
          <div className="flex flex-row gap-1 text-placeholder">
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
      </motion.div>
    )
  );
}

function Line({ active }: { active: boolean }) {
  return (
    <motion.span
      animate={{
        color: active ? "var(--color-secondary)" : "var(--color-placeholder)",
      }}
      className="relative flex w-0"
    >
      <svg
        className="absolute top-3 translate-x-[-50%] left-1/2 w-[80px] h-px"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x2="100%"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="4"
        />
      </svg>
    </motion.span>
  );
}
