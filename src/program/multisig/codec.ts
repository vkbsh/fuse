import {
  type Codec,
  getU8Codec,
  getU16Codec,
  getU32Codec,
  getU64Codec,
  getI64Codec,
  getUtf8Codec,
  getBytesCodec,
  getArrayCodec,
  getOptionCodec,
  getStructCodec,
  getBooleanCodec,
  getAddressCodec,
  getNullableCodec,
  addCodecSizePrefix,
  getDiscriminatedUnionCodec,
} from "gill";

type ExtractCodecValueType<T> = T extends Codec<unknown, infer V> ? V : never;

function getPermissionsCodec() {
  return getStructCodec([["mask", getU8Codec()]]);
}

function getMemberCodec() {
  return getStructCodec([
    ["key", getAddressCodec()],
    ["permissions", getPermissionsCodec()],
  ]);
}

export function getMultisigAccountCodec() {
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

export type MultisigAccount = ExtractCodecValueType<
  ReturnType<typeof getMultisigAccountCodec>
>;

export function getProposalStatusCodec() {
  return getDiscriminatedUnionCodec([
    ["Draft", getStructCodec([["timestamp", getI64Codec()]])],
    ["Active", getStructCodec([["timestamp", getI64Codec()]])],
    ["Rejected", getStructCodec([["timestamp", getI64Codec()]])],
    ["Approved", getStructCodec([["timestamp", getI64Codec()]])],
    ["Executing", getStructCodec([["timestamp", getI64Codec()]])],
    ["Executed", getStructCodec([["timestamp", getI64Codec()]])],
    ["Cancelled", getStructCodec([["timestamp", getI64Codec()]])],
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

export function getProposalCreateCodec() {
  return getStructCodec([
    ["instructionDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["transactionIndex", getU64Codec()],
    ["draft", getBooleanCodec()],
  ]);
}

const getProposalArgsCodec = () => {
  return getStructCodec([
    ["memo", getOptionCodec(addCodecSizePrefix(getUtf8Codec(), getU32Codec()))],
  ]);
};

export function getProposalApproveCodec() {
  return getStructCodec([
    ["instructionDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["args", getProposalArgsCodec()],
  ]);
}

export function getProposalCodec() {
  return getStructCodec([
    ["instructionDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["memo", getOptionCodec(addCodecSizePrefix(getUtf8Codec(), getU32Codec()))],
  ]);
}

export function getVaultExecuteCodec() {
  return getStructCodec([
    ["instructionDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
  ]);
}

export function getVaultTransactionCodec() {
  return getStructCodec([
    ["accountDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["multisig", getAddressCodec()],
    ["creator", getAddressCodec()],
    ["transactionIndex", getU64Codec()],
    ["bump", getU8Codec()],
    ["vaultIndex", getU8Codec()],
    ["vaultBump", getU8Codec()],
    ["ephemeralSignerBumps", getArrayCodec(getU8Codec())],
    ["message", getVaultTransactionMessageCodec()],
  ]);
}

export type VaultTransaction = ExtractCodecValueType<
  ReturnType<typeof getVaultTransactionCodec>
>;

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

export type VaultTransactionMessage = ExtractCodecValueType<
  ReturnType<typeof getVaultTransactionMessageCodec>
>;

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
