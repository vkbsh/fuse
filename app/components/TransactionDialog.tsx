import { ReactNode } from "react";
import { motion } from "motion/react";
import { UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";
import { address, signAndSendTransactionMessageWithSigners } from "gill";

import Button from "~/components/ui/Button";
import Dialog from "~/components/ui/Dialog";
import Transaction from "~/components/Transaction";
import { IconSquareDot } from "~/components/ui/icons/IconSquareDot";
import { IconCircleDot } from "~/components/ui/icons/IconCircleDot";
import { IconCirclePlus } from "~/components/ui/icons/IconCirclePlus";

import { createMessageWithSigner } from "~/program/multisig/transaction";
import {
  createProposalApproveInstruction,
  createProposalCancelInstruction,
} from "~/program/multisig/instruction";
import { createMessageExecuteAndCloseAccounts } from "~/program/multisig/utils/message";

import { Address } from "~/model/web3js";
import { abbreviateAddress } from "~/utils/address";

import { useDialog } from "~/state/dialog";
import { useWalletStore } from "~/state/wallet";
import { useWalletByName } from "~/hooks/wallet";

import { getProposalPda } from "~/program/multisig/pda";

export default function TransactionDialog() {
  const { isOpen, onOpenChange, data } = useDialog("transaction"); // TODO: Include refetch to Dialog data
  const { storageWallet, storageMultisigWallet } = useWalletStore();
  const wallet = useWalletByName(storageWallet?.name as Address);
  const walletAccount = wallet?.accounts[0];

  const { status, message, approved, timestamp, transactionIndex } = data || {};

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-8 w-[516px] p-8 m-auto bg-black text-white rounded-[40px]">
        {data && (
          <Transaction
            timestamp={timestamp}
            message={message}
            status={status}
          />
        )}
        <Progress isExecuted={status === "Executed"} approved={approved} />
        {walletAccount && (
          <Footer
            status={status}
            approved={approved}
            rentCollectorAddress={
              storageMultisigWallet?.account?.rentCollector as Address
            }
            storageWalletAddress={walletAccount.address as Address}
            storageMultisigWalletAddress={
              storageMultisigWallet?.address as Address
            }
            walletAccount={walletAccount}
            transactionIndex={transactionIndex}
          />
        )}
      </div>
    </Dialog>
  );
}

function Footer({
  status,
  approved,
  walletAccount,
  transactionIndex,
  rentCollectorAddress,
  storageWalletAddress,
  storageMultisigWalletAddress,
}: {
  status: any;
  approved: Address[];
  transactionIndex: bigint;
  walletAccount: UiWalletAccount;
  storageWalletAddress: Address;
  rentCollectorAddress: Address;
  storageMultisigWalletAddress: Address;
}) {
  const feePayer = useWalletAccountTransactionSendingSigner(
    walletAccount,
    "solana:mainnet",
  );

  const isApproveDisabled = approved.some((a) => a === walletAccount.address);

  const cancelHandler = async () => {
    try {
      const message = await createMessageWithSigner({
        feePayer,
        instructions: [
          await createProposalCancelInstruction({
            memo: "Approved by a Member",
            proposalPda: await getProposalPda({
              multisigAddress: storageMultisigWalletAddress,
              transactionIndex,
            }),
            memberAddress: address(storageWalletAddress),
            multisigPda: address(storageMultisigWalletAddress),
          }),
        ],
      });

      await signAndSendTransactionMessageWithSigners(message);
    } catch (error) {
      console.log("Error [Approve]:", error);
    } finally {
      console.log("Should triiger close Dialog");
    }
  };

  const approveHandler = async () => {
    try {
      const message = await createMessageWithSigner({
        feePayer,
        instructions: [
          await createProposalApproveInstruction({
            memo: "Approved by a Member",
            transactionIndex: BigInt(transactionIndex),
            memberAddress: address(storageWalletAddress),
            multisigPda: address(storageMultisigWalletAddress),
          }),
        ],
      });

      await signAndSendTransactionMessageWithSigners(message);
    } catch (error) {
      console.log("Error [Approve]:", error);
    } finally {
      console.log("Should triiger close Dialog");
    }
  };

  const executeHandler = async () => {
    try {
      const message = await createMessageExecuteAndCloseAccounts({
        feePayer,
        memberAddress: storageWalletAddress,
        multisigPda: storageMultisigWalletAddress,
        transactionIndex: BigInt(transactionIndex),
        rentCollectorPda: address(rentCollectorAddress),
      });
      await signAndSendTransactionMessageWithSigners(message);
    } catch (error) {
      console.log("Error [Execute, Close Accounts]:", error);
    } finally {
      console.log("Should triiger close Dialog");
    }
  };

  return (
    <div className="flex flex-row justify-center gap-1.5">
      {status === "Active" && (
        <>
          <Button size="md" variant="cancel" onClick={cancelHandler}>
            Cancel
          </Button>
          <Button
            size="md"
            variant="secondary"
            onClick={approveHandler}
            disabled={isApproveDisabled}
          >
            Approve
          </Button>
        </>
      )}

      {status === "Approved" && (
        <Button size="md" variant="secondary" onClick={executeHandler}>
          Execute
        </Button>
      )}

      {["Executed", "Canceled"].includes(status) && (
        <Button
          size="md"
          variant="secondary"
          onClick={() => console.log("Should triiger close Dialog")}
        >
          Ok
        </Button>
      )}
    </div>
  );
}

function Progress({
  approved,
  isExecuted,
}: {
  approved: Address[];
  isExecuted: boolean;
}) {
  const isAllApproved = approved.length === 2;
  const initiateByAddress = approved[0]; // TODO: Check Initiated Address
  const executedByAddress = approved[0]; // TODO: Check Executed Address

  // // TODO: Add tx execute/*cancel loading state + animation

  return (
    <div className="px-2 py-4 pt-3 pb-0">
      <div className="flex flex-row gap-4 justify-center text-sm font-semibold">
        <ProgressStatus
          label="Initiated"
          active={true}
          icon={<IconCirclePlus />}
          addresses={[initiateByAddress]}
        />
        <ProgressStatus
          label="Approved"
          active={isAllApproved}
          icon={<IconSquareDot />}
          addresses={approved}
        />
        <ProgressStatus
          label="Executed"
          active={isExecuted}
          icon={<IconCircleDot />}
          addresses={[executedByAddress]}
        />
      </div>
    </div>
  );
}

function ProgressStatus({
  icon,
  label,
  active,
  addresses,
}: {
  label: string;
  active: boolean;
  icon: ReactNode;
  addresses: Address[];
}) {
  return (
    <div className="w-full flex flex-col items-center gap-5 text-white/40">
      <motion.span
        animate={{ color: active ? "#fff" : "rgba(255, 255, 255, 0.3)" }}
      >
        {icon}
      </motion.span>
      <div className="flex flex-col gap-1 items-center">
        <span className="text-white">{label}</span>
        <div className="flex flex-row gap-1">
          <div className="flex flex-col">
            <span>With</span>
          </div>
          <div className="flex flex-col">
            {addresses.map((address) => {
              if (!address) return null;

              return <span key={address}>{abbreviateAddress(address)}</span>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
