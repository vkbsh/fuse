import {
  type FixedSizeDecoder,
  type ReadonlyUint8Array,
  getU64Decoder,
  fixDecoderSize,
  getBytesDecoder,
  getStructDecoder,
} from "gill";

type WithdrawInstructionData = {
  sharesAmount: bigint;
  discriminator: ReadonlyUint8Array;
};

export function getWithdrawInstructionDataDecoder(): FixedSizeDecoder<WithdrawInstructionData> {
  return getStructDecoder([
    ["discriminator", fixDecoderSize(getBytesDecoder(), 8)],
    ["sharesAmount", getU64Decoder()],
  ]);
}
