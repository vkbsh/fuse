import { motion } from "motion/react";

import Tooltip from "~/components/ui/Tooltip";
import Dropdown from "~/components/ui/Dropdown";
import { IconDots } from "~/components/icons/IconDots";
import { IconCopy } from "~/components/icons/IconCopy";
import { IconConnect } from "~/components/icons/IconConnect";
import { IconDisconnect } from "~/components/icons/IconDisconnect";

import { abbreviateAddress } from "~/utils/address";
import { LSWallet, useWalletStore } from "~/state/wallet";

export default function DisconnectDropdown({
  onConnect,
}: {
  onConnect: () => void;
}) {
  const { currentWallet, history } = useWalletStore();

  return (
    <Dropdown
      align="end"
      trigger={<IconDots />}
      items={[
        ...(history || []).map((wallet) => {
          if (!wallet?.address) return null;

          return (
            <Account
              wallet={wallet}
              key={wallet?.address}
              active={wallet?.address === currentWallet?.address}
            />
          );
        }),
        <motion.span
          onClick={onConnect}
          whileHover={{ opacity: 1 }}
          className="cursor-pointer p-2 flex flex-row justify-between opacity-60"
        >
          <span>Connect new key</span>
          <IconConnect />
        </motion.span>,
      ]}
    />
  );
}

function Account({ active, wallet }: { active: boolean; wallet: LSWallet }) {
  const { removeWallet } = useWalletStore();
  const { address, name, icon } = wallet || {};

  const connect: () => void = () => console.log("Connect account", address);
  const dissconnect: () => void = () => removeWallet(address);
  const copyClipboard: () => void = () =>
    navigator.clipboard.writeText(address);

  return (
    <motion.span
      onClick={(e) => e.stopPropagation()}
      className="flex flex-row items-center p-2 gap-6 justify-between"
    >
      <div className="flex flex-row gap-2 items-center">
        <img src={icon} alt={name} className="rounded-full w-5 h-5" />
        <span className="text-sm">{abbreviateAddress(address)}</span>
        {active && (
          <span className="w-3 h-3 bg-status-success rounded-full ml-auto" />
        )}
      </div>
      <div className="flex flex-row gap-2">
        <Tooltip text="Copy">
          <motion.span
            onClick={copyClipboard}
            className="cursor-pointer ml-auto"
            whileHover={{ color: "var(--color-status-success)" }}
          >
            <IconCopy />
          </motion.span>
        </Tooltip>
        <Tooltip text="Disconnect">
          <motion.span
            onClick={dissconnect}
            className="cursor-pointer ml-auto"
            whileHover={{ color: "var(--color-status-error)" }}
          >
            <IconDisconnect />
          </motion.span>
        </Tooltip>
        <Tooltip text="Connect">
          <motion.span
            onClick={connect}
            className="cursor-pointer ml-auto"
            whileHover={{ color: "var(--color-status-success)" }}
          >
            <IconConnect />
          </motion.span>
        </Tooltip>
      </div>
    </motion.span>
  );
}
