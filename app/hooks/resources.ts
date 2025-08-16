import { useEffect } from "react";
import {
  address,
  Address,
  LAMPORTS_PER_SOL,
  getMinimumBalanceForRentExemption,
} from "gill";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMultisigAccount,
  getWalletByMemberKey,
  getTransactionsByMultisig,
} from "~/service/multisig";

import { getAmount } from "~/lib/amount";
import { getBalance } from "~/service/balance";
import { FromToken } from "~/program/multisig/message";
import { fetchTokenMeta, fetchTokenPrice, TokenMeta } from "~/service/token";
import { SOL_MINT_ADDRESS } from "~/program/multisig/address";

export type TokenData = TokenMeta &
  FromToken & {
    amount: number;
    usdAmount: number;
  };

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
  tokenMeta: 1000 * 60 * 60 * 24 * 30, // 1 month
  transaction: 1000 * 15, // 15 sec
  balance: 1000 * 30, // 30 sec
  tokenPrice: 1000 * 30, // 30 sec
  multisigAccount: 1000 * 30, // 30 sec
  multisigWalletsByKey: 1000 * 30, // 30 sec
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

export function useTransactions(
  multisigAddress: Address,
  staleTransactionIndex: number,
) {
  return useQuery({
    enabled: !!multisigAddress && !!staleTransactionIndex,
    queryKey: [queryKeys.transaction, multisigAddress],
    staleTime: staleTimeByQueryKey.transaction,
    queryFn: async () =>
      getTransactionsByMultisig(multisigAddress, staleTransactionIndex),
  });
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
    queryFn: async () => await fetchTokenPrice(mint),
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
        amount:
          token?.mint === SOL_MINT_ADDRESS
            ? token?.amount -
              Number(getMinimumBalanceForRentExemption(0)) / LAMPORTS_PER_SOL
            : token?.amount,
        mint: address(token?.mint as string),
      };
    });

  console.log({ tokens });

  const meta = useTokensMeta(tokens.map((t) => t.mint));
  const price = useTokensPrice(tokens.map((t) => t.mint));

  const isLoading =
    meta.some((m) => m.isLoading) || price.some((p) => p.isLoading);
  const isError = meta.some((m) => m.isError) || price.some((p) => p.isError);
  const isAllFetched = meta.every((m) => m.data) && price.every((p) => p.data);
  const isFetched =
    meta.every((m) => m.isFetched) && price.every((p) => p.isFetched);

  const data = meta
    .map((m, i) => {
      if (!m.data || !price[i].data || !tokens[i]) return null;

      return {
        ...m.data,
        ata: tokens[i].ata,
        mint: tokens[i].mint,
        amount: getAmount({
          amount: tokens[i].amount,
          decimals: Number(m.data?.decimals),
        }),
        usdAmount: getAmount({
          price: price[i].data,
          amount: tokens[i].amount,
          decimals: Number(m.data?.decimals),
        }),
        programIdAddress: balanceData?.spl?.[tokens[i].mint]?.programIdAddress,
      };
    })
    // TODO: add .sort((a, b) => {})
    .filter(Boolean) as TokenData[];

  const totalAmount = data.reduce(
    (acc, token) =>
      acc + (isNaN(Number(token?.usdAmount)) ? 0 : token?.usdAmount || 0),
    0,
  );

  return {
    data,
    isError,
    isFetched,
    isLoading,
    totalAmount,
    isAllFetched,
  };
};

export function useRefetchTransactions(multisigAddress: Address) {
  const queryClient = useQueryClient();

  return async () => {
    return queryClient.invalidateQueries({
      queryKey: [queryKeys.transaction, multisigAddress],
    });
  };
}

export function refetchBalance(vaultAddress: Address) {
  const queryClient = useQueryClient();

  return async () => {
    return Promise.all([
      queryClient.refetchQueries({
        queryKey: [queryKeys.balance, vaultAddress],
      }),
      queryClient.refetchQueries({
        queryKey: [queryKeys.tokenPrice],
      }),
    ]);
  };
}

export function useQueryReset() {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.removeQueries({
      type: "all",
      predicate: (query) => {
        return query.queryKey[0] !== queryKeys.tokenMeta;
      },
    });
  }, []);
}
