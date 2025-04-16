import { create } from "zustand";
import { Address } from "~/model/web3js";

type WithdrawState = {
  amount: number | null;
  memo: string | null;
  toAddress: Address | null;
  token: {
    mint: Address;
    symbol: string;
  } | null;
};

type WithdrawActions = {
  set: <K extends keyof WithdrawState>(key: K, value: WithdrawState[K]) => void;
  reset: () => void;
};

type WithdrawStore = WithdrawState & WithdrawActions;

export const useWithdrawStore = create<WithdrawStore>((set) => ({
  amount: null,
  memo: null,
  toAddress: null,
  token: null,
  set: (key, value) => set(() => ({ [key]: value })),
  reset: () =>
    set(() => ({
      amount: 0,
      memo: null,
      toAddress: "" as Address,
      fromAddress: "" as Address,
      token: {
        mint: "" as Address,
        symbol: "",
      },
    })),
}));
