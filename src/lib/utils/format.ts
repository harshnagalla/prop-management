export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrencyIndian(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Crores`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} Lakhs`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  return `${sign}₹${abs}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function calcRentalYield(
  monthlyRent: number | string | null,
  currentValue: number | string | null
): number {
  const rent = typeof monthlyRent === "string" ? parseFloat(monthlyRent) : monthlyRent;
  const value = typeof currentValue === "string" ? parseFloat(currentValue) : currentValue;
  if (!rent || !value || value === 0) return 0;
  return (rent * 12 * 100) / value;
}

export function calcROI(
  monthlyRent: number | string | null,
  purchasePrice: number | string | null
): number {
  const rent = typeof monthlyRent === "string" ? parseFloat(monthlyRent) : monthlyRent;
  const price = typeof purchasePrice === "string" ? parseFloat(purchasePrice) : purchasePrice;
  if (!rent || !price || price === 0) return 0;
  return (rent * 12 * 100) / price;
}
