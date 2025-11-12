import {
  type Address,
  type AccountMeta,
  type Instruction,
  type ReadonlyUint8Array,
  type InstructionWithData,
  type InstructionWithAccounts,
  address,
} from "gill";
import { SpotMarkets, DRIFT_PROGRAM_ID } from "@drift-labs/sdk";

import { getWithdrawInstructionDataDecoder } from "~/program/drift/codec";

type CustomData = {
  mint: Address;
  amount: bigint;
};

type ParsedWithdrawInstruction<
  TProgram extends string = typeof DRIFT_PROGRAM_ID,
  TAccountMetas extends readonly AccountMeta[] = readonly AccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    state: TAccountMetas[0];
    user: TAccountMetas[1];
    userStats: TAccountMetas[2];
    authority: TAccountMetas[3];
    spotMarketVault: TAccountMetas[4];
    driftSigner: TAccountMetas[5];
    userTokenAccount: TAccountMetas[6];
    tokenProgram: TAccountMetas[7];
  };
  data: CustomData;
};

const LENGTH_OF_ACCOUNTS = 8;

export function parseDriftWithdrawInstruction<
  TProgram extends string,
  TAccountMetas extends readonly AccountMeta[],
>(
  instruction: Instruction<TProgram> &
    InstructionWithAccounts<TAccountMetas> &
    InstructionWithData<ReadonlyUint8Array>,
): ParsedWithdrawInstruction<TProgram, TAccountMetas> & {
  data: CustomData;
} {
  if (instruction.accounts.length < LENGTH_OF_ACCOUNTS) {
    throw new Error("Not enough accounts");
  }

  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = (instruction.accounts as TAccountMetas)[accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  const data = getWithdrawInstructionDataDecoder().decode(instruction.data);
  const spotMarket = SpotMarkets["mainnet-beta"][data.marketIndex];

  return {
    programAddress: instruction.programAddress,
    accounts: {
      state: getNextAccount(),
      user: getNextAccount(),
      userStats: getNextAccount(),
      authority: getNextAccount(),
      spotMarketVault: getNextAccount(),
      driftSigner: getNextAccount(),
      userTokenAccount: getNextAccount(),
      tokenProgram: getNextAccount(),
    },
    data: {
      amount: data.amount,
      mint: address(spotMarket.mint.toString()),
    },
  };
}
