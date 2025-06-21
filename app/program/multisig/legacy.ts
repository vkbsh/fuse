import * as multisig from "@sqds/multisig";

import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage as TMessage,
} from "web3js1";

import {
  address,
  Address,
  AccountRole,
  IInstruction,
  isWritableRole,
  ReadonlyUint8Array,
  upgradeRoleToSigner,
  upgradeRoleToWritable,
} from "gill";

import {
  TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
  ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
} from "gill/programs/token";

import { SYSTEM_PROGRAM_ADDRESS } from "gill/programs";
import { Signer } from "~/program/multisig/instruction";

import { useRpcStore } from "~/state/rpc";

export type TransactionMessage = TMessage;
export const TransactionMessage = TMessage;

const { READONLY, WRITABLE, READONLY_SIGNER, WRITABLE_SIGNER } = AccountRole;

const { rpc } = useRpcStore.getState();

export type AccountMeta = {
  pubkey: Address;
  isSigner: boolean;
  isWritable: boolean;
};

export function convertRoles(
  accountMetas: AccountMeta[],
): Array<[Address, AccountRole]> {
  return accountMetas.map((meta) => {
    let role = READONLY;
    if (meta.isWritable) {
      role = WRITABLE;
    }
    if (meta.isSigner) {
      role = isWritableRole(role) ? WRITABLE_SIGNER : READONLY_SIGNER;
    }
    return [address(meta.pubkey.toString()), role];
  });
}

export function isStaticWritableIndex(index: number, message: any): boolean {
  const numAccountKeys = message.accountKeys.length;
  const { numSigners, numWritableSigners, numWritableNonSigners } = message;

  if (index < 0 || index >= numAccountKeys) {
    return false;
  }

  const isWritableSigner = index < numWritableSigners;
  const isWritableNonSigner =
    index >= numSigners && index < numSigners + numWritableNonSigners;

  return isWritableSigner || isWritableNonSigner;
}

export function isSignerIndex(message: any, index: number) {
  return index < message.numSigners;
}

export function convertFromLegacyInstruction({
  data,
  accounts,
  accountKeys,
  programAddress,
}: {
  data: any;
  accounts: number[];
  accountKeys: Address[];
  programAddress:
    | typeof TOKEN_PROGRAM_ADDRESS
    | typeof SYSTEM_PROGRAM_ADDRESS
    | typeof TOKEN_2022_PROGRAM_ADDRESS
    | typeof ASSOCIATED_TOKEN_PROGRAM_ADDRESS;
}): {
  data: Uint8Array;
  programAddress: Address;
  accounts: Array<{
    address: Address;
    role: 0 | 1 | 2 | 3;
  }>;
} {
  return {
    data: new Uint8Array(data),
    programAddress,
    accounts: accounts.map((index) => ({
      address: accountKeys[index],
      role: 1, // !!! ANY role (to satisfy the type) !!!
    })),
  };
}

function addressFromLegacyPublicKey(legacyPublicKey: PublicKey): Address {
  return address(legacyPublicKey.toBase58());
}

function instructionFromLegacyInstruction(
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
      };
    }),
    data: legacyInstruction.data,
  };
}

export async function createLegacyTransactionMessage(
  signer: Signer,
  instructions: IInstruction[],
): Promise<TransactionMessage> {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  return new TransactionMessage({
    payerKey: new PublicKey(signer.address),
    instructions: instructions.map((ix) => {
      const accounts = ix.accounts ? ix.accounts : [];

      return {
        programId: new PublicKey(ix.programAddress),
        keys: accounts.map((account) => ({
          pubkey: new PublicKey(account.address),
          isSigner:
            account.role === WRITABLE_SIGNER ||
            account.role === READONLY_SIGNER,
          isWritable:
            account.role === WRITABLE || account.role === WRITABLE_SIGNER,
        })),
        data: Buffer.from(ix.data as ReadonlyUint8Array),
      };
    }),
    recentBlockhash: latestBlockhash.blockhash,
  });
}

export function createVaultInstruction({
  memo,
  creatorAddress,
  multisigAddress,
  transactionIndex,
  transactionMessage,
}: {
  memo?: string;
  creatorAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
  transactionMessage: TransactionMessage;
}): IInstruction {
  const createVaultTransactionIx = multisig.instructions.vaultTransactionCreate(
    {
      memo,
      vaultIndex: 0,
      transactionIndex,
      ephemeralSigners: 0,
      creator: new PublicKey(creatorAddress),
      multisigPda: new PublicKey(multisigAddress),
      // @ts-expect-error: incompatible type of TransactionMessage (solana web3js1 squads vs fuse)
      transactionMessage,
    },
  );

  return instructionFromLegacyInstruction(createVaultTransactionIx);
}
