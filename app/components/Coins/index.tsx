import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValueEvent,
} from "motion/react";
import { Address } from "gill";
import { useRef, useState } from "react";

import { useWalletStore } from "~/state/wallet";
import { useWithdrawStore } from "~/state/withdraw";
import { useTokenInfo } from "~/hooks/resources";
import { hasCloudPermission } from "~/program/multisig/utils/member";

import Coin from "./Coin";
import WithdrawDialog from "~/components/WithdrawDialog";
import { DialogTrigger } from "~/components/ui/dialog";

export default function Coins({ vaultAddress }: { vaultAddress: Address }) {
  const container = useRef(null);
  const { set } = useWithdrawStore();
  const { data, isFetched } = useTokenInfo(vaultAddress);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { walletStorage, multisigStorage } = useWalletStore();

  const { scrollYProgress } = useScroll({
    container,
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // @ts-ignore
    if (scrollYProgress.prev === 0) {
      return setHasScrolled(false);
    }

    if (latest > 1) {
      setHasScrolled(false);
    } else {
      setHasScrolled(true);
    }
  });

  const topGradientOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 0.8]);
  const bottomGradientOpacity = useTransform(
    scrollYProgress,
    [0.9, 1],
    [0.8, 0],
  );

  const hasAllPermissions = hasCloudPermission(
    multisigStorage?.account?.members || [],
    walletStorage?.address,
  );

  return (
    <div className="relative flex flex-1 flex-col gap-2 overflow-y-scroll scroll-smooth scrollbar-hidden">
      <div
        ref={container}
        className="flex w-full h-full flex-1 flex-col gap-2 overflow-y-scroll scroll-smooth scrollbar-hidden"
      >
        <motion.div
          transition={{
            duration: 0.4,
          }}
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          style={{ opacity: hasScrolled ? topGradientOpacity : 0 }}
          className="h-18 absolute top-0 left-0 right-0 w-full bg-gradient-to-b from-background to-transparent z-10"
        />
        <motion.div
          transition={{
            duration: 0.4,
          }}
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          style={{ opacity: hasScrolled ? bottomGradientOpacity : 0 }}
          className="h-18 absolute bottom-0 right-0 left-0 w-full bg-gradient-to-t from-background to-transparent z-10"
        />
        <AnimatePresence>
          {isFetched &&
            data.map((token, i) => {
              return (
                <motion.div
                  key={token.address}
                  initial={{ opacity: 0, y: -5 }}
                  exit={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  {hasAllPermissions ? (
                    <WithdrawDialog>
                      <DialogTrigger asChild>
                        <button
                          className="w-full"
                          onClick={() => set("token", token)}
                        >
                          <Coin token={token} />
                        </button>
                      </DialogTrigger>
                    </WithdrawDialog>
                  ) : (
                    <Coin token={token} />
                  )}
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
}
