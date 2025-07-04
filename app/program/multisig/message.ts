import {
  Address,
  lamports,
  IInstruction,
  TransactionSigner,
  createTransaction,
  getSignatureFromTransaction,
  assertTransactionIsFullySigned,
  signTransactionMessageWithSigners,
} from "gill";

import {
  createTransferSolInstruction,
  createTransferTokenInstruction,
  createCloseAccountsInstruction,
  createProposalCancelInstruction,
  createProposalCreateInstruction,
  createProposalRejectInstruction,
  createProposalApproveInstruction,
  createVaultTransactionExecuteInstruction,
} from "~/program/multisig/instruction";

import {
  LegacyTransactionMessage,
  createLegacyVaultInstruction,
  createLegacyTransactionMessage,
} from "~/program/multisig/legacy";

import { useRpcStore } from "~/state/rpc";

const { rpc, sendAndConfirmTransaction } = useRpcStore.getState();

export async function createAndConfirmMessage({
  feePayer,
  instructions,
}: {
  feePayer: TransactionSigner;
  instructions: IInstruction[];
}) {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const tx = createTransaction({
    feePayer,
    instructions,
    latestBlockhash,
    version: "legacy",
  });

  const lifetimeConstraint = {
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  };

  const signedTransaction = await signTransactionMessageWithSigners(tx);

  assertTransactionIsFullySigned(signedTransaction);

  await sendAndConfirmTransaction({
    ...signedTransaction,
    lifetimeConstraint,
  });

  const signature = getSignatureFromTransaction(signedTransaction);

  return signature;
}

export async function createTransferSolMessage({
  source,
  amount,
  toAddress,
}: {
  amount: number;
  source: Address;
  toAddress: Address;
}) {
  const transferSolIx = createTransferSolInstruction({
    source,
    toAddress,
    amount: lamports(BigInt(Math.round(amount))),
  });

  return createLegacyTransactionMessage(source, [transferSolIx]);
}

export async function createTransferTokenMessage({
  amount,
  signer,
  toAddress,
  fromToken,
  authorityAddress,
}: {
  amount: number;
  signer: Address;
  toAddress: Address;
  authorityAddress: Address;
  fromToken: { decimals: number; mint: Address; ata: Address };
}) {
  const transferTokenIxs = await createTransferTokenInstruction({
    signer,
    toAddress,
    fromToken,
    authorityAddress,
    amount: Math.round(amount),
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
  feePayer: TransactionSigner;
  memberAddress: Address;
  creatorAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
  transactionMessage: LegacyTransactionMessage;
}) {
  const instructions = [
    createLegacyVaultInstruction({
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
  feePayer: TransactionSigner;
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
  feePayer: TransactionSigner;
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
  feePayer: TransactionSigner;
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
  feePayer: TransactionSigner;
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
  feePayer: TransactionSigner;
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
