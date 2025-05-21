const tokenBaseUrl = "https://lite-api.jup.ag";
const tokenMetaUrl = `${tokenBaseUrl}/tokens/v1/token`;
const tokenPriceUrl = `${tokenBaseUrl}/price/v2`;

export const fetchTokenMeta = async (mint: string) => {
  if (!mint) {
    return null;
  }

  const res = await fetch(`${tokenMetaUrl}/${mint}`);

  return res.json();
};

export const fetchTokenPrice = async (mint: string) => {
  if (!mint) {
    return null;
  }

  const res = await fetch(`${tokenPriceUrl}?ids=${mint}`);
  const json = await res.json();

  return json?.data?.[mint]?.price;
};
