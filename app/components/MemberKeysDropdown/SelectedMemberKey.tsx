import { motion } from "motion/react";
import { forwardRef, Ref } from "react";

import { useWalletStore } from "~/state/wallet";
import { abbreviateAddress } from "~/lib/address";

const SelectedMemberKey = forwardRef((props, ref: Ref<HTMLButtonElement>) => {
  const wallet = useWalletStore((state) => state.walletStorage);

  if (!wallet) {
    return null;
  }

  return (
    <button ref={ref} {...props}>
      <motion.span
        key={wallet.address + wallet.name}
        initial={{ opacity: 0, filter: "blur(5px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(5px)" }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between text-foreground h-[34px] w-42 rounded-2xl bg-accent-background px-3.5"
      >
        <img
          src={wallet.icon}
          alt={wallet.name}
          className="rounded-full w-5 h-5"
        />
        <span>{abbreviateAddress(wallet.address)}</span>
      </motion.span>
    </button>
  );
});

export default SelectedMemberKey;
