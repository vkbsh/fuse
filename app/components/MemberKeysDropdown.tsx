import { address } from "gill";
import { motion } from "motion/react";
import { UiWallet, useConnect, useWallets } from "@wallet-standard/react";

import Tooltip from "~/components/ui/Tooltip";
import Dropdown from "~/components/ui/Dropdown";
import { IconLogo } from "~/components/ui/icons/IconLogo";
import { IconConnect } from "~/components/ui/icons/IconConnect";
import { IconDisconnect } from "~/components/ui/icons/IconDisconnect";
import { IconChevronDown } from "~/components/ui/icons/IconChevronDown";

import { Address } from "~/model/web3js";
import { abbreviateAddress } from "~/utils/address";
import { LSWallet, useWalletStore } from "~/state/wallet";
import { MemberPermissions } from "~/utils/parse-transaction";
import {
  getWalletByName,
  SOLANA_SIGN_AND_SEND_TRANSACTION,
} from "~/service/getWallets";
import { useEffect } from "react";

function getPermissionLabel(permissions?: number) {
  const isAllPermissions = MemberPermissions.All === permissions;
  const isVotePermissions = MemberPermissions.Vote === permissions;
  const permissionLabel = isAllPermissions
    ? "Cloud Key"
    : isVotePermissions
      ? "Recovery Key"
      : "";

  return permissionLabel;
}

export default function MemberKeysDropdown({
  onClick,
}: {
  onClick: () => void;
}) {
  const wallets = useWallets();

  const {
    currentWallet,
    currentMultisigWallet,
    history,
    updateHistory,
    removeWallet,
  } = useWalletStore();

  const members = currentMultisigWallet?.account?.members;

  useEffect(() => {
    const filteredWallets = wallets.filter((w) =>
      w.features.includes(SOLANA_SIGN_AND_SEND_TRANSACTION),
    );

    const updatedHistory = history?.map((w) => {
      const wallet = filteredWallets.find((w2) => w2.name === w.name);

      if (!wallet) {
        return w;
      }

      const account = wallet.accounts[0];

      const isMemberKey = members?.some((m) => m.key === account?.address);

      // TODO: Add check by member key

      return {
        name: wallet.name,
        icon: wallet.icon,
        address: account?.address || w.address,
      };
    });

    updateHistory(updatedHistory?.filter(Boolean));
  }, [wallets]);

  return (
    <Dropdown
      align="end"
      trigger={<CurrentAccount wallet={currentWallet} />}
      items={[
        ...(history || [])
          .sort((a, b) => (a.name[0] < b.name[0] ? 1 : -1))
          .map((wallet) => {
            const member = currentMultisigWallet?.account?.members.find(
              (m) => m.key === wallet.address,
            );

            const permission = member?.permissions?.mask;
            const permissionLabel = getPermissionLabel(permission);

            return (
              <div onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-row items-center gap-2 px-2 py-2">
                  <span className="text-white/60 text-sm">
                    {permissionLabel}
                  </span>
                </div>
                <Account
                  key={wallet.address}
                  walletStorage={wallet}
                  active={wallet.address === currentWallet?.address}
                />
              </div>
            );
          }),
        <motion.span
          onClick={onClick}
          whileHover={{ opacity: 1 }}
          className="cursor-pointer p-2 flex flex-row justify-between opacity-60"
        >
          <span>Connect a key</span>
          <IconConnect />
        </motion.span>,
      ]}
    />
  );
}

function Account({
  active,
  walletStorage,
}: {
  active: boolean;
  walletStorage: LSWallet;
}) {
  const wallet = getWalletByName(walletStorage.name);

  if (!wallet) {
    // TODO: check if need to remove wallet from history
    return null;
  }

  return (
    <WithWallet
      active={active}
      wallet={wallet}
      walletAddress={walletStorage.address}
    />
  );
}

function WithWallet({
  active,
  wallet,
  walletAddress,
}: {
  active: boolean;
  wallet: UiWallet;
  walletAddress: Address;
}) {
  const [, connect] = useConnect(wallet);
  const { removeWallet, currentMultisigWallet, saveWallet, selectWallet } =
    useWalletStore();

  const handleConnect = async () => {
    const [account] = await connect({ silent: true });

    if (account) {
      if (
        currentMultisigWallet?.account?.members.some(
          (m) => m.key === account.address,
        )
      ) {
        saveWallet({
          name: wallet.name,
          icon: wallet.icon,
          address: address(account.address),
        });

        selectWallet(wallet.name);
      } else {
        // TODO: Show toast
        removeWallet(wallet.name);
      }
    }
  };

  return (
    <motion.span className="flex flex-row items-center p-2 gap-6 justify-between">
      <div className="w-[132px] flex flex-row gap-2 items-center">
        <img
          src={wallet.icon}
          alt={wallet.name}
          className="rounded-full w-5 h-5"
        />
        <span className="text-sm">{abbreviateAddress(walletAddress)}</span>

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
            onClick={() => removeWallet(wallet.name)}
            className="cursor-pointer ml-auto"
            whileHover={{ color: "var(--color-status-error)" }}
          >
            <IconDisconnect />
          </motion.span>
        </Tooltip>
        <Tooltip text="Connect">
          <motion.span
            onClick={handleConnect}
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

function CurrentAccount({ wallet }: { wallet: null | LSWallet }) {
  return (
    <div className="cursor-pointer flex flex-row gap-3 items-center">
      <motion.div
        key={wallet?.address}
        initial={{
          opacity: 0,
          y: -5,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: -5,
        }}
        transition={{ duration: 0.5 }}
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
