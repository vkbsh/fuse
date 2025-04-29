import { describe, test, assert, beforeEach } from "vitest";
import {
  LAMPORTS_PER_SOL,
  getBase58Encoder,
  createSolanaClient,
  parseBase64RpcAccount,
  createKeyPairFromBytes,
  createSignerFromKeyPair,
  getSignatureFromTransaction,
  signTransactionMessageWithSigners,
} from "gill";

import { Address } from "~/model/web3js";
import { getWalletByMemberKey } from "~/service/getWalletByMemberKey";

import {
  createMessageWithSigner,
  createTransferInnerMessage,
  createTransferTokenInnerMessage,
} from "./transaction";

import {
  createVaultInstruction,
  createProposalCreateInstruction,
  createProposalApproveInstruction,
  createVaultTransactionExecuteInstruction,
} from "./instruction";

import { RPC_URL } from "../../env";
import { getVaultTransactionCodec } from "./codec";
import { getProposalPda, getTransactionPda, getVaultPda } from "./pda";

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

describe("Transfer SOL", async () => {
  const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: RPC_URL,
  });

  const [wallet] = await getWalletByMemberKey(memberSigner1.address);
  const multisigAddress = wallet.address;
  const vaultAddress = wallet.defaultVault;
  const transactionIndex = wallet.account.transactionIndex;
  const nextTxIndex = 1n + BigInt(transactionIndex);
  const amount = 0.00007357;

  const proposalPda = await getProposalPda({
    multisigAddress,
    transactionIndex: nextTxIndex,
  });

  beforeEach(async () => {}, 120000);

  test("Create VaultTransaction with: [TransferSOL, ProposalCreate, ProposalApprove]", async () => {
    const transferMessage = await createTransferInnerMessage({
      payer: vaultAddress,
      toAddress: memberSigner1.address,
      fromAddress: vaultAddress,
      lamports: Math.round(amount * LAMPORTS_PER_SOL),
    });

    const tx = await createMessageWithSigner({
      instructions: [
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
          memo: "approve from test by the creator",
          memberAddress: memberSigner1.address,
          multisigPda: multisigAddress,
        }),
      ],
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
  test("Approve VaultTransaction by a Member", async () => {
    try {
      const tx = await createMessageWithSigner({
        instructions: [
          createProposalApproveInstruction({
            proposalPda,
            multisigPda: multisigAddress,
            memberAddress: memberSigner2.address,
            memo: "approve from test by a member",
          }),
        ],
        feePayer: memberSigner2,
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
  });
  test("Execute VaultTransaction by Creator", async () => {
    const wallets = await getWalletByMemberKey(memberSigner1.address);
    const transactionIndex = wallets[0].account.transactionIndex;

    const proposalPda = await getProposalPda({
      multisigAddress,
      transactionIndex,
    });

    const transactionPda = await getTransactionPda({
      multisigAddress,
      transactionIndex,
    });

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
            multisigPda: multisigAddress,
            proposalPda,
            memberAddress: memberSigner1.address,
            transactionPda,
            message: vaultTransaction.message,
            ephemeralSignerBumps: vaultTransaction.ephemeralSignerBumps,
          }),
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
  });
});

// describe("Transfer USDC", async () => {
//   const { rpc, sendAndConfirmTransaction } = createSolanaClient({
//     urlOrMoniker: RPC_URL,
//   });

//   const wallets = await getWalletByMemberKey(memberSigner1.address);
//   const multisigAddress = wallets[0].address;
//   const vaultAddress = wallets[0].defaultVault;
//   const transactionIndex = wallets[0].account.transactionIndex;
//   const nextTxIndex = 1n + BigInt(transactionIndex);
//   const amount = 0.00007357;

//   const proposalPda = await getProposalPda({
//     multisigAddress,
//     transactionIndex: nextTxIndex,
//   });

//   beforeEach(async () => {}, 120000);

//   test("Create VaultTransaction with: [TransferUSDC, ProposalCreate, ProposalApprove]", async () => {
//     const fromToken = {
//       decimals: 6,
//       mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as Address,
//       ata: "6iuS9UZsFcS8Z2xLuPkJAxzowYNJcJ8ZupQBZH8hjaAJ" as Address,
//     };

//     const transferMessage = await createTransferTokenInnerMessage({
//       fromToken,
//       toAddress: memberSigner1.address,
//       authority: vaultAddress,
//       amount: amount * 10 ** fromToken.decimals,
//     });

//     const tx = await createMessageWithSigner({
//       instructions: [
//         createVaultInstruction({
//           vaultIndex: 0,
//           ephemeralSigners: 0,
//           creator: memberSigner1.address,
//           multisigPda: multisigAddress,
//           transactionIndex: nextTxIndex,
//           transactionMessage: transferMessage,
//         }),
//         createProposalCreateInstruction({
//           creator: memberSigner1.address,
//           proposalPda: proposalPda,
//           multisigPda: multisigAddress,
//           transactionIndex: nextTxIndex,
//         }),
//         createProposalApproveInstruction({
//           proposalPda,
//           memo: "approve from test by the creator",
//           memberAddress: memberSigner1.address,
//           multisigPda: multisigAddress,
//         }),
//       ],
//       feePayer: memberSigner1,
//       // feePayer: vaultAddress,
//     });

//     try {
//       const signedTransaction = await signTransactionMessageWithSigners(tx);
//       const signature = getSignatureFromTransaction(signedTransaction);
//       console.log("Signature", signature);

//       await sendAndConfirmTransaction(signedTransaction);
//       console.log("Transaction confirmed!");
//       assert.equal(1, 1);
//     } catch (error) {
//       console.log("Error", error);
//     }
//   });

//   test("Approve VaultTransaction by a Member", async () => {
//     try {
//       const tx = await createMessageWithSigner({
//         instructions: [
//           createProposalApproveInstruction({
//             proposalPda,
//             multisigPda: multisigAddress,
//             memberAddress: memberSigner2.address,
//             memo: "approve from test by a member",
//           }),
//         ],
//         feePayer: memberSigner2,
//       });

//       const signedTransaction = await signTransactionMessageWithSigners(tx);
//       const signature = getSignatureFromTransaction(signedTransaction);
//       console.log("Signature", signature);

//       await sendAndConfirmTransaction(signedTransaction);
//       console.log("Transaction confirmed!");
//       assert.equal(1, 1);
//     } catch (error) {
//       console.log("Error", error);
//     }
//   });
//   test("Execute VaultTransaction by Creator", async () => {
//     const wallets = await getWalletByMemberKey(memberSigner1.address);
//     const transactionIndex = wallets[0].account.transactionIndex;

//     const proposalPda = await getProposalPda({
//       multisigAddress,
//       transactionIndex,
//     });

//     const transactionPda = await getTransactionPda({
//       multisigAddress,
//       transactionIndex,
//     });

//     const transactionPdaInfo = await rpc
//       .getAccountInfo(transactionPda, { encoding: "base64" })
//       .send();

//     const vaultTransaction = getVaultTransactionCodec().decode(
//       parseBase64RpcAccount(transactionPda, transactionPdaInfo.value).data,
//     );

//     const vaultPda = await getVaultPda({
//       vaultIndex: 0,
//       multisigAddress: multisigAddress,
//     });

//     try {
//       const tx = await createMessageWithSigner({
//         instructions: [
//           createVaultTransactionExecuteInstruction({
//             vaultPda,
//             multisigPda: multisigAddress,
//             proposalPda,
//             memberAddress: memberSigner1.address,
//             transactionPda,
//             message: vaultTransaction.message,
//             ephemeralSignerBumps: vaultTransaction.ephemeralSignerBumps,
//           }),
//         ],
//         feePayer: memberSigner1,
//       });

//       const signedTransaction = await signTransactionMessageWithSigners(tx);
//       const signature = getSignatureFromTransaction(signedTransaction);
//       console.log("Signature", signature);

//       await sendAndConfirmTransaction(signedTransaction);
//       console.log("Transaction confirmed!");
//       assert.equal(1, 1);
//     } catch (error) {
//       console.log("Error", error);
//     }
//   });
// });
