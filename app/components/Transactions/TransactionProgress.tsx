import { Address } from "gill";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SquareDot, CircleDot, CirclePlus } from "lucide-react";

import { abbreviateAddress } from "~/lib/address";

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
    <div className="flex flex-row justify-between gap-4 text-sm mx-auto">
      <AnimatePresence>
        <ProgressStatus
          key="Initiated"
          label="Initiated"
          active={true}
          icon={<CirclePlus />}
          addresses={[initiated]}
        />
        <ProgressStatus
          key="Approved"
          label="Approved"
          active={isAllApproved}
          icon={<SquareDot />}
          addresses={approved}
        />
        <ProgressStatus
          key="Cancelled"
          label="Cancelled"
          active={isCancelled}
          icon={<CircleDot />}
          addresses={cancelled}
        />
        <ProgressStatus
          key="Rejected"
          label="Rejected"
          active={isRejected}
          icon={<CircleDot />}
          addresses={rejected}
        />
        <ProgressStatus
          key="Executed"
          label="Executed"
          active={isExecuting || isExecuted}
          icon={<CircleDot />}
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
      <motion.div
        initial={{ opacity: active ? 1 : 0.8 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="w-[130px] flex flex-col items-center gap-5"
      >
        <span className="">{icon}</span>
        <div className="flex flex-col gap-1 items-center">
          <span className="">{label}</span>
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
      </motion.div>
    )
  );
}
