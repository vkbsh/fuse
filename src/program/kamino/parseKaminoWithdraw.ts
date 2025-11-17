import {
  type Address,
  type AccountMeta,
  type Instruction,
  type ReadonlyUint8Array,
  type InstructionWithData,
  type InstructionWithAccounts,
  address,
} from "gill";
import { KVAULT_PROGRAM_ID_MAINNET as KAMINO_PROGRAM_ID } from "~/program/kamino/address";

import { getWithdrawInstructionDataDecoder } from "~/program/kamino/codec";

const USDC_MINT = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

type CustomData = {
  mint: Address;
  amount: bigint;
};

type ParsedWithdrawInstruction<
  TProgram extends string = typeof KAMINO_PROGRAM_ID,
  TAccountMetas extends readonly AccountMeta[] = readonly AccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    // WithdrawFromAvailable accounts (first 13)
    user: TAccountMetas[0];
    vaultState: TAccountMetas[1];
    tokenVault: TAccountMetas[2];
    baseVaultAuthority: TAccountMetas[3];
    userTokenAta: TAccountMetas[4];
    tokenMint: TAccountMetas[5];
    userSharesAta: TAccountMetas[6];
    sharesMint: TAccountMetas[7];
    tokenProgram: TAccountMetas[8];
    sharesTokenProgram: TAccountMetas[9];
    klendProgram: TAccountMetas[10];
    eventAuthority: TAccountMetas[11];
    program: TAccountMetas[12];

    // WithdrawFromInvested accounts (next 8)
    vaultStateReserve: TAccountMetas[13];
    reserve: TAccountMetas[14];
    ctokenVault: TAccountMetas[15];
    lendingMarket: TAccountMetas[16];
    lendingMarketAuthority: TAccountMetas[17];
    reserveLiquiditySupply: TAccountMetas[18];
    reserveCollateralMint: TAccountMetas[19];
    reserveCollateralTokenProgram: TAccountMetas[20];
    instructionSysvarAccount: TAccountMetas[21];
  };
  data: CustomData;
};

export function parseKaminoWithdrawInstruction<
  TProgram extends string,
  TAccountMetas extends readonly AccountMeta[],
>(
  instruction: Instruction<TProgram> &
    InstructionWithAccounts<TAccountMetas> &
    InstructionWithData<ReadonlyUint8Array>,
): ParsedWithdrawInstruction<TProgram, TAccountMetas> & {
  data: CustomData;
} {
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = (instruction.accounts as TAccountMetas)[accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };

  const data = getWithdrawInstructionDataDecoder().decode(instruction.data);

  return {
    programAddress: instruction.programAddress,
    accounts: {
      user: getNextAccount(),
      vaultState: getNextAccount(),
      tokenVault: getNextAccount(),
      baseVaultAuthority: getNextAccount(),
      userTokenAta: getNextAccount(),
      tokenMint: getNextAccount(),
      userSharesAta: getNextAccount(),
      sharesMint: getNextAccount(),
      tokenProgram: getNextAccount(),
      sharesTokenProgram: getNextAccount(),
      klendProgram: getNextAccount(),
      eventAuthority: getNextAccount(),
      program: getNextAccount(),
      vaultStateReserve: getNextAccount(),
      reserve: getNextAccount(),
      ctokenVault: getNextAccount(),
      lendingMarket: getNextAccount(),
      lendingMarketAuthority: getNextAccount(),
      reserveLiquiditySupply: getNextAccount(),
      reserveCollateralMint: getNextAccount(),
      reserveCollateralTokenProgram: getNextAccount(),
      instructionSysvarAccount: getNextAccount(),
    },
    data: {
      mint: USDC_MINT,
      amount: data.sharesAmount,
    },
  };
}
