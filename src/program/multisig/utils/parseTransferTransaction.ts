import {
  type Address,
  type Instruction,
  type EncodedAccount,
  parseBase64RpcAccount,
} from "gill";
import { DRIFT_PROGRAM_ID } from "@drift-labs/sdk";
import { KVAULT_PROGRAM_ID_MAINNET as KAMINO_PROGRAM_ID } from "~/program/kamino/address";
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
import { parseDriftWithdrawInstruction } from "~/program/drift/parseDriftWithdraw";

import { getRpcClient } from "~/lib/rpc";
import { parseKaminoWithdrawInstruction } from "~/program/kamino/parseKaminoWithdraw";

type Message = {
  accountKeys: Address[];
  instructions: Array<{
    data: number[];
    programIdIndex: number;
    accountIndexes: number[];
  }>;
};

type ParsedVaultTransactionMessage = {
  amount: bigint | number;
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

function isDriftProgram(programAddress: Address) {
  return programAddress === DRIFT_PROGRAM_ID;
}

function isKaminoProgram(programAddress: Address) {
  return programAddress === KAMINO_PROGRAM_ID;
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

  if (!instructions.length) {
    console.log("No instructions found");

    return null;
  }

  const instructionsFromLegacyInstructions = instructions.map((ix) => {
    const programAddress = accountKeys[ix.programIdIndex];

    return {
      programAddress,
      data: new Uint8Array(ix.data),
      accounts: mapAccounts(ix.accountIndexes, accountKeys), // ANY role (to satisfy the type)
    } satisfies Instruction;
  });

  const isSolanaWithdrawIx = instructionsFromLegacyInstructions.some((ix) =>
    isSystemProgram(ix.programAddress),
  );

  const isTokenWithdrawIx = instructionsFromLegacyInstructions.some((ix) =>
    isTokenProgram(ix.programAddress),
  );

  const isDriftWithdrawIx = instructionsFromLegacyInstructions.some((ix) =>
    isDriftProgram(ix.programAddress),
  );

  const isKaminoWithdrawIx = instructionsFromLegacyInstructions.some((ix) =>
    isKaminoProgram(ix.programAddress),
  );

  if (
    !isSolanaWithdrawIx &&
    !isTokenWithdrawIx &&
    !isDriftWithdrawIx &&
    !isKaminoWithdrawIx
  ) {
    console.error("Invalid instruction");

    return null;
  }

  if (isSolanaWithdrawIx) {
    const { accounts, data } = parseTransferSolInstruction(
      instructionsFromLegacyInstructions[0],
    );

    return {
      amount: data.amount,
      mintAddress: SOL_MINT_ADDRESS,
      fromAccount: accounts.source.address,
      toAccount: accounts.destination.address,
    };
  }

  if (isTokenWithdrawIx) {
    const tokenWithdrawIx = instructionsFromLegacyInstructions.find((ix) =>
      isTokenProgram(ix.programAddress),
    );

    const createATAIx = instructionsFromLegacyInstructions.find((ix) =>
      isAssociatedTokenProgram(ix.programAddress),
    );

    const { accounts } = createATAIx
      ? parseCreateAssociatedTokenIdempotentInstruction({
          accounts: createATAIx.accounts,
          data: new Uint8Array(createATAIx.data),
          programAddress: createATAIx.programAddress,
        })
      : {};

    const { data } = tokenWithdrawIx
      ? parseTransferInstruction(tokenWithdrawIx)
      : {};

    const toAccount = accounts?.owner?.address;
    const mintAddress = accounts?.mint?.address;
    const fromAccount = accounts?.payer?.address;

    if (!data?.amount || !toAccount || !mintAddress || !fromAccount) {
      console.error("Invalid TokenWithdraw instruction");

      return null;
    }

    return {
      toAccount,
      fromAccount,
      mintAddress,
      amount: data.amount,
    };
  }

  if (isDriftWithdrawIx) {
    const driftWithdrawIx = instructionsFromLegacyInstructions.find((ix) =>
      isDriftProgram(ix.programAddress),
    );

    const { data, accounts } = driftWithdrawIx
      ? parseDriftWithdrawInstruction(driftWithdrawIx)
      : {};

    console.log("Drift parsed accounts: ", accounts);

    const toAccount = accounts?.authority?.address;
    const fromAccount = accounts?.authority?.address;

    if (!data || !toAccount || !fromAccount) {
      console.error("Invalid DriftWithdraw instruction");
      return null;
    } else {
      return {
        toAccount,
        fromAccount,
        amount: data.amount,
        mintAddress: data.mint,
      };
    }
  }

  if (isKaminoWithdrawIx) {
    const kaminoWithdrawIx = instructionsFromLegacyInstructions.find((ix) =>
      isKaminoProgram(ix.programAddress),
    );

    const { data, accounts } = kaminoWithdrawIx
      ? parseKaminoWithdrawInstruction(kaminoWithdrawIx)
      : {};

    console.log("Kamino parsed accounts: ", accounts);

    const toAccount = accounts?.user?.address;
    const fromAccount = accounts?.user?.address;

    if (!data || !toAccount || !fromAccount) {
      console.error("Invalid KaminoWithdraw instruction");
      return null;
    } else {
      return {
        toAccount,
        fromAccount,
        amount: data.amount,
        mintAddress: data.mint,
      };
    }
  }

  return null;
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
