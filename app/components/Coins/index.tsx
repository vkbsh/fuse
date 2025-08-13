import { Address } from "gill";
import { motion, AnimatePresence } from "motion/react";

import { useWalletStore } from "~/state/wallet";
import { fadeInListItemProps } from "~/lib/motion";
import { useWithdrawStore } from "~/state/withdraw";
import { TokenData, useTokenInfo } from "~/hooks/resources";
import { hasCloudPermission } from "~/program/multisig/utils/member";

import Coin from "~/components/Coins/Coin";
import { DialogTrigger } from "~/components/ui/dialog";
import WithdrawDialog from "~/components/WithdrawDialog";
import CoinSkeleton from "~/components/Coins/CoinSkeleton";

export default function Coins({ vaultAddress }: { vaultAddress: Address }) {
  const { data, isFetched } = useTokenInfo(vaultAddress);
  const hasData = isFetched && data?.length;

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-scroll p-4 scroll-smooth scrollbar-hidden -mx-7 -mt-4">
      <AnimatePresence mode="popLayout">
        {!hasData ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.6 }}
            className="w-full flex gap-4 p-3"
          >
            <CoinSkeleton />
          </motion.div>
        ) : (
          <CoinList data={data} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CoinList({ data }: { data: TokenData[] }) {
  const { set } = useWithdrawStore();
  const walletStorage = useWalletStore((state) => state.walletStorage);
  const multisigStorage = useWalletStore((state) => state.multisigStorage);

  const walletAddress = walletStorage?.address;
  const members = multisigStorage?.account?.members || [];
  const hasAllPermissions = hasCloudPermission(members, walletAddress);

  return data.map((token, i) => {
    return (
      <motion.div
        layout
        key={token.address}
        className="w-full"
        {...fadeInListItemProps(i)}
      >
        <WithdrawDialog>
          <DialogTrigger asChild disabled={!hasAllPermissions}>
            <motion.button
              transition={{ duration: 0.3, type: "spring" }}
              whileHover={
                hasAllPermissions
                  ? {
                      opacity: 1,
                      scale: 1.03,
                      backgroundColor: "var(--color-background-hover)",
                    }
                  : undefined
              }
              className="w-full rounded-2xl bg-background"
              onClick={() => hasAllPermissions && set("token", token)}
            >
              <Coin token={token} />
            </motion.button>
          </DialogTrigger>
        </WithdrawDialog>
      </motion.div>
    );
  });
}
