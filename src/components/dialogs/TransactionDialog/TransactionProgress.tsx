import { type Address } from "gill";
import { type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

import { SquareXIcon } from "~/components/ui/icons/SquareX";
import { SquareDotIcon } from "~/components/ui/icons/SquareDot";
import { CirclePlusIcon } from "~/components/ui/icons/CirclePlus";

import { abbreviateAddress } from "~/lib/address";

export type Status = "Active" | "Approved" | "Executed" | "Cancelled";

export default function TransactionProgress({
  status,
  approved,
  cancelled,
  initiated,
}: {
  status: Status;
  initiated: Address;
  approved: Address[];
  cancelled: Address[];
}) {
  const isCancelled = status === "Cancelled";
  const isAllApproved = status === "Approved" || approved.length === 2;

  return (
    <div className="flex flex-row justify-center gap-4 text-sm px-2">
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
              {addresses.map((address) =>
                !address ? null : (
                  <span key={address}>{abbreviateAddress(address)}</span>
                ),
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  );
}

function Line({ active }: { active: boolean }) {
  const color = active ? "var(--color-secondary)" : "var(--color-placeholder)";

  return (
    <motion.span animate={{ color }} className="relative flex w-0">
      <svg className="absolute top-3 translate-x-[-50%] left-1/2 w-[105px] h-px">
        <line
          x2="100%"
          strokeWidth="4"
          stroke="currentColor"
          strokeDasharray={active ? "none" : "4"}
        />
      </svg>
    </motion.span>
  );
}
