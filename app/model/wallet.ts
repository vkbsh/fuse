import { Address } from "gill";

import { MultisigAccount } from "~/program/multisig/codec";

export type Wallet = {
  address: Address;
  defaultVault: Address;
  account: MultisigAccount;
};
