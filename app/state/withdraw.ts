import { Address } from "gill";
import { create } from "zustand";

import { TokenData } from "~/hooks/resources";

type Keys = "toAddress" | "token" | "amount" | "memo";

type WithdrawState = {
  token: TokenData | null;
  memo: string | null;
  amount: number | null;
  toAddress: Address | string;
  errors: { [key: string]: string } | null;
};

type WithdrawActions = {
  reset: () => void;
  removeError: (key: Keys) => void;
  addError: (key: string, message: string) => void;
  set: <K extends keyof WithdrawState>(key: K, value: WithdrawState[K]) => void;
};

export const useWithdrawStore = create<WithdrawState & WithdrawActions>(
  (set) => ({
    errors: null,
    memo: null,
    token: null,
    amount: null,
    toAddress: "",
    reset: () =>
      set(() => ({
        amount: 0,
        memo: null,
        token: null,
        toAddress: "",
        errors: null,
        fromAddress: null,
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
  }),
);
