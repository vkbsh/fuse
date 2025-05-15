import { address } from "gill";
import { MetaFunction } from "react-router";
import { useEffect, useState } from "react";
import { UiWallet, useConnect, UiWalletAccount } from "@wallet-standard/react";

import Toast from "~/components/ui/Toast";
import Connect from "~/components/Connect";
import Balance from "~/components/Balance";
import CoinSection from "~/components/CoinSectioin";
import VaultAccount from "~/components/VaultAccount";
import WithdrawButton from "~/components/WithdrawButton";
import TransactionSection from "~/components/TransactionSection";
import MemberKeysDropdown from "~/components/MemberKeysDropdown";
import { ConnectWalletDialog } from "~/components/ConnectWalletDialog";

import { Address } from "~/model/web3js";
import { LSWallet, useWalletStore } from "~/state/wallet";
import { getWalletByName } from "~/service/getWallets";

export const meta: MetaFunction = () => {
  return [
    { title: "Fuse Web Client - Access your Fuse Account" },
    { name: "description", content: "Access your Fuse Account on the web" },
  ];
};

export default function Index() {
  const { currentMultisigWallet, currentWallet } = useWalletStore();

  if (!currentMultisigWallet || !currentWallet) {
    return <Connect />;
  }

  return <Main currentWallet={currentWallet} />;
}

function Main({ currentWallet }: { currentWallet: LSWallet }) {
  const wallet = getWalletByName(currentWallet.name);

  return wallet ? <WithWallet wallet={wallet} /> : <Connect />;
}

const WithWallet = ({ wallet }: { wallet: UiWallet }) => {
  const account = wallet?.accounts[0];

  if (account) {
    return <WithAccount wallet={wallet} account={account} />;
  }

  return <WithConnect wallet={wallet} />;
};

const WithConnect = ({ wallet }: { wallet: UiWallet }) => {
  const [, connect] = useConnect(wallet);

  useEffect(() => {
    connect({ silent: true });
  }, []);

  return null;
};

const WithAccount = ({
  wallet,
  account,
}: {
  wallet: UiWallet;
  account: UiWalletAccount;
}) => {
  const { currentMultisigWallet, saveWallet, selectWallet } = useWalletStore();

  useEffect(() => {
    saveWallet({
      name: wallet.name,
      icon: wallet.icon,
      address: address(account.address),
    });
    selectWallet(wallet.name);
  }, [account.address]);

  return (
    <div className="h-screen w-full max-w-[1280px] m-auto p-6 flex flex-col gap-10 ">
      <header className="h-[42px] flex items-center justify-between">
        <VaultAccount />
        <MemberKeys account={account} />
      </header>
      <main className="flex-1 flex flex-col w-full h-full min-h-0 gap-10">
        <div className="flex flex-col">
          <Balance
            vaultAddress={currentMultisigWallet?.defaultVault as Address}
          />
          <WithdrawButton account={account} />
        </div>
        <div className="flex flex-1 w-full h-full min-h-0 justify-between ">
          <CoinSection />
          <div className="w-px bg-black/20 mx-10" />
          <TransactionSection account={account} />
        </div>
      </main>
      <Toast />
    </div>
  );
};

function MemberKeys({ account }: { account: UiWalletAccount }) {
  const [isOpenConnectWallet, setOpenConnectWallet] = useState(false);
  const [extensionWallet, setExtensionWallet] = useState<null | LSWallet>(null);
  const { currentMultisigWallet, saveWallet, selectWallet } = useWalletStore();

  const memberKeys = currentMultisigWallet?.account?.members;
  const isMemberKey = memberKeys?.some(
    (m) => m.key === extensionWallet?.address,
  );

  // TODO: use account?

  useEffect(() => {
    if (extensionWallet && isMemberKey) {
      saveWallet({
        name: extensionWallet.name,
        icon: extensionWallet.icon,
        address: extensionWallet.address,
      });

      selectWallet(extensionWallet.name);
    }
  }, [account.address, extensionWallet, isMemberKey]);

  return (
    <>
      <ConnectWalletDialog
        isOpen={isOpenConnectWallet}
        setWallet={setExtensionWallet}
        onOpenChange={setOpenConnectWallet}
      />
      <div>
        <MemberKeysDropdown onClick={() => setOpenConnectWallet(true)} />
      </div>
    </>
  );
}
