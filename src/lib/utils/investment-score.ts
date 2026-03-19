import { calcRentalYield } from "./format";

export function getInvestmentScore(property: {
  monthlyRent?: string | null;
  currentValue?: string | null;
  purchasePrice?: string | null;
  status: string;
}): { score: number; rating: string; variant: string } {
  // Rental yield score
  const yld = calcRentalYield(property.monthlyRent ?? null, property.currentValue ?? null);
  const yieldScore = yld > 6 ? 10 : yld > 4 ? 7 : yld > 2 ? 4 : 1;

  // Occupancy score
  const occupancyScore = property.status === "occupied" ? 10 : property.status === "vacant" ? 3 : property.status === "sold" ? 0 : 5;

  // Appreciation score
  const currentVal = parseFloat(property.currentValue || "0");
  const purchaseVal = parseFloat(property.purchasePrice || "0");
  let appreciationPct = 0;
  if (purchaseVal > 0 && currentVal > 0) {
    appreciationPct = ((currentVal - purchaseVal) / purchaseVal) * 100;
  }
  const appreciationScore = appreciationPct > 20 ? 10 : appreciationPct > 10 ? 7 : appreciationPct > 0 ? 4 : 1;

  const score = yieldScore * 0.4 + occupancyScore * 0.3 + appreciationScore * 0.3;

  let rating: string;
  let variant: string;
  if (score >= 8) {
    rating = "Strong Hold";
    variant = "success";
  } else if (score >= 6) {
    rating = "Good Investment";
    variant = "default";
  } else if (score >= 4) {
    rating = "Average";
    variant = "warning";
  } else {
    rating = "Consider Selling";
    variant = "destructive";
  }

  return { score: Math.round(score * 10) / 10, rating, variant };
}
