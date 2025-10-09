export function roundToken(amount: number): number {
  return Math.round(amount * 1000000000) / 1000000000;
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
  if (!decimals || !amount) return 0;

  return (amount / 10 ** decimals) * price;
}

export function formatUSD(amount: number | null | undefined) {
  if (amount == null) return "$ -";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
