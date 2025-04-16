import { Address } from "@solana/web3.js";
import { useQueries } from "@tanstack/react-query";

import { useSuspenseBalance } from "~/state/balance";

const fetchTokenMeta = async (mint: string) => {
  const res = await fetch(`https://api.jup.ag/tokens/v1/token/${mint}`);
  return res.json();
};

export const fetchTokenPrice = async (mint: string) => {
  const res = await fetch(`https://api.jup.ag/price/v2?ids=${mint}`);
  const resJSON = await res.json();
  return resJSON?.data?.[mint]?.price || 1;
};

export function useWalletTokens({ address }: { address: Address }) {
  const balanceData = useSuspenseBalance({ address });

  if (!balanceData) {
    return { totalAmount: 0, coins: [] };
  }

  // merge native and spl tokens
  const coins = [
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

  const results = useQueries({
    queries: coins.map((coin) => ({
      queryKey: ["tokenMeta", coin.mint],
      queryFn: async () => {
        const [meta, price] = await Promise.all([
          fetchTokenMeta(coin?.mint),
          fetchTokenPrice(coin?.mint),
        ]);
        return { ...meta, price };
      },
    })),
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
      symbol: query.data?.symbol || "",
      logoURI: query.data?.logoURI || "",
      amountUSD: (query.data?.price || 1) * amount,
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
