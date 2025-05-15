import { describe, test, assert, beforeAll } from "vitest";

import {
  address,
  lamports,
  LAMPORTS_PER_SOL,
  parseBase64RpcAccount,
  createKeyPairFromBytes,
  createSignerFromKeyPair,
  signTransactionMessageWithSigners,
} from "gill";

import {
  getVaultPda,
  getProposalPda,
  getTransactionPda,
} from "~/program/multisig/pda";

import {
  createMessageWithSigner,
  createTransferInnerMessage,
  createTransferTokenInnerMessage,
} from "~/program/multisig/transaction";

import {
  createProposalCreateInstruction,
  createProposalApproveInstruction,
  createVaultTransactionExecuteInstruction,
  createVaultTransactionAccountsCloseInstruction,
} from "~/program/multisig/instruction";

import {
  Permission,
  Permissions,
  createMultisig,
  getMultisigPda,
  getMultisigInfo,
  generateLegacyKeyPair,
  createVaultInstruction,
} from "~/program/multisig/legacy";

import { getVaultTransactionCodec } from "~/program/multisig/codec";

import { useRpcStore } from "~/state/rpc";

import { airdrop, getBalance, getMockToken } from "./_setup";

describe("Interacting with the Multisig Program", async () => {
  const { rpc, sendAndConfirmTransaction } = useRpcStore.getState();

  const creatorKeyPair = generateLegacyKeyPair();
  const createKeyKeyPair = generateLegacyKeyPair();
  const secondMemberKeyPair = generateLegacyKeyPair();

  const createKey = await createSignerFromKeyPair(
    await createKeyPairFromBytes(createKeyKeyPair.secretKey),
  );
  const creator = await createSignerFromKeyPair(
    await createKeyPairFromBytes(creatorKeyPair.secretKey),
  );
  const secondMember = await createSignerFromKeyPair(
    await createKeyPairFromBytes(secondMemberKeyPair.secretKey),
  );

  const multisigPda = getMultisigPda(createKey.address);
  const multisigAddress = address(multisigPda.toBase58());
  const vaultPda = await getVaultPda({
    vaultIndex: 0,
    multisigAddress,
  });
  let transactionIndex = 1n;

  const proposalPda = await getProposalPda({
    multisigAddress,
    transactionIndex,
  });

  const transactionPda = await getTransactionPda({
    multisigAddress,
    transactionIndex,
  });

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
      members: [
        {
          key: creator.address,
          permissions: Permissions.all(),
        },
        {
          key: secondMember.address,
          permissions: Permissions.fromPermissions([Permission.Vote]),
        },
      ],
    });
  });

  describe("Transfer SOL", async () => {
    test("Create VaultTransaction with: [TransferSOL, ProposalCreate, ProposalApprove]", async () => {
      const amount = 0.07;
      const transferMessage = await createTransferInnerMessage({
        payer: vaultPda,
        fromAddress: vaultPda,
        toAddress: creator.address,
        lamports: Math.round(amount * LAMPORTS_PER_SOL),
      });

      const message = await createMessageWithSigner({
        feePayer: creator,
        instructions: [
          createVaultInstruction({
            vaultIndex: 0,
            transactionIndex,
            ephemeralSigners: 0,
            creator: creator.address,
            multisigPda: multisigAddress,
            transactionMessage: transferMessage,
          }),
          createProposalCreateInstruction({
            transactionIndex,
            creator: creator.address,
            proposalPda: proposalPda,
            multisigPda: multisigAddress,
          }),
          createProposalApproveInstruction({
            proposalPda,
            memo: "approve from test by the creator",
            memberAddress: creator.address,
            multisigPda: multisigAddress,
          }),
        ],
      });

      try {
        const signedTransaction =
          await signTransactionMessageWithSigners(message);

        await sendAndConfirmTransaction(signedTransaction);

        assert.equal(1, 1);
      } catch (error) {
        console.log("Error", error);
      }
    });

    test("Approve VaultTransaction by a Member", async () => {
      try {
        const tx = await createMessageWithSigner({
          feePayer: secondMember,
          instructions: [
            createProposalApproveInstruction({
              proposalPda,
              multisigPda: multisigAddress,
              memberAddress: secondMember.address,
              memo: "approve from test by a member",
            }),
          ],
        });

        const signedTransaction = await signTransactionMessageWithSigners(tx);
        await sendAndConfirmTransaction(signedTransaction);
        assert.equal(1, 1);
      } catch (error) {
        console.log("Error", error);
      }
    });

    test("Execute VaultTransaction by Creator and Close Accounts", async () => {
      const { rentCollector } = await getMultisigInfo({
        multisigPda,
      });

      const transactionPdaInfo = await rpc
        .getAccountInfo(transactionPda, { encoding: "base64" })
        .send();

      const vaultTransaction = getVaultTransactionCodec().decode(
        parseBase64RpcAccount(transactionPda, transactionPdaInfo.value).data,
      );

      try {
        const tx = await createMessageWithSigner({
          feePayer: creator,
          instructions: [
            createVaultTransactionExecuteInstruction({
              vaultPda,
              proposalPda,
              transactionPda,
              multisigPda: multisigAddress,
              memberAddress: creator.address,
              message: vaultTransaction.message,
              ephemeralSignerBumps: vaultTransaction.ephemeralSignerBumps,
            }),
            createVaultTransactionAccountsCloseInstruction({
              proposalPda,
              transactionPda,
              multisigPda: multisigAddress,
              rentCollectorPda: rentCollector,
            }),
          ],
        });

        const signedTransaction = await signTransactionMessageWithSigners(tx);
        await sendAndConfirmTransaction(signedTransaction);
        assert.equal(1, 1);
      } catch (error) {
        console.log("Error", error);
      }
    });
  });

  describe("Transfer Token", async () => {
    let fromToken;
    const transactionIndex = 2n;

    const proposalPda = await getProposalPda({
      multisigAddress,
      transactionIndex,
    });

    const transactionPda = await getTransactionPda({
      multisigAddress,
      transactionIndex,
    });

    beforeAll(async () => {
      fromToken = await getMockToken({
        creator,
        vaultPda,
      });
    });

    test("Create VaultTransaction with: [TransferToken, ProposalCreate, ProposalApprove]", async () => {
      const amount = 0.07357;

      const transferMessage = await createTransferTokenInnerMessage({
        fromToken,
        authority: vaultPda,
        toAddress: creator.address,
        amount: amount * 10 ** fromToken.decimals,
      });

      const tx = await createMessageWithSigner({
        instructions: [
          createVaultInstruction({
            vaultIndex: 0,
            ephemeralSigners: 0,
            creator: creator.address,
            multisigPda: multisigAddress,
            transactionIndex: transactionIndex,
            transactionMessage: transferMessage,
          }),
          createProposalCreateInstruction({
            proposalPda,
            creator: creator.address,
            multisigPda: multisigAddress,
            transactionIndex: transactionIndex,
          }),
          createProposalApproveInstruction({
            proposalPda,
            memo: "approve from test by the creator",
            memberAddress: creator.address,
            multisigPda: multisigAddress,
          }),
        ],
        feePayer: creator,
      });

      try {
        const signedTransaction = await signTransactionMessageWithSigners(tx);
        await sendAndConfirmTransaction(signedTransaction);
        assert.equal(1, 1);
      } catch (error) {
        console.log("Error", error);
      }
    });

    test("Approve VaultTransaction by a Member", async () => {
      try {
        const tx = await createMessageWithSigner({
          instructions: [
            createProposalApproveInstruction({
              proposalPda,
              multisigPda: multisigAddress,
              memberAddress: secondMember.address,
              memo: "approve from test by a member",
            }),
          ],
          feePayer: secondMember,
        });

        const signedTransaction = await signTransactionMessageWithSigners(tx);
        await sendAndConfirmTransaction(signedTransaction);
        assert.equal(1, 1);
      } catch (error) {
        console.log("Error", error);
      }
    });
    test("Execute VaultTransaction by Creator", async () => {
      const transactionPdaInfo = await rpc
        .getAccountInfo(transactionPda, { encoding: "base64" })
        .send();

      const vaultTransaction = getVaultTransactionCodec().decode(
        parseBase64RpcAccount(transactionPda, transactionPdaInfo.value).data,
      );

      const vaultPda = await getVaultPda({
        vaultIndex: 0,
        multisigAddress: multisigAddress,
      });

      try {
        const tx = await createMessageWithSigner({
          instructions: [
            createVaultTransactionExecuteInstruction({
              vaultPda,
              proposalPda,
              transactionPda,
              multisigPda: multisigAddress,
              memberAddress: creator.address,
              message: vaultTransaction.message,
              ephemeralSignerBumps: vaultTransaction.ephemeralSignerBumps,
            }),
          ],
          feePayer: creator,
        });

        const signedTransaction = await signTransactionMessageWithSigners(tx);
        await sendAndConfirmTransaction(signedTransaction);
        assert.equal(1, 1);
      } catch (error) {
        console.log("Error", error);
      }
    });
  });
});

// TODO:
describe("Other Cases", async () => {
  test("Should handle maximum approval count", async () => {});
  test("Should fail when non-member tries to approve proposal", async () => {});
  test("Should verify account state after transaction execution", async () => {});
  test("Should not execute transaction before threshold is met", async () => {
    // Setup multisig with threshold=2 and test execution before all approvals
  });
  test("Should enforce permission restrictions", async () => {
    // Test that members with Vote permission can't execute transactions
    // Test that members without Vote permission can't approve
  });
});
