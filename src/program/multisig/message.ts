import {
  type Address,
  type Instruction,
  type TransactionSigner,
  lamports,
  createTransaction,
  getSignatureFromTransaction,
  assertIsFullySignedTransaction,
  signTransactionMessageWithSigners,
} from "gill";

import {
  TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "gill/programs/token";

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

import { getRpcClient } from "~/lib/rpc";

export type FromToken = {
  decimals: number;
  mint: Address;
  ata: Address;
  programIdAddress:
    | typeof TOKEN_PROGRAM_ADDRESS
    | typeof TOKEN_2022_PROGRAM_ADDRESS;
};

export async function createAndConfirmMessage({
  feePayer,
  instructions,
}: {
  feePayer: TransactionSigner;
  instructions: Instruction[];
}) {
  const { rpc, sendAndConfirmTransaction } = getRpcClient();
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

  assertIsFullySignedTransaction(signedTransaction);

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
  toAddress: Address;
  source: TransactionSigner;
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
  toAddress: Address;
  fromToken: FromToken;
  signer: TransactionSigner;
  authorityAddress: Address;
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

export async function sendAndConfirmProposalCancelAndCloseAccountsMessage({
  memo,
  feePayer,
  memberAddress,
  multisigAddress,
  transactionIndex,
  rentCollectorAddress,
}: {
  memo?: string;
  memberAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
  feePayer: TransactionSigner;
  rentCollectorAddress: Address;
}) {
  const instructions = [
    await createProposalCancelInstruction({
      memo,
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
