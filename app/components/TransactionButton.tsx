import { useState } from "react";
import { Address } from "@solana/web3.js";

import Dialog from "~/components/ui/Dialog";
import Button from "~/components/ui/Button";

import { Status } from "./Transaction";
import { IconSquareDot } from "~/components/icons/IconSquareDot";
import { IconCircleDot } from "~/components/icons/IconCircleDot";
import { IconCirclePlus } from "~/components/icons/IconCirclePlus";

const states = [
  {
    label: "Initiated",
    icon: <IconCirclePlus />,
  },
  {
    label: "Approved",
    icon: <IconSquareDot />,
  },
  {
    label: "Executed",
    icon: <IconCircleDot />,
  },
];

type Props = {
  status: Status;
  address: Address;
  children: React.ReactNode;
};

export default function WithdrawButton({ children, address, status }: Props) {
  const [isModalOpen, setisModalOpen] = useState(false);

  return (
    <Dialog
      isOpen={isModalOpen}
      trigger={
        <button className="w-full" onClick={() => setisModalOpen(true)}>
          {children}
        </button>
      }
      close={() => setisModalOpen(false)}
    >
      <div className="flex flex-col gap-8 w-[516px] p-8 m-auto bg-black text-white rounded-[40px]">
        {children}
        <div className="p-7 flex flex-col gap-4">
          <div className="flex flex-row  items-center w-[80%] mx-auto justify-between">
            <ListIcons />
          </div>
          <div className="w-full flex flex-row justify-between items-center mx-auto">
            <ListStates address={address} />
          </div>
        </div>
        <div className="flex flex-row justify-center gap-1.5">
          {status === "ready" && (
            <>
              <Button size="md" variant="secondary">
                {/* TODO: Cancel Transaction */}
                Cancel
              </Button>
              <Button size="md" variant="secondary">
                {/* TODO: Approve Transaction */}
                Approve
              </Button>
            </>
          )}
          {["executed", "canceled"].includes(status) && (
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

const ListIcons = () => {
  return states.map(({ label, icon }, i) => {
    return (
      <>
        <span className="flex justify-center items-center text-white">
          {icon}
        </span>
        <span className="text-white">
          {i !== states.length - 1 && (
            <svg className="w-26 h-2 flex">
              <line
                x1="0"
                y1="5"
                y2="5"
                x2="100%"
                strokeWidth="1"
                strokeDasharray="4"
                stroke="currentColor"
              />
            </svg>
          )}
        </span>
      </>
    );
  });
};

const ListStates = ({ address }: { address: Address }) => {
  return states.map(({ label }) => {
    return <State key={label} address={address} label={label} />;
  });
};

const State = ({ address, label }: { address: Address; label: string }) => {
  return (
    <div className="flex flex-col gap-1 items-center font-semibold text-sm">
      <span>{label}</span>
      <span>
        With <span>{address}</span>
      </span>
    </div>
  );
};
