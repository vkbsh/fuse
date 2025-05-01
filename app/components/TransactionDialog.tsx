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
  // address: Address;
  address: string;
  approved: Address[];
  children: React.ReactNode;
  transactionIndex: number;
};

export default function WithdrawButton({
  status,
  address = "????...????",
  children,
  approved,
  transactionIndex,
}: Props) {
  const isAllApproved = approved.length === 2;
  const isExecuted = status === "Executed"; // TODO: add tx submition loading state

  const currentWallet = { address: approved[0] }; // Mock
  const isApproveDisabled = approved.some((a) => a === currentWallet?.address);

  return (
    <Dialog trigger={children}>
      <div className="flex flex-col gap-8 w-[516px] p-8 m-auto bg-black text-white rounded-[40px]">
        {children}
        <div className="p-7 flex flex-col gap-4">
          <div className="flex flex-row gap-4 justify-center">
            <div className="w-full flex flex-col items-center gap-4">
              <IconCirclePlus />
              <div className="flex flex-col gap-2 items-center">
                <span>Initiated</span>
                <div className="flex flex-row gap-1">
                  <div className="flex flex-col font-semibold text-sm">
                    <span>With</span>
                  </div>
                  <div className="flex flex-col font-semibold text-sm">
                    <span>{abbreviateAddress(approved[0])}</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "w-full flex flex-col items-center gap-4 opacity-40",
                isAllApproved && "opacity-100",
              )}
            >
              <IconSquareDot />
              <div className="flex flex-col gap-2 items-center">
                <span className="opacity-100">Approved</span>
                <div className="flex flex-row gap-1">
                  <div className="flex flex-col font-semibold text-sm">
                    <span>With</span>
                  </div>
                  <div className="flex flex-col font-semibold text-sm">
                    {approved.map((address) => {
                      return <span>{abbreviateAddress(address)}</span>;
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "w-full flex flex-col items-center gap-4 opacity-40",
                isExecuted && "opacity-100",
              )}
            >
              <IconCircleDot />
              <div className="flex flex-col gap-2 items-center">
                <span className="opacity-100">Executed</span>
                <div className="flex flex-row gap-1">
                  <div className="flex flex-col font-semibold text-sm">
                    <span>With</span>
                  </div>
                  <div className="flex flex-col font-semibold text-sm">
                    <span>{abbreviateAddress(approved[0])}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-center gap-1.5">
          {status === "Active" && (
            <>
              <Button size="md" variant="secondary">
                {/* TODO: Cancel Transaction */}
                Cancel
              </Button>
              <Button
                disabled={isApproveDisabled}
                size="md"
                variant="secondary"
              >
                {/* TODO: Approve Transaction */}
                Approve
              </Button>
            </>
          )}
          {/* TODO: Add types from proposal */}
          {["Executed", "Canceled"].includes(status) && (
            <Button size="md" variant="secondary">
              {/* TODO: Close dialog */}
              Ok
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
