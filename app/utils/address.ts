import { Address, getAddressDecoder } from "@solana/web3.js";
import { PublicKey } from "web3js1";

export function abbreviateAddress(address: Address) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function addressFromLegacyPublicKey(
  legacyPublicKey: PublicKey,
): Address {
  return getAddressDecoder().decode(legacyPublicKey.toBytes());
}
