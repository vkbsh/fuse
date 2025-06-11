import { address } from "gill";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMultisigAccount,
  getWalletByMemberKey,
  getTransactionsByMultisig,
} from "~/service/multisig";

import { getBalance } from "~/service/balance";
import { fetchTokenMeta, fetchTokenPrice } from "~/service/token";

import { Address } from "~/model/web3js";
import { getAmount } from "~/utils/amount";

export type QueryKey =
  | "balance"
  | "tokenMeta"
  | "tokenPrice"
  | "transaction"
  | "multisigAccount"
  | "multisigWalletsByKey";

export const queryKeys: { [key in QueryKey]: QueryKey } = {
  balance: "balance",
  tokenMeta: "tokenMeta",
  tokenPrice: "tokenPrice",
  transaction: "transaction",
  multisigAccount: "multisigAccount",
  multisigWalletsByKey: "multisigWalletsByKey",
};

const staleTimeByQueryKey: { [key in QueryKey]: number } = {
  balance: 1000 * 20, // 20 sec
  tokenMeta: 1000 * 60 * 60 * 24 * 30, // 1 month
  tokenPrice: 1000 * 20, // 20 sec
  transaction: 0, // 1 min
  multisigAccount: 1000 * 60, // 1 min
  multisigWalletsByKey: 1000 * 60, // 1 min
};

export function useMultisigWallets(keyAddress: Address | null) {
  return useQuery({
    enabled: !!keyAddress,
    queryKey: [queryKeys.multisigWalletsByKey, keyAddress],
    staleTime: staleTimeByQueryKey.multisigWalletsByKey,
    queryFn: async () => getWalletByMemberKey(keyAddress),
  });
}

export function useMultisigAccount(multisigAddress: Address) {
  return useQuery({
    enabled: !!multisigAddress,
    queryKey: [queryKeys.multisigAccount, multisigAddress],
    staleTime: staleTimeByQueryKey.multisigAccount,
    queryFn: async () => getMultisigAccount(multisigAddress),
  });
}

export function useTransactions(multisigAddress: Address) {
  return useQuery({
    enabled: !!multisigAddress,
    queryKey: [queryKeys.transaction, multisigAddress],
    staleTime: Infinity,
    queryFn: async () => {
      console.log("Fetching transactions");
      return getTransactionsByMultisig(multisigAddress);
    },
  });
}

export function refetchTransactions(multisigAddress: Address) {
  const queryClient = useQueryClient();
  console.log("Refetching transactions");

  return async () => {
    console.log("Refetching inside");
    return queryClient.refetchQueries({
      queryKey: [queryKeys.transaction, multisigAddress],
    });
  };
}

export function useBalance(vaultAddress: Address) {
  return useQuery({
    enabled: !!vaultAddress,
    staleTime: staleTimeByQueryKey.balance,
    queryKey: [queryKeys.balance, vaultAddress],
    refetchInterval: staleTimeByQueryKey.balance,
    queryFn: async () => getBalance(vaultAddress),
  });
}

export function useTokenPrice(mint: Address) {
  return useQuery({
    enabled: !!mint,
    queryKey: [queryKeys.tokenPrice, mint],
    staleTime: staleTimeByQueryKey.tokenPrice,
    queryFn: async () => {
      const tokenPrice = await fetchTokenPrice(mint);

      return tokenPrice;
    },
  });
}

export function useTokensPrice(tokens: Address[]) {
  return useQueries({
    queries: tokens.map((mint) => ({
      enabled: !!mint,
      queryKey: [queryKeys.tokenPrice, mint],
      staleTime: staleTimeByQueryKey.tokenPrice,
      refetchInterval: staleTimeByQueryKey.tokenPrice,
      queryFn: async () => await fetchTokenPrice(mint),
    })),
  });
}

export function useTokensMeta(tokens: Address[]) {
  return useQueries({
    queries: tokens.map((mint) => ({
      enabled: !!mint,
      queryKey: [queryKeys.tokenMeta, mint],
      staleTime: staleTimeByQueryKey.tokenMeta,
      queryFn: async () => fetchTokenMeta(mint),
    })),
  });
}

export const useTokenInfo = (vaultAddress: Address) => {
  const { data: balanceData } = useBalance(vaultAddress);

  const tokens = Object.values(balanceData?.spl || {})
    .filter((token) => token && token.amount > 0)
    .map((token) => {
      return {
        ata: token?.address,
        amount: token?.amount,
        mint: address(token?.mint as string),
      };
    });

  tokens;

  const meta = useTokensMeta(tokens.map((t) => t.mint));
  const price = useTokensPrice(tokens.map((t) => t.mint));

  const isLoading =
    meta.some((m) => m.isLoading) || price.some((p) => p.isLoading);
  const isError = meta.some((m) => m.isError) || price.some((p) => p.isError);
  const isAllFetched = meta.every((m) => m.data) && price.every((p) => p.data);

  const data = meta.map((m, i) => {
    return {
      ...m.data,
      isAllFetched,
      ata: tokens[i].ata,
      mint: tokens[i].mint,
      amount: getAmount({
        decimals: m.data?.decimals,
        amount: tokens[i].amount ? Number(tokens[i].amount) : 0,
      }),
      usdAmount: getAmount({
        price: price[i].data || 0,
        decimals: m.data?.decimals,
        amount: tokens[i].amount ? Number(tokens[i].amount) : 0,
      }),
    };
  });

  const totalAmount = data.reduce(
    (acc, token) => acc + (token?.usdAmount || 0),
    0,
  );

  return {
    data,
    isError,
    isLoading,
    totalAmount,
  };
};
