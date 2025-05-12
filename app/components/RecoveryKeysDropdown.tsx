import { useEffect } from "react";
import { motion } from "motion/react";
import { useConnect, useWallets } from "@wallet-standard/react";

import Tooltip from "~/components/ui/Tooltip";
import Dropdown from "~/components/ui/Dropdown";
import { IconConnect } from "~/components/icons/IconConnect";
import { IconDisconnect } from "~/components/icons/IconDisconnect";
import { IconChevronDown } from "~/components/icons/IconChevronDown";

import { cn } from "~/utils/tw";
import { abbreviateAddress } from "~/utils/address";
import { LSWallet, useWalletStore } from "~/state/wallet";
import { MemberPermissions } from "~/utils/parse-transaction";

export default function RecoveryKeysDropdown({
  onClick,
}: {
  onClick: () => void;
}) {
  const { currentWallet, history } = useWalletStore();
  const { name, icon, address } = currentWallet || {};

  return (
    <Dropdown
      align="end"
      trigger={
        <div className="cursor-pointer flex flex-row gap-3 items-center min-h-8 py-1 px-4 rounded-2xl  bg-foreground">
          <span className="flex w-8 h-8 rounded-full bg-white justify-center items-center text-black">
            <img src={icon} alt={name} className="rounded-full w-6 h-6" />
          </span>
          <span className="w-20 font-semibold text-sm text-primary-text">
            {address ? abbreviateAddress(address) : "Select Account"}
          </span>
          <span>
            <IconChevronDown />
          </span>
        </div>
      }
      items={[
        ...(history || [])
          .sort((a, b) => (a.name[0] < b.name[0] ? 1 : -1))
          .map((wallet) => {
            const walletAddress = wallet?.address;

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
  const { removeWallet, saveWallet, currentMultisigWallet, selectWallet } =
    useWalletStore();
  const { address, name, icon } = wallet;

  const walletExtension = walletsExtension
    .filter((w) => w.features.includes("solana:signAndSendTransaction"))
    .find((w) => w.name === name);

  const [, connect] = useConnect(walletExtension);

  useEffect(() => {
    const tryConnectAndsaveWallet = async () => {
      const accounts = await connect({ silent: true });
      const currentAccount = accounts[0];

      if (wallet && currentAccount) {
        if (
          currentMultisigWallet?.account?.members.some(
            (m) => m.key === currentAccount.address,
          )
        ) {
          // saveWallet({
          //   name: wallet.name,
          //   icon: wallet.icon,
          //   address: currentAccount.address,
          // });
          // selectWallet(wallet.name);
        } else {
          // TODO: Show toast
          // removeWallet(wallet.name);
        }
      }
    };

    tryConnectAndsaveWallet();
  }, [walletsExtension]);

  const member = currentMultisigWallet?.account?.members.find(
    (m) => m.key === address,
  );
  const permissions = member?.permissions.mask;
  const isAllPermissions = MemberPermissions.All === permissions;
  const isVotePermissions = MemberPermissions.Vote === permissions;
  const permissionLabel = isAllPermissions
    ? "Cloud Key"
    : isVotePermissions
      ? "Recovery Key"
      : "";

  return (
    <motion.span
      onClick={(e) => e.stopPropagation()}
      className="flex flex-row items-center p-2 gap-6 justify-between"
    >
      <div>
        <span className="text-sm">{permissionLabel}</span>
      </div>
      <div className="w-[132px] flex flex-row gap-2 items-center">
        <img src={icon} alt={name} className="rounded-full w-5 h-5" />
        <span className="text-sm">{abbreviateAddress(address)}</span>

        <span
          className={cn("w-3 h-3 bg-transparent rounded-full ml-auto", {
            "bg-status-success": active,
          })}
        />
      </div>
      <div className="flex flex-row gap-2">
        <Tooltip text="Disconnect">
          <motion.span
            onClick={() => removeWallet(name)}
            className="cursor-pointer ml-auto"
            whileHover={{ color: "var(--color-status-error)" }}
          >
            <IconDisconnect />
          </motion.span>
        </Tooltip>
        <Tooltip text="Connect">
          <motion.span
            onClick={() => selectWallet(name)}
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
