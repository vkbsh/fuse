import {
  TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "gill/programs/token";
import { address, type Address, lamports } from "gill";

import { SOL_MINT_ADDRESS } from "~/program/multisig/address";

import { getRpcClient } from "~/lib/rpc";

type SplTokenBalance = {
  mint: Address;
  amount: number;
  decimals: number;
  address: Address;
  programIdAddress: Address;
};

type SplTokenBalances = {
  [mintAddress: string]: SplTokenBalance;
};

type Balance = {
  spl: SplTokenBalances;
};

export async function checkMinBalance(account: Address) {
  const { rpc } = getRpcClient();
  const { value } = await rpc.getBalance(account).send();

  const minimumBalanceForRentExemption = await rpc
    .getMinimumBalanceForRentExemption(0n)
    .send();
  const minTxFee = lamports(5000n);

  return value >= minimumBalanceForRentExemption + minTxFee;
}

export async function getBalance(vault: Address): Promise<Balance> {
  const { rpc } = getRpcClient();
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
        owner: TOKEN_PROGRAM_ADDRESS,
      },
    },
    ...tokenAccounts,
    ...tokenAccounts2022,
  ].map((spl) => {
    const { account, pubkey } = spl;
    const mintAddress = account.data.parsed.info.mint;
    const programIdAddress = account.owner;

    const amount = Number(account.data.parsed.info.tokenAmount.amount);
    const decimals = account.data.parsed.info.tokenAmount.decimals;

    return {
      mintAddress,
      tokenData: {
        amount,
        decimals,
        address: pubkey,
        mint: mintAddress,
        programIdAddress,
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
