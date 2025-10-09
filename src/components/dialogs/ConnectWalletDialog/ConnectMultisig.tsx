import { toast } from "sonner";
import { useEffect } from "react";
import { type Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import motionProps from "~/lib/motion";
import { useWalletStore } from "~/state/wallet";
import { abbreviateAddress } from "~/lib/address";
import { useMultisigWallets } from "~/hooks/resources";
import { isKeyMember } from "~/program/multisig/utils/member";

import TextShimmer from "~/components/ui/text-shimmer";

export default function ConnectMultisig({
  walletName,
  walletIcon,
  accountAddress,
  onCloseDialog,
  onDone,
}: {
  walletName: string;
  walletIcon: string;
  accountAddress: Address;
  onCloseDialog: () => void;
  onDone: () => void;
}) {
  const addMultisig = useWalletStore((s) => s.addMultisig);
  const multisigStorage = useWalletStore((s) => s.multisigStorage);
  const addWalletStorage = useWalletStore((s) => s.addWalletStorage);
  const selectWalletName = useWalletStore((s) => s.selectWalletName);
  const selectMultisig = useWalletStore((s) => s.selectMultisig);

  const {
    isError,
    isLoading,
    isFetched,
    data: multisigWallets,
  } = useMultisigWallets(multisigStorage ? null : accountAddress) || {};

  const multisig = multisigStorage ?? multisigWallets?.[0] ?? null;

  useEffect(() => {
    if (isLoading || (!isFetched && !multisigStorage)) return;

    if (isError) {
      toast.error("Failed to fetch multisig wallets");
      onDone();
      return;
    }

    if (!multisig) {
      toast.error(
        `Can't find multisig for ${abbreviateAddress(accountAddress)}`,
      );
      onDone();
      return;
    }

    const member = isKeyMember(multisig.account?.members, accountAddress);
    if (!member) {
      toast.error(
        `${walletName}: ${abbreviateAddress(accountAddress)} is not a member key`,
      );
      onDone();
      return;
    }

    try {
      addWalletStorage({
        icon: walletIcon,
        name: walletName,
        address: accountAddress,
      });
      selectWalletName(walletName);
      if (!multisigStorage && multisigWallets) {
        addMultisig(multisigWallets);
        selectMultisig(multisigWallets?.[0].address);
      }
      onCloseDialog();
      onDone();
    } catch (e) {
      console.error("Error applying multisig:", e);
      toast.error("Failed to add multisig");
      onDone();
    }
  }, [isFetched, multisigStorage, multisig, accountAddress]);

  return (
    <AnimatePresence>
      {isLoading ? (
        <motion.span {...motionProps.global.fadeIn}>
          <TextShimmer duration={1}>Validating account...</TextShimmer>
        </motion.span>
      ) : (
        <motion.span {...motionProps.global.fadeIn}>{walletName}</motion.span>
      )}
    </AnimatePresence>
  );
}
