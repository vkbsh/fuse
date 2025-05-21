import { create } from "zustand";
import { Address } from "~/model/web3js";

export type Token = {
  name: string;
  symbol: string;
  amount: number;
  logoURI: string;
  decimals: number;
  ata: Address;
  mint: Address;
};

type WithdrawState = {
  memo: string | null;
  token: Token | null;
  amount: number | null;
  toAddress: Address | null;
};

type WithdrawActions = {
  reset: () => void;
  set: <K extends keyof WithdrawState>(key: K, value: WithdrawState[K]) => void;
};

type WithdrawStore = WithdrawState & WithdrawActions;

export const useWithdrawStore = create<WithdrawStore>((set) => ({
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
}));
