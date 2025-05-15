import { Address, LAMPORTS_PER_SOL, TransactionSendingSigner } from "gill";

import {
  createProposalApproveInstruction,
  createProposalCreateInstruction,
} from "~/program/multisig/instruction";

import {
  createMessageWithSigner,
  createTransferInnerMessage,
  createTransferTokenInnerMessage,
} from "~/program/multisig/transaction";

import { createVaultInstruction } from "~/program/multisig/legacy";
import { getProposalPda, getVaultPda } from "~/program/multisig/pda";
import { TransactionMessage } from "web3js1";

export async function createTransferSolMessage({
  amount,
  creator,
  toAddress,
  multisigPda,
  transactionIndex,
  memo,
}: {
  amount: number;
  toAddress: Address;
  multisigPda: Address;
  transactionIndex: bigint;
  creator: TransactionSendingSigner;
  memo?: string;
}) {
  const vaultPda = await getVaultPda({
    vaultIndex: 0,
    multisigAddress: multisigPda,
  });
  const transferMessage = await createTransferInnerMessage({
    toAddress,
    payer: vaultPda,
    fromAddress: vaultPda,
    lamports: Math.round(amount * LAMPORTS_PER_SOL),
  });

  return createTransferMessageWithProposalApprove({
    memo,
    creator,
    multisigPda,
    transferMessage,
    transactionIndex,
  });
}
export async function createTransferTokenMessage({
  creator,
  amount,
  authority,
  toAddress,
  fromToken,
  multisigPda,
  transactionIndex,
  memo,
}: {
  amount: number;
  authority: Address;
  toAddress: Address;
  multisigPda: Address;
  transactionIndex: bigint;
  creator: TransactionSendingSigner;
  fromToken: { decimals: number; mint: Address; ata: Address };
  memo?: string;
}) {
  const transferMessage = await createTransferTokenInnerMessage({
    fromToken,
    toAddress,
    authority,
    amount: amount * 10 ** fromToken.decimals,
  });

  return createTransferMessageWithProposalApprove({
    memo,
    creator,
    multisigPda,
    transferMessage,
    transactionIndex,
  });
}

export async function createTransferMessageWithProposalApprove({
  creator,
  multisigPda,
  transferMessage,
  transactionIndex,
  memo,
}: {
  multisigPda: Address;
  transactionIndex: bigint;
  transferMessage: TransactionMessage;
  creator: TransactionSendingSigner;
  memo?: string;
}) {
  const proposalPda = await getProposalPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });

  const txMessage = await createMessageWithSigner({
    feePayer: creator,
    instructions: [
      createVaultInstruction({
        multisigPda,
        vaultIndex: 0,
        transactionIndex,
        ephemeralSigners: 0,
        creator: creator.address,
        transactionMessage: transferMessage,
      }),
      createProposalCreateInstruction({
        multisigPda,
        proposalPda,
        transactionIndex,
        creator: creator.address,
      }),
      createProposalApproveInstruction({
        memo,
        multisigPda,
        proposalPda,
        memberAddress: creator.address,
      }),
    ],
  });

  return txMessage;
}
