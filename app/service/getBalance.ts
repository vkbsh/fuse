import { TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";
import { TOKEN_2022_PROGRAM_ADDRESS } from "@solana-program/token-2022";
import { Rpc, Address, assertIsAddress, SolanaRpcApiMainnet } from "gill";

import { Balance, SplTokenBalance, SplTokenBalances } from "~/model/balance";

export async function getBalance(
  rpc: Rpc<SolanaRpcApiMainnet>,
  vault: Address,
): Promise<Balance> {
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
    ...tokenAccounts,
    ...tokenExtensionAccounts,
  ].reduce((result, { account, pubkey }) => {
    const mintAddress = account.data.parsed.info.mint;
    assertIsAddress(mintAddress);

    result[mintAddress] = {
      amount: BigInt(account.data.parsed.info.tokenAmount.amount),
      decimals: account.data.parsed.info.tokenAmount.decimals,
      mint: mintAddress,
      address: pubkey,
      programId: account.owner,
    } satisfies SplTokenBalance;

    return result;
  }, {} as SplTokenBalances);

  return Balance.parse({
    native: lamports,
    spl: splTokenAccountBalances,
  });
}
