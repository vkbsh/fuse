import {
  type Address,
  type ReadonlyUint8Array,
  getU8Codec,
  getU64Codec,
  getU8Encoder,
  getUtf8Encoder,
  getAddressEncoder,
  getProgramDerivedAddress,
} from "gill";

import { SQUADS_PROGRAM_ID } from "~/program/multisig/address";

export const SEED_MULTISIG = getUtf8Encoder().encode("multisig");
export const SEED_VAULT = getUtf8Encoder().encode("vault");
export const SEED_PREFIX = getUtf8Encoder().encode("multisig");
export const SEED_PROPOSAL = getUtf8Encoder().encode("proposal");
export const SEED_TRANSACTION = getUtf8Encoder().encode("transaction");
export const SEED_EPHEMERAL_SIGNER =
  getUtf8Encoder().encode("ephemeral_signer");

async function getPda(
  seeds: Array<ReadonlyUint8Array | string>,
): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    seeds,
    programAddress: SQUADS_PROGRAM_ID,
  });

  return pda;
}

export async function getMultisigPda({
  createKey,
}: {
  createKey: Address;
}): Promise<Address> {
  return getPda([
    SEED_PREFIX,
    SEED_MULTISIG,
    getAddressEncoder().encode(createKey),
  ]);
}

export async function getVaultPda({
  vaultIndex,
  multisigAddress,
}: {
  vaultIndex: number;
  multisigAddress: Address;
}): Promise<Address> {
  return getPda([
    SEED_PREFIX,
    getAddressEncoder().encode(multisigAddress),
    SEED_VAULT,
    getU8Encoder().encode(vaultIndex),
  ]);
}

export async function getTransactionPda({
  multisigAddress,
  transactionIndex,
}: {
  multisigAddress: Address;
  transactionIndex: bigint;
}): Promise<Address> {
  if (transactionIndex > Number.MAX_SAFE_INTEGER) {
    throw new Error("transactionIndex is too large");
  }

  return getPda([
    SEED_PREFIX,
    getAddressEncoder().encode(multisigAddress),
    SEED_TRANSACTION,
    getU64Codec().encode(transactionIndex),
  ]);
}

export async function getProposalPda({
  multisigAddress,
  transactionIndex,
}: {
  multisigAddress: Address;
  transactionIndex: bigint;
}): Promise<Address> {
  if (transactionIndex > Number.MAX_SAFE_INTEGER) {
    throw new Error("transactionIndex is too large");
  }

  return getPda([
    SEED_PREFIX,
    getAddressEncoder().encode(multisigAddress),
    SEED_TRANSACTION,
    getU64Codec().encode(transactionIndex),
    SEED_PROPOSAL,
  ]);
}

export async function getEphemeralSignerPda({
  transactionPda,
  ephemeralSignerIndex,
}: {
  transactionPda: Address;
  ephemeralSignerIndex: bigint;
}): Promise<Address> {
  return getPda([
    SEED_PREFIX,
    getAddressEncoder().encode(transactionPda),
    SEED_EPHEMERAL_SIGNER,
    getU8Codec().encode(ephemeralSignerIndex),
  ]);
}
