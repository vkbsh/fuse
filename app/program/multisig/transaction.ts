import { PublicKey, SystemProgram, TransactionMessage } from "web3js1";

import {
  getTransferInstruction,
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
} from "@solana-program/token";

import {
  pipe,
  address,
  Address,
  IInstruction,
  TransactionSigner,
  compileTransaction,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageFeePayerSigner,
  appendTransactionMessageInstructions,
  setTransactionMessageLifetimeUsingBlockhash,
} from "gill";

import {
  createProposalCancelInstruction,
  createProposalCreateInstruction,
  createProposalApproveInstruction,
  createVaultTransactionExecuteInstruction,
  createVaultTransactionAccountsCloseInstruction,
} from "~/program/multisig/instruction";

import { createVaultInstruction } from "~/program/multisig/legacy";

import { useRpcStore } from "~/state/rpc";

const rpc = useRpcStore.getState().rpc;

export type Signer = TransactionSigner & {
  keyPair?: CryptoKeyPair;
};

export async function createMessageWithSigner({
  feePayer,
  instructions,
}: {
  instructions: IInstruction[];
  feePayer: Signer;
}) {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx),
  );

  return transactionMessage;
}

export async function createMessage({
  feePayer,
  instructions,
}: {
  feePayer: Address;
  instructions: IInstruction[];
}) {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayer(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx),
  );

  return transactionMessage;
}

export async function compileTransactionWithIx({
  feePayer,
  instructions,
}: {
  feePayer: Address;
  instructions: IInstruction[];
}) {
  const transactionMessage = await createMessage({
    feePayer,
    instructions,
  });

  const transaction = compileTransaction(transactionMessage);

  return transaction;
}

export async function createTransferInnerMessage({
  payer,
  lamports,
  toAddress,
  fromAddress,
}: {
  payer?: Address;
  lamports: number;
  toAddress: Address;
  fromAddress: Address;
}) {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const transferInnerMessage = new TransactionMessage({
    instructions: [
      SystemProgram.transfer({
        lamports,
        toPubkey: new PublicKey(toAddress),
        fromPubkey: new PublicKey(fromAddress),
      }),
    ],
    payerKey: new PublicKey(payer ?? fromAddress),
    recentBlockhash: latestBlockhash.blockhash,
  });

  return transferInnerMessage;
}

export async function createTransferTokenInnerMessage({
  amount,
  feePayer,
  toAddress,
  fromToken,
}: {
  amount: number;
  toAddress: Address;
  feePayer: Signer;
  fromToken: { decimals: number; mint: Address; ata: Address };
}) {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const { value: mintInfo } = await rpc
    .getAccountInfo(fromToken.mint, { encoding: "jsonParsed" })
    .send();

  const [toAta] = await findAssociatedTokenPda({
    mint: address(fromToken.mint),
    owner: address(toAddress),
    tokenProgram: address(mintInfo?.owner as Address),
  });

  const createATAIx = getCreateAssociatedTokenIdempotentInstruction({
    ata: toAta,
    payer: feePayer,
    owner: toAddress,
    mint: fromToken.mint,
    tokenProgram: address(mintInfo?.owner as Address),
  });

  const transferIx = getTransferInstruction({
    amount,
    destination: address(toAta),
    authority: feePayer.address,
    source: address(fromToken.ata),
  });

  const transferInnerMessage = new TransactionMessage({
    payerKey: new PublicKey(feePayer.address),
    instructions: [
      {
        programId: new PublicKey(createATAIx.programAddress),
        keys: createATAIx.accounts.map((meta) => ({
          pubkey: new PublicKey(meta.address),
          isSigner: meta.role === 3 || meta.role === 2,
          isWritable: meta.role === 3 || meta.role === 1,
        })),
        data: Buffer.from(createATAIx.data),
      },
      {
        programId: new PublicKey(transferIx.programAddress),
        keys: transferIx.accounts.map((meta) => ({
          pubkey: new PublicKey(meta.address),
          isSigner: meta.role === 3 || meta.role === 2,
          isWritable: meta.role === 3 || meta.role === 1,
        })),
        data: Buffer.from(transferIx.data),
      },
    ],
    recentBlockhash: latestBlockhash.blockhash,
  });

  return transferInnerMessage;
}

export async function createVaultTransaction({
  memo,
  lamports,
  toAddress,
  fromAddress,
  multisigPda,
  transactionIndex,
}: {
  memo: string;
  lamports: number;
  toAddress: Address;
  fromAddress: Address;
  multisigPda: Address;
  transactionIndex: bigint;
}) {
  const transferInnerMessage = await createTransferInnerMessage({
    lamports,
    toAddress,
    fromAddress,
  });

  const vaultIx = createVaultInstruction({
    memo,
    multisigPda,
    vaultIndex: 0,
    transactionIndex,
    creator: toAddress,
    ephemeralSigners: 0,
    transactionMessage: transferInnerMessage,
  });

  return compileTransactionWithIx({
    feePayer: toAddress,
    instructions: [vaultIx],
  });
}

export async function proposalCreate({
  creator,
  multisigPda,
  transactionIndex,
}: {
  creator: Address;
  multisigPda: Address;
  transactionIndex: bigint;
}) {
  const proposalTransactionIx = await createProposalCreateInstruction({
    creator,
    multisigPda,
    transactionIndex,
  });

  return compileTransactionWithIx({
    feePayer: creator,
    instructions: [proposalTransactionIx],
  });
}

export async function proposalApprove({
  multisigPda,
  memberAddress,
  transactionIndex,
}: {
  multisigPda: Address;
  memberAddress: Address;
  transactionIndex: bigint;
}) {
  const proposalApproveTransactionIx = await createProposalApproveInstruction({
    multisigPda,
    memberAddress,
    transactionIndex,
  });

  return compileTransactionWithIx({
    feePayer: memberAddress,
    instructions: [proposalApproveTransactionIx],
  });
}

export async function proposalCancel({
  memo,
  multisigPda,
  memberAddress,
  transactionIndex,
}: {
  memo?: string;
  multisigPda: Address;
  memberAddress: Address;
  transactionIndex: bigint;
}) {
  const proposalApproveTransactionIx = await createProposalCancelInstruction({
    memo,
    multisigPda,
    memberAddress,
    transactionIndex,
  });

  return compileTransactionWithIx({
    feePayer: memberAddress,
    instructions: [proposalApproveTransactionIx],
  });
}

export async function vaultTransactionExecute({
  message,
  multisigPda,
  memberAddress,
  transactionIndex,
  ephemeralSignerBumps,
}: {
  multisigPda: Address;
  memberAddress: Address;
  transactionIndex: bigint;
  ephemeralSignerBumps: any;
  message: TransactionMessage;
}) {
  const vaultTransactionExecuteIx =
    await createVaultTransactionExecuteInstruction({
      // @ts-expect-error: incompatible type of TransactionMessage (solana web3js1 squads vs fuse)
      message,
      multisigPda,
      memberAddress,
      transactionIndex,
      ephemeralSignerBumps,
    });

  return compileTransactionWithIx({
    feePayer: memberAddress,
    instructions: [vaultTransactionExecuteIx],
  });
}

export async function vaultTransactionAccountsClose({
  multisigPda,
  transactionIndex,
  rentCollectorPda,
}: {
  multisigPda: Address;
  transactionIndex: bigint;
  rentCollectorPda: Address;
}) {
  const vaultTransactionAccountsCloseIx =
    await createVaultTransactionAccountsCloseInstruction({
      multisigPda,
      rentCollectorPda,
      transactionIndex,
    });

  const feePayer = rentCollectorPda;

  return compileTransactionWithIx({
    feePayer,
    instructions: [vaultTransactionAccountsCloseIx],
  });
}
