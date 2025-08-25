import { Dialog } from "~/components/ui/dialog";
import WithdrawDialog from "~/components/dialog/WithdrawDialog";
import TransactionDialog from "~/components/dialog/TransactionDialog";
import ConnectWalletDialog from "~/components/dialog/ConnectWalletDialog";

import { useBaseDialogStore } from "~/state/dialog";

export default function AppDialog() {
  const { connect, withdraw, transaction, setOpen } = useBaseDialogStore();

  const onOpenChange = (open: boolean) => {
    if (open) return;
    setOpen("connect", false);
    setOpen("withdraw", false);
    setOpen("transaction", false);
  };

  const isOpen = connect.isOpen || withdraw.isOpen || transaction.isOpen;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <WithdrawDialog isOpen={withdraw.isOpen} onOpenChange={onOpenChange} />
      <ConnectWalletDialog
        isOpen={connect.isOpen}
        onOpenChange={onOpenChange}
      />
      <TransactionDialog
        isOpen={transaction.isOpen}
        onOpenChange={onOpenChange}
        data={transaction.meta}
      />
    </Dialog>
  );
}
