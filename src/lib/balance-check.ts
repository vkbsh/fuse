import { type Address, lamports } from "gill";

import { getRpcClient } from "~/lib/rpc";

export async function checkIsMinWalletBalance(
  walletAddress: Address,
): Promise<boolean> {
  const { rpc } = getRpcClient();
  const balance = await rpc.getBalance(walletAddress).send();

  return balance.value > lamports(5000n);
}
