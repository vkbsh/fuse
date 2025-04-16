import * as multisig from "@sqds/multisig";

import {
  pipe,
  address,
  IAccountMeta,
  IInstruction,
  compileTransaction,
  parseJsonRpcAccount,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  appendTransactionMessageInstruction,
  setTransactionMessageLifetimeUsingBlockhash,
  TransactionWithBlockhashLifetime,
  getBase64EncodedWireTransaction,
  appendTransactionMessageInstructions,
} from "gill";

import {
  getTransferInstruction,
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
} from "@solana-program/token";

import {
  getU8Encoder,
  getU32Encoder,
  getBytesEncoder,
  getStructEncoder,
  addEncoderSizePrefix,
} from "@solana/kit";

import {
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionMessage,
  TransactionInstruction,
} from "web3js1";

import {
  getVaultPda,
  getProposalPda,
  getTransactionPda,
  getEphemeralSignerPda,
} from "~/program/multisig/pda";

import {
  createProposalCancelInstruction,
  createProposalCreateInstruction,
  createProposalRejectInstruction,
  createProposalApproveInstruction,
  createVaultTransactionExecuteInstruction,
} from "~/program/multisig/instruction";

import { getVaultTransactionCodec } from "~/program/multisig/codec";

import { Address } from "~/model/web3js";
import { useRpcStore } from "~/state/rpc";
import { instructionFromLegacyInstruction } from "~/utils/instruction";

const rpc = useRpcStore.getState().rpc;

export async function compileTransactionWithIx({
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

  const transaction = compileTransaction(transactionMessage);

  return transaction;
}

export function createVaultInstruction({
  memo,
  creator,
  vaultIndex,
  multisigPda,
  ephemeralSigners,
  transactionIndex,
  transactionMessage,
}: {
  memo?: string;
  creator: Address;
  vaultIndex: number;
  multisigPda: Address;
  transactionIndex: bigint;
  ephemeralSigners: number;
  transactionMessage: TransactionMessage;
}): IInstruction {
  const createVaultTransactionIx = multisig.instructions.vaultTransactionCreate(
    {
      memo,
      vaultIndex,
      ephemeralSigners,
      transactionIndex,
      // @ts-ignore (incompatible types sqds/multisig/web3 and fuse/web3js1)
      transactionMessage,
      creator: new PublicKey(creator),
      multisigPda: new PublicKey(multisigPda),
    },
  );
  return instructionFromLegacyInstruction(createVaultTransactionIx);
}

export async function createTransferInnerMessage({
  lamports,
  toAddress,
  fromAddress,
}: {
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
    payerKey: new PublicKey(toAddress),
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
    amount: BigInt(amount),
    destination: address(toAta),
    authority: address(authority),
    source: address(fromToken.ata),
  });

  console.log("createATAIx.accounts", createATAIx.accounts);
  console.log("transferIx.accounts", transferIx.accounts);

  // export declare enum AccountRole {
  //   WRITABLE_SIGNER = 3, // prettier-ignore
  //   READONLY_SIGNER = 2, // prettier-ignore
  //   WRITABLE = 1, // prettier-ignore
  //   READONLY = 0,
  // }

  const transferInnerMessage = new TransactionMessage({
    payerKey: new PublicKey(authority),
    instructions: [
      // createATAIx, transferIx
      {
        programId: new PublicKey(createATAIx.programAddress),
        keys: createATAIx.accounts.map((meta) => ({
          pubkey: new PublicKey(meta.address),
          isSigner: meta.role === 3 || meta.role === 2, // TODO: check new format
          isWritable: meta.role === 3 || meta.role === 1, // TODO: check new format
        })),
        data: Buffer.from(createATAIx.data),
      },
      {
        programId: new PublicKey(transferIx.programAddress),
        keys: transferIx.accounts.map((meta) => ({
          pubkey: new PublicKey(meta.address),
          isSigner: meta.role === 3 || meta.role === 2, // TODO: check new format
          isWritable: meta.role === 3 || meta.role === 1, // TODO: check new format
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

export async function proposalReject({
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

  const proposalApproveTransactionIx = createProposalRejectInstruction({
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

// export async function vaultTransactionExecute({
//   multisigPda,
//   memberAddress,
//   transactionIndex,
// }: {
//   multisigPda: Address;
//   memberAddress: Address;
//   transactionIndex: bigint;
// }) {
//   const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

//   const proposalPda = await getProposalPda({
//     multisigAddress: multisigPda,
//     transactionIndex,
//   });

//   const transactionPda = await getTransactionPda({
//     transactionIndex,
//     multisigAddress: multisigPda,
//   });

//   const { value: account } = await rpc
//     .getAccountInfo(transactionPda, {
//       encoding: "jsonParsed",
//     })
//     .send();

//   const transactionAccount = parseJsonRpcAccount<
//     // TODO: update types
//     {
//       vaultIndex: number;
//       message: {
//         addressTableLookups: Address[];
//       };
//       ephemeralSignerBumps: number[];
//     },
//     Address
//   >(transactionPda, account as Parameters<typeof parseJsonRpcAccount>[1]);

//   if (!transactionAccount.exists) {
//     throw new Error("Transaction account not found");
//   }

//   const vaultPda = await getVaultPda({
//     multisigAddress: multisigPda,
//     vaultIndex: transactionAccount.data.vaultIndex,
//   });

//   const { accountMetas, lookupTableAccounts } =
//     // multisig.utils.accountsForTransactionExecute
//     await accountsForTransactionExecute({
//       vaultPda,
//       transactionPda,
//       message: transactionAccount.data.message,
//       ephemeralSignerBumps: [...transactionAccount.data.ephemeralSignerBumps],
//     });

//   const vaultTransactionExecuteIx = createVaultTransactionExecuteInstruction({
//     multisigPda,
//     proposalPda,
//     memberAddress,
//     transactionPda,
//   });

//   const transactionMessage = pipe(
//     createTransactionMessage({ version: 0 }),
//     (tx) => setTransactionMessageFeePayer(memberAddress, tx),
//     (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
//     (tx) => appendTransactionMessageInstruction(vaultTransactionExecuteIx, tx),
//   );

//   const transaction = compileTransaction(transactionMessage);

//   return transaction;
// }
