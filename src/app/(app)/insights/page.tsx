"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Building2, MapPin } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatPercent, calcRentalYield } from "@/lib/utils/format";
import { getInvestmentScore } from "@/lib/utils/investment-score";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Property } from "@/lib/db/schema";

const KNOWN_AREAS = [
  "BOPAL",
  "NAROL",
  "BODAKDEV",
  "ISCON",
  "SG HIGHWAY",
  "AMBALI",
  "SHAHWADI",
  "GHUMA",
  "SATELLITE",
  "VASTRAPUR",
  "MANINAGAR",
  "NAVRANGPURA",
  "THALTEJ",
  "PRAHLAD NAGAR",
  "JODHPUR",
  "PALDI",
  "CHANDKHEDA",
  "GOTA",
  "MOTERA",
  "MEMNAGAR",
  "SABARMATI",
  "RANIP",
  "VASTRAL",
  "NIKOL",
  "NARODA",
  "ODHAV",
  "BAPUNAGAR",
  "SHAHIBAUG",
];

function extractArea(address: string): string {
  const upper = address.toUpperCase();

  // Try matching known areas
  for (const area of KNOWN_AREAS) {
    if (upper.includes(area)) return area;
  }

  // Fallback: extract text before AHMEDABAD
  const ahmedabadIdx = upper.indexOf("AHMEDABAD");
  if (ahmedabadIdx > 0) {
    const before = upper.substring(0, ahmedabadIdx).trim();
    const parts = before.split(/[,\-]/);
    const last = parts[parts.length - 1].trim();
    if (last.length > 2) return last;
  }

  // Fallback: extract text before pincode (6-digit number)
  const pincodeMatch = upper.match(/(\S+)\s+\d{6}/);
  if (pincodeMatch && pincodeMatch[1].length > 2) {
    return pincodeMatch[1].replace(/[,\-]$/, "").trim();
  }

  // Final fallback
  const parts = upper.split(/[,\-]/);
  if (parts.length >= 2) {
    const candidate = parts[parts.length - 2].trim();
    if (candidate.length > 2 && !/^\d+$/.test(candidate)) return candidate;
  }

  return "OTHER";
}

interface AreaData {
  area: string;
  properties: Property[];
  count: number;
  totalValue: number;
  avgYield: number;
  occupancyRate: number;
  avgAppreciation: number;
}

export default function InsightsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => (r.ok ? r.json() : []))
      .then(setProperties)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pt-12 md:pt-0 animate-pulse">
        <div className="h-9 w-44 bg-muted rounded-[var(--radius)]" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-[var(--radius)]" />
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="pt-12 md:pt-0">
        <EmptyState
          icon={TrendingUp}
          title="No properties yet"
          description="Add properties to see area insights and investment analysis."
        />
      </div>
    );
  }

  // Group by area
  const areaMap = new Map<string, Property[]>();
  for (const p of properties) {
    const area = extractArea(p.address);
    if (!areaMap.has(area)) areaMap.set(area, []);
    areaMap.get(area)!.push(p);
  }

  const areaData: AreaData[] = Array.from(areaMap.entries()).map(([area, props]) => {
    const totalValue = props.reduce((s, p) => s + parseFloat(p.currentValue || p.purchasePrice || "0"), 0);
    const yields = props.map((p) => calcRentalYield(p.monthlyRent, p.currentValue)).filter((y) => y > 0);
    const avgYield = yields.length > 0 ? yields.reduce((a, b) => a + b, 0) / yields.length : 0;
    const occupied = props.filter((p) => p.status === "occupied").length;
    const occupancyRate = (occupied / props.length) * 100;
    const appreciations = props
      .filter((p) => parseFloat(p.currentValue || "0") > 0 && parseFloat(p.purchasePrice || "0") > 0)
      .map((p) => ((parseFloat(p.currentValue!) - parseFloat(p.purchasePrice!)) / parseFloat(p.purchasePrice!)) * 100);
    const avgAppreciation = appreciations.length > 0 ? appreciations.reduce((a, b) => a + b, 0) / appreciations.length : 0;

    return { area, properties: props, count: props.length, totalValue, avgYield, occupancyRate, avgAppreciation };
  });

  // Sort by best yield
  areaData.sort((a, b) => b.avgYield - a.avgYield);

  // Chart data
  const chartData = areaData
    .filter((a) => a.avgYield > 0)
    .map((a) => ({
      area: a.area.length > 12 ? a.area.substring(0, 12) + "..." : a.area,
      yield: Math.round(a.avgYield * 10) / 10,
    }));

  return (
    <div className="space-y-6 pt-12 md:pt-0 overflow-x-hidden">
      <div className="flex items-center gap-3">
        <TrendingUp className="text-primary" size={24} />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Area Insights</h1>
      </div>

      {/* Yield comparison chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Yield by Area</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="area" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" tickFormatter={(v: number) => `${v}%`} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Avg Yield"]} />
                <Bar dataKey="yield" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Area cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {areaData.map((ad) => (
          <Card key={ad.area}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary shrink-0" />
                <h3 className="font-semibold text-base">{ad.area}</h3>
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {ad.count} {ad.count === 1 ? "property" : "properties"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="font-semibold">{formatCurrency(ad.totalValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Yield</p>
                  <p className={cn("font-semibold", ad.avgYield > 5 ? "text-success" : ad.avgYield > 3 ? "text-foreground" : "text-warning")}>
                    {ad.avgYield > 0 ? formatPercent(ad.avgYield) : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Occupancy</p>
                  <p className="font-semibold">{formatPercent(ad.occupancyRate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Appreciation</p>
                  <p className={cn("font-semibold", ad.avgAppreciation > 0 ? "text-success" : ad.avgAppreciation < 0 ? "text-destructive" : "text-foreground")}>
                    {ad.avgAppreciation !== 0 ? `${ad.avgAppreciation >= 0 ? "+" : ""}${ad.avgAppreciation.toFixed(1)}%` : "--"}
                  </p>
                </div>
              </div>

              {/* Property list with investment scores */}
              <div className="space-y-2 border-t border-border pt-3">
                {ad.properties.map((p) => {
                  const inv = getInvestmentScore(p);
                  return (
                    <Link
                      key={p.id}
                      href={`/properties/${p.id}`}
                      className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                    >
                      <Building2 size={14} className="shrink-0 text-muted-foreground" />
                      <span className="truncate flex-1">{p.name}</span>
                      <Badge variant={inv.variant as "success" | "default" | "warning" | "destructive"} className="text-[10px] shrink-0">
                        {inv.rating}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
