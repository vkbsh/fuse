import { Suspense, useEffect } from "react";
import { motion } from "motion/react";

import Button from "~/components/ui/Button";
import { ConnectWalletDialog } from "~/components/ConnectWalletDialog";

import { Address } from "~/model/web3js";
import { abbreviateAddress } from "~/utils/address";
import { useWalletStore, useSuspenseWalletByKey } from "~/state/wallet";

export default function Connect() {
  const { currentWallet } = useWalletStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex items-center justify-center"
    >
      <div className="flex flex-col gap-6 m-auto">
        <div className="max-w-[800px] w-full ">
          <img src="/images/SDNA-fuse.png" alt="Fuse" />
        </div>
        <div className="relative flex flex-col items-center justify-center gap-6">
          <span className="text-grey opacity-40">Fuse</span>
          <h1 className="font-semibold text-5xl text-center">
            Security is in our DNA
          </h1>

          <ConnectWalletDialog>
            <Button size="full">
              {currentWallet?.address
                ? abbreviateAddress(currentWallet.address)
                : "Log in with Fuse 2FA"}
            </Button>
          </ConnectWalletDialog>

          {currentWallet && (
            <MultisigWallets address={currentWallet?.address} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MultisigWallets({ address }: { readonly address: Address }) {
  const multisig = useSuspenseWalletByKey(address);
  const { currentWallet, saveMultisigWallets } = useWalletStore();

  const noMultisigFound = currentWallet && !multisig?.wallets?.length;

  useEffect(() => {
    if (multisig?.wallets.length > 0) {
      saveMultisigWallets(multisig.wallets);
    }
  }, [multisig?.wallets]);

  return noMultisigFound ? (
    <span className="text-status-error">No multisig wallets found</span>
  ) : null;
}
