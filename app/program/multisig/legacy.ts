import * as multisig from "@sqds/multisig";
import { IInstruction, ReadonlyUint8Array } from "gill";
import {
  Signer,
  Keypair,
  PublicKey,
  Connection,
  TransactionMessage,
} from "web3js1";

import { Address } from "~/model/web3js";
import { useRpcStore } from "~/state/rpc";
import { instructionFromLegacyInstruction } from "~/utils/instruction";

const { RPC_URL } = useRpcStore.getState();
const connection = new Connection(RPC_URL, "confirmed");

// export type CompiledMsInstruction = {
//   data: number[];
//   programIdIndex: number;
//   accountIndexes: number[];
// };

// export type MessageAddressTableLookup = {
//   accountKey: PublicKey;
//   writableIndexes: number[];
//   readonlyIndexes: number[];
// };

// export type TransactionMessage = {
//   numSigners: number;
//   accountKeys: PublicKey[];
//   numWritableSigners: number;
//   numWritableNonSigners: number;
//   instructions: CompiledMsInstruction[];
//   addressTableLookups: MessageAddressTableLookup[];
// };

export const { Permission, Permissions } = multisig.types;

type Permission = (typeof Permission)[keyof typeof Permission];
type Permissions = {
  mask: number;
};

export type Member = {
  key: PublicKey;
  permissions: Permissions;
};

export type VaultTransaction = {
  bump: number;
  index: bigint;
  creator: Address;
  multisig: Address;
  vaultBump: number;
  vaultIndex: number;
  message: VaultTransactionMessage;
  discriminator: ReadonlyUint8Array;
  ephemeralSignerBumps: ReadonlyUint8Array;
};

export type MultisigCompiledInstruction = {
  programIdIndex: number;
  accountIndexes: Uint8Array;
  data: Uint8Array;
};

export type MultisigMessageAddressTableLookup = {
  accountKey: PublicKey;
  writableIndexes: Uint8Array;
  readonlyIndexes: Uint8Array;
};

export type VaultTransactionMessage = {
  numSigners: number;
  numWritableSigners: number;
  accountKeys: Array<Address>;
  numWritableNonSigners: number;
  instructions: Array<MultisigCompiledInstruction>;
  addressTableLookups: Array<MultisigMessageAddressTableLookup>;
};

export async function getMultisigInfo({
  multisigPda,
}: {
  multisigPda: PublicKey;
}) {
  const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
    connection,
    multisigPda,
  );

  return multisigInfo;
}

export function generateLegacyKeyPair(): Keypair {
  return Keypair.generate();
}

export function getMultisigPda(createKey: Address): PublicKey {
  const [multisigPda] = multisig.getMultisigPda({
    createKey: new PublicKey(createKey),
  });

  return multisigPda;
}

export async function createMultisig({
  creator,
  members,
  createKey,
  multisigPda,
}: {
  members: Array<{ key: Address; permissions: Permissions }>;
  creator: Signer;
  createKey: Signer;
  multisigPda: PublicKey;
}) {
  const programConfigPda = multisig.getProgramConfigPda({})[0];

  const programConfig =
    await multisig.accounts.ProgramConfig.fromAccountAddress(
      connection,
      programConfigPda,
    );

  const legacyMembers = members.map((member) => ({
    key: new PublicKey(member.key),
    permissions: member.permissions,
  }));

  try {
    const signature = await multisig.rpc.multisigCreateV2({
      creator,
      createKey,
      connection,
      multisigPda,
      timeLock: 0,
      threshold: 2,
      configAuthority: null,
      members: legacyMembers,
      treasury: programConfig.treasury,
      rentCollector: Keypair.generate().publicKey,
    });

    await connection.confirmTransaction(signature);
  } catch (error) {
    console.log(error);
  }
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
      transactionMessage,
      creator: new PublicKey(creator),
      multisigPda: new PublicKey(multisigPda),
    },
  );

  return instructionFromLegacyInstruction(createVaultTransactionIx);
}
