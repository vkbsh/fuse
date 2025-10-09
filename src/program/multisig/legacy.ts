import {
  accounts,
  instructions,
  rpc as multisigRpc,
  getProgramConfigPda,
} from "@sqds/multisig";

import {
  type Signer,
  Keypair,
  PublicKey,
  Connection,
  TransactionInstruction,
  TransactionMessage as TMessage,
} from "@solana/web3.js";

import {
  type Address,
  type Instruction,
  type TransactionSigner,
  type ReadonlyUint8Array,
  address,
  AccountRole,
  upgradeRoleToSigner,
  upgradeRoleToWritable,
} from "gill";

import { useRpcStore } from "~/state/rpc";
import { getRpcClient } from "~/lib/rpc";

export type AccountMeta = {
  pubkey: Address;
  isSigner: boolean;
  isWritable: boolean;
};
export type LegacyTransactionMessage = TMessage;
export const LegacyTransactionMessage = TMessage;

const { WRITABLE, READONLY_SIGNER, WRITABLE_SIGNER } = AccountRole;

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
  const programConfigPda = getProgramConfigPda({})[0];
  const { RPC_URL } = useRpcStore.getState();
  const connection = new Connection(RPC_URL, "confirmed");

  const programConfig = await accounts.ProgramConfig.fromAccountAddress(
    connection,
    programConfigPda,
  );

  const legacyMembers = members.map((member) => ({
    key: new PublicKey(member.key),
    permissions: member.permissions,
  }));

  try {
    const signature = await multisigRpc.multisigCreateV2({
      creator,
      createKey,
      connection,
      timeLock: 0,
      threshold: 2,
      configAuthority: null,
      members: legacyMembers,
      treasury: programConfig.treasury,
      multisigPda: new PublicKey(multisigPda),
      rentCollector: new PublicKey(rentCollector),
    });

    await connection.confirmTransaction(signature);
  } catch (error) {
    console.error(error);
  }
}

export async function getMultisigInfo({
  multisigPda,
}: {
  multisigPda: PublicKey;
}) {
  const { RPC_URL } = useRpcStore.getState();
  const connection = new Connection(RPC_URL, "confirmed");
  const multisigInfo = await accounts.Multisig.fromAccountAddress(
    connection,
    multisigPda,
  );

  return multisigInfo;
}

function addressFromLegacyPublicKey(legacyPublicKey: PublicKey): Address {
  return address(legacyPublicKey.toBase58());
}

function instructionFromLegacyInstruction(
  legacyInstruction: TransactionInstruction,
): Instruction {
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
  instructions: Instruction[],
): Promise<LegacyTransactionMessage> {
  const { rpc } = getRpcClient();

  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  return new LegacyTransactionMessage({
    payerKey: new PublicKey(signer),
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
}): Instruction {
  const createVaultTransactionIx = instructions.vaultTransactionCreate({
    memo,
    vaultIndex: 0,
    transactionIndex,
    transactionMessage,
    ephemeralSigners: 0,
    creator: new PublicKey(creatorAddress),
    multisigPda: new PublicKey(multisigAddress),
  });

  return instructionFromLegacyInstruction(createVaultTransactionIx);
}
