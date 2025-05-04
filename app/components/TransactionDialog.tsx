import { useState } from "react";
import { address, parseBase64RpcAccount } from "gill";

import Button from "~/components/ui/Button";
import Dialog from "~/components/ui/Dialog";
import { IconSquareDot } from "~/components/icons/IconSquareDot";
import { IconCircleDot } from "~/components/icons/IconCircleDot";
import { IconCirclePlus } from "~/components/icons/IconCirclePlus";

import {
  createProposalApproveInstruction,
  createVaultTransactionAccountsCloseInstruction,
  createVaultTransactionExecuteInstruction,
} from "~/program/multisig/instruction";

import {
  getVaultPda,
  getProposalPda,
  getTransactionPda,
} from "~/program/multisig/pda";

import { getVaultTransactionCodec } from "~/program/multisig/codec";
import { compileTransactionWithIx } from "~/program/multisig/transaction";

import { cn } from "~/utils/tw";
import { Address } from "~/model/web3js";
import { useRpcStore } from "~/state/rpc";
import { abbreviateAddress } from "~/utils/address";
import { useWalletFeatureHandler } from "~/hooks/useWalletFeatureHandler";

import { Status } from "./Transaction";
import { getVaultTransactionAccountsCloseInstruction } from "~/generated/instructions";

type Props = {
  status: Status;
  approved: Address[];
  transactionIndex: number;
  children: React.ReactNode;
  currentWalletAddress: Address;
  currentMultisigWalletAddress: Address;
};

export default function TransactionDialog({
  status,
  children,
  approved,
  transactionIndex,
  currentWalletAddress,
  currentMultisigWalletAddress,
}: Props) {
  const [isOpen, setOpen] = useState(false);
  const createdByAddress = approved[0] || "";
  const executedByAddress = approved[0] || "";
  const isExecuted = status === "Executed";
  const isAllApproved = approved.length === 2;
  const isApproveDisabled = approved.some((a) => a === currentWalletAddress);
  const { rpc } = useRpcStore();
  const signAndSendTransaction = useWalletFeatureHandler(
    "signAndSendTransaction",
  );

  // TODO: Add tx execute/*cancel loading state + animation

  // TODO: Get Initiated Address
  // TODO: Get Executed Address

  const closeHandler = () => {
    console.log("Close Tx modal");
    setOpen(false);
  };

  const cancelHandler = () => {
    console.log("cancelHandler");
    setOpen(false);
  };

  const approveHandler = async () => {
    const proposalPda = await getProposalPda({
      transactionIndex: BigInt(transactionIndex),
      multisigAddress: currentMultisigWalletAddress,
    });

    const tx = await compileTransactionWithIx({
      instructions: [
        createProposalApproveInstruction({
          proposalPda,
          memo: "approve by a Member",
          memberAddress: address(currentWalletAddress),
          multisigPda: address(currentMultisigWalletAddress),
        }),
      ],
      feePayer: address(currentWalletAddress),
    });

    await signAndSendTransaction({ transaction: tx });

    setOpen(false);
  };

  const executeHandler = async () => {
    const proposalPda = await getProposalPda({
      transactionIndex: BigInt(transactionIndex),
      multisigAddress: currentMultisigWalletAddress,
    });

    const transactionPda = await getTransactionPda({
      transactionIndex: BigInt(transactionIndex),
      multisigAddress: currentMultisigWalletAddress,
    });

    const vaultPda = await getVaultPda({
      vaultIndex: 0,
      multisigAddress: currentMultisigWalletAddress,
    });

    const transactionPdaInfo = await rpc
      .getAccountInfo(transactionPda, { encoding: "base64" })
      .send();

    const vaultTransaction = getVaultTransactionCodec().decode(
      parseBase64RpcAccount(transactionPda, transactionPdaInfo.value).data,
    );

    const tx = await compileTransactionWithIx({
      instructions: [
        createVaultTransactionExecuteInstruction({
          vaultPda,
          proposalPda,
          transactionPda,
          message: vaultTransaction.message,
          multisigPda: currentMultisigWalletAddress,
          memberAddress: address(currentWalletAddress),
          ephemeralSignerBumps: vaultTransaction.ephemeralSignerBumps,
        }),
        // TODO: Ask for closing accounts after execution
        // createVaultTransactionAccountsCloseInstruction({
        //   vaultPda,
        //   proposalPda,
        //   transactionPda,
        //   multisigPda: currentMultisigWalletAddress,
        //   rentCollectorPda: address(currentWalletAddress),
        // }),
      ],
      feePayer: address(currentWalletAddress),
    });

    await signAndSendTransaction({ transaction: tx });

    setOpen(false);
  };

  return (
    <Dialog isOpen={isOpen} trigger={children} onOpenChange={setOpen}>
      <div className="flex flex-col gap-8 w-[516px] p-8 m-auto bg-black text-white rounded-[40px]">
        {children}
        <div className="px-2 py-4 pt-3 pb-5">
          <div className="flex flex-row gap-4 justify-center text-sm font-semibold">
            <div className="w-full flex flex-col items-center gap-5">
              <IconCirclePlus />
              <div className="flex flex-col gap-1 items-center">
                <span className="text-white">Initiated</span>
                <div className="flex flex-row gap-1">
                  <div className="flex flex-col">
                    <span>With</span>
                  </div>
                  <div className="flex flex-col">
                    <span>{abbreviateAddress(createdByAddress)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "w-full flex flex-col items-center gap-5 text-white/30",
                isAllApproved && "text-white",
              )}
            >
              <IconSquareDot />
              <div className="flex flex-col gap-1 items-center">
                <span className="text-white">Approved</span>
                <div className="flex flex-row gap-1">
                  <div className="flex flex-col">
                    <span>With</span>
                  </div>
                  <div className="flex flex-col">
                    {approved.map((address) => {
                      if (!address) return null;
                      return (
                        <span key={address}>{abbreviateAddress(address)}</span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "w-full flex flex-col items-center gap-5 text-white/30",
                isExecuted && "text-white",
              )}
            >
              <IconCircleDot />
              <div className="flex flex-col gap-1 items-center">
                <span className="text-white">Executed</span>
                <div className="flex flex-row gap-1">
                  <div className="flex flex-col">
                    <span>With</span>
                  </div>
                  <div className="flex flex-col">
                    <span>{abbreviateAddress(executedByAddress)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-center gap-1.5">
          {status === "Active" && (
            <>
              <Button size="md" variant="cancel" onClick={closeHandler}>
                {/* TODO: Cancel Transaction */}
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

          {/* TODO: Add types from proposal */}
          {["Executed", "Canceled"].includes(status) && (
            <Button size="md" variant="secondary" onClick={closeHandler}>
              {/* TODO: Close dialog */}
              Ok
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
