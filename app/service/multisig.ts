import { getBase64Codec, getU64Encoder, parseBase64RpcAccount } from "gill";

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

import {
  getProposalPda,
  getTransactionPda,
  getVaultPda,
} from "~/program/multisig/pda";

import { Wallet } from "~/model/wallet";
import { Address } from "~/model/web3js";
import { parseTransactionMessage } from "~/program/multisig/utils/parse-transaction";

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

export async function getTransactionAccount({
  multisigAddress,
  transactionIndex,
}: {
  multisigAddress: Address;
  transactionIndex: bigint;
}) {
  const transactionPda = await getTransactionPda({
    multisigAddress,
    transactionIndex,
  });

  const transactionPdaInfo = await rpc
    .getAccountInfo(transactionPda, { encoding: "base64" })
    .send();

  if (!transactionPdaInfo.value) {
    return null;
  }

  const { data: transactionDataAccount } = parseBase64RpcAccount(
    transactionPda,
    transactionPdaInfo.value,
  );

  return getVaultTransactionCodec().decode(transactionDataAccount);
}

export async function getTransaction({
  multisigAddress,
  transactionIndex,
}: {
  multisigAddress: Address;
  transactionIndex: number;
}) {
  const proposalAccount = await getProposalAccount({
    multisigAddress,
    transactionIndex: BigInt(transactionIndex),
  });

  if (!proposalAccount || proposalAccount.status.__kind === "Draft") {
    return null;
  }

  const transactionAccount = await getTransactionAccount({
    multisigAddress,
    transactionIndex: BigInt(transactionIndex),
  });

  const parsed = transactionAccount?.message
    ? await parseTransactionMessage(transactionAccount.message)
    : null;

  return {
    approved: proposalAccount.approved,
    transactionIndex,
    status: proposalAccount.status.__kind,
    timestamp: proposalAccount.status.timestamp,
    message: parsed,
  };
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

export async function getMultisigAccount(multisigAddress: Address) {
  if (!multisigAddress) {
    return null;
  }

  const multisigAccountInfo = await rpc
    .getAccountInfo(multisigAddress, { encoding: "base64" })
    .send();

  return getMultisigAccountCodec().decode(
    parseBase64RpcAccount(multisigAddress, multisigAccountInfo.value).data,
  );
}
