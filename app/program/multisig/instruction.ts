import { AccountMeta, PublicKey } from "web3js1";

import {
  AccountRole,
  IInstruction,
  isWritableRole,
  ReadonlyUint8Array,
} from "gill";

import { SYSTEM_PROGRAM_ADDRESS } from "gill/programs";

import {
  getProposalCodec,
  getVaultExecuteCodec,
  getProposalCreateCodec,
  getProposalApproveCodec,
} from "~/program/multisig/codec";

import { SQUADS_PROGRAM_ID } from "~/program/multisig/address";

import { getEphemeralSignerPda, getProposalPda } from "~/program/multisig/pda";

import { Address } from "~/model/web3js";
import { VaultTransactionMessage } from "./legacy";

const discriminator = {
  proposalCreate: [220, 60, 73, 224, 30, 108, 79, 159],
  proposalCancel: [27, 42, 127, 237, 38, 163, 84, 203],
  proposalApprove: [144, 37, 164, 136, 188, 216, 42, 248],
  proposalReject: [243, 62, 134, 156, 230, 106, 246, 135],
  vaultTransactionExecute: [194, 8, 161, 87, 153, 164, 25, 171],
  vaultTransactionCreate: [48, 250, 78, 168, 208, 226, 218, 211],
  vaultTransactionCloseAccounts: [196, 71, 187, 176, 2, 35, 170, 165],
};

const { READONLY, WRITABLE, READONLY_SIGNER, WRITABLE_SIGNER } = AccountRole;

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

export function isStaticWritableIndex(
  index: number,
  message: VaultTransactionMessage,
): boolean {
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

export function isSignerIndex(message: VaultTransactionMessage, index: number) {
  return index < message.numSigners;
}

function convertRoles(
  accountMetas: AccountMeta[],
): Array<[PublicKey, AccountRole]> {
  return accountMetas.map((meta) => {
    let role = READONLY;
    if (meta.isWritable) {
      role = WRITABLE;
    }
    if (meta.isSigner) {
      role = isWritableRole(role) ? WRITABLE_SIGNER : READONLY_SIGNER;
    }
    return [meta.pubkey, role];
  });
}

export function createVaultTransactionExecuteInstruction({
  message,
  vaultPda,
  multisigPda,
  proposalPda,
  memberAddress,
  transactionPda,
  ephemeralSignerBumps,
}: {
  vaultPda: Address;
  multisigPda: Address;
  proposalPda: Address;
  memberAddress: Address;
  transactionPda: Address;
  message: VaultTransactionMessage;
  ephemeralSignerBumps: ReadonlyUint8Array;
}) {
  const accountMetas: AccountMeta[] = [];

  const ephemeralSignerPdas = ephemeralSignerBumps.map(
    async (_, additionalSignerIndex) => {
      return await getEphemeralSignerPda({
        transactionPda,
        ephemeralSignerIndex: additionalSignerIndex,
      });
    },
  );

  // Then add static account keys included into the message.
  for (const [accountIndex, accountKey] of message.accountKeys.entries()) {
    accountMetas.push({
      pubkey: new PublicKey(accountKey),
      isWritable: isStaticWritableIndex(accountIndex, message),
      // NOTE: vaultPda and ephemeralSignerPdas cannot be marked as signers,
      // because they are PDAs and hence won't have their signatures on the transaction.
      isSigner:
        isSignerIndex(accountIndex, message) &&
        !(accountKey === vaultPda) &&
        !ephemeralSignerPdas.find((k) => accountKey.equals(k)),
    });
  }

  const converted = convertRoles(accountMetas);

  const accounts: Array<[Address, AccountRole]> = [
    [multisigPda, READONLY],
    [proposalPda, WRITABLE],
    [transactionPda, READONLY],
    [memberAddress, READONLY_SIGNER],
    ...converted,
  ];

  return createInstruction({
    accounts,
    data: getVaultExecuteCodec().encode({
      instructionDiscriminator: discriminator.vaultTransactionExecute,
    }),
  });
}

export function createProposalCreateInstruction({
  creator,
  multisigPda,
  proposalPda,
  transactionIndex,
}: {
  creator: Address;
  multisigPda: Address;
  proposalPda: Address;
  transactionIndex: bigint;
}): IInstruction {
  return createInstruction({
    data: getProposalCreateCodec().encode({
      draft: false,
      transactionIndex,
      instructionDiscriminator: discriminator.proposalCreate,
    }),

    accounts: [
      [multisigPda, READONLY],
      [proposalPda, WRITABLE],
      [creator, READONLY_SIGNER],
      [creator, WRITABLE_SIGNER],
      [SYSTEM_PROGRAM_ADDRESS, READONLY],
    ],
  });
}

export async function createProposalApproveInstruction({
  memo,
  multisigPda,
  memberAddress,
  transactionIndex,
}: {
  memo?: string;
  multisigPda: Address;
  memberAddress: Address;
  transactionIndex: bigint;
}): Promise<IInstruction> {
  const proposalPda = await getProposalPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });

  return createInstruction({
    data: getProposalApproveCodec().encode({
      instructionDiscriminator: discriminator.proposalApprove,
      args: {
        memo: memo ?? "",
      },
    }),
    accounts: [
      [multisigPda, READONLY],
      [memberAddress, WRITABLE_SIGNER],
      [proposalPda, WRITABLE],
    ],
  });
}

export function createProposalCancelInstruction({
  memo,
  multisigPda,
  proposalPda,
  memberAddress,
}: {
  memo?: string;
  multisigPda: Address;
  proposalPda: Address;
  memberAddress: Address;
}): IInstruction {
  return createInstruction({
    data: getProposalCodec().encode({
      memo: memo ?? "",
      instructionDiscriminator: discriminator.proposalCancel,
    }),
    accounts: [
      [multisigPda, READONLY],
      [memberAddress, WRITABLE_SIGNER],
      [proposalPda, READONLY_SIGNER],
    ],
  });
}

export function createVaultTransactionAccountsCloseInstruction({
  multisigPda,
  proposalPda,
  transactionPda,
  rentCollectorPda,
}: {
  multisigPda: Address;
  proposalPda: Address;
  transactionPda: Address;
  rentCollectorPda: Address;
}): IInstruction {
  return createInstruction({
    data: getVaultExecuteCodec().encode({
      instructionDiscriminator: discriminator.vaultTransactionCloseAccounts,
    }),
    accounts: [
      [multisigPda, READONLY],
      [proposalPda, WRITABLE],
      [transactionPda, WRITABLE],
      [rentCollectorPda, WRITABLE],
      // [SQUADS_PROGRAM_ID, READONLY],
      [SYSTEM_PROGRAM_ADDRESS, READONLY],
    ],
  });
}
