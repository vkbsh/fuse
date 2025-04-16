import {
  getU64Codec,
  getU8Encoder,
  getUtf8Encoder,
  getAddressEncoder,
  getProgramDerivedAddress,
} from "gill";

import { Address } from "~/model/web3js";
import { SQUADS_PROGRAM_ID } from "~/program/multisig/address";

export const SEED_VAULT = getUtf8Encoder().encode("vault");
export const SEED_PREFIX = getUtf8Encoder().encode("multisig");
export const SEED_PROPOSAL = getUtf8Encoder().encode("proposal");
export const SEED_TRANSACTION = getUtf8Encoder().encode("transaction");
export const SEED_EPHEMERAL_SIGNER =
  getUtf8Encoder().encode("ephemeral_signer");

async function getPda(seeds: any[]): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: SQUADS_PROGRAM_ID,
    seeds,
  });

  return pda;
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
  ephemeralSignerIndex: number;
}): Promise<Address> {
  return getPda([
    SEED_PREFIX,
    getAddressEncoder().encode(transactionPda),
    SEED_EPHEMERAL_SIGNER,
    getU8Encoder().encode(ephemeralSignerIndex),
    SEED_PROPOSAL,
  ]);
}
