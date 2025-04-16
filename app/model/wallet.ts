import { Address } from "./web3js";
import { z } from "zod";
import { MultisigAccount } from "../program/multisig/codec";

export const Wallet = z.object({
  address: Address,
  defaultVault: Address,
  account: MultisigAccount,
});
export type Wallet = z.infer<typeof Wallet>;
