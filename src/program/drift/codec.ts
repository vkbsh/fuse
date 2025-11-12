import {
  type FixedSizeDecoder,
  type ReadonlyUint8Array,
  getU16Decoder,
  getU64Decoder,
  fixDecoderSize,
  getBytesDecoder,
  getStructDecoder,
  getBooleanDecoder,
} from "gill";

type WithdrawInstructionData = {
  amount: bigint;
  marketIndex: number;
  reduceOnly: boolean;
  discriminator: ReadonlyUint8Array;
};

export function getWithdrawInstructionDataDecoder(): FixedSizeDecoder<WithdrawInstructionData> {
  return getStructDecoder([
    ["discriminator", fixDecoderSize(getBytesDecoder(), 8)],
    ["marketIndex", getU16Decoder()],
    ["amount", getU64Decoder()],
    ["reduceOnly", getBooleanDecoder()],
  ]);
}
