import { toast } from "sonner";
import { type Address, address } from "gill";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import {
  type UiWallet,
  type UiWalletAccount,
  useConnect,
  uiWalletAccountsAreSame,
} from "@wallet-standard/react";

import TextShimmer from "~/components/ui/text-shimmer";
import ConnectMultisig from "./ConnectMultisig";

import { cn } from "~/lib/utils";
import motionProps from "~/lib/motion";

export default function WalletOption({
  wallet,
  onCloseDialog,
  connectingWalletName,
  setConnectingWalletName,
}: {
  wallet: UiWallet;
  onCloseDialog: () => void;
  connectingWalletName: string;
  setConnectingWalletName: (walletName: string) => void;
}) {
  const [isConnecting, connect] = useConnect(wallet);
  const [accountAddress, setAccountAddress] = useState<Address | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const disabled =
    !!connectingWalletName && connectingWalletName !== wallet.name;

  useEffect(() => {
    if (isConnecting || isValidating) {
      setConnectingWalletName(wallet.name);
    } else {
      setConnectingWalletName("");
    }
  }, [isConnecting, isValidating, wallet.name, setConnectingWalletName]);

  const chooseNewAccount = useCallback(
    (
      existing: readonly UiWalletAccount[],
      next: readonly UiWalletAccount[],
    ) => {
      for (const acc of next) {
        if (!existing.some((ex) => uiWalletAccountsAreSame(acc, ex))) {
          return address(acc.address);
        }
      }
      return next[0] ? address(next[0].address) : null;
    },
    [],
  );

  const handleConnect = useCallback(async () => {
    try {
      setIsValidating(false);
      setAccountAddress(null);

      const existing = wallet.accounts ?? [];
      const next = await connect();
      const chosen = chooseNewAccount(existing, next ?? []);

      if (!chosen) {
        toast.error("No account found after connecting");
        return;
      }

      setAccountAddress(chosen);
      setIsValidating(true);
    } catch (e) {
      console.error("Wallet connect error:", e);
      toast.error("Failed to connect to wallet");
      setIsValidating(false);
      setAccountAddress(null);
    }
  }, [connect, wallet.accounts, chooseNewAccount]);

  const onDone = useCallback(() => {
    setIsValidating(false);
    setAccountAddress(null);
    setConnectingWalletName("");
  }, []);

  return (
    <button
      tabIndex={-1}
      disabled={disabled}
      onClick={disabled ? undefined : handleConnect}
      className={cn(
        "w-full relative flex flex-row items-center gap-4 rounded-2xl py-3 px-3 text-base font-semibold border border-white/0 hover:border-white/6 hover:bg-white/12 duration-300 transition-colors",
        disabled && "opacity-75 pointer-events-none blur-[1px]",
        connectingWalletName === wallet.name && "pointer-events-none",
      )}
    >
      <span className="w-[40px] h-[40px] flex items-center justify-center rounded-xl overflow-hidden">
        <img src={wallet.icon} alt={wallet.name} />
      </span>

      <AnimatePresence>
        {isConnecting ? (
          <motion.span {...motionProps.global.fadeIn}>
            <TextShimmer duration={1}>Wallet connecting...</TextShimmer>
          </motion.span>
        ) : isValidating && accountAddress ? (
          <ConnectMultisig
            onDone={onDone}
            walletIcon={wallet.icon}
            walletName={wallet.name}
            accountAddress={accountAddress}
            onCloseDialog={onCloseDialog}
          />
        ) : (
          <motion.span {...motionProps.global.fadeIn}>
            {wallet.name}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
