import { describe, it, expect } from "vitest";

// Area parsing used in dashboard API and property detail
function parseAreaDetails(text: string | null): Array<{ label: string; value: string }> {
  if (!text) return [];
  const areas: Array<{ label: string; value: string }> = [];
  const carpetMatch = text.match(/carpet\s*:?\s*([\d.]+)\s*(sq\.?\s*(?:mt|ft|yd))/i);
  const builtMatch = text.match(/build\s*up\s*:?\s*([\d.]+)\s*(sq\.?\s*(?:mt|ft|yd))/i);
  const landMatch = text.match(/land\s*:?\s*([\d.]+)\s*(sq\.?\s*(?:mt|ft|yd))/i);
  const totalMatch = text.match(/total\s*:?\s*([\d.]+)\s*(sq\.?\s*(?:mt|ft|yd))/i);
  if (carpetMatch) areas.push({ label: "Carpet Area", value: `${carpetMatch[1]} ${carpetMatch[2]}` });
  if (builtMatch) areas.push({ label: "Built-up Area", value: `${builtMatch[1]} ${builtMatch[2]}` });
  if (landMatch) areas.push({ label: "Land Area", value: `${landMatch[1]} ${landMatch[2]}` });
  if (totalMatch) areas.push({ label: "Total Area", value: `${totalMatch[1]} ${totalMatch[2]}` });
  if (areas.length === 0 && text.trim()) areas.push({ label: "Area", value: text.trim() });
  return areas;
}

describe("parseAreaDetails", () => {
  it("parses carpet and build up", () => {
    const result = parseAreaDetails("Carpet : 43.76 Sq.Mt Build up : 47.57 Sq.MT");
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe("Carpet Area");
    expect(result[0].value).toContain("43.76");
    expect(result[1].label).toBe("Built-up Area");
    expect(result[1].value).toContain("47.57");
  });

  it("parses land area", () => {
    const result = parseAreaDetails("Land : 281.76 Sq.Mt Constration");
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Land Area");
    expect(result[0].value).toContain("281.76");
  });

  it("parses carpet with Sq.Ft", () => {
    const result = parseAreaDetails("Carpet : 1114.825 Sq.Ft Build up : Sq.Ft");
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].value).toContain("1114.825");
  });

  it("parses total area", () => {
    const result = parseAreaDetails("Total 54.47 Sq.Mt");
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Total Area");
  });

  it("returns raw text if no pattern matches", () => {
    const result = parseAreaDetails("Some random area text");
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Area");
    expect(result[0].value).toBe("Some random area text");
  });

  it("returns empty for null", () => {
    expect(parseAreaDetails(null)).toEqual([]);
  });

  it("returns empty for empty string", () => {
    expect(parseAreaDetails("")).toEqual([]);
    expect(parseAreaDetails("   ")).toEqual([]);
  });

  it("parses multiple area types", () => {
    const result = parseAreaDetails("Carpet : 41.93Sq.Mt Attic : 12.54 Sq.Mt Total 54.47 Sq.Mt Build up: 114.22 Sq.Mt");
    expect(result.length).toBeGreaterThanOrEqual(2);
    const labels = result.map((r) => r.label);
    expect(labels).toContain("Carpet Area");
    expect(labels).toContain("Built-up Area");
  });
});
