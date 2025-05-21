import { PublicKey } from "web3js1";
import { getAddressDecoder } from "gill";

import { Address } from "~/model/web3js";

export function abbreviateAddress(address: Address) {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function addressFromLegacyPublicKey(
  legacyPublicKey: PublicKey,
): Address {
  return getAddressDecoder().decode(legacyPublicKey.toBytes());
}
