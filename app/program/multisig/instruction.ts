import {
  address,
  Address,
  AccountRole,
  IInstruction,
  EncodedAccount,
  isWritableRole,
  ReadonlyUint8Array,
  parseBase64RpcAccount,
} from "gill";
import { SYSTEM_PROGRAM_ADDRESS } from "gill/programs";

import {
  getVaultPda,
  getProposalPda,
  getTransactionPda,
  getEphemeralSignerPda,
} from "~/program/multisig/pda";
import {
  getProposalCodec,
  getVaultExecuteCodec,
  getProposalCreateCodec,
  getProposalApproveCodec,
  getVaultTransactionCodec,
} from "~/program/multisig/codec";
import { SQUADS_PROGRAM_ID } from "~/program/multisig/address";

import { useRpcStore } from "~/state/rpc";

const rpc = useRpcStore.getState().rpc;

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

type AccountMeta = {
  pubkey: Address;
  isSigner: boolean;
  isWritable: boolean;
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

function convertRoles(
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

export async function createVaultTransactionExecuteInstruction({
  multisigPda,
  memberAddress,
  transactionIndex,
}: {
  multisigPda: Address;
  memberAddress: Address;
  transactionIndex: bigint;
}): Promise<IInstruction> {
  const accountMetas: AccountMeta[] = [];

  const transactionPda = await getTransactionPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });

  const vaultPda = await getVaultPda({
    vaultIndex: 0,
    multisigAddress: multisigPda,
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

  const proposalPda = await getProposalPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });

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

export async function createProposalCreateInstruction({
  creator,
  multisigPda,
  transactionIndex,
}: {
  creator: Address;
  multisigPda: Address;

  transactionIndex: bigint;
}): Promise<IInstruction> {
  const proposalPda = await getProposalPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });
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

export async function createProposalCancelInstruction({
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
    multisigAddress: multisigPda,
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
      [multisigPda, READONLY],
      [memberAddress, WRITABLE_SIGNER],
      [proposalPda, WRITABLE],
      [SYSTEM_PROGRAM_ADDRESS, READONLY],
    ],
  });
}

export async function createVaultTransactionAccountsCloseInstruction({
  multisigPda,
  rentCollectorPda,
  transactionIndex,
}: {
  multisigPda: Address;
  transactionIndex: bigint;
  rentCollectorPda: Address;
}): Promise<IInstruction> {
  const transactionPda = await getTransactionPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });

  const proposalPda = await getProposalPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });

  return createInstruction({
    data: getVaultExecuteCodec().encode({
      instructionDiscriminator: discriminator.vaultTransactionCloseAccounts,
    }),
    accounts: [
      [multisigPda, READONLY],
      [proposalPda, WRITABLE],
      [transactionPda, WRITABLE],
      [rentCollectorPda, WRITABLE],
      [SYSTEM_PROGRAM_ADDRESS, READONLY],
    ],
  });
}

export async function createProposalRejectInstruction({
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
    multisigAddress: multisigPda,
    transactionIndex: BigInt(transactionIndex),
  });

  return createInstruction({
    data: getProposalCodec().encode({
      memo: memo ?? "",
      instructionDiscriminator: discriminator.proposalReject,
    }),
    accounts: [
      [multisigPda, READONLY],
      [memberAddress, WRITABLE_SIGNER],
      [proposalPda, WRITABLE],
    ],
  });
}
