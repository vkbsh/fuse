import { useQueries, useQuery } from "@tanstack/react-query";

import { Address } from "~/model/web3js";

import {
  getTransaction,
  getMultisigAccount,
  getWalletByMemberKey,
} from "~/service/multisig";

import { getBalance } from "~/service/balance";
import { fetchTokenMeta, fetchTokenPrice } from "~/service/token";

export type QueryKey =
  | "balance"
  | "tokenMeta"
  | "tokenPrice"
  | "transaction"
  | "multisigAccount"
  | "multisigWalletsByKey";

const queryKeys: { [key in QueryKey]: QueryKey } = {
  balance: "balance",
  tokenMeta: "tokenMeta",
  tokenPrice: "tokenPrice",
  transaction: "transaction",
  multisigAccount: "multisigAccount",
  multisigWalletsByKey: "multisigWalletsByKey",
};

export function useMultisigWallets(keyAddress: Address) {
  return useQuery({
    enabled: !!keyAddress,
    queryKey: [queryKeys.multisigWalletsByKey, keyAddress],
    meta: { persist: true },
    queryFn: async () => getWalletByMemberKey(keyAddress),
  });
}

export function useMultisigAccount(multisigAddress: Address) {
  return useQuery({
    enabled: !!multisigAddress,
    queryKey: [queryKeys.multisigAccount, multisigAddress],
    meta: { persist: true },
    queryFn: async () => getMultisigAccount(multisigAddress),
  });
}

export function useTransactions(multisigAddress: Address, queries: number[]) {
  return useQueries({
    queries: queries.map((transactionIndex) => ({
      enabled: transactionIndex != null,
      staleTime: 1000 * 60, // 1 min
      queryKey: [queryKeys.transaction, transactionIndex],
      meta: { persist: true },
      queryFn: async () =>
        getTransaction({
          multisigAddress,
          transactionIndex,
        }),
    })),
  });
}

export function useBalance(vaultAddress: Address) {
  return useQuery({
    enabled: !!vaultAddress,
    queryKey: [queryKeys.balance, vaultAddress],
    meta: { persist: true },
    queryFn: async () => getBalance(vaultAddress),
  });
}

export function useTokensPrice(tokens: Address[]) {
  return useQueries({
    queries: tokens.map((mint) => ({
      enabled: !!mint,
      queryKey: [queryKeys.tokenPrice, mint],
      meta: { persist: true },
      staleTime: 1000 * 10, // 10 sec
      queryFn: async () => ({
        mint,
        price: await fetchTokenPrice(mint),
      }),
    })),
  });
}

export function useTokensMeta(tokens: Address[]) {
  return useQueries({
    queries: tokens.map((mint) => ({
      enabled: !!mint,
      queryKey: [queryKeys.tokenMeta, mint],
      meta: { persist: true },
      staleTime: 1000 * 60 * 60 * 24 * 30, // 1 month
      queryFn: async () => fetchTokenMeta(mint),
    })),
  });
}
