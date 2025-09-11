import { lazy } from "react";

import { Dialog, DialogContent } from "~/components/ui/dialog";
const WithdrawDialog = lazy(() => import("./WithdrawDialog"));
const TransactionDialog = lazy(() => import("./TransactionDialog"));
const ConnectWalletDialog = lazy(() => import("./ConnectWalletDialog"));

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
  const className = connect.isOpen
    ? "w-[307px] px-4"
    : withdraw.isOpen
      ? "w-[485px]"
      : "w-[516px]";

  const title = connect.isOpen
    ? "Select wallet"
    : withdraw.isOpen
      ? "Withdraw"
      : "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent isOpen={isOpen} title={title} className={className}>
        {withdraw.isOpen && (
          <WithdrawDialog data={withdraw.meta} onOpenChange={onOpenChange} />
        )}
        {connect.isOpen && (
          <ConnectWalletDialog
            isOpen={connect.isOpen}
            onOpenChange={onOpenChange}
          />
        )}
        {transaction.isOpen && (
          <TransactionDialog
            isOpen={transaction.isOpen}
            onOpenChange={onOpenChange}
            data={transaction.meta}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
