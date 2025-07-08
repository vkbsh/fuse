import {
  Address,
  AccountInfoBase,
  Base64EncodedBytes,
  Base58EncodedBytes,
  parseBase64RpcAccount,
  AccountInfoWithPubkey,
  AccountInfoWithBase64EncodedData,
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
  ParsedVaultTransactionMessageWithCreator,
} from "~/program/multisig/utils/parseTransferTransaction";

import { useRpcStore } from "~/state/rpc";

const { rpc } = useRpcStore.getState();

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
  status: any;
  message: ParsedVaultTransactionMessageWithCreator;
  timestamp: number;
  approved: Address[];
  rejected: Address[];
  cancelled: Address[];
  creator: Address | null;
  transactionIndex: number;
};

type ProgramAccountInfo = AccountInfoWithPubkey<
  AccountInfoBase & AccountInfoWithBase64EncodedData
>;

export async function getMultisigAccount(multisigAddress: Address) {
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
  multisigAddress: Address | null,
  staleTransactionIndex: number | null,
) {
  if (!multisigAddress)
    throw new Error("Missing multisigAddress in getTransactionsByMultisig()");

  try {
    const transactions = await getTransactionsByMultisigAndIndex(
      multisigAddress,
      staleTransactionIndex,
    );

    const result = transactions
      ?.filter(Boolean)
      .sort(
        (a, b) => Number(b?.transactionIndex) - Number(a?.transactionIndex),
      );

    return result;
  } catch (e) {
    console.log("Can't give a transaction list", e);
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
  const offset = BigInt(132 + (32 + 1) * index);

  const accounts: ProgramAccountInfo[] = await rpc
    .getProgramAccounts(SQUADS_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0n,
            encoding: "base64",
            bytes: MULTISIG_ACCOUNT_DISCRIMINATOR_BASE64 as Base64EncodedBytes,
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
      encoding: "base64",
    })
    .send();

  return await Promise.all(
    accounts.map(async (wallet) => {
      const defaultVault = await getVaultPda({
        vaultIndex: 0,
        multisigAddress: wallet.pubkey,
      });
      const account = getMultisigAccountCodec().decode(
        parseBase64RpcAccount(wallet.pubkey, wallet.account).data,
      );

      return {
        account,
        defaultVault,
        address: wallet.pubkey,
      };
    }),
  );
}

async function getTransactionsByMultisigAndIndex(
  multisigAddress: Address,
  staleTransactionIndex: number | null,
): Promise<(VaultTransaction | null)[] | null> {
  let accounts: ProgramAccountInfo[];

  try {
    accounts = await rpc
      .getProgramAccounts(SQUADS_PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 0n, // Discriminator
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
        encoding: "base64",
      })
      .send();
  } catch (e) {
    accounts = [];
    console.error("Failed to getProgramAccounts for Proposals: ", e);
  }

  return await Promise.all(
    accounts.map(async (tx) => {
      const { data } = parseBase64RpcAccount(tx.pubkey, tx.account);
      const { status, rejected, approved, cancelled, transactionIndex } =
        getProposalAccountCodec().decode(data);
      const isStale = Number(transactionIndex) <= (staleTransactionIndex || 0);
      const isDraft = status.__kind === "Draft";

      if (isStale || isDraft) {
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
