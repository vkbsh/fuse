import { parseTransferSolInstruction } from "gill/programs";
import {
  parseTransferInstruction,
  parseCreateAssociatedTokenIdempotentInstruction,
} from "@solana-program/token";

import {
  TOKEN_PROGRAM_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
  ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
} from "~/program/multisig/address";

import { Address } from "~/model/web3js";
import { fetchTokenMeta } from "~/service/token";
import { LAMPORTS_PER_SOL } from "gill";

const nativeToken = {
  decimals: 9,
  symbol: "SOL",
  name: "Solana",
  address: "So11111111111111111111111111111111111111112",
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
};

type Message = {
  accountKeys: Address[];
  instructions: Array<{
    data: any;
    programIdIndex: number;
    accountIndexes: number[];
  }>;
};

export type Mint = {
  name: string;
  symbol: string;
  logoURI: string;
  decimals: number;
  address: Address;
};

type Result = {
  mint: Mint;
  amount: number;
  toAccount: Address;
  fromAccount: Address;
};

export async function parseTransactionMessage(
  message: Message,
): Promise<Result | null> {
  const instructions = message?.instructions || [];
  const accountKeys = message?.accountKeys || [];
  let decoded = null;
  let result = null;

  if (instructions.length === 0) {
    return decoded;
  }

  // List of 2 instructions might contain:
  // ['Create ATA Instruction', 'Transfer Token Instruction']
  if (instructions.length > 1) {
    const createATAIx = instructions[0]; // Maybe Create ATA
    const transferTokenIx = instructions[1]; // Maybe Transfer Token

    const programAddressCreateATA = accountKeys[createATAIx.programIdIndex];
    const programAddressTransferToken =
      accountKeys[transferTokenIx.programIdIndex];

    if (
      isAssociatedTokenProgram(programAddressCreateATA) &&
      isTokenProgram(programAddressTransferToken)
    ) {
      let ata = null;
      let toAccount = null;
      let mintAddress = null;

      try {
        const decodedATA = parseCreateAssociatedTokenIdempotentInstruction(
          convertFromLegacyInstruction({
            accountKeys,
            accounts: createATAIx.accountIndexes,
            programAddress: TOKEN_PROGRAM_ADDRESS,
            data: new Uint8Array(createATAIx.data),
          }),
        );

        if (decodedATA) {
          ata = decodedATA?.accounts?.ata?.address;
          toAccount = decodedATA?.accounts?.owner?.address;
          mintAddress = decodedATA?.accounts?.mint?.address;
        }
      } catch (error) {
        console.log("error", error);
      }

      try {
        decoded = parseTransferInstruction(
          convertFromLegacyInstruction({
            accountKeys,
            accounts: transferTokenIx.accountIndexes,
            programAddress: TOKEN_PROGRAM_ADDRESS,
            data: new Uint8Array(transferTokenIx.data),
          }),
        );

        if (decoded) {
          try {
            const mintInfo = mintAddress
              ? await fetchTokenMeta(mintAddress)
              : {};

            // decoded.accounts.source.address = ata;
            // decoded.accounts.destination.address = toAccount;
            // decoded.mint = mintInfo;

            result = {
              ...decoded,
              accounts: {
                source: {
                  address: ata,
                },
                destination: {
                  address: toAccount,
                },
              },
              mint: mintInfo,
            };
          } catch (error) {
            console.log("error", error);
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    }
  }

  // [Transfer Token]
  if (
    instructions.length === 1 &&
    isTokenProgram(accountKeys[instructions[0].programIdIndex])
  ) {
    const ix = instructions[0];
    const programAddress = accountKeys[ix.programIdIndex];

    const customIx = convertFromLegacyInstruction({
      data: ix.data,
      accounts: ix.accountIndexes,
      accountKeys,
      programAddress,
    });

    try {
      decoded = parseTransferInstruction(customIx);
      if (decoded) {
        result = {
          ...decoded,
        };
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  // [Transfer SOL]
  if (
    instructions.length === 1 &&
    isSystemProgram(accountKeys[instructions[0].programIdIndex])
  ) {
    const ix = instructions[0];
    const programAddress = accountKeys[ix.programIdIndex];

    const customIx = convertFromLegacyInstruction({
      data: ix.data,
      accounts: ix.accountIndexes,
      accountKeys,
      programAddress,
    });

    try {
      decoded = parseTransferSolInstruction(customIx);

      if (decoded) {
        result = {
          ...decoded,
          mint: nativeToken,
        };
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  if (!result) {
    return null;
  }

  return {
    mint: result.mint,
    fromAccount: result?.accounts?.source?.address as Address,
    toAccount: result?.accounts?.destination?.address as Address,
    amount: isTokenProgram(decoded?.programAddress)
      ? Number(result?.data?.amount) / 10 ** result?.mint?.decimals
      : Number(result?.data?.amount) / LAMPORTS_PER_SOL,
  };
}

function convertFromLegacyInstruction({
  data,
  accounts,
  accountKeys,
  programAddress,
}: {
  data: any;
  accounts: number[];
  accountKeys: Address[];
  programAddress: Address;
}): {
  data: Uint8Array;
  programAddress: Address;
  accounts: Array<{
    address: Address;
    role: 0 | 1 | 2 | 3;
  }>;
} {
  return {
    data: new Uint8Array(data),
    programAddress,
    accounts: accounts.map((index) => ({
      address: accountKeys[index],
      role: 1, // !!! ANY role (to satisfy the type) !!!
    })),
  };
}

function isTokenProgram(programAddress: Address): boolean {
  return programAddress === TOKEN_PROGRAM_ADDRESS;
}

function isSystemProgram(programAddress: Address): boolean {
  return programAddress === SYSTEM_PROGRAM_ADDRESS;
}

function isAssociatedTokenProgram(programAddress: Address): boolean {
  return programAddress === ASSOCIATED_TOKEN_PROGRAM_ADDRESS;
}

export enum MemberPermissions {
  Initiate = 1,
  Vote = 2,
  InitiateVote = 3,
  Execute = 4,
  InitiateExecute = 5,
  VoteExecute = 6,
  All = 7,
}
