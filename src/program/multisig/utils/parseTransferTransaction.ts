import { parseBase64RpcAccount } from "gill";
import { type Address, type EncodedAccount } from "gill";

import {
  SYSTEM_PROGRAM_ADDRESS,
  parseTransferSolInstruction,
} from "gill/programs";

import {
  TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
  ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
  parseTransferInstruction,
  parseCreateAssociatedTokenIdempotentInstruction,
} from "gill/programs/token";

import {
  getProposalAccountCodec,
  getVaultTransactionCodec,
} from "~/program/multisig/codec";

import { SOL_MINT_ADDRESS } from "~/program/multisig/address";
import { getProposalPda, getTransactionPda } from "~/program/multisig/pda";

import { getRpcClient } from "~/lib/rpc";

type Message = {
  accountKeys: Address[];
  instructions: Array<{
    data: number[];
    programIdIndex: number;
    accountIndexes: number[];
  }>;
};

type ParsedVaultTransactionMessage = {
  amount: bigint;
  toAccount: Address;
  fromAccount: Address;
  mintAddress: Address;
};

export type ParsedVaultTransactionMessageWithCreator =
  ParsedVaultTransactionMessage & {
    creator: Address | null;
  };

function isTokenProgram(programAddress: Address) {
  return (
    programAddress === TOKEN_PROGRAM_ADDRESS ||
    programAddress === TOKEN_2022_PROGRAM_ADDRESS
  );
}

function isSystemProgram(programAddress: Address) {
  return programAddress === SYSTEM_PROGRAM_ADDRESS;
}

function isAssociatedTokenProgram(programAddress: Address) {
  return programAddress === ASSOCIATED_TOKEN_PROGRAM_ADDRESS;
}

function mapAccounts(indexes: number[], accountKeys: Address[]) {
  return indexes.map((index) => ({ address: accountKeys[index], role: 1 }));
}

export async function getProposalAccount(
  multisigAddress: Address,
  transactionIndex: number,
) {
  const { rpc } = getRpcClient();
  const proposalPda = await getProposalPda({
    multisigAddress,
    transactionIndex: BigInt(transactionIndex),
  });

  const proposalPdaInfo = await rpc
    .getAccountInfo(proposalPda, { encoding: "base64" })
    .send();

  if (!proposalPdaInfo.value) {
    return null;
  }

  const { data: proposalDataAccount } = parseBase64RpcAccount(
    proposalPda,
    proposalPdaInfo.value,
  );

  const proposal = getProposalAccountCodec().decode(proposalDataAccount);

  return proposal;
}

export async function getVaultTransaction({
  multisigAddress,
  transactionIndex,
}: {
  multisigAddress: Address;
  transactionIndex: bigint;
}) {
  const { rpc } = getRpcClient();
  const transactionPda = await getTransactionPda({
    multisigAddress,
    transactionIndex,
  });

  const transactionPdaInfo = await rpc
    .getAccountInfo(transactionPda, {
      encoding: "base64",
    })
    .send();

  const parsedTransaction = parseBase64RpcAccount(
    transactionPda,
    transactionPdaInfo.value,
  ) as EncodedAccount;

  if (!parsedTransaction?.data) {
    return null;
  }

  let vaultTransaction;

  try {
    vaultTransaction = getVaultTransactionCodec().decode(
      parsedTransaction?.data,
    );
    return vaultTransaction;
  } catch (e) {
    console.error("Decode vaultTransaction: ", transactionIndex, e);
    return null;
  }
}

export async function parseVaultTransactionMessage(
  message: Message,
): Promise<ParsedVaultTransactionMessage | null> {
  const { accountKeys = [], instructions = [] } = message || {};

  if (instructions.length === 0) {
    return null;
  }

  let result: ParsedVaultTransactionMessage | null = null;

  // Transfer (SOL/Token) Instruction
  if (instructions.length === 1) {
    const ixLegacy = instructions[0];
    const programAddress = accountKeys[ixLegacy.programIdIndex];

    const ix = {
      programAddress,
      data: new Uint8Array(ixLegacy.data),
      accounts: mapAccounts(ixLegacy.accountIndexes, accountKeys), // ANY role (to satisfy the type)
    };

    if (isSystemProgram(programAddress)) {
      try {
        const { accounts, data } = parseTransferSolInstruction(ix);

        result = {
          amount: data.amount,
          mintAddress: SOL_MINT_ADDRESS,
          fromAccount: accounts.source.address,
          toAccount: accounts.destination.address,
        };
      } catch (error) {
        console.error("Failed to parse Transfer SOL Instruction: ", error);
        return null;
      }
    }

    if (isTokenProgram(programAddress)) {
      try {
        const { accounts, data } = parseTransferInstruction(ix);

        result = {
          amount: data.amount,
          mintAddress: SOL_MINT_ADDRESS,
          fromAccount: accounts.source.address,
          toAccount: accounts.destination.address,
        };
      } catch (error) {
        console.error("Failed to parse Transfer Token Instruction: ", error);
        return null;
      }
    }
  }

  // List of 2 instructions might contain:
  // ['Create ATA Instruction', 'Transfer Token Instruction']
  if (instructions.length === 2) {
    const createATAIx = instructions[0]; // Create ATA
    const transferTokenIx = instructions[1]; // Transfer Token

    const programAddressCreateATA = accountKeys[createATAIx.programIdIndex];
    const programAddressTransferToken =
      accountKeys[transferTokenIx.programIdIndex];

    if (
      isAssociatedTokenProgram(programAddressCreateATA) &&
      isTokenProgram(programAddressTransferToken)
    ) {
      try {
        const decodedATI = parseCreateAssociatedTokenIdempotentInstruction({
          data: new Uint8Array(createATAIx.data),
          programAddress: programAddressCreateATA,
          accounts: mapAccounts(createATAIx.accountIndexes, accountKeys), // ANY role (to satisfy the type)
        });

        if (decodedATI) {
          const accountsATI = decodedATI?.accounts;

          const toAccount = accountsATI.owner.address;
          const mintAddress = accountsATI.mint.address;

          try {
            const { data } = parseTransferInstruction({
              data: new Uint8Array(transferTokenIx.data),
              programAddress: programAddressTransferToken,
              accounts: mapAccounts(
                transferTokenIx.accountIndexes,
                accountKeys,
              ), // ANY role (to satisfy the type)
            });

            result = {
              mintAddress,
              toAccount,
              amount: data.amount,
              fromAccount: decodedATI.accounts.payer.address,
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

export async function getParsedVaultTransactionMessage({
  multisigAddress,
  transactionIndex,
}: {
  multisigAddress: Address;
  transactionIndex: bigint;
}): Promise<ParsedVaultTransactionMessageWithCreator | null> {
  const vaultTransaction = await getVaultTransaction({
    multisigAddress,
    transactionIndex,
  });

  const parsedMessage = vaultTransaction?.message
    ? await parseVaultTransactionMessage(vaultTransaction.message)
    : null;

  if (!parsedMessage || !vaultTransaction?.creator) {
    return null;
  }

  return {
    ...(parsedMessage || {}),
    creator: vaultTransaction?.creator || null,
  };
}
