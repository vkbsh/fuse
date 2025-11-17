import { Decimal } from "decimal.js";
import { type Address, createNoopSigner } from "gill";
import { KaminoVault } from "@kamino-finance/klend-sdk";

import {
  type LegacyTransactionMessage,
  createLegacyTransactionMessage,
} from "~/program/multisig/legacy";
import { getRpcClient } from "~/lib/rpc";

export async function createKaminoWithdrawLegacyMessage({
  amount,
  vaultAddress,
  vaultUSDCAddress,
}: {
  amount: number;
  vaultAddress: Address;
  vaultUSDCAddress: Address;
}): Promise<LegacyTransactionMessage> {
  const { rpc } = getRpcClient();

  const vault = new KaminoVault(rpc, vaultUSDCAddress);

  const { withdrawIxs } = await vault.withdrawIxs(
    createNoopSigner(vaultAddress),
    new Decimal(amount), // MAX Amount
  );

  return createLegacyTransactionMessage(vaultAddress, withdrawIxs);
}
