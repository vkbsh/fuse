import { type Address, address } from "gill";
import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  DriftClient,
  SpotMarkets,
  getTokenAmount,
  convertToNumber,
  MainnetSpotMarkets,
  type SpotPosition,
  type SpotMarketAccount,
} from "@drift-labs/sdk";

import { useRpcStore } from "~/state/rpc";
import { useTokensMeta } from "~/hooks/resources";

import Coin from "~/components/Coins/Coin";
import ListItem from "~/components/ListItem";
import CoinSkeleton from "~/components/Coins/CoinSkeleton";

const supportedMarketSpotsSymbols = ["usdc", "usds"];

const supportedMarketSpots = MainnetSpotMarkets.filter((market) =>
  supportedMarketSpotsSymbols.includes(market.symbol.toLowerCase()),
);

type Balance = {
  symbol: string;
  balance: number;
};

export default function Earn({ vaultAddress }: { vaultAddress: Address }) {
  const [balance, setBalance] = useState<Balance[] | null>(null);

  const { RPC_URL } = useRpcStore.getState();
  const connection = new Connection(RPC_URL, "confirmed");

  const tokenMetas = useTokensMeta(
    supportedMarketSpots.map((spot) => address(spot.mint.toString())),
  ).map((meta) => meta.data);

  const driftClient = new DriftClient({
    connection,
    wallet: {
      signTransaction: async () => null,
      signAllTransactions: async () => null,
      publicKey: new PublicKey(vaultAddress as string),
    },
  });

  useEffect(() => {
    async function testBalance() {
      await driftClient.subscribe();

      const balanceList = supportedMarketSpots.map((spot) => {
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

        return {
          symbol: spotConfig.symbol,
          balance: convertToNumber(tokenAmount, spotConfig.precision),
        };
      });

      setBalance(balanceList);
    }

    testBalance();
  }, []);

  return (
    <AnimatePresence>
      {balance === null ? (
        <div className="h-16 -mx-3">
          <CoinSkeleton />
        </div>
      ) : (
        <div className="flex flex-col -mx-3">
          {balance.map((item, i) => {
            const tokenMeta = tokenMetas.find(
              (meta) => meta?.symbol === item.symbol,
            );

            const token = {
              ...tokenMeta,
              amount: item.balance,
              usdAmount: item.balance,
            };

            return (
              <ListItem
                key={token.id}
                index={i}
                onClick={() => console.log(token)}
              >
                <Coin token={token} />
              </ListItem>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
