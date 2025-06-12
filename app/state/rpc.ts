import { create } from "zustand";
import {
  Rpc,
  SolanaRpcApi,
  RpcFromTransport,
  ModifiedClusterUrl,
  createSolanaClient,
  SolanaRpcApiFromTransport,
  RpcTransportFromClusterUrl,
  SendAndConfirmTransactionWithSignersFunction,
} from "gill";

const VITE_RPC_URL = import.meta.env.VITE_RPC_URL;
const IS_TEST_MODE = import.meta.env.MODE === "test";

type RpcState = {
  RPC_URL: string;
  rpc: RpcFromTransport<
    SolanaRpcApiFromTransport<RpcTransportFromClusterUrl<ModifiedClusterUrl>>,
    RpcTransportFromClusterUrl<ModifiedClusterUrl>
  >;
  setRpc: (rpc: Rpc<SolanaRpcApi>) => void;
  sendAndConfirmTransaction: SendAndConfirmTransactionWithSignersFunction;
};

export const useRpcStore = create<RpcState>((set) => {
  let RPC_URL = IS_TEST_MODE ? "http://localhost:8899" : VITE_RPC_URL;

  if (!RPC_URL) {
    console.warn("You might want to set VITE_RPC_URL in your .env file.");
    RPC_URL = "https://api.mainnet-beta.solana.com";
  }

  const { rpc, sendAndConfirmTransaction } = createSolanaClient({
    urlOrMoniker: RPC_URL,
  });

  return {
    rpc,
    RPC_URL,
    sendAndConfirmTransaction,
    setRpc: (rpc: Rpc<SolanaRpcApi>) => set({ rpc }),
  };
});

// const abortController = new AbortController();

// function onUserNavigateAway() {
//   abortController.abort();
// }

// const slot = await rpc.getSlot().send({ abortSignal: abortController.signal });
