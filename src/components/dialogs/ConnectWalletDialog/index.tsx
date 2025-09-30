import { useSupportedWallets } from "~/hooks/wallet";

import Content from "./ContentConnectWallet";

export default function ConnectWalletDialog({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const supportedWallets = useSupportedWallets();

  return (
    <Content
      supportedWallets={supportedWallets}
      onCloseDialog={() => onOpenChange(false)}
    />
  );
}
