import { PublicKey, SystemProgram, TransactionMessage } from "web3js1";
import { VaultTransactionMessage } from "~/generated";

import {
  getTransferInstruction,
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
} from "@solana-program/token";

import {
  pipe,
  address,
  IInstruction,
  compileTransaction,
  TransactionSigner,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageFeePayerSigner,
  appendTransactionMessageInstructions,
  setTransactionMessageLifetimeUsingBlockhash,
  TransactionSendingSigner,
} from "gill";

import {
  createVaultInstruction,
  createProposalCancelInstruction,
  createProposalCreateInstruction,
  createProposalApproveInstruction,
  createVaultTransactionExecuteInstruction,
  createVaultTransactionAccountsCloseInstruction,
} from "~/program/multisig/instruction";

import {
  getVaultPda,
  getProposalPda,
  getTransactionPda,
} from "~/program/multisig/pda";

import { Address } from "~/model/web3js";
import { useRpcStore } from "~/state/rpc";

const rpc = useRpcStore.getState().rpc;

export async function createMessageWithSigner({
  feePayer,
  instructions,
}: {
  instructions: IInstruction[];
  feePayer: TransactionSendingSigner;
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
  toAddress,
  fromToken,
  authority,
}: {
  amount: number;
  authority: Address;
  toAddress: Address;
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
    payer: authority,
    owner: toAddress,
    mint: fromToken.mint,
    tokenProgram: address(mintInfo?.owner as Address),
  });

  const transferIx = getTransferInstruction({
    amount,
    destination: address(toAta),
    authority: address(authority),
    source: address(fromToken.ata),
  });

  const transferInnerMessage = new TransactionMessage({
    payerKey: new PublicKey(authority),
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
  const proposalPda = await getProposalPda({
    multisigAddress: multisigPda,
    transactionIndex,
  });

  const proposalTransactionIx = createProposalCreateInstruction({
    creator,
    multisigPda,
    proposalPda,
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
  const proposalPda = await getProposalPda({
    multisigAddress: multisigPda,
    transactionIndex,
  });

  const proposalApproveTransactionIx = createProposalApproveInstruction({
    multisigPda,
    proposalPda,
    memberAddress,
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
  const proposalPda = await getProposalPda({
    multisigAddress: multisigPda,
    transactionIndex,
  });

  const proposalApproveTransactionIx = createProposalCancelInstruction({
    memo,
    multisigPda,
    proposalPda,
    memberAddress,
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
  message: VaultTransactionMessage;
  ephemeralSignerBumps: any;
  multisigPda: Address;
  memberAddress: Address;
  transactionIndex: bigint;
}) {
  const proposalPda = await getProposalPda({
    multisigAddress: multisigPda,
    transactionIndex,
  });

  const transactionPda = await getTransactionPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });

  const vaultPda = await getVaultPda({
    vaultIndex: 0,
    multisigAddress: multisigPda,
  });

  const vaultTransactionExecuteIx = createVaultTransactionExecuteInstruction({
    message,
    vaultPda,
    multisigPda,
    proposalPda,
    memberAddress,
    transactionPda,
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
  const vaultPda = await getVaultPda({
    vaultIndex: 0,
    multisigAddress: multisigPda,
  });

  const proposalPda = await getProposalPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });

  const transactionPda = await getTransactionPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });

  const vaultTransactionAccountsCloseIx =
    createVaultTransactionAccountsCloseInstruction({
      vaultPda,
      multisigPda,
      proposalPda,
      transactionPda,
      rentCollectorPda,
    });

  const feePayer = rentCollectorPda ?? vaultPda; // TODO: temp

  return compileTransactionWithIx({
    feePayer,
    instructions: [vaultTransactionAccountsCloseIx],
  });
}
