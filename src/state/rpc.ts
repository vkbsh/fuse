import { create } from "zustand";
import { createSolanaClient, type SolanaClient } from "gill";

const RPC_URL_MAINNET =
  "https://mainnet.helius-rpc.com/?api-key=b79c2065-6c48-483c-a01f-ead4f4fe616d";
const RPC_URL_TEST_VALIDATOR = "http://127.0.0.1:8899";

export const RPC_URL = import.meta.env.VITEST
  ? RPC_URL_TEST_VALIDATOR
  : RPC_URL_MAINNET;

export const useRpcStore = create<SolanaClient>(() =>
  createSolanaClient({
    urlOrMoniker: RPC_URL,
  }),
);
