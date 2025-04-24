import { describe, test, assert } from "vitest";
import { address, getBase64EncodedWireTransaction } from "gill";

import {
  proposalCreate,
  proposalCancel,
  proposalReject,
  proposalApprove,
  createVaultTransaction,
  vaultTransactionExecute,
} from "~/program/multisig/transaction";

describe("Multisig", () => {
  test("Create Vault Tx", async () => {
    assert.equal(1, 1);
  });
  test("Create Proposal", async () => {
    assert.equal(1, 1);
  });
  test("Approve Proposal", async () => {
    assert.equal(1, 1);
  });
  test("Reject Proposal", async () => {
    assert.equal(1, 1);
  });
  test("Cancel Proposal", async () => {
    assert.equal(1, 1);
  });
  test("Execute Vault Tx", async () => {
    assert.equal(1, 0);
  });
});
