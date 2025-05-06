import { isAddress } from "gill";
import { motion } from "motion/react";
import { useConnect, useWallets } from "@wallet-standard/react";

import Tooltip from "~/components/ui/Tooltip";
import Dropdown from "~/components/ui/Dropdown";
import { IconDots } from "~/components/icons/IconDots";
import { IconCopy } from "~/components/icons/IconCopy";
import { IconConnect } from "~/components/icons/IconConnect";
import { IconDisconnect } from "~/components/icons/IconDisconnect";

import { abbreviateAddress } from "~/utils/address";
import { LSWallet, useWalletStore } from "~/state/wallet";
import { cn } from "~/utils/tw";

export default function RecoveryKeysDropdown({
  onClick,
}: {
  onClick: () => void;
}) {
  const { currentWallet, history } = useWalletStore();

  return (
    <Dropdown
      align="end"
      trigger={<IconDots />}
      items={[
        ...(history || [])
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((wallet) => {
            const walletAddress = wallet?.address;

            if (!walletAddress) return null;

            return (
              <Account
                wallet={wallet}
                key={walletAddress}
                active={walletAddress === currentWallet?.address}
              />
            );
          }),
        <motion.span
          onClick={onClick}
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
  const walletsExtension = useWallets();
  const { removeWallet, addWallet } = useWalletStore();
  const { address, name, icon } = wallet;

  const walletExtension = walletsExtension
    .filter((w) => w.chains.includes("solana:mainnet"))
    .find((w) => w.name === name);

  const [, connect] = useConnect(walletExtension);

  const dissconnectHandler = () => removeWallet(address);
  const copyClipboardHandler = () => navigator.clipboard.writeText(address);
  const connectHandler = async () => {
    const accounts = await connect({ silent: true });
    const accountAddress = accounts[0]?.address;

    if (isAddress(accountAddress)) {
      addWallet({
        name,
        icon,
        address: accountAddress,
      });
    }
  };

  return (
    <motion.span
      onClick={(e) => e.stopPropagation()}
      className="flex flex-row items-center p-2 gap-6 justify-between"
    >
      <div className="w-[132px] flex flex-row gap-2 items-center">
        <img src={icon} alt={name} className="rounded-full w-5 h-5" />
        <span className={cn("text-sm", { "blur-[3px]": !active })}>
          {abbreviateAddress(address)}
        </span>

        <span
          className={cn("w-3 h-3 bg-transparent rounded-full ml-auto", {
            "bg-status-success": active,
          })}
        />
      </div>
      <div className="flex flex-row gap-2">
        {active && (
          <Tooltip text="Copy">
            <motion.span
              onClick={copyClipboardHandler}
              className="cursor-pointer ml-auto"
              whileHover={{ color: "var(--color-status-success)" }}
            >
              <IconCopy />
            </motion.span>
          </Tooltip>
        )}
        <Tooltip text="Disconnect">
          <motion.span
            onClick={dissconnectHandler}
            className="cursor-pointer ml-auto"
            whileHover={{ color: "var(--color-status-error)" }}
          >
            <IconDisconnect />
          </motion.span>
        </Tooltip>
        <Tooltip text="Connect">
          <motion.span
            onClick={connectHandler}
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
