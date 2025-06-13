import * as multisig from "@sqds/multisig";
import { PublicKey, TransactionMessage, TransactionInstruction } from "web3js1";

import {
  Address,
  AccountRole,
  IAccountMeta,
  IInstruction,
  getAddressDecoder,
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
      // @ts-expect-error: incompatible type of TransactionMessage (solana web3js1 squads vs fuse)
      transactionMessage,
      creator: new PublicKey(creator),
      multisigPda: new PublicKey(multisigPda),
    },
  );

  return instructionFromLegacyInstruction(createVaultTransactionIx);
}
