import superjson from "superjson";
import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";
import { UseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { Wallet } from "~/model/wallet";
import { Address } from "~/model/web3js";
import {
  getWalletByMemberKey,
  getActiveProposals,
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

export function useSuspenseWalletByKey(
  keyAddress: Address,
): WalletData | { wallets: [] } {
  const { data } = useSuspenseQuery(walletsByKeyQuery({ keyAddress }));

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
  } satisfies UseQueryOptions<ProposalAccountData>;
}

export function useSuspenseProposalByKey(keyAddress: Address) {
  const { data } = useSuspenseQuery(proposalByKeyQuery({ keyAddress }));

  return data;
}

type WalletStore = {
  history: LSWallet[] | null;
  multisigWallets: Wallet[] | null;
  currentWallet: LSWallet | null;
  currentMultisigWallet: Wallet | null;
  removeWallet(address: Address): void;
  addWallet(wallet: LSWallet): void;
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

// TODO: Show history only for related Multisig account
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
      removeWallet: (address: Address) =>
        set((state) => {
          const newHistory =
            state.history?.filter((w) => w.address !== address) || [];
          if (state?.currentWallet?.address === address) {
            return {
              currentWallet: null,
              history: newHistory,
            };
          }

          return {
            history: newHistory,
          };
        }),

      addWallet: (wallet: LSWallet) =>
        // TODO: make unique by wallet name

        set((state) => {
          const history = [
            wallet,
            ...(state.history
              ?.filter((w) => w.address !== wallet.address)
              ?.filter((w) => w.name !== wallet.name) || []),
          ];
          return {
            currentWallet: wallet,
            history,
            // history: [
            //   wallet,
            //     ...(state.history?.filter((w) => w.address !== wallet.address) ||
            //       []),
            // ],
          };
        }),
    }),
    {
      storage,
      name: STORAGE_KEY,
    },
  ),
);
