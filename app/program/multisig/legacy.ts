import * as multisig from "@sqds/multisig";
import { PublicKey, TransactionMessage, TransactionInstruction } from "web3js1";

import {
  Address,
  AccountRole,
  IAccountMeta,
  IInstruction,
  getAddressDecoder,
  ReadonlyUint8Array,
  upgradeRoleToSigner,
  upgradeRoleToWritable,
} from "gill";
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

export function addressFromLegacyPublicKey(
  legacyPublicKey: PublicKey,
): Address {
  return getAddressDecoder().decode(legacyPublicKey.toBytes());
}

export function instructionFromLegacyInstruction(
  legacyInstruction: TransactionInstruction,
): IInstruction {
  return {
    programAddress: addressFromLegacyPublicKey(legacyInstruction.programId),
    accounts: legacyInstruction.keys.map((meta) => {
      let role = AccountRole.READONLY;
      if (meta.isWritable) {
        role = upgradeRoleToWritable(role);
      }
      if (meta.isSigner) {
        role = upgradeRoleToSigner(role);
      }

      return {
        address: addressFromLegacyPublicKey(meta.pubkey),
        role,
      } satisfies IAccountMeta;
    }),
    data: legacyInstruction.data,
  };
}

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
