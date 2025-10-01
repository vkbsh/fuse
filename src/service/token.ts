import { type Address } from "gill";

export type TokenMeta = {
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
  id: Address;
};

const tokenBaseUrl = "https://lite-api.jup.ag";
const tokenMetaUrl = `${tokenBaseUrl}/tokens/v2/search`;
const tokenPriceUrl = `${tokenBaseUrl}/price/v3`;

export const fetchTokenMeta = async (
  mint: string,
): Promise<TokenMeta | null> => {
  const res = await fetch(`${tokenMetaUrl}?query=${mint}`);
  const json = await res.json();
  const token = json[0];

  if (!token?.name) {
    return null;
  }

  return token;
};

export const fetchTokenPrice = async (mint: string): Promise<number> => {
  const res = await fetch(`${tokenPriceUrl}?ids=${mint}`);
  const json = await res.json();

  return json?.[mint]?.usdPrice || null;
};
