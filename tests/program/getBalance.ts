import { type Address } from "gill";
import { getRpcClient } from "~/lib/rpc";

export async function getBalance(address: Address) {
  const { rpc } = getRpcClient();
  const { value: balance } = await rpc.getBalance(address).send();

  return balance;
}
