import { create } from "zustand";
import { createSolanaClient, type SolanaClient } from "gill";

const RPC_URL_MAINNET = import.meta.env.VITE_RPC_URL_MAINNET;
const RPC_URL_TEST_VALIDATOR = "http://127.0.0.1:8899";

export const RPC_URL = import.meta.env.VITEST
  ? RPC_URL_TEST_VALIDATOR
  : RPC_URL_MAINNET;

export const useRpcStore = create<SolanaClient>(() => {
  try {
    return createSolanaClient({
      urlOrMoniker: RPC_URL,
    });
  } catch (e) {
    console.error(e);
    return {} as SolanaClient;
  }
});
