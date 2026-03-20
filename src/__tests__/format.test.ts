import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatCurrencyIndian,
  formatDate,
  formatPercent,
  calcRentalYield,
  calcROI,
} from "@/lib/utils/format";

describe("formatCurrency", () => {
  it("formats numbers in INR", () => {
    expect(formatCurrency(1205450)).toBe("₹12,05,450");
  });

  it("handles string input", () => {
    expect(formatCurrency("2450000")).toBe("₹24,50,000");
  });

  it("returns ₹0 for null/undefined", () => {
    expect(formatCurrency(null)).toBe("₹0");
    expect(formatCurrency(undefined)).toBe("₹0");
  });

  it("returns ₹0 for NaN string", () => {
    expect(formatCurrency("abc")).toBe("₹0");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("₹0");
  });

  it("formats large numbers in lakhs", () => {
    expect(formatCurrency(10000000)).toBe("₹1,00,00,000");
  });
});

describe("formatCurrencyIndian", () => {
  it("formats in crores", () => {
    expect(formatCurrencyIndian(12500000)).toBe("₹1.25 Crores");
  });

  it("formats in lakhs", () => {
    expect(formatCurrencyIndian(1205450)).toBe("₹12.05 Lakhs");
  });

  it("formats in thousands", () => {
    expect(formatCurrencyIndian(9930)).toBe("₹9.9K");
  });

  it("formats small numbers", () => {
    expect(formatCurrencyIndian(500)).toBe("₹500");
  });

  it("handles null", () => {
    expect(formatCurrencyIndian(null)).toBe("₹0");
  });

  it("handles negative numbers", () => {
    expect(formatCurrencyIndian(-500000)).toBe("-₹5.00 Lakhs");
  });

  it("handles string input", () => {
    expect(formatCurrencyIndian("2450000")).toBe("₹24.50 Lakhs");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2024-02-20");
    expect(result).toContain("2024");
    expect(result).toContain("Feb");
    expect(result).toContain("20");
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date("2024-09-15"));
    expect(result).toContain("2024");
  });

  it("returns — for null", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("formats with one decimal", () => {
    expect(formatPercent(5.234)).toBe("5.2%");
  });

  it("formats zero", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });

  it("formats large numbers", () => {
    expect(formatPercent(100)).toBe("100.0%");
  });
});

describe("calcRentalYield", () => {
  it("calculates yield from numbers", () => {
    const yield_ = calcRentalYield(10000, 2400000);
    expect(yield_).toBeCloseTo(5.0, 1);
  });

  it("calculates yield from strings", () => {
    const yield_ = calcRentalYield("8000", "1600000");
    expect(yield_).toBeCloseTo(6.0, 1);
  });

  it("returns 0 when rent is null", () => {
    expect(calcRentalYield(null, 1000000)).toBe(0);
  });

  it("returns 0 when value is 0", () => {
    expect(calcRentalYield(10000, 0)).toBe(0);
  });

  it("returns 0 when both null", () => {
    expect(calcRentalYield(null, null)).toBe(0);
  });
});

describe("calcROI", () => {
  it("calculates ROI", () => {
    const roi = calcROI(10000, 2000000);
    expect(roi).toBeCloseTo(6.0, 1);
  });

  it("returns 0 for null inputs", () => {
    expect(calcROI(null, null)).toBe(0);
  });
});
