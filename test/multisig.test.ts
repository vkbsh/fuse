import { describe, test, expect, beforeAll } from "vitest";

import {
  address,
  Address,
  LAMPORTS_PER_SOL,
  createKeyPairFromBytes,
  createSignerFromKeyPair,
} from "gill";

import {
  createTransferSolMessage,
  createTransferTokenMessage,
  sendAndConfirmProposalApproveMessage,
  sendAndConfirmExecuteAndCloseAccountsMessage,
  sendAndConfirmTransferWithProposalApproveMessage,
} from "~/program/multisig/message";

import { getVaultPda } from "~/program/multisig/pda";

import {
  airdrop,
  getBalance,
  getMockToken,
  createMultisig,
  getMultisigPda,
  generateLegacyKeyPair,
  getTokenAccountBalance,
} from "./_setup";
import {
  getAssociatedTokenAccountAddress,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "gill/programs/token";

describe("Interacting with the Multisig Program", async () => {
  const creatorKeyPair = generateLegacyKeyPair();
  const createKeyKeyPair = generateLegacyKeyPair();
  const secondMemberKeyPair = generateLegacyKeyPair();
  const rentCollectorKeyPair = generateLegacyKeyPair();
  const toTokenKeyPair = generateLegacyKeyPair();
  const toSolKeyPair = generateLegacyKeyPair();

  const createKey = await createSignerFromKeyPair(
    await createKeyPairFromBytes(createKeyKeyPair.secretKey),
  );

  const creator = await createSignerFromKeyPair(
    await createKeyPairFromBytes(creatorKeyPair.secretKey),
  );
  const secondMember = await createSignerFromKeyPair(
    await createKeyPairFromBytes(secondMemberKeyPair.secretKey),
  );

  const rentCollector = await createSignerFromKeyPair(
    await createKeyPairFromBytes(rentCollectorKeyPair.secretKey),
  );

  const toToken = await createSignerFromKeyPair(
    await createKeyPairFromBytes(toTokenKeyPair.secretKey),
  );

  const toSol = await createSignerFromKeyPair(
    await createKeyPairFromBytes(toSolKeyPair.secretKey),
  );

  const toSolAddress = toSol.address;
  const toTokenAddress = toToken.address;

  const multisigPda = getMultisigPda(createKey.address);
  const multisigAddress = address(multisigPda.toBase58());
  const vaultPda = await getVaultPda({
    vaultIndex: 0,
    multisigAddress,
  });

  const amount = 0.07357;
  let transactionIndex = 1n;

  beforeAll(async () => {
    await Promise.all(
      [creator, createKey, secondMember, { address: vaultPda }].map(
        async ({ address }) => await airdrop(address),
      ),
    );

    await createMultisig({
      multisigPda,
      creator: createKeyKeyPair,
      createKey: createKeyKeyPair,
      rentCollector: rentCollector.address,
      members: [
        {
          key: creator.address,
          permissions: { mask: 7 },
        },
        {
          key: secondMember.address,
          permissions: { mask: 2 },
        },
      ],
    });
  });

  describe("Transfer SOL", async () => {
    test("Create VaultTransaction with: [TransferSOL, ProposalCreate, ProposalApprove]", async () => {
      const transactionMessage = await createTransferSolMessage({
        signer: creator,
        toAddress: toSolAddress,
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
        memberAddress: creator.address,
        multisigAddress: multisigAddress,
        rentCollectorAddress: rentCollector.address,
      });
    });

    test("Should verify account state after transaction execution", async () => {
      const balance = await getBalance(toSolAddress);

      expect(balance.value).equal(BigInt(amount * LAMPORTS_PER_SOL));
    });
  });

  describe("Transfer Token", async () => {
    let fromToken: { decimals: number; mint: Address; ata: Address };
    const transactionIndex = 2n;

    beforeAll(async () => {
      fromToken = await getMockToken({
        creator,
        vaultPda,
      });
    });

    test("Create VaultTransaction with: [TransferToken, ProposalCreate, ProposalApprove]", async () => {
      const transactionMessage = await createTransferTokenMessage({
        fromToken,
        signer: creator,
        toAddress: toTokenAddress,
        amount: Math.round(amount * 10 ** fromToken.decimals),
      });

      await sendAndConfirmTransferWithProposalApproveMessage({
        multisigAddress,
        transactionIndex,
        feePayer: creator,
        transactionMessage,
        memberAddress: creator.address,
        creatorAddress: creator.address,
        memo: "approve from test by creator",
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
      try {
        await sendAndConfirmExecuteAndCloseAccountsMessage({
          transactionIndex,
          feePayer: creator,
          memberAddress: creator.address,
          multisigAddress: multisigAddress,
          rentCollectorAddress: rentCollector.address,
        });
      } catch (e) {
        console.error("Error [Execute, Close Accounts]: ", e);
      }
    });

    test("Should verify account state after transaction execution", async () => {
      const ata = await getAssociatedTokenAccountAddress(
        fromToken.mint,
        toTokenAddress,
        TOKEN_2022_PROGRAM_ADDRESS,
      );

      const balance = await getTokenAccountBalance(ata);

      expect(balance.uiAmountString).equal(amount.toString());
    });
  });
});

// describe("Other Cases", async () => {
//   test("Should handle maximum approval count", async () => {});
//   test("Should fail when non-member tries to approve proposal", async () => {});
//   test("Should verify account state after transaction execution", async () => {});
//   test("Should not execute transaction before threshold is met", async () => {});
//   test("Should not execute transaction after it is cancelled", async () => {});
//   test("Should not execute transaction after it is rejected", async () => {});
// });
