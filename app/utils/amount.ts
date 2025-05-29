export function roundAmount(num: number): number | string {
  const min = 0.0001;

  if (typeof num !== "number" || isNaN(num)) {
    console.error("Invalid number:", num);

    return "-";
  }

  if (num < min) {
    return `< ${min}`;
  }

  return num;
}

export function getRoundedUSD(amount: number): number | string {
  const num = roundAmount(amount);

  if (typeof num === "string") return num;

  const r = Math.round(num * 100) / 100;

  return cleanFloat(r.toFixed(2));
}

export function cleanFloat(num: string) {
  return num.replace(/\.?0+$/, "");
}

export function getRoundedToken(amount: number): number | string {
  const num = roundAmount(amount);

  if (typeof num === "string") return num;

  return cleanFloat(num.toFixed(3));
}

export function getRoundedSOL(amount: number): number | string {
  const num = roundAmount(amount);

  if (typeof num === "string") return num;

  return cleanFloat(num.toFixed(4));
}

export function roundCoin(type: "native" | "usd" | "token", amount: number) {
  switch (type) {
    default:
      return amount;
    case "native":
      return getRoundedSOL(amount);
    case "usd":
      return getRoundedUSD(amount);
    case "token":
      return getRoundedToken(amount);
  }
}

export function getAmount({
  amount,
  decimals,
  price = 1,
}: {
  amount: number;
  price?: number;
  decimals: number;
}) {
  return (Number(amount) / 10 ** decimals) * price;
}
