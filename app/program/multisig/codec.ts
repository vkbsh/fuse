import {
  Codec,
  Address,
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
  OptionOrNullable,
  getNullableCodec,
  ReadonlyUint8Array,
  addCodecSizePrefix,
  getDiscriminatedUnionCodec,
} from "gill";

export const MemberPermissions = {
  All: 7, // Cloud Key
  Vote: 2, // Recovery Key
};

export type Permissions = {
  mask: number;
};

export type Member = {
  key: Address;
  permissions: Permissions;
};

function getPermissionsCodec(): Codec<Permissions> {
  return getStructCodec([["mask", getU8Codec()]]);
}

function getMemberCodec(): Codec<Member> {
  return getStructCodec([
    ["key", getAddressCodec()],
    ["permissions", getPermissionsCodec()],
  ]);
}

export type MultisigAccount = {
  accountDiscriminator: number[];
  createKey: Address;
  configAuthority: Address;
  threshold: number;
  timeLock: number;
  transactionIndex: bigint;
  staleTransactionIndex: bigint;
  rentCollector: Address | null;
  bump: number;
  members: Member[];
};

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

export type ProposalStatus =
  | { __kind: "Draft"; timestamp: number | bigint }
  | { __kind: "Active"; timestamp: number | bigint }
  | { __kind: "Rejected"; timestamp: number | bigint }
  | { __kind: "Approved"; timestamp: number | bigint }
  | { __kind: "Executed"; timestamp: number | bigint }
  | { __kind: "Cancelled"; timestamp: number | bigint };

export function getProposalStatusCodec(): Codec<ProposalStatus> {
  return getDiscriminatedUnionCodec([
    ["Draft", getStructCodec([["timestamp", getI64Codec()]])],
    ["Active", getStructCodec([["timestamp", getI64Codec()]])],
    ["Rejected", getStructCodec([["timestamp", getI64Codec()]])],
    ["Approved", getStructCodec([["timestamp", getI64Codec()]])],
    ["Executed", getStructCodec([["timestamp", getI64Codec()]])],
    ["Cancelled", getStructCodec([["timestamp", getI64Codec()]])],
  ]);
}

export type ProposalAccount = {
  accountDiscriminator: number[];
  multisig: Address;
  transactionIndex: bigint;
  status: ProposalStatus;
  bump: number;
  approved: Address[];
  rejected: Address[];
  cancelled: Address[];
};

export function getProposalAccountCodec(): Codec<ProposalAccount> {
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

export type ProposalCreate = {
  draft: boolean;
  transactionIndex: bigint;
  instructionDiscriminator: number[];
};

export function getProposalCreateCodec(): Codec<ProposalCreate> {
  return getStructCodec([
    ["instructionDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["transactionIndex", getU64Codec()],
    ["draft", getBooleanCodec()],
  ]);
}

type ProposalApproveArgs = {
  memo: OptionOrNullable<string>;
};

const getProposalArgsCodec = (): Codec<ProposalApproveArgs> => {
  return getStructCodec([
    ["memo", getOptionCodec(addCodecSizePrefix(getUtf8Codec(), getU32Codec()))],
  ]);
};

type ProposalApprove = {
  args: ProposalApproveArgs;
  instructionDiscriminator: number[];
};

export function getProposalApproveCodec(): Codec<ProposalApprove> {
  return getStructCodec([
    ["instructionDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["args", getProposalArgsCodec()],
  ]);
}

type Proposal = {
  memo: OptionOrNullable<string>;
  instructionDiscriminator: number[];
};
export function getProposalCodec(): Codec<Proposal> {
  return getStructCodec([
    ["instructionDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
    ["memo", getOptionCodec(addCodecSizePrefix(getUtf8Codec(), getU32Codec()))],
  ]);
}

type VaultExecute = {
  instructionDiscriminator: number[];
};

export function getVaultExecuteCodec(): Codec<VaultExecute> {
  return getStructCodec([
    ["instructionDiscriminator", getArrayCodec(getU8Codec(), { size: 8 })],
  ]);
}

type VaultTransaction = {
  accountDiscriminator: number[];
  multisig: Address;
  creator: Address;
  index: bigint;
  bump: number;
  vaultIndex: number;
  vaultBump: number;
  ephemeralSignerBumps: ReadonlyUint8Array;
  message: VaultTransactionMessage;
};

export function getVaultTransactionCodec(): Codec<VaultTransaction> {
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

type VaultTransactionMessage = {
  numSigners: number;
  numWritableSigners: number;
  numWritableNonSigners: number;
  accountKeys: Address[];
  instructions: MultisigCompiledInstruction[];
  addressTableLookups: MultisigMessageAddressTableLookup[];
};

export function getVaultTransactionMessageCodec(): Codec<VaultTransactionMessage> {
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

type MultisigCompiledInstruction = {
  data: number[];
  programIdIndex: number;
  accountIndexes: number[];
};

export function getMultisigCompiledInstructionCodec(): Codec<MultisigCompiledInstruction> {
  return getStructCodec([
    ["programIdIndex", getU8Codec()],
    ["accountIndexes", getArrayCodec(getU8Codec())],
    ["data", getArrayCodec(getU8Codec())],
  ]);
}

type MultisigMessageAddressTableLookup = {
  accountKey: Address;
  writableIndexes: ReadonlyUint8Array;
  readonlyIndexes: ReadonlyUint8Array;
};

export function getMultisigMessageAddressTableLookupCodec(): Codec<MultisigMessageAddressTableLookup> {
  return getStructCodec([
    ["accountKey", getAddressCodec()],
    ["writableIndexes", addCodecSizePrefix(getBytesCodec(), getU32Codec())],
    ["readonlyIndexes", addCodecSizePrefix(getBytesCodec(), getU32Codec())],
  ]);
}
