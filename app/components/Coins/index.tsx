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
    <div className="flex flex-1 flex-col overflow-y-scroll scroll-smooth scrollbar-hidden -mx-5">
      <AnimatePresence mode="popLayout">
        {!hasData ? (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.6 }}
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
  const set = useWithdrawStore((state) => state.set);
  const walletStorage = useWalletStore((state) => state.walletStorage);
  const multisigStorage = useWalletStore((state) => state.multisigStorage);

  const walletAddress = walletStorage?.address;
  const members = multisigStorage?.account?.members || [];
  const hasAllPermissions = hasCloudPermission(members, walletAddress);

  return data.map((token, i) => {
    return (
      <motion.div
        key={token.address}
        {...fadeInListItemProps(i)}
        className="px-2"
      >
        <motion.div
          whileHover={{
            scale: 1.03,
          }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-3"
        >
          <WithdrawDialog>
            <DialogTrigger asChild disabled={!hasAllPermissions}>
              <button
                className="w-full"
                onClick={() => hasAllPermissions && set("token", token)}
              >
                <Coin token={token} />
              </button>
            </DialogTrigger>
          </WithdrawDialog>
        </motion.div>
      </motion.div>
    );
  });
}
