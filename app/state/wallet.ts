import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Address } from "~/model/web3js";
import { MultisigAccount } from "~/program/multisig/codec";

const STORAGE_KEY = "fuse:wallet-store";

export type LSWallet = {
  name: string;
  icon: string;
  address: Address;
};

export type WalletWithMembers = {
  address: Address;
  defaultVault: Address;
  account: {
    members: MultisigAccount["members"];
  };
};

type WalletStore = {
  walletHistory: LSWallet[];
  walletStorage: LSWallet | null;
  selectedWalletName: string | null;
  multisigStorage: WalletWithMembers | null;
  removewalletStorage(name: string): void;
  addwalletStorage(wallet: LSWallet): void;
  selectWalletName(name: string): void;
  updateHistory(wallets: (LSWallet | undefined)[]): void;
  addMultisig(wallet: WalletWithMembers): void;
};

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      walletHistory: [],
      walletStorage: null,
      selectedWalletName: null,
      multisigStorage: null,
      addMultisig: (wallet: WalletWithMembers) =>
        set(() => {
          if (!wallet) {
            return { multisigStorage: null };
          }

          return {
            multisigStorage: {
              address: wallet.address,
              defaultVault: wallet.defaultVault,
              account: {
                members: wallet.account.members,
              },
            },
          };
        }),
      removewalletStorage: (name: string) =>
        set((state) => {
          const newHistory =
            state.walletHistory?.filter((w) => w.name !== name) || [];

          if (state?.walletStorage?.name === name) {
            return {
              walletHistory: newHistory,
              walletStorage: newHistory[0] || null,
              multisigStorage: newHistory.length ? state.multisigStorage : null,
            };
          }

          return {
            walletHistory: newHistory,
          };
        }),
      addwalletStorage: (wallet: LSWallet) =>
        set((state) => {
          const walletHistory = [
            { name: wallet.name, icon: wallet.icon, address: wallet.address },
            ...state.walletHistory?.filter((w) => w.name !== wallet.name),
          ];

          return {
            walletHistory,
          };
        }),
      updateHistory: (wallets: LSWallet[]) =>
        set(() => {
          return {
            walletHistory: wallets.filter(Boolean),
          };
        }),
      selectWalletName: (name: string) =>
        set((state) => ({
          walletStorage:
            state.walletHistory.find((w) => w.name === name) || null,
        })),
    }),

    {
      version: 0.1,
      name: STORAGE_KEY,
    },
  ),
);
