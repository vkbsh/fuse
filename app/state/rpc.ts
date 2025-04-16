import { create } from "zustand";
import {
  createSolanaRpc,
  mainnet,
  Rpc,
  SolanaRpcApiMainnet,
} from "@solana/web3.js";
import { RPC_URL } from "../env";

type RpcState = {
  rpc: Rpc<SolanaRpcApiMainnet>;
};

export const useRpcStore = create<RpcState>((set) => ({
  rpc: createSolanaRpc(mainnet(RPC_URL)),
  setRpc: (rpc: Rpc<SolanaRpcApiMainnet>) => set({ rpc }),
}));

// const abortController = new AbortController();

// function onUserNavigateAway() {
//   abortController.abort();
// }

// const slot = await rpc.getSlot().send({ abortSignal: abortController.signal });
