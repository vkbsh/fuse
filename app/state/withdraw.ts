import { Address } from "gill";
import { create } from "zustand";

import { TokenData } from "~/hooks/resources";

type Keys = "toAddress" | "token" | "amount" | "memo";

type WithdrawState = {
  token: TokenData | null;
  memo: string | null;
  amount: number | null;
  toAddress: Address | null;
  errors: { [key: string]: string } | null;
  addError: (key: string, message: string) => void;
  removeError: (key: Keys) => void;
};

type WithdrawActions = {
  reset: () => void;
  set: <K extends keyof WithdrawState>(key: K, value: WithdrawState[K]) => void;
};

type WithdrawStore = WithdrawState & WithdrawActions;

export const useWithdrawStore = create<WithdrawStore>((set) => ({
  errors: null,
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
      errors: null,
    })),
  set: (key, value) => set(() => ({ [key]: value })),
  addError: (key: string, message: string) =>
    set((state) => {
      return { errors: { ...(state.errors || {}), [key]: message } };
    }),
  removeError: (type: string) =>
    set((state) => {
      const errors = state.errors || {};
      delete errors[type];

      return { errors };
    }),
}));
