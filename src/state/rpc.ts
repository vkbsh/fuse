import { create } from "zustand";
import { persist } from "zustand/middleware";

const RPC_URL_MAINNET = import.meta.env.VITE_RPC_URL_MAINNET;
const RPC_URL_TEST_VALIDATOR = "http://127.0.0.1:8899";

export const RPC_URL = import.meta.env.VITEST
  ? RPC_URL_TEST_VALIDATOR
  : RPC_URL_MAINNET;

type State = {
  RPC_URL: string;
};

type Actions = {
  setRpc: (urlOrMoniker: string) => void;
};

export const useRpcStore = create<State & Actions>()(
  persist(
    (set) => ({
      RPC_URL,
      setRpc: (url: string) =>
        set({
          RPC_URL: url,
        }),
    }),
    {
      version: 0.1,
      name: "fuse:rpc-store",
    },
  ),
);
