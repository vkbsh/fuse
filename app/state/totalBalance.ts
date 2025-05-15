import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { Address } from "~/model/web3js";
import { BalanceData } from "~/state/balance";

type SplTokenData = {
  amount: bigint;
  decimals: number;
  address: Address;
  mint: Address;
  programId: Address;
};

type ProcessedCoin = {
  address: Address; // Or string, depending on Address type
  decimals: number;
  amount: BigInt | string | number; // Keeping original type, will be converted to number later
  mint: string;
};

export const fetchTokenMeta = async (mint: string) => {
  if (!mint) {
    return null;
  }

  const res = await fetch(`https://api.jup.ag/tokens/v1/token/${mint}`);
  if (!res.ok) {
    return null; // Or throw an error for React Query to catch
  }
  try {
    return await res.json();
  } catch (error) {
    return null; // Or throw
  }
};

export const fetchTokenPrice = async (mint: string) => {
  if (!mint) {
    return null;
  }
  const res = await fetch(`https://api.jup.ag/price/v2?ids=${mint}`);
  if (!res.ok) {
    return null;
  }
  try {
    const resJSON = await res.json();

    return resJSON?.data?.[mint]?.price;
  } catch (error) {
    return null;
  }
};

export function useVaultTokens({
  vaultAddress,
  balanceData,
}: {
  vaultAddress: Address;
  balanceData: BalanceData;
}) {
  const coins = useMemo(() => {
    const splTokensArray: SplTokenData[] = balanceData?.balance?.spl
      ? Object.values(balanceData.balance.spl)
      : [];
    const nativeBalanceAmount = balanceData?.balance?.native;

    const potentialCoins: ProcessedCoin[] = [...splTokensArray];

    if (nativeBalanceAmount) {
      potentialCoins.push({
        decimals: 9,
        address: vaultAddress,
        amount: nativeBalanceAmount,
        mint: "So11111111111111111111111111111111111111112",
      });
    }

    return potentialCoins.filter(Boolean) as ProcessedCoin[];
  }, [balanceData, vaultAddress]);

  const queriesConfig = useMemo(() => {
    return coins.map((coin) => {
      const isValidCoin = coin && typeof coin.mint === "string";

      return {
        enabled: isValidCoin,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        queryKey: ["tokenMetaAndPrice", coin?.mint],
        queryFn: async () => {
          if (!isValidCoin) {
            return null;
          }
          const [meta, price] = await Promise.all([
            fetchTokenMeta(coin.mint),
            fetchTokenPrice(coin.mint),
          ]);

          return {
            ...(typeof meta === "object" && meta !== null ? meta : {}),

            price: price !== undefined && price !== null ? Number(price) : 0,
          };
        },
      };
    });
  }, [coins]);

  const results = useQueries({
    queries: queriesConfig,
  });

  const processedTokens = useMemo(() => {
    return results
      .map((query, index) => {
        const coin = coins[index];
        if (!coin || !query.data || query.isLoading || query.isError) {
          return null;
        }

        const amountValue =
          coin.amount && coin.decimals
            ? Number(coin.amount) / Math.pow(10, coin.decimals)
            : 0;

        const priceValue = query.data.price as number;

        return {
          amount: amountValue,
          mint: coin.mint,
          ata: coin.address,
          decimals: coin.decimals,
          name: (query.data as any).name || "",
          symbol: (query.data as any).symbol || "",
          logoURI: (query.data as any).logoURI || "",
          amountUSD: priceValue * amountValue,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (!a || !b) return 0;
        const aIsSol = a.symbol?.toLowerCase() === "sol";
        const bIsSol = b.symbol?.toLowerCase() === "sol";
        if (aIsSol) return -1;
        if (bIsSol) return 1;

        return 0;
      });
  }, [results, coins]);

  const totalAmount = useMemo(() => {
    return processedTokens.reduce(
      (sum, token) => sum + (token?.amountUSD || 0),
      0,
    );
  }, [processedTokens]);

  return {
    totalAmount,
    coins: processedTokens,
  };
}
