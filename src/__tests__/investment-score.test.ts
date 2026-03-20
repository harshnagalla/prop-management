import { describe, it, expect } from "vitest";
import { getInvestmentScore } from "@/lib/utils/investment-score";

describe("getInvestmentScore", () => {
  it("rates high-yield occupied property as Strong Hold", () => {
    const result = getInvestmentScore({
      monthlyRent: "25000",
      currentValue: "3000000",
      purchasePrice: "2000000",
      status: "occupied",
    });
    expect(result.score).toBeGreaterThanOrEqual(7);
    expect(result.rating).toBe("Strong Hold");
  });

  it("rates vacant property with no rent as low score", () => {
    const result = getInvestmentScore({
      monthlyRent: null,
      currentValue: "5000000",
      purchasePrice: "5000000",
      status: "vacant",
    });
    expect(result.score).toBeLessThan(5);
  });

  it("rates sold property as 0 occupancy", () => {
    const result = getInvestmentScore({
      monthlyRent: "20000",
      currentValue: "4000000",
      purchasePrice: "3000000",
      status: "sold",
    });
    // Sold properties get 0 occupancy score
    expect(result.score).toBeLessThan(8);
  });

  it("handles null/undefined values", () => {
    const result = getInvestmentScore({
      monthlyRent: null,
      currentValue: null,
      purchasePrice: null,
      status: "vacant",
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.rating).toBeDefined();
  });

  it("considers appreciation in scoring", () => {
    // Property appreciated 50%
    const appreciated = getInvestmentScore({
      monthlyRent: "10000",
      currentValue: "3000000",
      purchasePrice: "2000000",
      status: "occupied",
    });
    // Property depreciated
    const depreciated = getInvestmentScore({
      monthlyRent: "10000",
      currentValue: "1500000",
      purchasePrice: "2000000",
      status: "occupied",
    });
    expect(appreciated.score).toBeGreaterThan(depreciated.score);
  });

  it("returns correct variant colors", () => {
    const strong = getInvestmentScore({ monthlyRent: "50000", currentValue: "5000000", purchasePrice: "3000000", status: "occupied" });
    expect(["success", "primary", "warning", "destructive"]).toContain(strong.variant);
  });
});
