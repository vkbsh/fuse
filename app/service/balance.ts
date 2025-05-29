import { assertIsAddress } from "gill";
import { TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";
import { TOKEN_2022_PROGRAM_ADDRESS } from "@solana-program/token-2022";

import type { Address } from "~/model/web3js";
import { Balance, SplTokenBalance, SplTokenBalances } from "~/model/balance";
import { useRpcStore } from "~/state/rpc";

const { rpc } = useRpcStore.getState();

export async function getBalance(vault: Address): Promise<Balance> {
  const [lamports, tokenAccounts, tokenExtensionAccounts] = await Promise.all([
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
      // TODO: check if this is needed
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

  const splTokenAccountBalances = await Promise.all(
    [
      {
        pubkey: vault,
        account: {
          data: {
            parsed: {
              info: {
                mint: "So11111111111111111111111111111111111111112",
                tokenAmount: {
                  amount: lamports,
                  decimals: 9,
                },
              },
            },
          },
        },
      },
      ...tokenAccounts,
      ...tokenExtensionAccounts,
    ].map(async (spl) => {
      const { account, pubkey } = spl;
      const mintAddress = account.data.parsed.info.mint;

      assertIsAddress(mintAddress);

      const amount = account.data.parsed.info.tokenAmount.amount;
      const decimals = account.data.parsed.info.tokenAmount.decimals;

      return {
        mintAddress,
        tokenData: {
          address: pubkey,
          mint: mintAddress,
          amount,
          decimals,
        } satisfies SplTokenBalance,
      };
    }),
  ).then((tokens) =>
    tokens.reduce((result, { mintAddress, tokenData }) => {
      result[mintAddress] = tokenData;
      return result;
    }, {} as SplTokenBalances),
  );

  return {
    native: Number(lamports),
    spl: splTokenAccountBalances,
  };
}
