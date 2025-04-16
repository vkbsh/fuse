import {
  Rpc,
  Address,
  getBase64Codec,
  parseBase64RpcAccount,
  SolanaRpcApiMainnet,
} from "@solana/web3.js";

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

export async function getWalletByMemberKey(
  rpc: Rpc<SolanaRpcApiMainnet>,
  keyAddress: Address,
): Promise<Wallet[]> {
  // The key must be the one of the first 6 multisig members: Paymaster (optionally), up to 2 Active Keys, up to 3 Recovery Keys.
  const [...wallets] = await Promise.all([
    getWalletByKeyAndIndex(rpc, keyAddress, 0),
    getWalletByKeyAndIndex(rpc, keyAddress, 1),
    getWalletByKeyAndIndex(rpc, keyAddress, 2),
    getWalletByKeyAndIndex(rpc, keyAddress, 3),
    getWalletByKeyAndIndex(rpc, keyAddress, 4),
    getWalletByKeyAndIndex(rpc, keyAddress, 5),
  ]);

  return wallets.flat();
}

export async function getActiveProposals(
  rpc: Rpc<SolanaRpcApiMainnet>,
  keyAddress: Address,
): Promise<any[]> {
  const [...accounts] = await Promise.all([
    getProposalAccounts(rpc, keyAddress, 1), // (Active: 1) Ready to approve
    getProposalAccounts(rpc, keyAddress, 2), // (Rejected: 2)
    getProposalAccounts(rpc, keyAddress, 3), // (Approved: 3) Ready to execute
    getProposalAccounts(rpc, keyAddress, 4), // (Executed: 4)
    getProposalAccounts(rpc, keyAddress, 5), // (Calncelled: 4)
  ]);

  return accounts.flat();
}

export async function getProposalAccounts(
  rpc: Rpc<SolanaRpcApiMainnet>,
  keyAddress: Address,
  index: 1 | 2 | 3 | 4 | 5,
): Promise<any> {
  const accounts = await rpc
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

  return Promise.all(
    accounts.map(async (proposal) => {
      const { data } = parseBase64RpcAccount(proposal.pubkey, proposal.account);
      const { status, rejected, approved, cancelled, transactionIndex } =
        getProposalAccountCodec().decode(data);

      const transactionPda = await getTransactionPda({
        multisigAddress: keyAddress,
        transactionIndex: transactionIndex,
      });

      const transactionPdaInfo = await rpc
        .getAccountInfo(transactionPda, {
          encoding: "base64",
        })
        .send();

      const vaultTransaction = getVaultTransactionCodec().decode(
        parseBase64RpcAccount(transactionPda, transactionPdaInfo.value).data,
      );

      return {
        message: {
          instructionType: 2,
          fromAccount: "null",
          toAccount: "null",
          lamports: 0,
        },
        approved,
        rejected,
        cancelled,
        transactionIndex,
        status: status.__kind,
        timestamp: status?.timestamp,
      };
    }),
  );
}

async function getWalletByKeyAndIndex(
  rpc: Rpc<SolanaRpcApiMainnet>,
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

      return {
        address: wallet.pubkey,
        defaultVault,
        account: getMultisigAccountCodec().decode(
          parseBase64RpcAccount(wallet.pubkey, wallet.account).data,
        ),
      };
    }),
  );
}
