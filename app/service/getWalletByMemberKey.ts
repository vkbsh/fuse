import {
  Rpc,
  getBase64Codec,
  SolanaRpcApiMainnet,
  parseBase64RpcAccount,
} from "gill";

import {
  getMultisigAccountCodec,
  getProposalAccountCodec,
  getVaultTransactionCodec,
} from "~/program/multisig/codec";

import {
  SQUADS_PROGRAM_ID,
  MULTISIG_ACCOUNT_DISCRIMINATOR_BASE64,
  PROPOSAL_ACCOUNT_DISCRIMINATOR_BASE64,
} from "~/program/multisig/address";

import { getTransactionPda, getVaultPda } from "~/program/multisig/pda";

import { Wallet } from "~/model/wallet";
import { Address } from "~/model/web3js";
import { parseTransactionMessage } from "~/utils/parse-transaction";

import { useRpcStore } from "~/state/rpc";

const { rpc } = useRpcStore.getState();

export async function getWalletByMemberKey(
  keyAddress: Address,
): Promise<Wallet[]> {
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

export async function getActiveProposals(keyAddress: Address): Promise<any[]> {
  const [...accounts] = await Promise.all([
    getProposalAccounts(keyAddress, 1), // (Active: 1) Ready to approve
    getProposalAccounts(keyAddress, 2), // (Rejected: 2)
    getProposalAccounts(keyAddress, 3), // (Approved: 3) Ready to execute
    getProposalAccounts(keyAddress, 4), // (Executed: 4)
    getProposalAccounts(keyAddress, 5), // (Calncelled: 4)
  ]);

  return accounts
    .flat()
    .sort((a, b) => Number(b?.transactionIndex) - Number(a?.transactionIndex));
}

export async function getProposalAccounts(
  keyAddress: Address,
  index: 1 | 2 | 3 | 4 | 5,
): Promise<any> {
  const proposals = await rpc
    .getProgramAccounts(SQUADS_PROGRAM_ID, {
      filters: [
        // discriminator
        {
          memcmp: {
            offset: 0n,
            encoding: "base64",
            bytes: PROPOSAL_ACCOUNT_DISCRIMINATOR_BASE64,
          },
        },
        //multisig
        {
          memcmp: {
            offset: 8n,
            encoding: "base58",
            bytes: keyAddress,
          },
        },
        // status
        {
          memcmp: {
            offset: 48n,
            encoding: "base64",
            bytes: getBase64Codec().decode(new Uint8Array([index])),
          },
        },
      ],
      encoding: "base64",
    })
    .send();

  const transactions = await Promise.all(
    proposals.map(async (proposal) => {
      const { data: proposalDataAccount } = parseBase64RpcAccount(
        proposal.pubkey,
        proposal.account,
      );

      const { status, rejected, approved, cancelled, transactionIndex } =
        getProposalAccountCodec().decode(proposalDataAccount);

      const transactionPda = await getTransactionPda({
        multisigAddress: keyAddress,
        transactionIndex: transactionIndex,
      });

      const transactionPdaInfo = await rpc
        .getAccountInfo(transactionPda, {
          encoding: "base64",
        })
        .send();

      const { data: vaultDataAccount } = parseBase64RpcAccount(
        transactionPda,
        transactionPdaInfo.value,
      );

      let parsedMessage = null;

      try {
        const { message } = getVaultTransactionCodec().decode(vaultDataAccount);

        if (message) {
          parsedMessage = await parseTransactionMessage(message);
        }
      } catch (error) {
        console.log("error", error);
      }

      if (!parsedMessage) {
        return null;
      }

      return {
        // TODO: add address of Tx creator
        approved,
        rejected,
        cancelled,
        transactionIndex,
        status: status.__kind,
        message: parsedMessage,
        timestamp: status?.timestamp,
      };
    }),
  );

  console.log("transactions", transactions.length);

  console.log(
    "transactions",
    transactions.map((t) => ({
      transactionIndex: Number(t?.transactionIndex),
    })),
  );

  return transactions.filter((data) => !!data);
}

async function getWalletByKeyAndIndex(
  keyAddress: Address,
  index: number,
): Promise<Wallet[]> {
  const offset = BigInt(132 + (32 + 1) * index);

  const wallets = await rpc
    .getProgramAccounts(SQUADS_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0n,
            bytes: MULTISIG_ACCOUNT_DISCRIMINATOR_BASE64,
            encoding: "base64",
          },
        },
        {
          memcmp: {
            offset,
            bytes: keyAddress,
            encoding: "base58",
          },
        },
      ],
      encoding: "base64",
    })
    .send();

  return await Promise.all(
    wallets.map(async (wallet) => {
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
