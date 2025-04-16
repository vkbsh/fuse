import { UseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Balance } from "../model/balance";
import { getBalance } from "../service/getBalance";
import { Address, Rpc, SolanaRpcApiMainnet } from "@solana/web3.js";
import { useRpcStore } from "./rpc";

export type BalanceData = {
  balance: Balance;
};

const keys = {
  balanceByAddress: (address: Address) => ["balances", address] as const,
};

export function balanceQuery({
  address,
  rpc,
  refetchInterval,
}: {
  address: Address;
  rpc: Rpc<SolanaRpcApiMainnet>;
  refetchInterval?: number;
}) {
  return {
    queryKey: keys.balanceByAddress(address),
    queryFn: async () => {
      return {
        balance: await getBalance(rpc, address),
      };
    },
    refetchInterval,
  } satisfies UseQueryOptions<BalanceData>;
}

export function useSuspenseBalance({
  address,
  refetchInterval,
}: {
  address: Address;
  refetchInterval?: number;
}) {
  const { rpc } = useRpcStore();

  const { data } = useSuspenseQuery(
    balanceQuery({ address, rpc, refetchInterval }),
  );

  return data;
}
