import superjson from "superjson";
import { create } from "zustand";
import { Rpc, SolanaRpcApiMainnet } from "gill";
import { persist, PersistStorage } from "zustand/middleware";
import { UseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { Wallet } from "~/model/wallet";
import { Address } from "~/model/web3js";
import { useRpcStore } from "~/state/rpc";
import {
  getWalletByMemberKey,
  getActiveProposals,
} from "~/service/getWalletByMemberKey";

const STORAGE_KEY = "fuse:wallet-store";

export type CustomWallet = {
  name: string;
  icon: string;
  address: Address;
};

export type WalletData = {
  wallets: Wallet[];
};

export type ProposalAccountData = {
  transactions: Array<{
    message: {
      instructionType: string;
      fromAccount: Address;
      toAccount: Address;
      lamports: number;
    };
    approved: Address[];
    rejected: Address[];
    cancelled: Address[];
    transactionIndex: number;
    status: string;
    timestamp: number;
  }>;
};

const keys = {
  walletsByKey: (keyAddress: string) => ["walletsByKey", keyAddress] as const,
  transactions: (keyAddress: string) => ["transactions", keyAddress] as const,
};

export function walletsByKeyQuery({
  rpc,
  keyAddress,
}: {
  keyAddress: Address;
  rpc: Rpc<SolanaRpcApiMainnet>;
}) {
  return {
    queryKey: keys.walletsByKey(keyAddress),
    enabled: !!keyAddress,
    queryFn: async () => {
      return {
        wallets: await getWalletByMemberKey(rpc, keyAddress),
      };
    },
  } satisfies UseQueryOptions<WalletData>;
}

export function useSuspenseWalletByKey(
  keyAddress: Address,
): WalletData | { wallets: [] } {
  const { rpc } = useRpcStore();

  const { data } = useSuspenseQuery(walletsByKeyQuery({ keyAddress, rpc }));

  return data;
}

export function proposalByKeyQuery({
  rpc,
  keyAddress,
}: {
  keyAddress: Address;
  rpc: Rpc<SolanaRpcApiMainnet>;
}) {
  return {
    queryKey: keys.transactions(keyAddress),
    queryFn: async () => {
      return {
        transactions: await getActiveProposals(rpc, keyAddress),
      };
    },
  } satisfies UseQueryOptions<ProposalAccountData>;
}

export function useSuspenseProposalByKey(keyAddress: Address) {
  const { rpc } = useRpcStore();

  const { data } = useSuspenseQuery(proposalByKeyQuery({ keyAddress, rpc }));

  return data;
}

type WalletStore = {
  history: CustomWallet[] | null;
  multisigWallets: Wallet[] | null;
  currentWallet: CustomWallet | null;
  currentMultisigWallet: Wallet | null;
  removeWallet(): void;
  addWallet(wallet: CustomWallet): void;
  saveMultisigWallets(wallets: Wallet[]): void;
  selectMultisigWallet(walletAddress: Address): void;
};

const storage: PersistStorage<WalletStore> = {
  getItem: (name) => {
    const str = localStorage.getItem(name);

    if (!str) return null;

    return superjson.parse(str);
  },
  setItem: (name, value) => {
    localStorage.setItem(name, superjson.stringify(value));
  },
  removeItem: (name) => localStorage.removeItem(name),
};

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      history: [],
      multisigWallets: null,
      currentWallet: null,
      currentMultisigWallet: null,
      selectMultisigWallet: (address: Address) =>
        set((state) => {
          return {
            currentMultisigWallet:
              state.multisigWallets?.find((w) => w.address === address) || null,
          };
        }),
      saveMultisigWallets: (wallets: Wallet[]) =>
        set(() => {
          return {
            multisigWallets: wallets,
            currentMultisigWallet: wallets[0],
          };
        }),
      removeWallet: () =>
        set(() => {
          return {
            currentWallet: null,
            multisigWallets: null,
            currentMultisigWallet: null,
          };
        }),

      addWallet: (wallet: CustomWallet) =>
        set((state) => {
          return {
            currentWallet: wallet,
            history: [
              wallet,
              ...(state.history?.filter((w) => w.address !== wallet.address) ||
                []),
            ],
          };
        }),
    }),
    {
      storage,
      name: STORAGE_KEY,
    },
  ),
);
