import { describe, test, expect, beforeAll } from "vitest";

import { Address, LAMPORTS_PER_SOL } from "gill";

import {
  createTransferSolMessage,
  createTransferTokenMessage,
  sendAndConfirmProposalApproveMessage,
  sendAndConfirmExecuteAndCloseAccountsMessage,
  sendAndConfirmTransferWithProposalApproveMessage,
} from "~/program/multisig/message";

import {
  getBalance,
  createMintAndMintTo,
  getTokenAccountBalance,
  getTestAccountsWithBalances,
} from "./_setup";

const amount = 0.07357;
let transactionIndex = 1n;

describe("Interacting with the Multisig Program", async () => {
  const {
    creator,
    secondMember,
    vaultAddress,
    multisigAddress,
    recipientSolAddress,
    recipientTokenAddress,
    rentCollectorAddress,
  } = await getTestAccountsWithBalances();

  describe("Transfer SOL", async () => {
    test("Create VaultTransaction with: [TransferSOL, ProposalCreate, ProposalApprove]", async () => {
      const transactionMessage = await createTransferSolMessage({
        source: vaultAddress,
        toAddress: recipientSolAddress,
        amount: amount * LAMPORTS_PER_SOL,
      });

      await sendAndConfirmTransferWithProposalApproveMessage({
        multisigAddress,
        transactionIndex,
        feePayer: creator,
        transactionMessage,
        memberAddress: creator.address,
        creatorAddress: creator.address,
        memo: "approve from test by the creator",
      });
    });

    test("Approve proposal by a Member", async () => {
      await sendAndConfirmProposalApproveMessage({
        memo: "Approved by a Member",
        transactionIndex,
        feePayer: secondMember,
        multisigAddress: multisigAddress,
        memberAddress: secondMember.address,
      });
    });

    test("Execute VaultTransaction & Close Accounts", async () => {
      await sendAndConfirmExecuteAndCloseAccountsMessage({
        transactionIndex,
        feePayer: creator,
        rentCollectorAddress,
        memberAddress: creator.address,
        multisigAddress: multisigAddress,
      });
    });

    test("Should verify account state after transaction execution", async () => {
      const recipientBalance = await getBalance(recipientSolAddress);
      const vaultBalance = await getBalance(vaultAddress);

      expect(vaultBalance).equal(
        BigInt(LAMPORTS_PER_SOL) - BigInt(amount * LAMPORTS_PER_SOL),
      );
      expect(recipientBalance).equal(BigInt(amount * LAMPORTS_PER_SOL));
    });
  });

  describe("Transfer Token", async () => {
    let fromToken: { decimals: number; mint: Address; ata: Address };
    const transactionIndex = 2n;

    beforeAll(async () => {
      // Create Mint by Creator and mint to Vault
      fromToken = await createMintAndMintTo({
        payer: creator,
        recipient: vaultAddress,
      });
    });

    test("Create VaultTransaction with: [TransferToken, ProposalCreate, ProposalApprove]", async () => {
      const transactionMessage = await createTransferTokenMessage({
        fromToken,
        signer: vaultAddress,
        authorityAddress: vaultAddress,
        toAddress: recipientTokenAddress,
        amount: Math.round(amount * 10 ** fromToken.decimals),
      });

      try {
        await sendAndConfirmTransferWithProposalApproveMessage({
          multisigAddress,
          transactionIndex,
          feePayer: creator,
          transactionMessage,
          memberAddress: creator.address,
          creatorAddress: creator.address,
          memo: "approve from test by creator",
        });
      } catch (e) {
        console.error("Error [Transfer, Proposal, Approve]: ", e);
      }
    });

    test("Approve proposal by a Member", async () => {
      await sendAndConfirmProposalApproveMessage({
        memo: "Approved by a Member",
        transactionIndex,
        feePayer: secondMember,
        multisigAddress: multisigAddress,
        memberAddress: secondMember.address,
      });
    });

    test("Execute VaultTransaction & Close Accounts", async () => {
      try {
        await sendAndConfirmExecuteAndCloseAccountsMessage({
          transactionIndex,
          feePayer: creator,
          rentCollectorAddress,
          memberAddress: creator.address,
          multisigAddress: multisigAddress,
        });
      } catch (e) {
        console.error("Error [Execute, Close Accounts]: ", e);
      }
    });

    test("Should verify account state after transaction execution", async () => {
      const recipientBalance = await getTokenAccountBalance(
        fromToken.mint,
        recipientTokenAddress,
      );
      const vaultBalance = await getTokenAccountBalance(
        fromToken.mint,
        vaultAddress,
      );

      expect(vaultBalance.amount).equal(
        (
          10 ** fromToken.decimals -
          amount * 10 ** fromToken.decimals
        ).toString(),
      );
      expect(recipientBalance.uiAmountString).equal(amount.toString());
    });
  });
});
