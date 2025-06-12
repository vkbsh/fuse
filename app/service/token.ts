import { Address } from "gill";

const tokenBaseUrl = "https://lite-api.jup.ag";
const tokenMetaUrl = `${tokenBaseUrl}/tokens/v1/token`;
const tokenPriceUrl = `${tokenBaseUrl}/price/v2`;

export type TokenMeta = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  daily_volume: number;
  created_at: string;
  freeze_authority: null;
  mint_authority: null;
  permanent_delegate: null;
  minted_at: string;
  extensions: { coingeckoId: string };
};

export const fetchTokenMeta = async (
  mint: string,
): Promise<TokenMeta | null> => {
  if (!mint) {
    return null;
  }

  const res = await fetch(`${tokenMetaUrl}/${mint}`);

  return res.json();
};

export const fetchTokenPrice = async (mint: string): Promise<number | null> => {
  if (!mint) {
    return null;
  }

  const res = await fetch(`${tokenPriceUrl}?ids=${mint}`);
  const json = await res.json();

  return json?.data?.[mint]?.price;
};
