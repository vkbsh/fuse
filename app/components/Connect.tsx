import { useEffect, useState } from "react";

import Button from "~/components/ui/Button";
import { ConnectWalletDialog } from "~/components/ConnectWalletDialog";

import { abbreviateAddress } from "~/utils/address";
import { LSWallet, useWalletByKey, useWalletStore } from "~/state/wallet";

export default function Connect() {
  const [isOpenConnectWallet, setOpenConnectWallet] = useState(false);
  const [extensionWallet, setExtensionWallet] = useState<null | LSWallet>(null);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col gap-6 m-auto">
        <div className="max-w-[800px] w-full ">
          <img src="/images/SDNA-fuse.png" alt="Fuse" />
        </div>
        <div className="relative flex flex-col items-center justify-center gap-6">
          <span className="text-grey opacity-40">Fuse</span>
          <h1 className="font-semibold text-5xl text-center">
            Security is in our DNA
          </h1>

          <ConnectWalletDialog
            isOpen={isOpenConnectWallet}
            setWallet={setExtensionWallet}
            onOpenChange={setOpenConnectWallet}
          >
            <Button size="full">
              {extensionWallet?.address
                ? abbreviateAddress(extensionWallet.address)
                : "Log in with Fuse 2FA"}
            </Button>
          </ConnectWalletDialog>

          {extensionWallet && <MultisigWallets wallet={extensionWallet} />}
        </div>
      </div>
    </div>
  );
}

function MultisigWallets({ wallet }: { wallet: LSWallet }) {
  const multisig = useWalletByKey(wallet.address);

  const { saveMultisigWallets, saveWallet, selectWallet } = useWalletStore();
  const hasMultisigWallets = multisig?.wallets?.length;

  useEffect(() => {
    if (hasMultisigWallets) {
      saveWallet({
        name: wallet.name,
        icon: wallet.icon,
        address: wallet.address,
      });

      selectWallet(wallet.name);
      saveMultisigWallets(multisig.wallets);
    }
  }, [multisig?.wallets]);

  if (!multisig) {
    return null;
  }

  return !hasMultisigWallets ? (
    <span className="absolute -bottom-8 text-status-error">
      No multisig wallets found
    </span>
  ) : null;
}
