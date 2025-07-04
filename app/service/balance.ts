import { address, Address } from "gill";
import {
  TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "gill/programs/token";

import { useRpcStore } from "~/state/rpc";

const { rpc } = useRpcStore.getState();

type SplTokenBalance = {
  mint: Address;
  amount: number;
  decimals: number;
  address: Address;
  programId: Address;
};

type SplTokenBalances = {
  [mintAddress: string]: SplTokenBalance;
};

type Balance = {
  spl: SplTokenBalances;
};

export const SOL_MINT_ADDRESS = address(
  "So11111111111111111111111111111111111111112",
);

export async function getBalance(vault: Address): Promise<Balance> {
  const [lamports, tokenAccounts, tokenAccounts2022] = await Promise.all([
    rpc
      .getBalance(vault)
      .send()
      .then(({ value }) => value),
    rpc
      .getTokenAccountsByOwner(
        vault,
        {
          programId: TOKEN_PROGRAM_ADDRESS,
        },
        {
          encoding: "jsonParsed",
        },
      )
      .send()
      .then(({ value: accounts }) => accounts),
    rpc
      .getTokenAccountsByOwner(
        vault,
        {
          programId: TOKEN_2022_PROGRAM_ADDRESS,
        },
        {
          encoding: "jsonParsed",
        },
      )
      .send()
      .then(({ value: accounts }) => accounts),
  ]);

  const splTokenAccountBalances = [
    {
      pubkey: vault,
      account: {
        data: {
          parsed: {
            info: {
              mint: SOL_MINT_ADDRESS,
              tokenAmount: {
                amount: Number(lamports),
                decimals: 9,
              },
            },
          },
        },
      },
    },
    ...tokenAccounts,
    ...tokenAccounts2022,
  ].map((spl) => {
    const { account, pubkey } = spl;
    const mintAddress = account.data.parsed.info.mint;

    const amount = Number(account.data.parsed.info.tokenAmount.amount);
    const decimals = account.data.parsed.info.tokenAmount.decimals;

    return {
      mintAddress,
      tokenData: {
        amount,
        decimals,
        address: pubkey,
        mint: mintAddress,
      } as SplTokenBalance,
    };
  });

  const spl = splTokenAccountBalances.reduce((result, current) => {
    const { mintAddress, tokenData } = current;
    result[address(mintAddress)] = tokenData;

    return result;
  }, {} as SplTokenBalances);

  return {
    spl,
  };
}
