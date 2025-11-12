import {
  type SpotPosition,
  type SpotMarketAccount,
  SpotMarkets,
  getTokenAmount,
  convertToNumber,
  MainnetSpotMarkets,
  DRIFT_PROGRAM_ID,
} from "@drift-labs/sdk";

import { type Address } from "gill";
import { DriftClient } from "@drift-labs/sdk";
import { Connection, PublicKey } from "@solana/web3.js";

import { type EarnBalance } from "~/hooks/resources";
import { useRpcStore } from "~/state/rpc";

const supportedMarketSpotsSymbols = ["usdc", "usds"];
export const supportedMarketSpots = MainnetSpotMarkets.filter((market) =>
  supportedMarketSpotsSymbols.includes(market.symbol.toLowerCase()),
);

let driftClient: DriftClient | null = null;
let currentVaultAddress: Address | null = null;

async function createDriftClient(vaultAddress: Address) {
  const { RPC_URL } = useRpcStore.getState();
  const connection = new Connection(RPC_URL, "confirmed");

  const client = new DriftClient({
    connection,
    wallet: {
      signTransaction: async () => null,
      signAllTransactions: async () => null,
      publicKey: new PublicKey(vaultAddress as string),
    },
  });

  await client.subscribe();

  return client;
}

export async function getDriftClient(vaultAddress: Address) {
  if (!driftClient || currentVaultAddress !== vaultAddress) {
    if (driftClient) {
      try {
        await driftClient.unsubscribe(); // graceful cleanup
      } catch (err) {
        console.warn("Failed to unsubscribe old DriftClient:", err);
      }
    }

    driftClient = await createDriftClient(vaultAddress);
    currentVaultAddress = vaultAddress;
  }

  return driftClient;
}

export async function fetchDriftBalance(
  vaultAddress: Address,
): Promise<(EarnBalance | null)[]> {
  const driftClient = await getDriftClient(vaultAddress);

  if (!driftClient) {
    return [];
  }

  const balance = supportedMarketSpots.map((spot) => {
    const spotConfig = SpotMarkets["mainnet-beta"][spot.marketIndex];
    const spotPosition = driftClient.getSpotPosition(
      spot.marketIndex,
    ) as SpotPosition;

    const spotMarket = driftClient.getSpotMarketAccount(
      spot.marketIndex,
    ) as SpotMarketAccount;

    const tokenAmount = getTokenAmount(
      spotPosition.scaledBalance,
      spotMarket,
      spotPosition.balanceType,
    );

    const balance = convertToNumber(tokenAmount, spotConfig.precision);

    if (!balance) {
      return null;
    }

    return {
      symbol: spot.symbol,
      programId: DRIFT_PROGRAM_ID,
      balance,
    };
  });

  return balance;
}
