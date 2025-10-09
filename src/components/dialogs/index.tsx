import { lazy } from "react";

const RpcDialog = lazy(() => import("./RpcDialog"));
const WithdrawDialog = lazy(() => import("./WithdrawDialog"));
const TransactionDialog = lazy(() => import("./TransactionDialog"));
const ConnectWalletDialog = lazy(() => import("./ConnectWalletDialog"));

import { Dialog, DialogContent } from "~/components/ui/dialog";
import { useBaseDialogStore } from "~/state/dialog";

export default function AppDialog() {
  const { rpc, connect, withdraw, transaction, setOpen } = useBaseDialogStore();

  const onOpenChange = (open: boolean) => {
    if (open) return;
    setOpen("rpc", false);
    setOpen("connect", false);
    setOpen("withdraw", false);
    setOpen("transaction", false);
  };

  const isOpen =
    connect.isOpen || withdraw.isOpen || transaction.isOpen || rpc.isOpen;

  const className = connect.isOpen
    ? "w-[307px] px-4"
    : withdraw.isOpen
      ? "w-[485px]"
      : "w-[516px]";

  const title = connect.isOpen
    ? "Select wallet"
    : withdraw.isOpen
      ? "Withdraw"
      : rpc.isOpen
        ? "Rpc URL"
        : "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent isOpen={isOpen} title={title} className={className}>
        {withdraw.isOpen && (
          <WithdrawDialog data={withdraw.meta} onOpenChange={onOpenChange} />
        )}
        {connect.isOpen && <ConnectWalletDialog onOpenChange={onOpenChange} />}
        {transaction.isOpen && (
          <TransactionDialog
            onOpenChange={onOpenChange}
            data={transaction.meta}
          />
        )}
        {rpc.isOpen && <RpcDialog onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}
