import { useQueries, useQuery } from "@tanstack/react-query";

import { useSuspenseBalance } from "~/state/balance";
import { Address } from "~/model/web3js";

export const fetchTokenMeta = async (mint: string) => {
  const res = await fetch(`https://api.jup.ag/tokens/v1/token/${mint}`);
  return res.json();
};

export const fetchTokenPrice = async (mint: string) => {
  const res = await fetch(`https://api.jup.ag/price/v2?ids=${mint}`);
  const resJSON = await res.json();
  return resJSON?.data?.[mint]?.price || 1;
};

export function useVaultTokens({ address }: { address: Address }) {
  const balanceData = useSuspenseBalance({ address });

  if (!balanceData) {
    return { totalAmount: 0, coins: [] };
  }

  // merge native and spl tokens
  let coins = [
    ...(Object.values(balanceData.balance.spl) || []),
    {
      address,
      decimals: 9,
      amount: balanceData.balance.native,
      mint: "So11111111111111111111111111111111111111112",
    },
  ];

  if (coins.length === 0) {
    return { totalAmount: 0, coins: [] };
  }

  coins = coins.filter((c) => Number(c.amount) > 0);

  const resultsTokenMeta = useQueries({
    queries: coins.map((coin) => ({
      enabled: !!coin,
      queryKey: ["tokenMeta", coin.mint],
      staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
      cacheTime: 1000 * 60 * 60 * 24 * 7, // 1 week
      gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      queryFn: async () => {
        const [meta] = await Promise.all([fetchTokenMeta(coin?.mint)]);
        return meta;
      },
    })),
  });

  const resultsTokenPrice = useQueries({
    queries: coins.map((coin) => ({
      enabled: !!coin,
      queryKey: ["tokenPrice", coin.mint],
      staleTime: 1000 * 60, // 1 min
      cacheTime: 1000 * 60, // 1 min
      gcTime: 1000 * 60 * 60 * 24 * 7, // 1 min
      queryFn: async () => {
        const [price] = await Promise.all([fetchTokenPrice(coin?.mint)]);
        return { price };
      },
    })),
  });

  const results = resultsTokenMeta.map((query, index) => {
    const price = resultsTokenPrice[index].data?.price;
    return { ...query.data, price };
  });

  const tokens = results.map((query, index) => {
    const coin = coins[index];

    if (!coin) {
      return null;
    }

    const amount = Number(coin.amount) / Math.pow(10, coin.decimals);

    return {
      amount,
      mint: coin.mint,
      ata: coin.address,
      decimals: coin.decimals,
      name: query.data?.name || "",
      symbol: query?.data?.symbol || "",
      logoURI: query?.data?.logoURI || "",
      amountUSD: (query?.data?.price || 1) * amount,
    };
  });

  const totalAmount = tokens.reduce((sum, token) => sum + token.amountUSD, 0);

  return {
    totalAmount,
    coins: tokens.sort((a, b) => {
      // TODO: keep same order as in the balanceData
      return a?.symbol?.toLowerCase() === "sol"
        ? -1
        : b?.symbol?.toLowerCase() === "sol"
          ? 1
          : 0;
    }),
  };
}
