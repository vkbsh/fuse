import { type Address } from "gill";

export function abbreviateAddress(address: Address) {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
