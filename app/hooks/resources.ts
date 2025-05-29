import { useQueries, useQuery, useInfiniteQuery } from "@tanstack/react-query";

import { Address } from "~/model/web3js";

import {
  getTransaction,
  getMultisigAccount,
  getWalletByMemberKey,
} from "~/service/multisig";

import { getBalance } from "~/service/balance";
import { fetchTokenMeta, fetchTokenPrice } from "~/service/token";
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

export function useMultisigWallets(keyAddress: Address | null) {
  return useQuery({
    enabled: !!keyAddress,
    queryKey: [queryKeys.multisigWalletsByKey, keyAddress],
    meta: { persist: true },
    staleTime: 1000 * 60 * 5,
    queryFn: async () => getWalletByMemberKey(keyAddress),
  });
}

export function useMultisigAccount(multisigAddress: Address) {
  return useQuery({
    enabled: !!multisigAddress,
    queryKey: [queryKeys.multisigAccount, multisigAddress],
    meta: { persist: true },
    staleTime: 1000 * 60 * 0.5,
    queryFn: async () => getMultisigAccount(multisigAddress),
  });
}

async function fetchTransactionBatch({
  multisigAddress,
  startIndex,
  batchSize = 10,
  staleTransactionIndex,
}: {
  multisigAddress: Address;
  startIndex: number | undefined;
  batchSize?: number;
  staleTransactionIndex: number;
}) {
  if (!startIndex) {
    return null;
  }

  const endIndex = staleTransactionIndex;
  if (endIndex >= startIndex) {
    return null;
  }

  let transactions = [];
  let _startIndex = startIndex;

  while (transactions.length < batchSize && _startIndex > endIndex) {
    const transaction = await getTransaction({
      multisigAddress,
      transactionIndex: _startIndex,
    });

    if (transaction) {
      transactions.push(transaction);
    }

    _startIndex--;
  }

  return transactions;
}

export function useTransactionBatch(
  multisigAddress: Address,
  batchSize = 10,
  transactionIndex: number,
  staleTransactionIndex: number,
) {
  return useInfiniteQuery({
    enabled: !!multisigAddress && transactionIndex > 0,
    queryKey: [queryKeys.transaction, multisigAddress, transactionIndex],
    queryFn: async ({ pageParam }) => {
      return fetchTransactionBatch({
        startIndex: pageParam,
        batchSize,
        multisigAddress,
        staleTransactionIndex,
      });
    },
    initialPageParam: transactionIndex,

    getNextPageParam: (lastPage) => {
      if (!lastPage?.length) {
        return undefined;
      }

      const nextIndex = lastPage?.[lastPage.length - 1]?.transactionIndex - 1;

      if (nextIndex < 1 || nextIndex < staleTransactionIndex) {
        return undefined;
      }

      return nextIndex;
    },
  });
}

export function useBalance(vaultAddress: Address) {
  return useQuery({
    enabled: !!vaultAddress,
    meta: { persist: true },
    staleTime: 1000 * 30,
    queryKey: [queryKeys.balance, vaultAddress],
    queryFn: async () => getBalance(vaultAddress),
  });
}

export function useTokenPrice(mint: Address) {
  return useQuery({
    enabled: !!mint,
    queryKey: [queryKeys.tokenPrice, mint],
    meta: { persist: true },
    staleTime: 1000 * 15,
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
      meta: { persist: true },
      staleTime: 1000 * 15,
      queryFn: async () => await fetchTokenPrice(mint),
    })),
  });
}

export function useTokensMeta(tokens: Address[]) {
  return useQueries({
    queries: tokens.map((mint) => ({
      enabled: !!mint,
      queryKey: [queryKeys.tokenMeta, mint],
      meta: { persist: true },
      queryFn: async () => fetchTokenMeta(mint),
    })),
  });
}

export const useTokenInfo = (vaultAddress: Address) => {
  const { data: balanceData, isLoading: isBalanceLoading } =
    useBalance(vaultAddress);

  const tokens = Object.values(balanceData?.spl || {})
    .filter((token) => token && token.amount > 0)
    .map(({ mint, amount, address }) => ({ mint, amount, ata: address }));

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
        amount: tokens[i].amount,
        decimals: m.data?.decimals,
      }),
      usdAmount: getAmount({
        amount: tokens[i].amount,
        decimals: m.data?.decimals,
        price: price[i].data || 1,
      }),
    };
  });

  return {
    data,
    isError,
    isLoading,
    totalAmount: data.reduce((acc, token) => acc + token.usdAmount, 0),
  };
};
