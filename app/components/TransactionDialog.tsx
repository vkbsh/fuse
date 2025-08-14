import { Address } from "gill";
import { useState } from "react";

import Transaction from "~/components/Transactions/Transaction";
import Footer from "~/components/Transactions/TransactionFooter";
import Progress from "~/components/Transactions/TransactionProgress";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";

import { useWalletStore } from "~/state/wallet";
import { useWalletByName } from "~/hooks/wallet";

export default function TransactionDialog({
  data,
  rentCollectorAddress,
}: {
  data: any;
  rentCollectorAddress: Address;
}) {
  const [isOpen, onOpenChange] = useState(false);
  const walletName = useWalletStore((state) => state.walletStorage?.name);
  const wallet = useWalletByName(walletName as Address);

  const {
    status,
    creator,
    message,
    rejected,
    approved,
    timestamp,
    cancelled,
    transactionIndex,
  } = data || {};
  const walletAccount = wallet?.accounts[0];

  const tx = (
    <Transaction status={status} message={message} timestamp={timestamp} />
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="w-full">{tx}</button>
      </DialogTrigger>
      <DialogContent isOpen={isOpen} className="min-w-[516px]">
        <div className="flex flex-col gap-10 text-primary-foreground rounded-2xl">
          {tx}
          <Progress
            status={status}
            approved={approved}
            rejected={rejected}
            initiated={creator}
            cancelled={cancelled}
          />
          <Footer
            status={status}
            approved={approved}
            rejected={rejected}
            cancelled={cancelled}
            walletAccount={walletAccount}
            transactionIndex={transactionIndex}
            rentCollectorAddress={rentCollectorAddress}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
