import {
  type Address,
  type AccountInfoBase,
  type Base58EncodedBytes,
  type Base64EncodedBytes,
  type AccountInfoWithPubkey,
  type AccountInfoWithBase64EncodedData,
  parseBase64RpcAccount,
} from "gill";

import {
  getMultisigAccountCodec,
  getProposalAccountCodec,
} from "~/program/multisig/codec";

import {
  SQUADS_PROGRAM_ID,
  MULTISIG_ACCOUNT_DISCRIMINATOR_BASE64,
  PROPOSAL_ACCOUNT_DISCRIMINATOR_BASE64,
} from "~/program/multisig/address";

import { getVaultPda } from "~/program/multisig/pda";
import {
  getParsedVaultTransactionMessage,
  type ParsedVaultTransactionMessageWithCreator,
} from "~/program/multisig/utils/parseTransferTransaction";

import { getRpcClient } from "~/lib/rpc";

type Member = {
  key: Address;
  permissions: { mask: number };
};

type Wallet = {
  address: Address;
  defaultVault: Address;
  account: {
    members: Member[];
  };
};

export type VaultTransaction = {
  status:
    | "Active"
    | "Approved"
    | "Rejected"
    | "Cancelled"
    | "Executed"
    | "Executing";
  timestamp: number;
  approved: Address[];
  rejected: Address[];
  cancelled: Address[];
  creator: Address | null;
  transactionIndex: number;
  message: ParsedVaultTransactionMessageWithCreator;
};

type ProgramAccountInfo = AccountInfoWithPubkey<
  AccountInfoBase & AccountInfoWithBase64EncodedData
>;

export async function getMultisigAccount(multisigAddress: Address) {
  const { rpc } = getRpcClient();
  const multisigAccountInfo = await rpc
    .getAccountInfo(multisigAddress, { encoding: "base64" })
    .send();

  if (!multisigAccountInfo.value) {
    return null;
  }

  try {
    const parsed = getMultisigAccountCodec().decode(
      parseBase64RpcAccount(multisigAddress, multisigAccountInfo?.value)?.data,
    );

    return parsed;
  } catch (e) {
    console.error("Failed to decode multisig account: ", e);
  }
}

export async function getTransactionsByMultisig(
  multisigAddress: Address,
  staleTransactionIndex: number,
) {
  try {
    const transactions =
      await getTransactionsByMultisigAndIndex(multisigAddress);

    const result = (transactions || [])
      .filter((tx) => {
        if (!tx) return false;
        return tx.transactionIndex > staleTransactionIndex;
      })
      .sort(
        (a, b) => Number(b?.transactionIndex) - Number(a?.transactionIndex),
      );

    return result;
  } catch (e) {
    console.error("Can't give a transaction list", e);
  }
}

export async function getWalletByMemberKey(
  keyAddress: Address | null,
): Promise<Wallet[] | null> {
  if (!keyAddress)
    throw new Error("Missing keyAddress in getWalletByMemberKey()");

  const [...wallets] = await Promise.all([
    // The key must be the one of the first 6 multisig members: Paymaster (optionally), up to 2 Active Keys, up to 3 Recovery Keys.
    getWalletByKeyAndIndex(keyAddress, 0),
    getWalletByKeyAndIndex(keyAddress, 1),
    getWalletByKeyAndIndex(keyAddress, 2),
    getWalletByKeyAndIndex(keyAddress, 3),
    getWalletByKeyAndIndex(keyAddress, 4),
    getWalletByKeyAndIndex(keyAddress, 5),
  ]);

  return wallets.flat();
}

async function getWalletByKeyAndIndex(
  keyAddress: Address,
  index: number,
): Promise<Wallet[]> {
  const { rpc } = getRpcClient();
  const offset = BigInt(132 + (32 + 1) * index);
  let accounts: ProgramAccountInfo[] = [];

  try {
    accounts = await rpc
      .getProgramAccounts(SQUADS_PROGRAM_ID, {
        encoding: "base64",
        filters: [
          {
            memcmp: {
              offset: 0n,
              encoding: "base64",
              bytes:
                MULTISIG_ACCOUNT_DISCRIMINATOR_BASE64 as Base64EncodedBytes,
            },
          },
          {
            memcmp: {
              offset,
              encoding: "base58",
              bytes: keyAddress as unknown as Base58EncodedBytes,
            },
          },
        ],
      })
      .send();
  } catch (e) {
    console.error("Failed to getProgramAccounts for Multisig: ", e);
    throw new Error("Failed to fetch multisig wallets");
  }

  return await Promise.all(
    accounts.map(async (multisig: ProgramAccountInfo) => {
      const defaultVault = await getVaultPda({
        vaultIndex: 0,
        multisigAddress: multisig.pubkey,
      });
      const account = getMultisigAccountCodec().decode(
        parseBase64RpcAccount(multisig.pubkey, multisig.account).data,
      );

      return {
        account,
        defaultVault,
        address: multisig.pubkey,
      };
    }),
  );
}

async function getTransactionsByMultisigAndIndex(
  multisigAddress: Address,
): Promise<(VaultTransaction | null)[] | null> {
  const { rpc } = getRpcClient();
  let accounts: ProgramAccountInfo[] = [];

  try {
    accounts = await rpc
      .getProgramAccounts(SQUADS_PROGRAM_ID, {
        encoding: "base64",
        filters: [
          {
            memcmp: {
              offset: 0n,
              encoding: "base64",
              bytes:
                PROPOSAL_ACCOUNT_DISCRIMINATOR_BASE64 as Base64EncodedBytes,
            },
          },
          {
            memcmp: {
              offset: 8n, // Multisig Address
              encoding: "base58",
              bytes: multisigAddress as unknown as Base58EncodedBytes,
            },
          },
        ],
      })
      .send();
  } catch (e) {
    console.error("Failed to getProgramAccounts for Proposals: ", e);
    throw new Error("Failed to fetch proposals");
  }

  return await Promise.all(
    accounts.map(async (tx) => {
      const { data } = parseBase64RpcAccount(tx.pubkey, tx.account);
      const { status, rejected, approved, cancelled, transactionIndex } =
        getProposalAccountCodec().decode(data);

      const isDraft = status.__kind === "Draft";

      if (isDraft) {
        return null;
      }

      const parsedMessage = await getParsedVaultTransactionMessage({
        multisigAddress,
        transactionIndex,
      });

      if (!parsedMessage) {
        return null;
      }

      return {
        approved,
        rejected,
        cancelled,
        status: status.__kind,
        message: parsedMessage,
        timestamp: Number(status.timestamp),
        creator: parsedMessage.creator || null,
        transactionIndex: Number(transactionIndex),
      };
    }),
  );
}
