import { useState } from "react";

import Button from "~/components/ui/Button";
import Dialog from "~/components/ui/Dialog";

import { IconSquareDot } from "~/components/icons/IconSquareDot";
import { IconCircleDot } from "~/components/icons/IconCircleDot";
import { IconCirclePlus } from "~/components/icons/IconCirclePlus";

import { cn } from "~/utils/tw";
import { Address } from "~/model/web3js";
import { abbreviateAddress } from "~/utils/address";

import { Status } from "./Transaction";

type Props = {
  status: Status;
  approved: Address[];
  transactionIndex: number;
  children: React.ReactNode;
  currentWalletAddress: Address;
};

export default function TransactionDialog({
  status,
  children,
  approved,
  transactionIndex,
  currentWalletAddress,
}: Props) {
  const [isOpen, setOpen] = useState(false);
  const createdByAddress = approved[0] || "";
  const executedByAddress = approved[0] || "";
  const isExecuted = status === "Executed";
  const isAllApproved = approved.length === 2;
  const isApproveDisabled = approved.some((a) => a === currentWalletAddress);

  // TODO: add tx submition loading state

  const closeHandler = () => {
    console.log("Close Tx modal");
    setOpen(false);
  };

  const cancelHandler = () => {
    console.log("cancelHandler", transactionIndex);
  };

  const approveHandler = () => {
    console.log("approveHandler", transactionIndex);
  };

  return (
    <Dialog isOpen={isOpen} trigger={children} onOpenChange={setOpen}>
      <div className="flex flex-col gap-8 w-[516px] p-8 m-auto bg-black text-white rounded-[40px]">
        {children}
        <div className="px-2 py-4 pt-3 pb-5">
          <div className="flex flex-row gap-4 justify-center text-sm font-semibold">
            <div className="w-full flex flex-col items-center gap-5">
              <IconCirclePlus />
              <div className="flex flex-col gap-1 items-center">
                <span className="text-white">Initiated</span>
                <div className="flex flex-row gap-1">
                  <div className="flex flex-col">
                    <span>With</span>
                  </div>
                  <div className="flex flex-col">
                    <span>{abbreviateAddress(createdByAddress)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "w-full flex flex-col items-center gap-5 text-white/30",
                isAllApproved && "text-white",
              )}
            >
              <IconSquareDot />
              <div className="flex flex-col gap-1 items-center">
                <span className="text-white">Approved</span>
                <div className="flex flex-row gap-1">
                  <div className="flex flex-col">
                    <span>With</span>
                  </div>
                  <div className="flex flex-col">
                    {approved.map((address) => {
                      if (!address) return null;
                      return <span>{abbreviateAddress(address)}</span>;
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "w-full flex flex-col items-center gap-5 text-white/30",
                isExecuted && "text-white",
              )}
            >
              <IconCircleDot />
              <div className="flex flex-col gap-1 items-center">
                <span className="text-white">Executed</span>
                <div className="flex flex-row gap-1">
                  <div className="flex flex-col">
                    <span>With</span>
                  </div>
                  <div className="flex flex-col">
                    <span>{abbreviateAddress(executedByAddress)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-center gap-1.5">
          {status === "Active" && (
            <>
              <Button size="md" variant="cancel" onClick={closeHandler}>
                {/* TODO: Cancel Transaction */}
                Cancel
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={approveHandler}
                disabled={isApproveDisabled}
              >
                Approve
              </Button>
            </>
          )}
          {/* TODO: Add types from proposal */}
          {["Executed", "Canceled"].includes(status) && (
            <Button size="md" variant="secondary" onClick={closeHandler}>
              {/* TODO: Close dialog */}
              Ok
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
