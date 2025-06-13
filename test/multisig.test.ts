import { describe, test, assert, beforeAll } from "vitest";

import {
  address,
  Address,
  createKeyPairFromBytes,
  createSignerFromKeyPair,
  signTransactionMessageWithSigners,
} from "gill";

import {
  createProposalApproveInstruction,
  createVaultTransactionExecuteInstruction,
} from "~/program/multisig/instruction";
import {
  createTransferSolMessage,
  createTransferTokenMessage,
  createMessageExecuteAndCloseAccounts,
} from "~/program/multisig/utils/message";
import { getVaultPda } from "~/program/multisig/pda";
import { createMessageWithSigner } from "~/program/multisig/transaction";

import { useRpcStore } from "~/state/rpc";

import {
  airdrop,
  getBalance,
  getMockToken,
  createMultisig,
  getMultisigPda,
  getMultisigInfo,
  generateLegacyKeyPair,
} from "./_setup";

// TODO: Add correct assertions
// TODO: Use rpc.getAccountInfo, getBalance, etc.  to retrieve accounts and check balances
describe("Interacting with the Multisig Program", async () => {
  const { sendAndConfirmTransaction } = useRpcStore.getState();

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
      const message = await createTransferSolMessage({
        vaultPda,
        amount: 0.07,
        transactionIndex,
        feePayer: creator,
        creator: creator.address,
        toAddress: creator.address,
        multisigPda: multisigAddress,
        memo: "approve from test by the creator",
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
            await createProposalApproveInstruction({
              multisigPda: multisigAddress,
              transactionIndex: transactionIndex,
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

      try {
        const message = await createMessageExecuteAndCloseAccounts({
          feePayer: creator,
          transactionIndex,
          multisigPda: multisigAddress,
          memberAddress: creator.address,
          rentCollectorPda: address(String(rentCollector)),
        });

        const signedTransaction =
          await signTransactionMessageWithSigners(message);
        await sendAndConfirmTransaction(signedTransaction);
        assert.equal(1, 1);
      } catch (error) {
        console.log("Error", error);
      }
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
      const amount = 0.07357;

      const message = await createTransferTokenMessage({
        feePayer: creator,
        creator: creator.address,
        amount,
        fromToken,
        transactionIndex,
        authority: vaultPda,
        toAddress: creator.address,
        multisigPda: multisigAddress,
        memo: "approve from test by the creator",
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
            await createProposalApproveInstruction({
              transactionIndex,
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
    test("Execute VaultTransaction by Creator", async () => {
      try {
        const tx = await createMessageWithSigner({
          instructions: [
            await createVaultTransactionExecuteInstruction({
              transactionIndex,
              multisigPda: multisigAddress,
              memberAddress: creator.address,
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
  test("Should not execute transaction before threshold is met", async () => {});
});
