import { MetaFunction } from "react-router";
import { memo, useEffect, useState } from "react";
import {
  UiWallet,
  useConnect,
  useWallets,
  UiWalletAccount,
} from "@wallet-standard/react";

import Toast from "~/components/ui/Toast";
import Connect from "~/components/Connect";
import Balance from "~/components/Balance";
import CoinSection from "~/components/CoinSectioin";
import VaultAccount from "~/components/VaultAccount";
import WithdrawButton from "~/components/WithdrawButton";
import TransactionSection from "~/components/TransactionSection";
import RecoveryKeysDropdown from "~/components/RecoveryKeysDropdown";
import { ConnectWalletDialog } from "~/components/ConnectWalletDialog";

import { LSWallet, useWalletStore } from "~/state/wallet";

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
  const wallets = useWallets();
  const wallet = wallets
    .filter((w) => w.features.includes("solana:signAndSendTransaction"))
    .find((w) => w.name === currentWallet?.name);

  return wallet ? <TestRerender wallet={wallet} /> : null;
}

const TestRerender = ({ wallet }: { wallet: UiWallet }) => {
  const account = wallet?.accounts[0];

  if (account) {
    return <WithAccount account={account} />;
  }

  return <ShouldConnect wallet={wallet} />;
};

const ShouldConnect = ({ wallet }: { wallet: UiWallet }) => {
  const [, connect] = useConnect(wallet);
  const { currentMultisigWallet, selectWallet, removeWallet } =
    useWalletStore();

  useEffect(() => {
    const tryConnectWallet = async () => {
      const [account] = await connect({ silent: true });
      const members = currentMultisigWallet?.account?.members || [];
      const isMember = members.some((m) => m.key === account.address);

      if (account && isMember) {
        selectWallet(wallet.name);
      } else {
        // TODO: Show toast
        removeWallet(wallet.name);
      }
    };

    tryConnectWallet();
  }, []);

  return null;
};

const WithAccount = memo(({ account }: { account: UiWalletAccount }) => {
  if (!account) {
    return null;
  }

  return (
    <div className="h-screen w-full max-w-[1280px] m-auto p-6 flex flex-col gap-10 ">
      <header className="h-[42px] flex items-center justify-between">
        <VaultAccount />
        <RecoveryKeys />
      </header>
      <main className="flex-1 flex flex-col w-full h-full min-h-0 gap-10">
        <div className="flex flex-col">
          <Balance />
          <WithdrawButton walletAccount={account} />
        </div>
        <div className="flex flex-1 w-full h-full min-h-0 justify-between ">
          <CoinSection />
          <div className="w-px bg-black/20 mx-10" />
          <TransactionSection walletAccount={account} />
        </div>
      </main>
    </div>
  );
});

function RecoveryKeys() {
  const { currentMultisigWallet, saveWallet, selectWallet } = useWalletStore();
  const [extensionWallet, setExtensionWallet] = useState<null | LSWallet>(null);
  const [isOpenConnectWallet, setOpenConnectWallet] = useState(false);

  const memberKeys = currentMultisigWallet?.account?.members;
  const isMemberKey = memberKeys?.some(
    (m) => m.key === extensionWallet?.address,
  );

  useEffect(() => {
    if (extensionWallet && isMemberKey) {
      saveWallet({
        name: extensionWallet.name,
        icon: extensionWallet.icon,
        address: extensionWallet.address,
      });

      selectWallet(extensionWallet.name);
    }
  }, [extensionWallet, isMemberKey]);

  return (
    <>
      <ConnectWalletDialog
        isOpen={isOpenConnectWallet}
        setWallet={setExtensionWallet}
        onOpenChange={setOpenConnectWallet}
      />
      <RecoveryKeysDropdown onClick={() => setOpenConnectWallet(true)} />
      {extensionWallet && !isMemberKey ? (
        <Toast
          close="Close"
          action="View"
          title="Connected"
          actionAltText="View"
          description="You have successfully connected to your Fuse account"
        />
      ) : null}
    </>
  );
}
