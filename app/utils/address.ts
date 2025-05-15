import { PublicKey } from "@solana/web3.js";
import { getAddressDecoder } from "gill";
import { Address } from "~/model/web3js";

export function abbreviateAddress(address: Address) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function addressFromLegacyPublicKey(
  legacyPublicKey: PublicKey,
): Address {
  return getAddressDecoder().decode(legacyPublicKey.toBytes());
}
