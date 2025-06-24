import { address, Address } from "gill";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Transaction,
  getMultisigAccount,
  getProposalByIndex,
  getWalletByMemberKey,
  getTransactionsByMultisig,
} from "~/service/multisig";

import { getAmount } from "~/utils/amount";
import { getBalance } from "~/service/balance";
import { fetchTokenMeta, fetchTokenPrice, TokenMeta } from "~/service/token";

export type TokenData = TokenMeta & {
  ata: Address;
  mint: Address;
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
    staleTime: 0,
    queryFn: async () => {
      return getTransactionsByMultisig(multisigAddress, staleTransactionIndex);
    },
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

  const meta = useTokensMeta(tokens.map((t) => t.mint));
  const price = useTokensPrice(tokens.map((t) => t.mint));

  const isLoading =
    meta.some((m) => m.isLoading) || price.some((p) => p.isLoading);
  const isError = meta.some((m) => m.isError) || price.some((p) => p.isError);
  const isAllFetched = meta.every((m) => m.data) && price.every((p) => p.data);

  const data = meta.map((m, i) => {
    return {
      ...m.data,
      ata: tokens[i].ata,
      mint: tokens[i].mint,
      amount: getAmount({
        decimals: Number(m.data?.decimals) || 0,
        amount: tokens[i].amount ? Number(tokens[i].amount) : 0,
      }),
      usdAmount: getAmount({
        price: price[i].data || 0,
        decimals: Number(m.data?.decimals) || 0,
        amount: tokens[i].amount ? Number(tokens[i].amount) : 0,
      }),
    };
  }) as TokenData[];

  const totalAmount = data.reduce(
    (acc, token) => acc + (token?.usdAmount || 0),
    0,
  );

  return {
    data,
    isError,
    isLoading,
    totalAmount,
    isAllFetched,
  };
};

export function useUpdateTransaction(
  multisigAddress: Address,
  transactionIndex: number,
) {
  const queryClient = useQueryClient();

  return async () => {
    // let allTransactions: Transaction[] =
    //   queryClient.getQueryData<Array<Transaction>>([
    //     queryKeys.transaction,
    //     multisigAddress,
    //   ]) || [];
    // const newProposal = await getProposalByIndex(
    //   multisigAddress,
    //   transactionIndex,
    // );

    queryClient.invalidateQueries({
      queryKey: [queryKeys.transaction, multisigAddress],
    });

    return queryClient.refetchQueries({
      queryKey: [queryKeys.transaction, multisigAddress],
    });

    // queryClient.setQueryData(
    //   [queryKeys.transaction, multisigAddress],
    //   (allTransactions: Transaction[]) => {
    //     console.log("allTransactions", allTransactions);
    //     let updatedTransactions = [];

    //     if (!newProposal) {
    //       updatedTransactions = allTransactions.filter(
    //         (tx) => tx.transactionIndex !== transactionIndex,
    //       );
    //     } else {
    //       updatedTransactions = allTransactions.map((transaction) => {
    //         if (transaction.transactionIndex === transactionIndex) {
    //           return {
    //             ...transaction,
    //             approved: newProposal?.approved,
    //             rejected: newProposal?.rejected,
    //             cancelled: newProposal?.cancelled,
    //             status: newProposal?.status.__kind,
    //             timestamp: Number(newProposal?.status.timestamp),
    //           };
    //         }

    //         return transaction;
    //       });
    //     }

    //     console.log("updatedTransactions", updatedTransactions);

    //     return updatedTransactions;
    //   },
    // );
  };
}

export function useFetchLatestTransaction(
  multisigAddress: Address,
  transactionIndex: number,
) {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: [queryKeys.transaction, multisigAddress],
    });
    return queryClient.refetchQueries({
      queryKey: [queryKeys.transaction, multisigAddress],
    });
  };

  // const allTransactions: Transaction[] =
  //   queryClient.getQueryData<Array<Transaction>>([
  //     queryKeys.transaction,
  //     multisigAddress,
  //   ]) || [];

  // return async () => {
  //   const newProposal = await getProposalByIndex(
  //     multisigAddress,
  //     transactionIndex,
  //   );

  //   return queryClient.setQueryData(
  //     [queryKeys.transaction, multisigAddress],
  //     [newProposal, ...allTransactions], // TODO: use setter function instead (oldData) => return [newProposal,...oldData]
  //   );
  // };
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
