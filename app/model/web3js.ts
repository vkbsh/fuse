import { z } from "zod";
import {
  isAddress,
  isLamports,
  Address as AddressType,
  Lamports as LamportsType,
} from "gill";

export const Lamports = z.custom<LamportsType>((value: unknown) => {
  return typeof value === "bigint" && isLamports(value);
}, "value is not a valid Lamports");

export type Lamports = LamportsType;

export const Address = z.custom<AddressType>((value: unknown) => {
  return typeof value === "string" && isAddress(value);
}, "value is not a valid Address");

export type Address = AddressType;
