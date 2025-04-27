export const roundAmount = (num: number): number | string => {
  const min = 0.001;

  if (typeof num !== "number" || isNaN(num)) {
    console.error("Invalid number:", num);

    return "-";
  }

  if (num < min) {
    return `< ${min}`;
  }

  return num;
};

export const getRoundedUSD = (amount: number): number | string => {
  const num = roundAmount(amount);

  if (typeof num === "string") return num;

  const r = Math.round(num * 100) / 100;

  return cleanFloat(r.toFixed(2));
};
// TODO: remove all 0 in the end

export const cleanFloat = (num: string) => {
  return num.replace(/\.?0+$/, "");
};

export const getRoundedCoin = (amount: number): number | string => {
  const num = roundAmount(amount);

  if (typeof num === "string") return num;

  return cleanFloat(num.toFixed(3));
};

export const getRoundedSOL = (amount: number): number | string => {
  const num = roundAmount(amount);

  if (typeof num === "string") return num;

  return cleanFloat(num.toFixed(4));
};
