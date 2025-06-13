import { Address } from "gill";
import { TransactionMessage } from "web3js1";

import {
  createProposalCreateInstruction,
  createProposalApproveInstruction,
  createVaultTransactionExecuteInstruction,
  createVaultTransactionAccountsCloseInstruction,
} from "~/program/multisig/instruction";

import {
  createMessageWithSigner,
  createTransferInnerMessage,
  createTransferTokenInnerMessage,
} from "~/program/multisig/transaction";

import { createVaultInstruction } from "~/program/multisig/legacy";
import { Signer } from "~/program/multisig/transaction";

export async function createTransferSolMessage({
  memo,
  amount,
  creator,
  vaultPda,
  feePayer,
  toAddress,
  multisigPda,
  transactionIndex,
}: {
  memo?: string;
  amount: number;
  creator: Address;
  vaultPda: Address;
  toAddress: Address;
  multisigPda: Address;
  transactionIndex: bigint;
  feePayer: Signer;
}) {
  const transferMessage = await createTransferInnerMessage({
    toAddress,
    payer: vaultPda,
    lamports: amount,
    fromAddress: vaultPda,
  });

  return createTransferMessageWithProposalApprove({
    memo,
    creator,
    feePayer,
    multisigPda,
    transferMessage,
    transactionIndex,
  });
}
export async function createTransferTokenMessage({
  memo,
  amount,
  creator,
  feePayer,
  toAddress,
  fromToken,
  multisigPda,
  transactionIndex,
}: {
  memo?: string;
  amount: number;
  creator: Address;
  authority: Address;
  toAddress: Address;
  multisigPda: Address;
  transactionIndex: bigint;
  feePayer: Signer;
  fromToken: { decimals: number; mint: Address; ata: Address };
}) {
  const transferMessage = await createTransferTokenInnerMessage({
    amount,
    feePayer,
    fromToken,
    toAddress,
  });

  return createTransferMessageWithProposalApprove({
    memo,
    creator,
    feePayer,
    multisigPda,
    transferMessage,
    transactionIndex,
  });
}

export async function createTransferMessageWithProposalApprove({
  memo,
  creator,
  feePayer,
  multisigPda,
  transferMessage,
  transactionIndex,
}: {
  memo?: string;
  creator: Address;
  multisigPda: Address;
  transactionIndex: bigint;
  feePayer: Signer;
  transferMessage: TransactionMessage;
}) {
  const txMessage = await createMessageWithSigner({
    feePayer: feePayer,
    instructions: [
      createVaultInstruction({
        creator,
        multisigPda,
        vaultIndex: 0,
        transactionIndex,
        ephemeralSigners: 0,
        transactionMessage: transferMessage,
      }),
      await createProposalCreateInstruction({
        creator,
        multisigPda,
        transactionIndex,
      }),
      await createProposalApproveInstruction({
        memo,
        multisigPda,
        transactionIndex,
        memberAddress: creator,
      }),
    ],
  });

  return txMessage;
}

export async function createMessageExecuteAndCloseAccounts({
  feePayer,
  multisigPda,
  memberAddress,
  transactionIndex,
  rentCollectorPda,
}: {
  multisigPda: Address;
  memberAddress: Address;
  rentCollectorPda: Address;
  transactionIndex: bigint;
  feePayer: Signer;
}) {
  const txMessage = await createMessageWithSigner({
    feePayer,
    instructions: [
      await createVaultTransactionExecuteInstruction({
        multisigPda,
        memberAddress,
        transactionIndex,
      }),
      await createVaultTransactionAccountsCloseInstruction({
        multisigPda,
        rentCollectorPda,
        transactionIndex,
      }),
    ],
  });

  return txMessage;
}
