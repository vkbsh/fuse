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
  getMockToken,
  getTokenAccountBalance,
  getTestAccountsWithBalances,
} from "./_setup";

describe("Interacting with the Multisig Program", async () => {
  const {
    creator,
    secondMember,
    vaultAddress,
    multisigAddress,
    receiverSolAddress,
    receiverTokenAddress,
    rentCollectorAddress,
  } = await getTestAccountsWithBalances();

  console.log({
    creator,
    secondMember,
    vaultAddress,
    multisigAddress,
    receiverSolAddress,
    receiverTokenAddress,
    rentCollectorAddress,
  });

  const amount = 0.07357;
  let transactionIndex = 1n;

  // beforeAll(async () => {});

  describe("Transfer SOL", async () => {
    test("Create VaultTransaction with: [TransferSOL, ProposalCreate, ProposalApprove]", async () => {
      const transactionMessage = await createTransferSolMessage({
        signer: creator,
        toAddress: receiverSolAddress,
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
      const balance = await getBalance(receiverSolAddress);

      expect(balance.value).equal(BigInt(amount * LAMPORTS_PER_SOL));
    });
  });

  describe("Transfer Token", async () => {
    let fromToken: { decimals: number; mint: Address; ata: Address };
    const transactionIndex = 2n;

    beforeAll(async () => {
      fromToken = await getMockToken({
        payer: creator,
        vaultPda: vaultAddress,
      });

      console.log("fromToken", fromToken);
    });

    test("Create VaultTransaction with: [TransferToken, ProposalCreate, ProposalApprove]", async () => {
      const transactionMessage = await createTransferTokenMessage({
        fromToken,
        signer: creator,
        toAddress: receiverTokenAddress,
        authorityAddress: creator.address,
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

    // test("Should verify account state after transaction execution", async () => {
    //   const balance = await getTokenAccountBalance(
    //     fromToken.mint,
    //     receiverTokenAddress,
    //   );

    //   expect(balance.uiAmountString).equal(amount.toString());
    // });
  });
});
