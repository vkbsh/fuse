import { forwardRef, Ref } from "react";
import { motion, AnimatePresence } from "motion/react";

import { LSWallet } from "~/state/wallet";
import { Button } from "~/components/ui/button";
import { abbreviateAddress } from "~/lib/address";

const SelectedMemberKey = forwardRef(
  (
    props: {
      wallet: LSWallet | null;
    },
    ref: Ref<HTMLButtonElement>,
  ) => {
    const { wallet, ...rest } = props;

    if (!wallet) {
      return null;
    }

    return (
      <Button
        ref={ref}
        variant="outline"
        className="flex flex-row gap-3 items-center"
        {...rest}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={wallet.address + wallet.name}
            initial={{ opacity: 0, rotateX: 90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: -90 }}
            transition={{ duration: 0.2 }}
            className="w-32 flex flex-row gap-3 items-center"
          >
            <span className="flex rounded-full justify-center items-center">
              <img
                src={wallet.icon}
                alt={wallet.name}
                className="rounded-full w-5 h-5"
              />
            </span>
            <span className="text-sm">{abbreviateAddress(wallet.address)}</span>
          </motion.span>
        </AnimatePresence>
      </Button>
    );
  },
);

export default SelectedMemberKey;
