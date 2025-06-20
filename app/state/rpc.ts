import { create } from "zustand";
import { createSolanaClient, SolanaClient } from "gill";

const isTestEnvironment = import.meta.env.VITEST;
export const RPC_URL_PROD =
  "https://mainnet.helius-rpc.com/?api-key=b79c2065-6c48-483c-a01f-ead4f4fe616d";
export const RPC_URL_TEST = "http://localhost:8899";
export const RPC_URL = isTestEnvironment ? RPC_URL_TEST : RPC_URL_PROD;

export const useRpcStore = create<SolanaClient>(() => {
  const client = createSolanaClient({
    urlOrMoniker: RPC_URL,
  });

  return client;
});

// const abortController = new AbortController();

// function onUserNavigateAway() {
//   abortController.abort();
// }

// const slot = await rpc.getSlot().send({ abortSignal: abortController.signal });
