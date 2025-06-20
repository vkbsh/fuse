import { address, Address, fetchEncodedAccount, decodeAccount } from "gill";

import {
  SYSTEM_PROGRAM_ADDRESS,
  parseTransferSolInstruction,
  ParsedTransferSolInstruction,
  getTransferSolInstructionDataEncoder,
} from "gill/programs";

import {
  parseTransferInstruction,
  ParsedTransferInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
  parseCreateAssociatedTokenIdempotentInstruction,
  TOKEN_2022_PROGRAM_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
} from "gill/programs/token";

import { convertFromLegacyInstruction } from "~/program/multisig/legacy";

const nativeToken = {
  address: address("So11111111111111111111111111111111111111112"),
};

type Message = {
  accountKeys: Address[];
  instructions: Array<{
    data: any;
    programIdIndex: number;
    accountIndexes: number[];
  }>;
};

type Result = {
  amount: number;
  toAccount: Address;
  fromAccount: Address;
  mintAddress: Address;
};

function isTokenProgram(programAddress: Address): boolean {
  return programAddress === TOKEN_2022_PROGRAM_ADDRESS;
}

function isSystemProgram(programAddress: Address): boolean {
  return programAddress === SYSTEM_PROGRAM_ADDRESS;
}

function isAssociatedTokenProgram(programAddress: Address): boolean {
  return programAddress === ASSOCIATED_TOKEN_PROGRAM_ADDRESS;
}

export async function parseTransactionMessage(
  message: Message,
): Promise<Result | null> {
  const { accountKeys = [], instructions = [] } = message || {};

  if (instructions.length === 0) {
    return null;
  }

  let result: Result | null = null;

  // Transfer (SOL/Token) Instruction
  if (instructions.length === 1) {
    const ixLegacy = instructions[0];
    const programAddress = accountKeys[ixLegacy.programIdIndex] as
      | typeof TOKEN_PROGRAM_ADDRESS
      | typeof SYSTEM_PROGRAM_ADDRESS;

    const ix = convertFromLegacyInstruction({
      accountKeys,
      programAddress,
      data: ixLegacy.data,
      accounts: ixLegacy.accountIndexes,
    });

    let parsedTx:
      | ParsedTransferInstruction<Address>
      | ParsedTransferSolInstruction<string>
      | null = null;

    if (isSystemProgram(programAddress)) {
      try {
        parsedTx = parseTransferSolInstruction(ix);
      } catch (error) {
        console.error("Failed to parse Transfer SOL Instruction: ", error);
        return null;
      }
    }

    if (isTokenProgram(programAddress)) {
      try {
        parsedTx = parseTransferInstruction(ix);
      } catch (error) {
        console.error("Failed to parse Transfer Token Instruction: ", error);
        return null;
      }
    }

    if (!parsedTx) {
      return null;
    }

    const { accounts, data } = parsedTx;

    result = {
      amount: Number(data.amount),
      mintAddress: nativeToken.address,
      fromAccount: accounts.source.address,
      toAccount: accounts.destination.address,
    };
  }

  // List of 2 instructions might contain:
  // ['Create ATA Instruction', 'Transfer Token Instruction']
  if (instructions.length === 2) {
    const createATAIx = instructions[0]; // Maybe Create ATA
    const transferTokenIx = instructions[1]; // Maybe Transfer Token

    const programAddressCreateATA = accountKeys[createATAIx.programIdIndex];
    const programAddressTransferToken =
      accountKeys[transferTokenIx.programIdIndex];

    if (
      isAssociatedTokenProgram(programAddressCreateATA) &&
      isTokenProgram(programAddressTransferToken)
    ) {
      try {
        const decodedATI = parseCreateAssociatedTokenIdempotentInstruction(
          convertFromLegacyInstruction({
            accountKeys,
            accounts: createATAIx.accountIndexes,
            programAddress: TOKEN_PROGRAM_ADDRESS,
            data: new Uint8Array(createATAIx.data),
          }),
        );

        if (decodedATI) {
          const accountsATI = decodedATI?.accounts;

          const ata = accountsATI.ata.address;
          const toAccount = accountsATI.owner.address;
          const mintAddress = accountsATI.mint.address;

          try {
            const { accounts, data } = parseTransferInstruction(
              convertFromLegacyInstruction({
                accountKeys,
                accounts: transferTokenIx.accountIndexes,
                programAddress: TOKEN_PROGRAM_ADDRESS,
                data: new Uint8Array(transferTokenIx.data),
              }),
            );

            result = {
              mintAddress,
              amount: Number(data.amount),
              toAccount:
                accounts.destination.address === ata
                  ? toAccount
                  : accounts.destination.address,
              fromAccount: accounts.source.address,
            };
          } catch (e) {
            console.error("Failed to parse Transfer Instruction: ", e);
            return null;
          }
        }
      } catch (e) {
        console.error("Failed to parse Create ATA Instruction: ", e);
        return null;
      }
    }
  }

  if (
    !result?.amount ||
    !result?.toAccount ||
    !result?.fromAccount ||
    !result?.mintAddress
  ) {
    return null;
  }

  return result;
}
