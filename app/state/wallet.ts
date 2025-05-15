import { create } from "zustand";
import superjson from "superjson";
import { persist, PersistStorage } from "zustand/middleware";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { Wallet } from "~/model/wallet";
import { Address } from "~/model/web3js";
import {
  getActiveProposals,
  getWalletByMemberKey,
} from "~/service/getWalletByMemberKey";

const STORAGE_KEY = "fuse:wallet-store";

export type LSWallet = {
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

export function walletsByKeyQuery({ keyAddress }: { keyAddress: Address }) {
  return {
    queryKey: keys.walletsByKey(keyAddress),
    enabled: !!keyAddress,
    queryFn: async () => {
      return {
        wallets: await getWalletByMemberKey(keyAddress),
      };
    },
  } satisfies UseQueryOptions<WalletData>;
}

export function useWalletByKey(
  keyAddress: Address,
): WalletData | { wallets: [] } {
  const { data } = useQuery(walletsByKeyQuery({ keyAddress }));

  return data;
}

export function proposalByKeyQuery({ keyAddress }: { keyAddress: Address }) {
  return {
    queryKey: keys.transactions(keyAddress),
    queryFn: async () => {
      return {
        transactions: await getActiveProposals(keyAddress),
      };
    },
  };
}

export function useSuspenseProposalByKey(keyAddress: Address) {
  const data = useQuery(proposalByKeyQuery({ keyAddress }));

  return data;
}

type WalletStore = {
  history: LSWallet[] | null;
  currentWallet: LSWallet | null;
  multisigWallets: Wallet[] | null;
  currentMultisigWallet: Wallet | null;
  removeWallet(name: string): void;
  selectWallet(name: string): void;
  saveWallet(wallet: LSWallet): void;
  updateHistory(wallets: LSWallet[]): void;
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
      removeWallet: (name: string) =>
        set((state) => {
          const newHistory =
            state.history?.filter((w) => w.name !== name) || [];

          if (state?.currentWallet?.name === name) {
            return {
              history: newHistory,
              currentWallet: newHistory[0] || null,
              currentMultisigWallet: newHistory.length
                ? state.currentMultisigWallet
                : null,
              multisigWallets: newHistory.length ? state.multisigWallets : null,
            };
          }

          return {
            history: newHistory,
          };
        }),

      saveWallet: (wallet: LSWallet) =>
        set((state) => {
          const history = [
            wallet,
            ...(state.history?.filter((w) => w.name !== wallet.name) || []),
          ];

          return {
            history,
          };
        }),
      selectWallet: (name: string) =>
        set((state) => {
          const wallet = state.history?.find((w) => w.name === name);

          return {
            currentWallet: wallet,
          };
        }),
      updateHistory: (wallets: LSWallet[]) =>
        set((state) => {
          return {
            history: wallets,
          };
        }),
    }),
    {
      storage,
      name: STORAGE_KEY,
    },
  ),
);
