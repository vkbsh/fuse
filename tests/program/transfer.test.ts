import { LAMPORTS_PER_SOL } from "gill";
import { getAddMemoInstruction } from "gill/programs";
import { describe, test, expect, beforeAll } from "vitest";

import {
  createAndConfirmMessage,
  createTransferSolMessage,
  createTransferTokenMessage,
  sendAndConfirmProposalCancelMessage,
  sendAndConfirmProposalApproveMessage,
  sendAndConfirmExecuteAndCloseAccountsMessage,
  sendAndConfirmTransferWithProposalApproveMessage,
} from "~/program/multisig/message";

import {
  TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "gill/programs/token";

import {
  createLegacyVaultInstruction,
  createLegacyTransactionMessage,
} from "~/program/multisig/legacy";

import {
  createProposalCreateInstruction,
  createProposalRejectInstruction,
} from "~/program/multisig/instruction";

import {
  getProposalAccount,
  getParsedVaultTransactionMessage,
} from "~/program/multisig/utils/parseTransferTransaction";

import { type FromToken } from "~/program/multisig/message";
import { SOL_MINT_ADDRESS } from "~/program/multisig/address";

import {
  createMintAndMintTo,
  getTokenAccountBalance,
  getTestAccountsWithBalances,
} from "./utils";
import { getBalance } from "./getBalance";

const {
  creator,
  secondMember,
  thirdMember,
  vaultAddress,
  multisigAddress,
  recipientSolAddress,
  recipientTokenAddress,
  rentCollectorAddress,
} = await getTestAccountsWithBalances();
const amount = 1;
let transactionIndex = 0n;

describe("Interacting with Multisig Program", async () => {
  describe("Transfer SOL", async () => {
    beforeAll(async () => {
      transactionIndex = 1n;
    });

    test("Should verify account state before transaction execution", async () => {
      const vaultBalance = await getBalance(vaultAddress);

      expect(vaultBalance).equal(BigInt(LAMPORTS_PER_SOL * 2));
    });

    test("Create VaultTransaction with: [TransferSOL, ProposalCreate, ProposalApprove]", async () => {
      const transactionMessage = await createTransferSolMessage({
        // @ts-expect-error (expect signer)
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

    test("Should parse SOL Transfer transaction message", async () => {
      const parsedMessage = await getParsedVaultTransactionMessage({
        multisigAddress,
        transactionIndex,
      });

      const proposal = await getProposalAccount(
        multisigAddress,
        Number(transactionIndex),
      );

      expect(parsedMessage).not.toBeNull();
      expect(Number(parsedMessage?.amount)).equal(amount * LAMPORTS_PER_SOL);
      expect(parsedMessage?.toAccount).equal(recipientSolAddress);
      expect(parsedMessage?.fromAccount).equal(vaultAddress);
      expect(parsedMessage?.mintAddress).equal(SOL_MINT_ADDRESS);
      expect(parsedMessage?.creator).equal(creator.address);
      expect(proposal?.status.__kind).equal("Active");
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

    test("Should change proposal status to Approved", async () => {
      const proposal = await getProposalAccount(
        multisigAddress,
        Number(transactionIndex),
      );

      expect(proposal?.status.__kind).equal("Approved");
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

    test("After execution, proposal should be null", async () => {
      const proposal = await getProposalAccount(
        multisigAddress,
        Number(transactionIndex),
      );

      expect(proposal).toBeNull();
    });

    test("Should verify account state after transaction execution", async () => {
      const recipientBalance = await getBalance(recipientSolAddress);
      const vaultBalance = await getBalance(vaultAddress);

      expect(vaultBalance).equal(
        BigInt(LAMPORTS_PER_SOL * 2) - BigInt(amount * LAMPORTS_PER_SOL),
      );
      expect(recipientBalance).equal(BigInt(amount * LAMPORTS_PER_SOL));
    });
  });

  describe("Transfer Token", async () => {
    let fromToken: FromToken;

    beforeAll(async () => {
      transactionIndex = 2n;
      // Create Mint by Creator and mint to Vault
      fromToken = await createMintAndMintTo({
        payer: creator,
        recipient: vaultAddress,
        tokenProgramAddress: TOKEN_PROGRAM_ADDRESS,
      });
    });

    test("Should verify account state before transaction execution", async () => {
      const vaultBalance = await getTokenAccountBalance(
        fromToken.mint,
        vaultAddress,
        fromToken.programIdAddress,
      );

      expect(vaultBalance.amount).equal((10 ** fromToken.decimals).toString());
    });

    test("Create VaultTransaction with: [TransferToken, ProposalCreate, ProposalApprove]", async () => {
      const transactionMessage = await createTransferTokenMessage({
        fromToken,
        // @ts-expect-error (expect signer) (expect signer)
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

    test("Should parse Token Transfer transaction message", async () => {
      const parsedMessage = await getParsedVaultTransactionMessage({
        multisigAddress,
        transactionIndex,
      });

      const proposal = await getProposalAccount(
        multisigAddress,
        Number(transactionIndex),
      );

      expect(parsedMessage).not.toBeNull();
      expect(Number(parsedMessage?.amount)).equal(
        Math.round(amount * 10 ** fromToken.decimals),
      );
      expect(parsedMessage?.toAccount).equal(recipientTokenAddress);
      expect(parsedMessage?.fromAccount).equal(vaultAddress);
      expect(parsedMessage?.mintAddress).equal(fromToken.mint);
      expect(parsedMessage?.creator).equal(creator.address);
      expect(proposal?.status.__kind).equal("Active");
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

    test("Should change proposal status to Approved", async () => {
      const proposal = await getProposalAccount(
        multisigAddress,
        Number(transactionIndex),
      );

      expect(proposal?.status.__kind).equal("Approved");
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

    test("After execution, proposal should be null", async () => {
      const proposal = await getProposalAccount(
        multisigAddress,
        Number(transactionIndex),
      );

      expect(proposal).toBeNull();
    });

    test("Should verify account state after transaction execution", async () => {
      const recipientBalance = await getTokenAccountBalance(
        fromToken.mint,
        recipientTokenAddress,
        fromToken.programIdAddress,
      );
      const vaultBalance = await getTokenAccountBalance(
        fromToken.mint,
        vaultAddress,
        fromToken.programIdAddress,
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

  describe("Transfer Token 2022", async () => {
    let fromToken: FromToken;

    beforeAll(async () => {
      transactionIndex = 3n;
      // Create Mint by Creator and mint to Vault
      fromToken = await createMintAndMintTo({
        payer: creator,
        recipient: vaultAddress,
        tokenProgramAddress: TOKEN_2022_PROGRAM_ADDRESS,
      });
    });

    test("Should verify account state before transaction execution", async () => {
      const vaultBalance = await getTokenAccountBalance(
        fromToken.mint,
        vaultAddress,
        fromToken.programIdAddress,
      );

      expect(vaultBalance.amount).equal((10 ** fromToken.decimals).toString());
    });

    test("Create VaultTransaction with: [TransferToken, ProposalCreate, ProposalApprove]", async () => {
      const transactionMessage = await createTransferTokenMessage({
        fromToken,
        // @ts-expect-error (expect signer)
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

    test("Should parse Token 2022 Transfer transaction message", async () => {
      const parsedMessage = await getParsedVaultTransactionMessage({
        multisigAddress,
        transactionIndex,
      });

      const proposal = await getProposalAccount(
        multisigAddress,
        Number(transactionIndex),
      );

      expect(parsedMessage).not.toBeNull();
      expect(Number(parsedMessage?.amount)).equal(
        Math.round(amount * 10 ** fromToken.decimals),
      );
      expect(parsedMessage?.toAccount).equal(recipientTokenAddress);
      expect(parsedMessage?.fromAccount).equal(vaultAddress);
      expect(parsedMessage?.mintAddress).equal(fromToken.mint);
      expect(parsedMessage?.creator).equal(creator.address);
      expect(proposal?.status.__kind).equal("Active");
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

    test("Should change proposal status to Approved", async () => {
      const proposal = await getProposalAccount(
        multisigAddress,
        Number(transactionIndex),
      );

      expect(proposal?.status.__kind).equal("Approved");
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

    test("After execution, proposal should be null", async () => {
      const proposal = await getProposalAccount(
        multisigAddress,
        Number(transactionIndex),
      );

      expect(proposal).toBeNull();
    });

    test("Should verify account state after transaction execution", async () => {
      const recipientBalance = await getTokenAccountBalance(
        fromToken.mint,
        recipientTokenAddress,
        fromToken.programIdAddress,
      );
      const vaultBalance = await getTokenAccountBalance(
        fromToken.mint,
        vaultAddress,
        fromToken.programIdAddress,
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

  describe("Reject Transaction", async () => {
    beforeAll(async () => {
      transactionIndex = 4n;
    });

    test("Create VaultTransaction with: [SendMemo, ProposalCreate, ProposalReject]", async () => {
      const transactionMessage = await createLegacyTransactionMessage(
        // @ts-expect-error (expect signer)
        creator.address,
        [
          getAddMemoInstruction({
            memo: "Rejecte",
          }),
        ],
      );

      await createAndConfirmMessage({
        feePayer: creator,
        instructions: [
          createLegacyVaultInstruction({
            multisigAddress,
            transactionIndex,
            transactionMessage,
            creatorAddress: creator.address,
          }),
          await createProposalCreateInstruction({
            multisigAddress,
            transactionIndex,
            creatorAddress: creator.address,
          }),
        ],
      });
    });

    test("Reject Proposal by Creator", async () => {
      await createAndConfirmMessage({
        feePayer: creator,
        instructions: [
          await createProposalRejectInstruction({
            multisigAddress,
            transactionIndex,
            memo: "Rejected by Creator",
            memberAddress: creator.address,
          }),
        ],
      });
    });

    test("Reject Proposal by a Member", async () => {
      await createAndConfirmMessage({
        feePayer: secondMember,
        instructions: [
          await createProposalRejectInstruction({
            multisigAddress,
            transactionIndex,
            memo: "Rejected by a Member",
            memberAddress: secondMember.address,
          }),
        ],
      });
    });

    test("Should verify transaction status", async () => {
      const proposal = await getProposalAccount(
        multisigAddress,
        Number(transactionIndex),
      );

      expect(proposal?.status.__kind).equal("Rejected");
    });
  });

  describe("Cancel Transaction", async () => {
    beforeAll(async () => {
      transactionIndex = 5n;
    });

    test("Create VaultTransaction with: [SendMemo, ProposalCreate, ProposalCancel]", async () => {
      const transactionMessage = await createLegacyTransactionMessage(
        // @ts-expect-error (expect signer)
        creator.address,
        [
          getAddMemoInstruction({
            memo: "Cancel",
            signers: [creator],
          }),
        ],
      );

      await createAndConfirmMessage({
        feePayer: creator,
        instructions: [
          createLegacyVaultInstruction({
            multisigAddress,
            transactionIndex,
            transactionMessage,
            creatorAddress: creator.address,
          }),
          await createProposalCreateInstruction({
            multisigAddress,
            transactionIndex,
            creatorAddress: creator.address,
          }),
        ],
      });
    });

    test("Approve Proposal by Creator", async () => {
      try {
        await sendAndConfirmProposalApproveMessage({
          memo: "Approve by Creator",
          transactionIndex,
          feePayer: creator,
          memberAddress: creator.address,
          multisigAddress: multisigAddress,
        });
      } catch (e) {
        console.error("Error [Approve Proposal]: ", e);
      }
    });

    test("Approve Proposal by a Member", async () => {
      try {
        await sendAndConfirmProposalApproveMessage({
          memo: "Approve by a Member",
          transactionIndex,
          feePayer: secondMember,
          multisigAddress: multisigAddress,
          memberAddress: secondMember.address,
        });
      } catch (e) {
        console.error("Error [Approve Proposal]: ", e);
      }
    });

    test("Cancel Proposal by Creator", async () => {
      await sendAndConfirmProposalCancelMessage({
        memo: "Cancelled by Creator",
        transactionIndex,
        feePayer: creator,
        multisigAddress: multisigAddress,
        memberAddress: creator.address,
      });
    });

    test("Cancel Proposal by a Third Member", async () => {
      await sendAndConfirmProposalCancelMessage({
        memo: "Cancelled by a Third Member",
        transactionIndex,
        feePayer: thirdMember,
        multisigAddress: multisigAddress,
        memberAddress: thirdMember.address,
      });
    });

    test("Should verify transaction status", async () => {
      const proposal = await getProposalAccount(
        multisigAddress,
        Number(transactionIndex),
      );

      expect(proposal?.status.__kind).equal("Cancelled");
    });
  });
});
