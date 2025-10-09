import {
  type Address,
  address,
  LAMPORTS_PER_SOL,
  getMinimumBalanceForRentExemption,
} from "gill";
import { useEffect } from "react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAmount } from "~/lib/amount";
import { type FromToken } from "~/program/multisig/message";
import { SOL_MINT_ADDRESS } from "~/program/multisig/address";

import {
  type TokenMeta,
  fetchTokenMeta,
  fetchTokenPrice,
} from "~/service/token";
import {
  getMultisigAccount,
  getWalletByMemberKey,
  getTransactionsByMultisig,
} from "~/service/multisig";
import { useWalletStore } from "~/state/wallet";
import { getBalance, checkMinBalance } from "~/service/balance";

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
  | "balanceMember"
  | "multisigAccount"
  | "multisigWalletsByKey";

export const queryKeys: { [key in QueryKey]: QueryKey } = {
  balance: "balance",
  tokenMeta: "tokenMeta",
  tokenPrice: "tokenPrice",
  transaction: "transaction",
  balanceMember: "balanceMember",
  multisigAccount: "multisigAccount",
  multisigWalletsByKey: "multisigWalletsByKey",
};

const staleTimeByQueryKey: { [key in QueryKey]: number } = {
  transaction: 0,
  balanceMember: 0,
  balance: 1000 * 30, // 30 sec
  tokenPrice: 1000 * 30, // 30 sec
  multisigAccount: 1000 * 30, // 30 sec
  multisigWalletsByKey: 1000 * 30, // 30 sec
  tokenMeta: 1000 * 60 * 60 * 24 * 30, // 1 month
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
  const query = useQuery({
    enabled:
      !!multisigAddress &&
      staleTransactionIndex != undefined &&
      !isNaN(staleTransactionIndex),
    queryKey: [queryKeys.transaction, multisigAddress],
    staleTime: staleTimeByQueryKey.transaction,
    queryFn: async () =>
      getTransactionsByMultisig(multisigAddress, staleTransactionIndex),
  });

  return query;
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

export function useMemberBalance(memberKey: Address) {
  return useQuery({
    enabled: !!memberKey,
    staleTime: staleTimeByQueryKey.balance,
    queryKey: [queryKeys.balanceMember, memberKey],
    refetchInterval: staleTimeByQueryKey.balance,
    queryFn: async () => checkMinBalance(memberKey),
  });
}

export function useTokenPrice(mint: Address | null | undefined) {
  return useQuery({
    enabled: !!mint,
    queryKey: [queryKeys.tokenPrice, mint],
    staleTime: staleTimeByQueryKey.tokenPrice,
    queryFn: async () => (mint ? await fetchTokenPrice(mint) : null),
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
    .filter((token) => token?.amount)
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

  const meta = useTokensMeta(tokens.map((t) => t.mint));

  const isError = meta.some((m) => m.isError);
  const isLoading = meta.some((m) => m.isLoading);
  const isFetched = meta.every((m) => m.isFetched);

  const data = meta
    .map((m, i) => {
      return {
        ...m.data,
        ata: tokens[i].ata,
        mint: tokens[i].mint,
        amount: getAmount({
          amount: tokens[i].amount,
          decimals: Number(m.data?.decimals),
        }),
        usdAmount: m.data?.usdPrice
          ? getAmount({
              price: m.data.usdPrice,
              amount: tokens[i].amount,
              decimals: Number(m.data?.decimals),
            })
          : 0,
        programIdAddress: balanceData?.spl?.[tokens[i].mint]?.programIdAddress,
      };
    })
    .filter((token) => token?.amount > 0);

  const totalAmount = data.reduce(
    (acc, token) =>
      acc + (isNaN(Number(token?.usdAmount)) ? 0 : token?.usdAmount || 0),
    0,
  );

  return {
    data: data.sort((a, b) => b.usdAmount - a.usdAmount),
    isError,
    isFetched,
    isLoading,
    totalAmount,
  };
};

export function useHydratedTransactions(
  multisigAddress: Address,
  staleTransactionIndex: number,
) {
  const {
    data: txs,
    isLoading,
    isFetched,
  } = useTransactions(multisigAddress, staleTransactionIndex);

  const tokensMeta = useTokensMeta(
    Array.from(
      new Set(
        txs?.map((t) => t?.message?.mintAddress as Address).filter(Boolean),
      ),
    ),
  );

  const transactions = txs
    ?.map((tx) => {
      const tokenMeta = tokensMeta.find(
        (m) => m.data?.id === tx?.message?.mintAddress,
      );
      if (!tx?.message || !tokenMeta?.data) return null;

      return {
        ...tx,
        message: {
          ...tx.message,
          mint: tokenMeta.data,
          amount:
            Number(tx.message.amount) / 10 ** (tokenMeta.data.decimals || 0),
        },
      };
    })
    .filter(Boolean);

  return {
    data: transactions,
    isLoading,
    isFetched,
  };
}

export function useRefetchTransactions(multisigAddress: Address) {
  const queryClient = useQueryClient();

  return async () => {
    return queryClient.refetchQueries({
      queryKey: [queryKeys.transaction, multisigAddress],
    });
  };
}

export function useRefetchBalance(vaultAddress: Address) {
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
  const walletStore = useWalletStore();

  useEffect(() => {
    walletStore.reset();
    useWalletStore.persist.clearStorage();

    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== queryKeys.tokenMeta,
    });
  }, [queryClient]);
}
