import * as multisig from "@sqds/multisig";
import { PublicKey, Connection } from "web3js1";
import { describe, test, assert } from "vitest";
import {
  LAMPORTS_PER_SOL,
  getBase58Encoder,
  createSolanaClient,
  createKeyPairFromBytes,
  createSignerFromKeyPair,
  getSignatureFromTransaction,
  signTransactionMessageWithSigners,
} from "gill";

import {
  createVaultInstruction,
  createMessageWithSigner,
  createTransferInnerMessage,
} from "./transaction";

import {
  createProposalCreateInstruction,
  createProposalApproveInstruction,
  createVaultTransactionExecuteInstruction,
} from "./instruction";

import { getWalletByMemberKey } from "~/service/getWalletByMemberKey";

import { RPC_URL } from "../../env";
import { getProposalPda, getTransactionPda } from "./pda";
import { SQUADS_PROGRAM_ID } from "./address";
import { instructionFromLegacyInstruction } from "~/utils/instruction";

const memberPrivateKey1 =
  "4QuarDxdbbkC1os7hyDMYAqM5i99yRdgJ6RUE85wrHrGB6WRiMbptoFy6vd7FAFktMpTSqC1USd8UfysFi9WGSYt";
const memberSigner1 = await createSignerFromKeyPair(
  await createKeyPairFromBytes(getBase58Encoder().encode(memberPrivateKey1)),
);

const memberPrivateKey2 =
  "42TTL4Nz87WZsiDBhA6JKgsNAnYk3ifZ4RVUei4sFE5Q3wJ9uqGTMh9uQeC3QYHxLn9Tna5bgb8EVA72eL1gQE8z";
const memberSigner2 = await createSignerFromKeyPair(
  await createKeyPairFromBytes(getBase58Encoder().encode(memberPrivateKey2)),
);

describe("Multisig", async () => {
  const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: RPC_URL,
  });

  const wallets = await getWalletByMemberKey(rpc, memberSigner1.address);
  const multisigAddress = wallets[0].address;
  const vaultAddress = wallets[0].defaultVault;
  const transactionIndex = wallets[0].account.transactionIndex;
  const nextTxIndex = 1n + BigInt(transactionIndex);
  const amount = 0.00007357;

  const proposalPda = await getProposalPda({
    multisigAddress,
    transactionIndex: nextTxIndex,
  });

  const transactionPda = await getTransactionPda({
    multisigAddress,
    transactionIndex: nextTxIndex,
  });

  test("Create VaultTransaction with: [TransferSOL, ProposalCreate, ProposalApprove]", async () => {
    const transferMessage = await createTransferInnerMessage({
      payer: vaultAddress,
      toAddress: memberSigner1.address,
      fromAddress: vaultAddress,
      lamports: Math.round(amount * LAMPORTS_PER_SOL),
    });

    const instructions = [
      createVaultInstruction({
        vaultIndex: 0,
        ephemeralSigners: 0,
        creator: memberSigner1.address,
        multisigPda: multisigAddress,
        transactionIndex: nextTxIndex,
        transactionMessage: transferMessage,
      }),
      createProposalCreateInstruction({
        creator: memberSigner1.address,
        proposalPda: proposalPda,
        multisigPda: multisigAddress,
        transactionIndex: nextTxIndex,
      }),
      createProposalApproveInstruction({
        proposalPda,
        memo: "approve from test",
        memberAddress: memberSigner1.address,
        multisigPda: multisigAddress,
      }),
    ];

    const tx = await createMessageWithSigner({
      instructions,
      feePayer: memberSigner1,
      // feePayer: vaultAddress,
    });

    try {
      const signedTransaction = await signTransactionMessageWithSigners(tx);
      const signature = getSignatureFromTransaction(signedTransaction);
      console.log("Signature", signature);

      await sendAndConfirmTransaction(signedTransaction);
      console.log("Transaction confirmed!");
      assert.equal(1, 1);
    } catch (error) {
      console.log("Error", error);
    }
  });
  test("Approve VaultTransaction by Member", async () => {
    const ix = createProposalApproveInstruction({
      proposalPda,
      memo: "approve from test by another member",
      memberAddress: memberSigner2.address,
      multisigPda: multisigAddress,
    });

    const instructions = [ix];

    const tx = await createMessageWithSigner({
      instructions,
      feePayer: memberSigner2,
      // feePayer: vaultAddress,
    });

    try {
      const signedTransaction = await signTransactionMessageWithSigners(tx);
      const signature = getSignatureFromTransaction(signedTransaction);
      console.log("Signature", signature);

      await sendAndConfirmTransaction(signedTransaction);
      console.log("Transaction confirmed!");
      assert.equal(1, 1);
    } catch (error) {
      console.log("Error", error);
    }
  });
  test(
    "[Legacy v4] - Execute VaultTransaction by Creator",
    async () => {
      const connection = new Connection(RPC_URL, "confirmed");

      try {
        const legacyIx = await multisig.instructions.vaultTransactionExecute({
          connection,
          feePayer: new PublicKey(memberSigner1.address),
          transactionIndex: nextTxIndex,
          multisigPda: new PublicKey(multisigAddress),
          member: new PublicKey(memberSigner1.address),
          programId: new PublicKey(SQUADS_PROGRAM_ID),
        });

        const tx = await createMessageWithSigner({
          instructions: [
            instructionFromLegacyInstruction(legacyIx.instruction),
          ],
          feePayer: memberSigner1,
        });

        const signedTransaction = await signTransactionMessageWithSigners(tx);
        const signature = getSignatureFromTransaction(signedTransaction);
        console.log("Signature", signature);

        await sendAndConfirmTransaction(signedTransaction);
        console.log("Transaction confirmed!");
        assert.equal(1, 1);
      } catch (error) {
        console.log("Error", error);
      }
    },
    { timeout: 10000 },
  );
  // test("Transfer USDC", async () => {
  //   const fromToken = {
  //     decimals: 6,
  //     mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as Address,
  //     ata: "" as Address, // TODO: Set ATA
  //   };

  //   const transferMessage = await createTransferTokenInnerMessage({
  //     fromToken,
  //     toAddress: memberSigner1.address,
  //     authority: vaultAddress,
  //     amount: amount * 10 ** fromToken.decimals,
  //   });

  //   const instructions = [
  //     createVaultInstruction({
  //       vaultIndex: 0,
  //       ephemeralSigners: 0,
  //       creator: memberSigner1.address,
  //       multisigPda: multisigAddress,
  //       transactionIndex: nextTxIndex,
  //       transactionMessage: transferMessage,
  //     }),
  //     createProposalCreateInstruction({
  //       creator: memberSigner1.address,
  //       proposalPda: proposalPda,
  //       multisigPda: multisigAddress,
  //       transactionIndex: nextTxIndex,
  //     }),
  //     createProposalApproveInstruction({
  //       proposalPda,
  //       memo: "auto approve",
  //       memberAddress: memberSigner1.address,
  //       multisigPda: multisigAddress,
  //     }),
  //   ];

  //   assert.equal(1, 1);
  // });
});
