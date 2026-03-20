import { describe, it, expect } from "vitest";

// Ownership parsing used in dashboard API
function parseOwnership(text: string): Array<{ name: string; percent: number }> {
  const results: Array<{ name: string; percent: number }> = [];
  const matches = text.matchAll(/(\d+)\s*%\s*([a-zA-Z]+)/gi);
  for (const m of matches) {
    results.push({
      percent: parseInt(m[1]),
      name: m[2].charAt(0).toUpperCase() + m[2].slice(1).toLowerCase(),
    });
  }
  return results;
}

describe("parseOwnership", () => {
  it("parses 50%Siva 50% nmp", () => {
    const result = parseOwnership("50%Siva 50% nmp");
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ percent: 50, name: "Siva" });
    expect(result[1]).toEqual({ percent: 50, name: "Nmp" });
  });

  it("parses 100% Siva", () => {
    const result = parseOwnership("100% Siva");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ percent: 100, name: "Siva" });
  });

  it("parses 100%Siva no space", () => {
    const result = parseOwnership("100%Siva");
    expect(result).toHaveLength(1);
    expect(result[0].percent).toBe(100);
  });

  it("parses 100% siva lowercase", () => {
    const result = parseOwnership("100% siva");
    expect(result[0].name).toBe("Siva"); // Capitalized
  });

  it("parses 100% nmp", () => {
    const result = parseOwnership("100% nmp");
    expect(result[0]).toEqual({ percent: 100, name: "Nmp" });
  });

  it("returns empty for no ownership text", () => {
    expect(parseOwnership("")).toEqual([]);
  });

  it("percentages add up", () => {
    const result = parseOwnership("50%Siva 50% nmp");
    const total = result.reduce((s, r) => s + r.percent, 0);
    expect(total).toBe(100);
  });
});
