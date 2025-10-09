import { create } from "zustand";
import superjson from "superjson";
import { type Address } from "gill";
import { persist } from "zustand/middleware";

export type LSWallet = {
  name: string;
  icon: string;
  address: Address;
};

type Member = {
  key: Address;
  permissions: { mask: number };
};

export type WalletWithMembers = {
  address: Address;
  defaultVault: Address;
  account: {
    members: Member[];
  };
};

type WalletState = {
  walletHistory: LSWallet[];
  walletStorage: LSWallet | null;
  multisigList: WalletWithMembers[] | null;
  multisigStorage: WalletWithMembers | null;
};

type WithdrawActions = {
  reset: () => void;
  removeWalletStorage(name: string): void;
  addWalletStorage(wallet: LSWallet): void;
  updateHistory(wallets: LSWallet[]): void;
  selectWalletName(name: string): void;
  selectMultisig: (address: string) => void;
  addMultisig(multisigList: WalletWithMembers[]): void;
};

export const useWalletStore = create<WalletState & WithdrawActions>()(
  persist(
    (set) => ({
      multisigList: [],
      walletHistory: [],
      walletStorage: null,
      multisigStorage: null,
      reset: () => {
        set({
          multisigList: [],
          walletHistory: [],
          walletStorage: null,
          multisigStorage: null,
        });
      },
      addMultisig: (multisigList: WalletWithMembers[]) =>
        set(() => {
          if (!multisigList?.length) {
            return { multisigList: null };
          }

          const uniqueMultisigList = Array.from(
            new Map(
              multisigList.map((obj) => [superjson.stringify(obj), obj]),
            ).values(),
          );

          return {
            multisigList: uniqueMultisigList.map((multisig) => {
              return {
                address: multisig.address,
                defaultVault: multisig.defaultVault,
                account: {
                  members: multisig.account.members.map((member) => ({
                    key: member.key,
                    permissions: { mask: Number(member.permissions.mask) },
                  })),
                },
              };
            }),
          };
        }),

      addWalletStorage: (wallet: LSWallet) =>
        set((state) => {
          const walletHistory = [
            { name: wallet.name, icon: wallet.icon, address: wallet.address },
            ...(state.walletHistory?.filter((w) => w.name !== wallet.name) ||
              []),
          ];

          return {
            walletHistory,
          };
        }),
      removeWalletStorage: (name: string) =>
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
      updateHistory: (wallets: LSWallet[]) =>
        set(() => {
          return {
            walletHistory: wallets.filter(Boolean),
          };
        }),
      selectMultisig: (address: string) =>
        set((state) => {
          const multisigStorage = state?.multisigList?.find(
            (m) => m.address === address,
          );

          if (multisigStorage) {
            return {
              multisigStorage,
            };
          }

          return state;
        }),
      selectWalletName: (name: string) =>
        set((state) => ({
          walletStorage:
            state.walletHistory.find((w) => w.name === name) || null,
        })),
    }),
    {
      version: 0.1,
      name: "fuse:wallet-store",
    },
  ),
);
