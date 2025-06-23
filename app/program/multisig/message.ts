import {
  Address,
  lamports,
  IInstruction,
  createTransaction,
  getSignatureFromTransaction,
  signTransactionMessageWithSigners,
} from "gill";

import {
  createTransferSolInstruction,
  createCloseAccountsInstruction,
  createTransferTokenInstruction,
  createProposalCreateInstruction,
  createProposalCancelInstruction,
  createProposalRejectInstruction,
  createProposalApproveInstruction,
  createVaultTransactionExecuteInstruction,
} from "~/program/multisig/instruction";

import { Signer } from "~/program/multisig/instruction";

import {
  TransactionMessage,
  createVaultInstruction,
  createLegacyTransactionMessage,
} from "~/program/multisig/legacy";

import { useRpcStore } from "~/state/rpc";

const { rpc, sendAndConfirmTransaction } = useRpcStore.getState();

export async function createAndConfirmMessage({
  feePayer,
  instructions,
}: {
  feePayer: Signer;
  instructions: IInstruction[];
}) {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const tx = createTransaction({
    feePayer,
    instructions,
    latestBlockhash,
    version: "legacy",
  });

  const signedTransaction = await signTransactionMessageWithSigners(tx);

  await sendAndConfirmTransaction(signedTransaction);

  return getSignatureFromTransaction(signedTransaction);
}

export async function createTransferSolMessage({
  signer,
  amount,
  toAddress,
}: {
  signer: Signer;
  amount: number;
  toAddress: Address;
}) {
  const transferSolIx = createTransferSolInstruction({
    signer,
    toAddress,
    amount: lamports(BigInt(Math.round(amount))),
  });

  return createLegacyTransactionMessage(signer, [transferSolIx]);
}

export async function createTransferTokenMessage({
  amount,
  signer,
  toAddress,
  fromToken,
}: {
  amount: number;
  signer: Signer;
  toAddress: Address;
  fromToken: { decimals: number; mint: Address; ata: Address };
}) {
  const transferTokenIxs = await createTransferTokenInstruction({
    amount: Math.round(amount),
    signer,
    toAddress,
    fromToken,
  });

  return createLegacyTransactionMessage(signer, transferTokenIxs);
}

export async function sendAndConfirmTransferWithProposalApproveMessage({
  memo,
  feePayer,
  memberAddress,
  creatorAddress,
  multisigAddress,
  transactionIndex,
  transactionMessage,
}: {
  memo: string;
  feePayer: Signer;
  memberAddress: Address;
  creatorAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
  transactionMessage: TransactionMessage;
}) {
  const instructions = [
    createVaultInstruction({
      creatorAddress,
      multisigAddress,
      transactionIndex,
      transactionMessage,
    }),
    await createProposalCreateInstruction({
      creatorAddress,
      multisigAddress,
      transactionIndex,
    }),
    await createProposalApproveInstruction({
      memo,
      memberAddress,
      multisigAddress,
      transactionIndex,
    }),
  ];

  return createAndConfirmMessage({
    feePayer,
    instructions,
  });
}

export async function sendAndConfirmProposalApproveMessage({
  memo,
  feePayer,
  memberAddress,
  multisigAddress,
  transactionIndex,
}: {
  memo: string;
  feePayer: Signer;
  memberAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
}) {
  const ix = await createProposalApproveInstruction({
    memo,
    memberAddress,
    multisigAddress,
    transactionIndex,
  });

  return createAndConfirmMessage({
    feePayer,
    instructions: [ix],
  });
}

export async function sendAndConfirmProposalCancelMessage({
  memo,
  feePayer,
  memberAddress,
  multisigAddress,
  transactionIndex,
}: {
  memo?: string;
  feePayer: Signer;
  memberAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
}) {
  const ix = await createProposalCancelInstruction({
    memo,
    memberAddress,
    multisigAddress,
    transactionIndex,
  });

  return createAndConfirmMessage({
    feePayer,
    instructions: [ix],
  });
}

export async function sendAndConfirmProposalRejectMessage({
  memo,
  feePayer,
  memberAddress,
  multisigAddress,
  transactionIndex,
}: {
  memo?: string;
  feePayer: Signer;
  memberAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
}) {
  const ix = await createProposalRejectInstruction({
    memo,
    memberAddress,
    multisigAddress,
    transactionIndex,
  });

  return createAndConfirmMessage({
    feePayer,
    instructions: [ix],
  });
}

export async function sendAndConfirmExecuteAndCloseAccountsMessage({
  feePayer,
  memberAddress,
  multisigAddress,
  transactionIndex,
  rentCollectorAddress,
}: {
  feePayer: Signer;
  memberAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
  rentCollectorAddress: Address;
}) {
  const instructions = [
    await createVaultTransactionExecuteInstruction({
      memberAddress,
      multisigAddress,
      transactionIndex,
    }),
    await createCloseAccountsInstruction({
      multisigAddress,
      transactionIndex,
      rentCollectorAddress,
    }),
  ];

  return createAndConfirmMessage({
    feePayer,
    instructions,
  });
}

export async function sendAndConfirmAccountsCloseMessage({
  feePayer,
  multisigAddress,
  transactionIndex,
  rentCollectorAddress,
}: {
  feePayer: Signer;
  multisigAddress: Address;
  transactionIndex: bigint;
  rentCollectorAddress: Address;
}) {
  const ix = await createCloseAccountsInstruction({
    multisigAddress,
    transactionIndex,
    rentCollectorAddress,
  });

  return createAndConfirmMessage({
    feePayer,
    instructions: [ix],
  });
}
