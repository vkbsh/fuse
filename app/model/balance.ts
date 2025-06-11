import { z } from "zod";
import { Address } from "./web3js";

const MintAddress = Address;

const SplTokenBalance = z.object({
  amount: z.number(),
  decimals: z.number(),
  address: Address,
  mint: Address,
  programId: Address,
});
export type SplTokenBalance = z.infer<typeof SplTokenBalance>;

export const SplTokenBalances = z.record(MintAddress, SplTokenBalance);
export type SplTokenBalances = z.infer<typeof SplTokenBalances>;

export const Balance = z.object({
  spl: SplTokenBalances,
});
export type Balance = z.infer<typeof Balance>;
