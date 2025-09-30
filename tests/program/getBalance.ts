import { createSolanaClient, type Address } from "gill";
import { useRpcStore } from "~/state/rpc";

export async function getBalance(address: Address) {
  const { RPC_URL } = useRpcStore.getState();
  const { rpc } = createSolanaClient({
    urlOrMoniker: RPC_URL,
  });
  const { value: balance } = await rpc.getBalance(address).send();

  return balance;
}
