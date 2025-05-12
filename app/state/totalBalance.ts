import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { Address } from "~/model/web3js"; // Assuming these are type definitions
import { BalanceData } from "~/state/balance"; // Assuming SplTokenData type

type SplTokenData = {
  amount: bigint;
  decimals: number;
  address: Address;
  mint: Address;
  programId: Address;
};

// These fetch functions are top-level and thus stable, no need to memoize them here.
export const fetchTokenMeta = async (mint: string) => {
  if (!mint) {
    return null;
  }
  // Consider adding error handling (try/catch) if the API might fail often
  const res = await fetch(`https://api.jup.ag/tokens/v1/token/${mint}`);
  if (!res.ok) {
    // Handle HTTP errors (e.g., 404, 500)
    // console.error(`Failed to fetch token meta for ${mint}: ${res.status}`);
    return null; // Or throw an error for React Query to catch
  }
  try {
    return await res.json();
  } catch (error) {
    // console.error(`Failed to parse token meta for ${mint}:`, error);
    return null; // Or throw
  }
};

export const fetchTokenPrice = async (mint: string) => {
  if (!mint) {
    return null; // Return null or undefined if price is unknown, rather than 1
  }
  const res = await fetch(`https://api.jup.ag/price/v2?ids=${mint}`);
  if (!res.ok) {
    // console.error(`Failed to fetch token price for ${mint}: ${res.status}`);
    return null;
  }
  try {
    const resJSON = await res.json();
    // Prefer null/undefined if price genuinely doesn't exist or can't be fetched
    return resJSON?.data?.[mint]?.price;
  } catch (error) {
    // console.error(`Failed to parse token price for ${mint}:`, error);
    return null;
  }
};

// Define a more specific type for what a "coin" object looks like internally
interface ProcessedCoin {
  address: Address; // Or string, depending on Address type
  decimals: number;
  amount: BigInt | string | number; // Keeping original type, will be converted to number later
  mint: string;
}

export function useVaultTokens({
  address,
  balanceData,
}: {
  address: Address;
  balanceData: BalanceData;
}) {
  // Memoize the extraction and initial processing of coins
  // This depends on `balanceData` and `address`
  const coins = useMemo(() => {
    const splTokensArray: SplTokenData[] = balanceData?.balance?.spl
      ? Object.values(balanceData.balance.spl)
      : [];
    const nativeBalanceAmount = balanceData?.balance?.native;

    const potentialCoins: ProcessedCoin[] = [...splTokensArray];

    if (nativeBalanceAmount) {
      potentialCoins.push({
        address, // Assuming `address` prop is the address for the native token account
        decimals: 9, // SOL decimals
        amount: nativeBalanceAmount,
        mint: "So11111111111111111111111111111111111111112", // Native SOL mint address
      });
    }
    // The filter(Boolean) might be redundant if splTokensArray and the native push are guaranteed to be valid objects.
    // If SplTokenData can be null/undefined in the Object.values, then it's useful.
    return potentialCoins.filter(Boolean) as ProcessedCoin[]; // Ensure correct typing after filter
  }, [balanceData, address]);

  // Memoize the queries array for useQueries
  // This depends on the `coins` array derived above
  const queriesConfig = useMemo(() => {
    return coins.map((coin) => {
      // The `coin` object here is from the memoized `coins` array.
      // `coin.mint` will be stable if the coin itself hasn't changed.
      const isValidCoin = coin && typeof coin.mint === "string";

      return {
        enabled: isValidCoin,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        queryKey: ["tokenMetaAndPrice", coin?.mint], // queryKey should be stable for a given mint
        queryFn: async () => {
          if (!isValidCoin) {
            // Should not be hit if `enabled` is false, but good for safety
            return null;
          }
          // Promise.all is good for concurrent fetching
          const [meta, price] = await Promise.all([
            fetchTokenMeta(coin.mint),
            fetchTokenPrice(coin.mint),
          ]);

          return {
            // Safely spread meta, ensuring it's an object
            ...(typeof meta === "object" && meta !== null ? meta : {}),
            // If price is undefined/null from fetchTokenPrice, store it as such or default here
            price: price !== undefined && price !== null ? Number(price) : 0, // Default to 0 if price is not available
          };
        },
        // React Query options for stale time, cache time can be added here if needed
        // staleTime: 5 * 60 * 1000, // 5 minutes
        // cacheTime: 10 * 60 * 1000, // 10 minutes
      };
    });
  }, [coins]); // Only re-create queriesConfig if the `coins` array changes identity

  const results = useQueries({
    queries: queriesConfig,
  });

  // Memoize the transformation of query results into the final token list
  // This depends on `results` (from useQueries) and `coins`
  const processedTokens = useMemo(() => {
    return results
      .map((query, index) => {
        const coin = coins[index]; // Get corresponding coin from our memoized `coins` array

        // query.data might be null if queryFn returned null or if query is disabled/ errored
        if (!coin || !query.data || query.isLoading || query.isError) {
          // You might want to handle loading/error states differently,
          // or return a partial object. Returning null will filter it out later.
          return null;
        }

        const amountValue =
          coin.amount && coin.decimals
            ? Number(coin.amount) / Math.pow(10, coin.decimals)
            : 0;

        // Price is already a number from queryFn or defaulted to 0
        const priceValue = query.data.price as number;

        return {
          amount: amountValue,
          mint: coin.mint,
          ata: coin.address, // Assuming coin.address is the Associated Token Account
          decimals: coin.decimals,
          name: (query.data as any).name || "", // Type assertion if structure is known
          symbol: (query.data as any).symbol || "",
          logoURI: (query.data as any).logoURI || "",
          amountUSD: priceValue * amountValue,
        };
      })
      .filter(Boolean) // Remove any nulls (e.g., from loading/error states or invalid coins)
      .sort((a, b) => {
        // Sort here so the final sorted array is memoized
        if (!a || !b) return 0; // Should not happen due to filter(Boolean)
        const aIsSol = a.symbol?.toLowerCase() === "sol";
        const bIsSol = b.symbol?.toLowerCase() === "sol";
        if (aIsSol) return -1;
        if (bIsSol) return 1;
        // Optional: add a secondary sort criteria for non-SOL tokens, e.g., by name or amountUSD
        // return (a.name || "").localeCompare(b.name || "");
        return 0; // Keep original order for non-SOL if no secondary sort
      });
  }, [results, coins]); // Re-process only if query results or the base coins list changes

  // Memoize the calculation of totalAmount
  // This depends on the `processedTokens`
  const totalAmount = useMemo(() => {
    return processedTokens.reduce(
      (sum, token) => sum + (token?.amountUSD || 0),
      0,
    );
  }, [processedTokens]);

  return {
    totalAmount,
    coins: processedTokens, // This is now the memoized and sorted list
    // You might also want to expose loading/error states from `results`
    // e.g. isLoading: results.some(query => query.isLoading)
  };
}
