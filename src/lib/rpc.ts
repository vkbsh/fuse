import { createSolanaClient } from "gill";

import { useRpcStore } from "~/state/rpc";

export function getRpcClient() {
  const { RPC_URL } = useRpcStore.getState();
  return createSolanaClient({ urlOrMoniker: RPC_URL });
}
