import { Address } from "gill";
import { create } from "zustand";

export type Token = {
  ata: Address;
  mint: Address;
  name: string;
  symbol: string;
  amount: number;
  logoURI: string;
  decimals: number;
};

type WithdrawState = {
  token: Token | null;
  memo: string | null;
  amount: number | null;
  toAddress: Address | null;
  errors: { type: string; message: string }[] | [];
};

type WithdrawActions = {
  reset: () => void;
  set: <K extends keyof WithdrawState>(key: K, value: WithdrawState[K]) => void;
};

type WithdrawStore = WithdrawState & WithdrawActions;

export const useWithdrawStore = create<WithdrawStore>((set) => ({
  errors: [],
  memo: null,
  token: null,
  amount: null,
  toAddress: null,
  reset: () =>
    set(() => ({
      amount: 0,
      memo: null,
      token: null,
      toAddress: null,
      fromAddress: null,
    })),
  set: (key, value) => set(() => ({ [key]: value })),
  addError: (type: string, message: string) =>
    set((state) => {
      return { errors: [...state.errors, { type, message }] };
    }),
  removeError: (type: string) =>
    set((state) => {
      const errors = state.errors || [];
      const newErrors = errors.filter((e) => e.type !== type);
      return { errors: newErrors };
    }),
}));
