import {
  Address,
  LAMPORTS_PER_SOL,
  parseBase64RpcAccount,
  TransactionSendingSigner,
} from "gill";

import {
  createProposalApproveInstruction,
  createProposalCreateInstruction,
  createVaultTransactionAccountsCloseInstruction,
  createVaultTransactionExecuteInstruction,
} from "~/program/multisig/instruction";

import {
  createMessageWithSigner,
  createTransferInnerMessage,
  createTransferTokenInnerMessage,
} from "~/program/multisig/transaction";

import { createVaultInstruction } from "~/program/multisig/legacy";
import {
  getProposalPda,
  getTransactionPda,
  getVaultPda,
} from "~/program/multisig/pda";
import { TransactionMessage } from "web3js1";
import { getVaultTransactionCodec } from "~/program/multisig/codec";

import { useRpcStore } from "~/state/rpc";

const { rpc } = useRpcStore.getState();

export async function createTransferSolMessage({
  amount,
  creator,
  toAddress,
  multisigPda,
  transactionIndex,
  feePayer,
  memo,
}: {
  amount: number;
  feePayer: TransactionSendingSigner;
  toAddress: Address;
  multisigPda: Address;
  transactionIndex: bigint;
  creator: Address;
  memo?: string;
}) {
  const vaultPda = await getVaultPda({
    vaultIndex: 0,
    multisigAddress: multisigPda,
  });
  const transferMessage = await createTransferInnerMessage({
    toAddress,
    payer: vaultPda,
    lamports: amount,
    fromAddress: vaultPda,
  });

  return createTransferMessageWithProposalApprove({
    memo,
    creator,
    feePayer,
    multisigPda,
    transferMessage,
    transactionIndex,
  });
}
export async function createTransferTokenMessage({
  creator,
  amount,
  authority,
  toAddress,
  fromToken,
  multisigPda,
  transactionIndex,
  feePayer,
  memo,
}: {
  amount: number;
  feePayer: TransactionSendingSigner;
  authority: Address;
  toAddress: Address;
  multisigPda: Address;
  transactionIndex: bigint;
  creator: Address;
  fromToken: { decimals: number; mint: Address; ata: Address };
  memo?: string;
}) {
  const transferMessage = await createTransferTokenInnerMessage({
    amount,
    fromToken,
    toAddress,
    authority,
  });

  return createTransferMessageWithProposalApprove({
    memo,
    creator,
    feePayer,
    multisigPda,
    transferMessage,
    transactionIndex,
  });
}

export async function createTransferMessageWithProposalApprove({
  creator,
  multisigPda,
  transferMessage,
  transactionIndex,
  feePayer,
  memo,
}: {
  feePayer: TransactionSendingSigner;
  multisigPda: Address;
  transactionIndex: bigint;
  transferMessage: TransactionMessage;
  creator: Address;
  memo?: string;
}) {
  const proposalPda = await getProposalPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });

  const txMessage = await createMessageWithSigner({
    feePayer: feePayer,
    instructions: [
      createVaultInstruction({
        multisigPda,
        vaultIndex: 0,
        transactionIndex,
        ephemeralSigners: 0,
        creator,
        transactionMessage: transferMessage,
      }),
      createProposalCreateInstruction({
        multisigPda,
        proposalPda,
        transactionIndex,
        creator,
      }),
      await createProposalApproveInstruction({
        memo,
        multisigPda,
        transactionIndex,
        memberAddress: creator,
      }),
    ],
  });

  return txMessage;
}

export async function createMessageExecuteAndCloseAccounts({
  feePayer,
  multisigPda,
  transactionIndex,
  rentCollectorPda,
  memberAddress,
}: {
  multisigPda: Address;
  memberAddress: Address;
  rentCollectorPda: Address;
  transactionIndex: bigint;
  feePayer: TransactionSendingSigner;
}) {
  const proposalPda = await getProposalPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });

  const transactionPda = await getTransactionPda({
    transactionIndex,
    multisigAddress: multisigPda,
  });

  const transactionPdaInfo = await rpc
    .getAccountInfo(transactionPda, { encoding: "base64" })
    .send();

  const vaultTransaction = getVaultTransactionCodec().decode(
    parseBase64RpcAccount(transactionPda, transactionPdaInfo.value).data,
  );

  const vaultPda = await getVaultPda({
    vaultIndex: 0,
    multisigAddress: multisigPda,
  });

  const txMessage = await createMessageWithSigner({
    feePayer,
    instructions: [
      createVaultTransactionExecuteInstruction({
        vaultPda,
        multisigPda,
        proposalPda,
        memberAddress,
        transactionPda,
        message: vaultTransaction.message,
        ephemeralSignerBumps: vaultTransaction.ephemeralSignerBumps,
      }),
      createVaultTransactionAccountsCloseInstruction({
        proposalPda,
        multisigPda,
        transactionPda,
        rentCollectorPda,
      }),
    ],
  });

  return txMessage;
}
