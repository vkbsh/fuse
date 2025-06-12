import { motion } from "motion/react";

import Tooltip from "~/components/ui/Tooltip";
import Dropdown from "~/components/ui/Dropdown";
import { IconLogo } from "~/components/ui/icons/IconLogo";
import { IconConnect } from "~/components/ui/icons/IconConnect";
import { IconDisconnect } from "~/components/ui/icons/IconDisconnect";
import { IconChevronDown } from "~/components/ui/icons/IconChevronDown";

import { useDialog } from "~/state/dialog";
import { LSWallet, useWalletStore } from "~/state/wallet";

import { abbreviateAddress } from "~/utils/address";

import {
  getPermissionLabel,
  CLOUD_KEY_LABEL,
  RECOVERY_KEY_LABEL,
} from "~/program/multisig/utils/member";

export default function MemberKeysDropdown() {
  const { onOpenChange } = useDialog("connectWallet");
  const { walletHistory, walletStorage, multisigStorage } = useWalletStore();

  const items = [
    ...(walletHistory || [])
      .map((wallet) => {
        const members = multisigStorage?.account?.members || [];

        const permissionLabel = getPermissionLabel(members, wallet.address);

        return {
          ...wallet,
          permissionLabel,
          name: wallet.name,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => {
        const order: { [key: string]: number } = {
          [CLOUD_KEY_LABEL]: 0,
          [RECOVERY_KEY_LABEL]: 1,
        };

        return order[a.permissionLabel] - order[b.permissionLabel];
      })
      .map((wallet) => {
        return (
          <div
            key={wallet.address}
            onClick={(e) => e.stopPropagation()}
            className="p-2"
          >
            <Account
              key={wallet.address}
              wallet={wallet}
              permissionLabel={wallet.permissionLabel}
              active={
                wallet.address === walletStorage?.address &&
                wallet.name === walletStorage?.name
              }
            />
          </div>
        );
      }),
    <motion.button
      whileHover={{ opacity: 1 }}
      onClick={() => onOpenChange(true)}
      className="w-full cursor-pointer p-2 flex flex-row justify-between opacity-60"
    >
      <span>Connect a key</span>
      <IconConnect />
    </motion.button>,
  ];

  return (
    <Dropdown
      align="end"
      items={items}
      trigger={<CurrentAccount wallet={walletStorage} />}
    />
  );
}

function Account({
  active,
  wallet,
  permissionLabel,
}: {
  active: boolean;
  permissionLabel: string;
  wallet: LSWallet;
}) {
  if (!wallet) {
    return null;
  }

  const { removewalletStorage, selectWalletName } = useWalletStore();

  return (
    <div className="flex flex-col">
      <span className="text-white/60 text-sm">{permissionLabel}</span>
      <motion.span className="flex flex-row items-center py-2 gap-6 justify-between">
        <div className="w-[132px] flex flex-row gap-2 items-center">
          <img
            src={wallet.icon}
            alt={wallet.name}
            className="rounded-full w-5 h-5"
          />
          <span className="text-sm">{abbreviateAddress(wallet?.address)}</span>

          <motion.span
            className="w-3 h-3 bg-transparent rounded-full ml-auto"
            animate={{
              opacity: active ? 1 : 0,
              backgroundColor: active
                ? "var(--color-status-success)"
                : "transparent",
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className="flex flex-row gap-2">
          <Tooltip text="Disconnect">
            <motion.span
              onClick={() => removewalletStorage(wallet.name)}
              className="cursor-pointer ml-auto"
              whileHover={{ color: "var(--color-status-error)" }}
            >
              <IconDisconnect />
            </motion.span>
          </Tooltip>
          <Tooltip text="Connect">
            <motion.span
              onClick={() => selectWalletName(wallet.name)}
              className="cursor-pointer ml-auto"
              whileHover={{ color: "var(--color-status-success)" }}
            >
              <IconConnect />
            </motion.span>
          </Tooltip>
        </div>
      </motion.span>
    </div>
  );
}

function CurrentAccount({ wallet }: { wallet: null | LSWallet }) {
  return (
    <div className="cursor-pointer flex flex-row gap-3 items-center">
      <motion.div
        key={wallet?.address}
        initial={{
          y: -5,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        exit={{
          y: -5,
          opacity: 0,
        }}
        transition={{ duration: 0.6 }}
        className="flex flex-row gap-3 items-center"
      >
        {wallet ? (
          <span className="flex w-[42px] h-[42px] rounded-full bg-[#EBEBEB] justify-center items-center text-black">
            <img
              src={wallet.icon}
              alt={wallet.name}
              className="rounded-full w-5 h-5"
            />
          </span>
        ) : (
          <span className="w-[42px] h-[42px] rounded-full bg-[#EBEBEB] flex items-center justify-center text-black">
            <IconLogo />
          </span>
        )}
        <span className="font-semibold w-[90px] text-sm text-primary-text">
          {wallet?.address
            ? abbreviateAddress(wallet.address)
            : "Select Account"}
        </span>
      </motion.div>
      <span>
        <IconChevronDown />
      </span>
    </div>
  );
}
