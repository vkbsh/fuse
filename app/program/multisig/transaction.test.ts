import * as multisig from "@sqds/multisig";

import { describe, test, assert } from "vitest";
import { address, getBase64EncodedWireTransaction } from "@solana/web3.js";

import {
  proposalCreate,
  proposalCancel,
  proposalReject,
  proposalApprove,
  createVaultTransaction,
  // vaultTransactionExecute,
} from "~/program/multisig/transaction";

const testAccount = {
  threshold: 2,
  transactionIndex: 8n,
  staleTransactionIndex: 7n,
  configAuthority: "11111111111111111111111111111111",
  address: "7QbxACoBK9dKE8Sz1WFerTyuYgzq7CnbNLSPM1h3Aqi2",
  createKey: "6G4XcoaUVB7qH4yyzdoDjwAiRyM5mXD6pusTZE2LXZ6M",
  defaultVault: "EE5NeWRxi4p5Zx68JFRTR9P5K6Hk5JBwErx3rX9ZgS8r",
  rentCollector: "6CTbpaBijCeDiK9cJDivHEimDQ9yq5EN411mmNLui9Rr",
};

const myPhantomAddress = "FUJoZ7doNKNUjvvYo5bswziKZi1BZm9myhF9k3QfHPu6";

describe("Multisig", () => {
  test("Create Vault Tx", async () => {
    const transaction = await createVaultTransaction({
      memo: "test",
      multisigPda: address(testAccount.address),
      fromAddress: address(myPhantomAddress),
      toAddress: address(testAccount.defaultVault),
      transactionIndex: testAccount.transactionIndex,
    });

    console.log("VaultTxBase64", getBase64EncodedWireTransaction(transaction));

    assert.equal(1, 1);
  });
  test("Create Proposal", async () => {
    const multisigPda = address(testAccount.address);
    const creator = address(myPhantomAddress);

    const proposalTx = await proposalCreate({
      creator,
      multisigPda,
      transactionIndex: testAccount.transactionIndex,
    });

    console.log(
      "ProposalCreateTxBase64",
      getBase64EncodedWireTransaction(proposalTx),
    );
    assert.equal(1, 1);
  });
  test("Approve Proposal", async () => {
    const multisigPda = address(testAccount.address);
    const memberAddress = address(myPhantomAddress);

    const proposalApproveTx = await proposalApprove({
      multisigPda,
      memberAddress,
      transactionIndex: testAccount.transactionIndex,
    });

    console.log(
      "ProposalApproveTxBase64",
      getBase64EncodedWireTransaction(proposalApproveTx),
    );

    assert.equal(1, 1);
  });
  test("Reject Proposal", async () => {
    const multisigPda = address(testAccount.address);
    const memberAddress = address(myPhantomAddress);

    const proposalRejectTx = await proposalReject({
      multisigPda,
      memberAddress,
      transactionIndex: testAccount.transactionIndex,
    });

    console.log(
      "ProposalRejectTxBase64",
      getBase64EncodedWireTransaction(proposalRejectTx),
    );

    assert.equal(1, 1);
  });
  test("Cancel Proposal", async () => {
    const multisigPda = address(testAccount.address);
    const memberAddress = address(myPhantomAddress);

    const proposalCancelTx = await proposalCancel({
      multisigPda,
      memberAddress,
      transactionIndex: testAccount.transactionIndex,
    });

    console.log(
      "ProposalCancelTxBase64",
      getBase64EncodedWireTransaction(proposalCancelTx),
    );

    assert.equal(1, 1);
  });
  test("Execute Vault Tx", async () => {
    multisig.instructions.vaultTransactionExecute;

    const memberAddress = address(myPhantomAddress);
    const multisigPda = address(testAccount.address);

    // const vaultTransactionExecuteTx = await vaultTransactionExecute({
    //   multisigPda,
    //   memberAddress,
    //   transactionIndex: testAccount.transactionIndex,
    // });

    // console.log(
    //   "VaultExecuteTxBase64",
    //   getBase64EncodedWireTransaction(vaultTransactionExecuteTx),
    // );

    assert.equal(1, 0);
  });
});
