import { create } from "zustand";
import superjson from "superjson";
import { persist, PersistStorage } from "zustand/middleware";

import { Wallet } from "~/model/wallet";
import { Address } from "~/model/web3js";
import { UiWalletAccount } from "@wallet-standard/react";

const STORAGE_KEY = "fuse:wallet-store";

export type LSWallet = {
  name: string;
  icon: string;
  address: Address;
};

type WalletStore = {
  history: LSWallet[];
  storageWallet: LSWallet | null;
  multisigWallets: Wallet[] | null;
  storageMultisigWallet: Wallet | null;
  storageAccount: UiWalletAccount | null;
  removeStorageWallet(name: string): void;
  selectStorageWallet(name: string): void;
  saveStorageWallet(wallet: LSWallet): void;
  updateHistory(wallets: (LSWallet | undefined)[]): void;
  saveStorageAccount(account: UiWalletAccount): void;
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
      storageWallet: null,
      storageMultisigWallet: null,
      storageAccount: null,
      saveStorageAccount: (account: UiWalletAccount) =>
        set(() => {
          return {
            storageAccount: account,
          };
        }),
      selectMultisigWallet: (address: Address) =>
        set((state) => {
          return {
            storageMultisigWallet:
              state.multisigWallets?.find((w) => w.address === address) || null,
          };
        }),
      saveMultisigWallets: (wallets: Wallet[]) =>
        set(() => {
          return {
            multisigWallets: wallets,
            storageMultisigWallet: wallets[0],
          };
        }),
      removeStorageWallet: (name: string) =>
        set((state) => {
          const newHistory =
            state.history?.filter((w) => w.name !== name) || [];

          if (state?.storageWallet?.name === name) {
            return {
              history: newHistory,
              storageWallet: newHistory[0] || null,
              storageMultisigWallet: newHistory.length
                ? state.storageMultisigWallet
                : null,
              multisigWallets: newHistory.length ? state.multisigWallets : null,
            };
          }

          return {
            history: newHistory,
          };
        }),

      saveStorageWallet: (wallet: LSWallet) =>
        set((state) => {
          const history = [
            wallet,
            ...(state.history?.filter((w) => w.name !== wallet.name) || []),
          ];

          return {
            history,
          };
        }),
      selectStorageWallet: (name: string) =>
        set((state) => {
          const wallet = state.history?.find((w) => w.name === name);

          return {
            storageWallet: wallet,
          };
        }),
      updateHistory: (wallets: LSWallet[]) =>
        set(() => {
          return {
            history: wallets,
          };
        }),
    }),
    {
      storage,
      name: STORAGE_KEY,
      partialize: (state) => {
        return {
          history: state.history,
          storageWallet: state.storageWallet,
          multisigWallets: state.multisigWallets,
          storageMultisigWallet: state.storageMultisigWallet,
        };
      },
    },
  ),
);
