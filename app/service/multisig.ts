import {
  Address,
  getBase64Codec,
  EncodedAccount,
  AccountInfoBase,
  Base64EncodedBytes,
  Base58EncodedBytes,
  parseBase64RpcAccount,
  AccountInfoWithPubkey,
  AccountInfoWithBase64EncodedData,
} from "gill";

import {
  MultisigAccount,
  getMultisigAccountCodec,
  getProposalAccountCodec,
  getVaultTransactionCodec,
} from "~/program/multisig/codec";

import {
  SQUADS_PROGRAM_ID,
  MULTISIG_ACCOUNT_DISCRIMINATOR_BASE64,
  PROPOSAL_ACCOUNT_DISCRIMINATOR_BASE64,
} from "~/program/multisig/address";

import {
  getVaultPda,
  getProposalPda,
  getTransactionPda,
} from "~/program/multisig/pda";

import { parseTransactionMessage } from "~/program/multisig/utils/parse-transaction";

import { useRpcStore } from "~/state/rpc";

const { rpc } = useRpcStore.getState();

export type Wallet = {
  address: Address;
  defaultVault: Address;
  account: MultisigAccount;
};

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

// TODO: Get from model
type Transaction = {
  status: any;
  message: any;
  timestamp: number;
  creator: Address | null;
  approved: Address[];
  rejected: Address[];
  cancelled: Address[];
  transactionIndex: number;
};

type ProgramAccountInfo = AccountInfoWithPubkey<
  AccountInfoBase & AccountInfoWithBase64EncodedData
>;

export async function getTransactionsByMultisig(keyAddress: Address | null) {
  if (!keyAddress)
    throw new Error("Missing keyAddress in getTransactionsByMemberKey()");

  // Proposal Status has [Draft, Active, Rejected, Approved, Executing, Executed, Cancelled]

  try {
    const [...transactions] = await Promise.all([
      await getTransactionsByMultisigAndIndex(keyAddress, 1),
      await getTransactionsByMultisigAndIndex(keyAddress, 2),
      await getTransactionsByMultisigAndIndex(keyAddress, 3),
      await getTransactionsByMultisigAndIndex(keyAddress, 4),
      await getTransactionsByMultisigAndIndex(keyAddress, 5),
    ]);

    return transactions;
  } catch (e) {
    console.log("Can't give a transaction list", e);
  }
}

export async function getWalletByMemberKey(
  keyAddress: Address | null,
): Promise<Wallet[] | null> {
  if (!keyAddress)
    throw new Error("Missing keyAddress in getWalletByMemberKey()");

  // The key must be the one of the first 6 multisig members: Paymaster (optionally), up to 2 Active Keys, up to 3 Recovery Keys.
  const [...wallets] = await Promise.all([
    getWalletByKeyAndIndex(keyAddress, 0),
    getWalletByKeyAndIndex(keyAddress, 1),
    getWalletByKeyAndIndex(keyAddress, 2),
    getWalletByKeyAndIndex(keyAddress, 3),
    getWalletByKeyAndIndex(keyAddress, 4),
    getWalletByKeyAndIndex(keyAddress, 5),
  ]);

  return wallets.flat();
}

export async function getProposalAccount({
  multisigAddress,
  transactionIndex,
}: {
  multisigAddress: Address;
  transactionIndex: bigint;
}) {
  const proposalPda = await getProposalPda({
    multisigAddress,
    transactionIndex,
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

  return getProposalAccountCodec().decode(proposalDataAccount);
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
      const data = getMultisigAccountCodec().decode(
        parseBase64RpcAccount(wallet.pubkey, wallet.account).data,
      );

      return {
        defaultVault,
        account: data,
        address: wallet.pubkey,
      };
    }),
  );
}

async function getTransactionsByMultisigAndIndex(
  multisigAddress: Address,
  status: number,
): Promise<(Transaction | null)[] | null> {
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
          {
            memcmp: {
              offset: 48n, // Status
              encoding: "base64",
              bytes: getBase64Codec().decode(
                new Uint8Array([status]),
              ) as Base64EncodedBytes,
            },
          },
        ],
        encoding: "base64",
      })
      .send();
  } catch (e) {
    accounts = [];
    console.error(e);
  }

  return await Promise.all(
    accounts.map(async (tx) => {
      const { data } = parseBase64RpcAccount(tx.pubkey, tx.account);
      const { status, rejected, approved, cancelled, transactionIndex } =
        getProposalAccountCodec().decode(data);

      const transactionPda = await getTransactionPda({
        multisigAddress,
        transactionIndex: transactionIndex,
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

      let vaultTransaction;

      try {
        vaultTransaction = getVaultTransactionCodec().decode(
          parsedTransaction?.data,
        );
      } catch (e) {
        console.error("Decode vaultTransaction: ", transactionIndex, e);
        return null;
      }

      let parsedMessage;

      try {
        parsedMessage = vaultTransaction?.message
          ? await parseTransactionMessage(vaultTransaction.message)
          : null;
      } catch (e) {
        console.error(
          "Failed to parse vaultTransaction: ",
          transactionIndex,
          e,
        );
        return null;
      }

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
        transactionIndex: Number(transactionIndex),
        creator: vaultTransaction ? vaultTransaction.creator : null,
      };
    }),
  );
}
