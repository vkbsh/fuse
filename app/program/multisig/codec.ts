import { z } from "zod";
import {
  Codec,
  getU8Codec,
  getU16Codec,
  getU32Codec,
  getU64Codec,
  getUtf8Codec,
  getArrayCodec,
  getStructCodec,
  getBooleanCodec,
  getAddressCodec,
  getNullableCodec,
  addCodecSizePrefix,
  getOptionCodec,
  getEnumCodec,
  getDiscriminatedUnionDecoder,
  getDiscriminatedUnionCodec,
  getStructDecoder,
  getUnitDecoder,
  getI64Codec,
  getUnitCodec,
  getBytesCodec,
} from "gill";

import { Address } from "~/model/web3js";

export const Permissions = z.object({ mask: z.number() });

export type Permissions = z.infer<typeof Permissions>;

function getPermissionsCodec(): Codec<Permissions> {
  return getStructCodec([["mask", getU8Codec()]]);
}

export const Member = z.object({
  key: Address,
  permissions: Permissions,
});

export type Member = z.infer<typeof Member>;

function getMemberCodec(): Codec<Member> {
  return getStructCodec([
    ["key", getAddressCodec()],
    ["permissions", getPermissionsCodec()],
  ]);
}

export const MultisigAccount = z.object({
  accountDiscriminator: z.array(z.number()).length(8),
  createKey: Address,
  configAuthority: Address,
  threshold: z.number(),
  timeLock: z.number(),
  transactionIndex: z.bigint(),
  staleTransactionIndex: z.bigint(),
  rentCollector: Address.nullable(),
  bump: z.number(),
  members: z.array(Member),
});

export type MultisigAccount = z.infer<typeof MultisigAccount>;

export function getMultisigAccountCodec(): Codec<MultisigAccount> {
  return getStructCodec([
    ["accountDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["createKey", getAddressCodec()],
    ["configAuthority", getAddressCodec()],
    ["threshold", getU16Codec()],
    ["timeLock", getU32Codec()],
    ["transactionIndex", getU64Codec()],
    ["staleTransactionIndex", getU64Codec()],
    ["rentCollector", getNullableCodec(getAddressCodec())],
    ["bump", getU8Codec()],
    ["members", getArrayCodec(getMemberCodec())],
  ]);
}

export function getProposalAccountCodec() {
  return getStructCodec([
    ["accountDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["multisig", getAddressCodec()],
    ["transactionIndex", getU64Codec()],
    ["status", getProposalStatusCodec()],
    ["bump", getU8Codec()],
    ["approved", getArrayCodec(getAddressCodec())],
    ["rejected", getArrayCodec(getAddressCodec())],
    ["cancelled", getArrayCodec(getAddressCodec())],
  ]);
}

export function getProposalStatusCodec() {
  return getDiscriminatedUnionCodec([
    ["Draft", getStructCodec([["timestamp", getI64Codec()]])],
    ["Active", getStructCodec([["timestamp", getI64Codec()]])],
    ["Rejected", getStructCodec([["timestamp", getI64Codec()]])],
    ["Approved", getStructCodec([["timestamp", getI64Codec()]])],
    ["Executing", getUnitCodec()],
    ["Executed", getStructCodec([["timestamp", getI64Codec()]])],
    ["Cancelled", getStructCodec([["timestamp", getI64Codec()]])],
  ]);
}

export const ProposalCreate = z.object({
  draft: z.boolean(),
  transactionIndex: z.bigint(),
  instructionDiscriminator: z.array(z.number()),
});

export function getProposalCreateCodec(): Codec<
  z.infer<typeof ProposalCreate>
> {
  return getStructCodec([
    ["instructionDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["transactionIndex", getU64Codec()],
    ["draft", getBooleanCodec()],
  ]);
}

export const Proposal = z.object({
  memo: z.string(),
  instructionDiscriminator: z.array(z.number()),
});

export const ProposalApprove = z.object({
  args: z.object({
    memo: z.string().optional(),
  }),
  instructionDiscriminator: z.array(z.number()),
});

export const getDynamicStringCodec = () => {
  return addCodecSizePrefix(getUtf8Codec(), getU32Codec());
};
export const getProposalArgsCodec = () =>
  getStructCodec([["memo", getOptionCodec(getDynamicStringCodec())]]);

export function getProposalApproveCodec(): Codec<
  z.infer<typeof ProposalApprove>
> {
  return getStructCodec([
    ["instructionDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["args", getProposalArgsCodec()],
  ]);
}

export function getProposalCodec(): Codec<z.infer<typeof Proposal>> {
  return getStructCodec([
    ["instructionDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["memo", getUtf8Codec()],
  ]);
}

export const VaultExecute = z.object({
  instructionDiscriminator: z.array(z.number()),
});
export function getVaultExecuteCodec(): Codec<z.infer<typeof VaultExecute>> {
  return getStructCodec([
    ["instructionDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
  ]);
}

export function getVaultTransactionCodec() {
  return getStructCodec([
    ["accountDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["multisig", getAddressCodec()],
    ["creator", getAddressCodec()],
    ["index", getU64Codec()],
    ["bump", getU8Codec()],
    ["vaultIndex", getU8Codec()],
    ["vaultBump", getU8Codec()],
    [
      "ephemeralSignerBumps",
      addCodecSizePrefix(getBytesCodec(), getU32Codec()),
    ],
    ["message", getVaultTransactionMessageCodec()],
  ]);
}

export function getVaultTransactionMessageCodec() {
  return getStructCodec([
    ["numSigners", getU8Codec()],
    ["numWritableSigners", getU8Codec()],
    ["numWritableNonSigners", getU8Codec()],
    ["accountKeys", getArrayCodec(getAddressCodec())],
    ["instructions", getArrayCodec(getMultisigCompiledInstructionCodec())],
    [
      "addressTableLookups",
      getArrayCodec(getMultisigMessageAddressTableLookupCodec()),
    ],
  ]);
}

export function getMultisigCompiledInstructionCodec() {
  return getStructCodec([
    ["programIdIndex", getU8Codec()],
    ["accountIndexes", getArrayCodec(getU8Codec())],
    ["data", getArrayCodec(getU8Codec())],
  ]);
}

export function getMultisigMessageAddressTableLookupCodec() {
  return getStructCodec([
    ["accountKey", getAddressCodec()],
    ["writableIndexes", addCodecSizePrefix(getBytesCodec(), getU32Codec())],
    ["readonlyIndexes", addCodecSizePrefix(getBytesCodec(), getU32Codec())],
  ]);
}
