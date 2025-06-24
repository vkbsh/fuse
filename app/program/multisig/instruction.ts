import {
  Address,
  Lamports,
  AccountRole,
  IInstruction,
  EncodedAccount,
  TransactionSigner,
  ReadonlyUint8Array,
  parseBase64RpcAccount,
} from "gill";

import {
  TransferSolInstruction,
  SYSTEM_PROGRAM_ADDRESS,
  getTransferSolInstruction,
} from "gill/programs";

import {
  getProposalCodec,
  getVaultExecuteCodec,
  getProposalCreateCodec,
  getProposalApproveCodec,
  getVaultTransactionCodec,
} from "~/program/multisig/codec";

import {
  TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
  getTransferTokensInstructions,
  getAssociatedTokenAccountAddress,
} from "gill/programs/token";

import { SQUADS_PROGRAM_ID } from "~/program/multisig/address";
import {
  getVaultPda,
  getProposalPda,
  getTransactionPda,
  getEphemeralSignerPda,
} from "~/program/multisig/pda";

import {
  AccountMeta,
  convertRoles,
  isSignerIndex,
  isStaticWritableIndex,
} from "~/program/multisig/legacy";

import { useRpcStore } from "~/state/rpc";
const { rpc } = useRpcStore.getState();

const discriminator = {
  proposalCreate: [220, 60, 73, 224, 30, 108, 79, 159],
  proposalCancel: [205, 41, 194, 61, 220, 139, 16, 247],
  proposalApprove: [144, 37, 164, 136, 188, 216, 42, 248],
  proposalReject: [243, 62, 134, 156, 230, 106, 246, 135],
  vaultTransactionExecute: [194, 8, 161, 87, 153, 164, 25, 171],
  vaultTransactionCreate: [48, 250, 78, 168, 208, 226, 218, 211],
  vaultTransactionCloseAccounts: [196, 71, 187, 176, 2, 35, 170, 165],
};

const { READONLY, WRITABLE, READONLY_SIGNER, WRITABLE_SIGNER } = AccountRole;

export type Signer = TransactionSigner & {
  keyPair?: CryptoKeyPair;
};

export function createInstruction({
  data,
  accounts,
}: {
  data: ReadonlyUint8Array;
  accounts: Array<[Address, AccountRole]>;
}): IInstruction {
  return {
    data: data as Uint8Array,
    programAddress: SQUADS_PROGRAM_ID,
    accounts: accounts.map(([address, role]) => ({ address, role })),
  };
}

export async function createProposalCreateInstruction({
  creatorAddress,
  multisigAddress,
  transactionIndex,
}: {
  creatorAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
}): Promise<IInstruction> {
  const proposalPda = await getProposalPda({
    transactionIndex,
    multisigAddress,
  });
  return createInstruction({
    data: getProposalCreateCodec().encode({
      draft: false,
      transactionIndex,
      instructionDiscriminator: discriminator.proposalCreate,
    }),

    accounts: [
      [multisigAddress, READONLY],
      [proposalPda, WRITABLE],
      [creatorAddress, READONLY_SIGNER],
      [creatorAddress, WRITABLE_SIGNER],
      [SYSTEM_PROGRAM_ADDRESS, READONLY],
    ],
  });
}

export async function createProposalApproveInstruction({
  memo,
  memberAddress,
  multisigAddress,
  transactionIndex,
}: {
  memo?: string;
  multisigAddress: Address;
  memberAddress: Address;
  transactionIndex: bigint;
}): Promise<IInstruction> {
  const proposalPda = await getProposalPda({
    transactionIndex,
    multisigAddress,
  });

  return createInstruction({
    data: getProposalApproveCodec().encode({
      instructionDiscriminator: discriminator.proposalApprove,
      args: {
        memo: memo ?? "",
      },
    }),
    accounts: [
      [multisigAddress, READONLY],
      [memberAddress, WRITABLE_SIGNER],
      [proposalPda, WRITABLE],
    ],
  });
}

export async function createProposalRejectInstruction({
  memo,
  memberAddress,
  multisigAddress,
  transactionIndex,
}: {
  memo?: string;
  memberAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
}): Promise<IInstruction> {
  const proposalPda = await getProposalPda({
    multisigAddress,
    transactionIndex,
  });

  return createInstruction({
    data: getProposalCodec().encode({
      memo: memo ?? "",
      instructionDiscriminator: discriminator.proposalReject,
    }),
    accounts: [
      [multisigAddress, READONLY],
      [memberAddress, WRITABLE_SIGNER],
      [proposalPda, WRITABLE],
    ],
  });
}

export async function createProposalCancelInstruction({
  memo,
  memberAddress,
  multisigAddress,
  transactionIndex,
}: {
  memo?: string;
  memberAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
}): Promise<IInstruction> {
  const proposalPda = await getProposalPda({
    multisigAddress,
    transactionIndex: BigInt(transactionIndex),
  });

  return createInstruction({
    data: getProposalApproveCodec().encode({
      instructionDiscriminator: discriminator.proposalCancel,
      args: {
        memo: memo ?? "",
      },
    }),
    accounts: [
      [multisigAddress, READONLY],
      [memberAddress, WRITABLE_SIGNER],
      [proposalPda, WRITABLE],
      [SYSTEM_PROGRAM_ADDRESS, READONLY],
    ],
  });
}

export async function createVaultTransactionExecuteInstruction({
  memberAddress,
  multisigAddress,
  transactionIndex,
}: {
  memberAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
}): Promise<IInstruction> {
  const transactionPda = await getTransactionPda({
    multisigAddress,
    transactionIndex,
  });

  const proposalPda = await getProposalPda({
    multisigAddress,
    transactionIndex,
  });

  const vaultPda = await getVaultPda({
    vaultIndex: 0,
    multisigAddress,
  });

  const transactionPdaInfo = await rpc
    .getAccountInfo(transactionPda, { encoding: "base64" })
    .send();

  const parsedTransaction = parseBase64RpcAccount(
    transactionPda,
    transactionPdaInfo.value,
  ) as EncodedAccount;

  const vaultTransaction = getVaultTransactionCodec().decode(
    parsedTransaction.data,
  );

  const accountMetas: AccountMeta[] = [];

  const message = vaultTransaction.message;
  const ephemeralSignerBumps = vaultTransaction.ephemeralSignerBumps;

  const ephemeralSignerPdas = await Promise.all(
    ephemeralSignerBumps.map(async (_, additionalSignerIndex) => {
      return await getEphemeralSignerPda({
        transactionPda,
        ephemeralSignerIndex: BigInt(additionalSignerIndex),
      });
    }),
  );

  // Then add static account keys included into the message.
  for (const [accountIndex, accountKey] of message.accountKeys.entries()) {
    accountMetas.push({
      pubkey: accountKey,
      isWritable: isStaticWritableIndex(accountIndex, message),
      // NOTE: vaultPda and ephemeralSignerPdas cannot be marked as signers,
      // because they are PDAs and hence won't have their signatures on the transaction.
      isSigner:
        isSignerIndex(message, accountIndex) &&
        !(accountKey === vaultPda) &&
        !ephemeralSignerPdas.find((k) => k === accountKey),
    });
  }

  const converted = convertRoles(accountMetas);

  return createInstruction({
    data: getVaultExecuteCodec().encode({
      instructionDiscriminator: discriminator.vaultTransactionExecute,
    }),
    accounts: [
      [multisigAddress, READONLY],
      [proposalPda, WRITABLE],
      [transactionPda, READONLY],
      [memberAddress, READONLY_SIGNER],
      ...converted,
    ],
  });
}

export async function createCloseAccountsInstruction({
  multisigAddress,
  transactionIndex,
  rentCollectorAddress,
}: {
  multisigAddress: Address;
  transactionIndex: bigint;
  rentCollectorAddress: Address;
}): Promise<IInstruction> {
  const transactionPda = await getTransactionPda({
    transactionIndex,
    multisigAddress,
  });

  const proposalPda = await getProposalPda({
    transactionIndex,
    multisigAddress,
  });

  return createInstruction({
    data: getVaultExecuteCodec().encode({
      instructionDiscriminator: discriminator.vaultTransactionCloseAccounts,
    }),
    accounts: [
      [multisigAddress, READONLY],
      [proposalPda, WRITABLE],
      [transactionPda, WRITABLE],
      [rentCollectorAddress, WRITABLE],
      [SYSTEM_PROGRAM_ADDRESS, READONLY],
    ],
  });
}

export function createTransferSolInstruction({
  signer,
  amount,
  toAddress,
}: {
  signer: Signer;
  amount: Lamports;
  toAddress: Address;
}): TransferSolInstruction {
  return getTransferSolInstruction({
    amount,
    source: signer,
    destination: toAddress,
  });
}

export async function createTransferTokenInstruction({
  amount,
  signer,
  toAddress,
  fromToken,
}: {
  amount: number;
  signer: Signer;
  toAddress: Address;
  fromToken: { decimals: number; mint: Address; ata: Address };
}): Promise<IInstruction[]> {
  const { value: mintInfo } = await rpc
    .getAccountInfo(fromToken.mint, { encoding: "jsonParsed" })
    .send();

  const owner = mintInfo?.owner;

  if (!owner) {
    throw new Error("Failed to get mint info: createTransferTokenInstruction");
  }

  const toAta = await getAssociatedTokenAccountAddress(
    fromToken.mint,
    toAddress,
    TOKEN_2022_PROGRAM_ADDRESS,
  );

  return getTransferTokensInstructions({
    amount,
    feePayer: signer,
    authority: signer,
    mint: fromToken.mint,
    destinationAta: toAta,
    destination: toAddress,
    sourceAta: fromToken.ata,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  });
}
