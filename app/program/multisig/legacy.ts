import * as multisig from "@sqds/multisig";

import {
  Signer,
  Keypair,
  PublicKey,
  Connection,
  TransactionInstruction,
  TransactionMessage as TMessage,
} from "web3js1";

import {
  address,
  Address,
  AccountRole,
  IInstruction,
  TransactionSigner,
  ReadonlyUint8Array,
  upgradeRoleToSigner,
  upgradeRoleToWritable,
} from "gill";

import {
  TOKEN_PROGRAM_ADDRESS,
  ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
} from "gill/programs/token";

import { SYSTEM_PROGRAM_ADDRESS } from "gill/programs";

import { RPC_URL_TEST, useRpcStore } from "~/state/rpc";

export type LegacyTransactionMessage = TMessage;
export const LegacyTransactionMessage = TMessage;

const { rpc } = useRpcStore.getState();

const { WRITABLE, READONLY_SIGNER, WRITABLE_SIGNER } = AccountRole;

export type AccountMeta = {
  pubkey: Address;
  isSigner: boolean;
  isWritable: boolean;
};

const connection = new Connection(RPC_URL_TEST, "confirmed");

export function generateLegacyKeyPair(): Keypair {
  return Keypair.generate();
}

export async function createMultisig({
  creator,
  members,
  createKey,
  multisigPda,
  rentCollector,
}: {
  creator: Signer;
  createKey: Signer;
  multisigPda: Address;
  rentCollector: Address;
  members: Array<{ key: Address; permissions: { mask: number } }>;
}) {
  const programConfigPda = multisig.getProgramConfigPda({})[0];

  const programConfig =
    await multisig.accounts.ProgramConfig.fromAccountAddress(
      // @ts-expect-error: incompatible type of Connection (solana web3js1 squads vs fuse)
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
      // @ts-expect-error: incompatible type of Connection (solana web3js1 squads vs fuse)
      connection,
      timeLock: 0,
      threshold: 2,
      configAuthority: null,
      members: legacyMembers,
      treasury: programConfig.treasury,
      multisigPda: new PublicKey(multisigPda),
      rentCollector: new PublicKey(rentCollector) ?? null,
    });

    await connection.confirmTransaction(signature);
  } catch (error) {
    console.log(error);
  }
}

export async function getMultisigInfo({
  multisigPda,
}: {
  multisigPda: PublicKey;
}) {
  const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
    // @ts-expect-error: incompatible type of Connection (solana web3js1 squads vs fuse)
    connection,
    multisigPda,
  );

  return multisigInfo;
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
        role,
        address: addressFromLegacyPublicKey(meta.pubkey),
      };
    }),
    data: legacyInstruction.data,
  };
}

export async function createLegacyTransactionMessage(
  signer: TransactionSigner,
  instructions: IInstruction[],
): Promise<LegacyTransactionMessage> {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  return new LegacyTransactionMessage({
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

export function createLegacyVaultInstruction({
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
  transactionMessage: LegacyTransactionMessage;
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

export async function createLegacyVaultExecuteInstruction({
  memberAddress,
  multisigAddress,
  transactionIndex,
}: {
  memberAddress: Address;
  multisigAddress: Address;
  transactionIndex: bigint;
}): Promise<IInstruction> {
  console.log("createVaultExecuteInstruction", {
    memberAddress,
    multisigAddress,
    transactionIndex,
  });

  const { instruction: executeVaultTransactionIx } =
    await multisig.instructions.vaultTransactionExecute({
      // @ts-expect-error: incompatible type of TransactionMessage (solana web3js1 squads vs fuse)
      connection,
      transactionIndex,
      member: new PublicKey(memberAddress),
      multisigPda: new PublicKey(multisigAddress),
    });

  return instructionFromLegacyInstruction(executeVaultTransactionIx);
}
