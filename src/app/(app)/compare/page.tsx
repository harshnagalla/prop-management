"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowLeftRight, X, ChevronDown } from "lucide-react";
import {
  formatCurrency,
  formatPercent,
  calcRentalYield,
  calcROI,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { toast } from "@/lib/utils/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Property } from "@/lib/db/schema";

const MAX_COMPARE = 4;

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "occupied":
      return "success" as const;
    case "vacant":
      return "secondary" as const;
    case "under_renovation":
      return "warning" as const;
    case "for_sale":
      return "outline" as const;
    case "sold":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

function toNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) ? 0 : n;
}

/** Compute total acquisition cost: purchase price + stamp duty + registration charges */
function totalCost(p: Property): number {
  return (
    toNum(p.purchasePrice) + toNum(p.stampDuty) + toNum(p.registrationCharges)
  );
}

type MetricRow = {
  label: string;
  values: (string | number | null)[];
  /** "highest" = green on max, "lowest" = green on min, "none" = no highlight */
  best: "highest" | "lowest" | "none";
  type: "badge" | "currency" | "percent" | "text";
};

function buildMetrics(selected: Property[]): MetricRow[] {
  return [
    {
      label: "Status",
      values: selected.map((p) => p.status || "—"),
      best: "none",
      type: "badge",
    },
    {
      label: "Type",
      values: selected.map(
        (p) =>
          (p.type || "—").charAt(0).toUpperCase() + (p.type || "—").slice(1)
      ),
      best: "none",
      type: "text",
    },
    {
      label: "Current Value",
      values: selected.map((p) => toNum(p.currentValue)),
      best: "highest",
      type: "currency",
    },
    {
      label: "Purchase Price",
      values: selected.map((p) => toNum(p.purchasePrice)),
      best: "lowest",
      type: "currency",
    },
    {
      label: "Monthly Rent",
      values: selected.map((p) => toNum(p.monthlyRent)),
      best: "highest",
      type: "currency",
    },
    {
      label: "Rental Yield",
      values: selected.map((p) =>
        calcRentalYield(p.monthlyRent, p.currentValue)
      ),
      best: "highest",
      type: "percent",
    },
    {
      label: "ROI",
      values: selected.map((p) => calcROI(p.monthlyRent, p.purchasePrice)),
      best: "highest",
      type: "percent",
    },
    {
      label: "Area",
      values: selected.map((p) =>
        p.area ? `${toNum(p.area)} ${p.areaUnit || "sqft"}` : "—"
      ),
      best: "none",
      type: "text",
    },
    {
      label: "Ownership",
      values: selected.map((p) => p.ownership || "—"),
      best: "none",
      type: "text",
    },
    {
      label: "Stamp Duty",
      values: selected.map((p) => toNum(p.stampDuty)),
      best: "lowest",
      type: "currency",
    },
    {
      label: "Registration Charges",
      values: selected.map((p) => toNum(p.registrationCharges)),
      best: "lowest",
      type: "currency",
    },
    {
      label: "Total Cost",
      values: selected.map((p) => totalCost(p)),
      best: "lowest",
      type: "currency",
    },
  ];
}

function bestIndex(
  values: (string | number | null)[],
  direction: "highest" | "lowest"
): number {
  let best = -1;
  let bestVal = direction === "highest" ? -Infinity : Infinity;
  let hasNonZero = false;
  for (let i = 0; i < values.length; i++) {
    const v = typeof values[i] === "number" ? (values[i] as number) : 0;
    if (v > 0) hasNonZero = true;
    if (direction === "highest" && v > bestVal) {
      bestVal = v;
      best = i;
    }
    if (direction === "lowest" && v > 0 && v < bestVal) {
      bestVal = v;
      best = i;
    }
  }
  return hasNonZero ? best : -1;
}

function formatCell(
  value: string | number | null,
  type: MetricRow["type"],
  isBest: boolean
): React.ReactNode {
  if (type === "badge" && typeof value === "string") {
    return (
      <Badge variant={getStatusBadgeVariant(value)}>
        {value.replace("_", " ")}
      </Badge>
    );
  }
  if (type === "currency") {
    const n = typeof value === "number" ? value : 0;
    if (n === 0) return <span className="text-muted-foreground">—</span>;
    return (
      <span className={cn(isBest && "text-success font-semibold")}>
        {formatCurrency(n)}
      </span>
    );
  }
  if (type === "percent") {
    const n = typeof value === "number" ? value : 0;
    if (n === 0) return <span className="text-muted-foreground">—</span>;
    return (
      <span className={cn(isBest && "text-success font-semibold")}>
        {formatPercent(n)}
      </span>
    );
  }
  return <span>{value || "—"}</span>;
}

/** Simple horizontal bar for a single metric across properties */
function ComparisonBar({
  selected,
  label,
  getValue,
}: {
  selected: Property[];
  label: string;
  getValue: (p: Property) => number;
}) {
  const values = selected.map(getValue);
  const max = Math.max(...values, 1);
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {selected.map((p, i) => (
        <div key={p.id} className="flex items-center gap-3">
          <span className="text-xs w-24 truncate shrink-0">{p.name}</span>
          <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/70 rounded-full transition-all"
              style={{ width: `${max > 0 ? (values[i] / max) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-medium w-20 text-right shrink-0">
            {values[i] > 0 ? formatCurrency(values[i]) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ComparePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setProperties)
      .catch(() => toast.error("Failed to load properties"))
      .finally(() => setLoading(false));
  }, []);

  const selected = useMemo(
    () => properties.filter((p) => selectedIds.has(p.id)),
    [properties, selectedIds]
  );

  const toggleProperty = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_COMPARE) {
          toast.error(`Maximum ${MAX_COMPARE} properties`);
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const removeProperty = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const metrics = useMemo(
    () => (selected.length >= 2 ? buildMetrics(selected) : []),
    [selected]
  );

  if (loading) {
    return (
      <div className="space-y-6 pt-12 md:pt-0 animate-pulse">
        <div className="h-9 w-56 bg-muted rounded-[var(--radius)]" />
        <div className="h-12 bg-muted rounded-[var(--radius)]" />
        <div className="h-64 bg-muted rounded-[var(--radius)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      {/* Header */}
      <h1 className="text-3xl font-bold tracking-tight">Compare Properties</h1>

      {/* Property selector */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Dropdown trigger */}
          <button
            onClick={() => setSelectorOpen((o) => !o)}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform",
                selectorOpen && "rotate-180"
              )}
            />
            Select properties to compare ({selectedIds.size}/{MAX_COMPARE})
          </button>

          {/* Dropdown list */}
          {selectorOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
              {properties.map((p) => {
                const isSelected = selectedIds.has(p.id);
                const disabled = !isSelected && selectedIds.size >= MAX_COMPARE;
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleProperty(p.id)}
                    disabled={disabled}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-[var(--radius)] border text-left text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border hover:border-primary/50 text-foreground",
                      disabled && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {isSelected && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2.5 6L5 8.5L9.5 3.5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.address}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected pills */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {p.name}
                  <button
                    onClick={() => removeProperty(p.id)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty state */}
      {selected.length < 2 && (
        <EmptyState
          icon={ArrowLeftRight}
          title="Select 2 or more properties to compare"
          description="Use the selector above to pick properties for a side-by-side comparison of all metrics."
        />
      )}

      {/* Comparison table */}
      {selected.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Side-by-Side Comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="sticky left-0 bg-card z-10 text-left p-3 font-semibold text-muted-foreground min-w-[140px]">
                      Metric
                    </th>
                    {selected.map((p) => (
                      <th
                        key={p.id}
                        className="text-left p-3 font-semibold min-w-[160px]"
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((row) => {
                    const best =
                      row.best !== "none"
                        ? bestIndex(row.values, row.best)
                        : -1;
                    return (
                      <tr
                        key={row.label}
                        className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="sticky left-0 bg-card z-10 p-3 font-medium text-muted-foreground whitespace-nowrap">
                          {row.label}
                        </td>
                        {row.values.map((val, i) => (
                          <td key={i} className="p-3">
                            {formatCell(val, row.type, i === best)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual comparison bars */}
      {selected.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Visual Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ComparisonBar
              selected={selected}
              label="Current Value"
              getValue={(p) => toNum(p.currentValue)}
            />
            <ComparisonBar
              selected={selected}
              label="Monthly Rent"
              getValue={(p) => toNum(p.monthlyRent)}
            />
            <ComparisonBar
              selected={selected}
              label="Purchase Price"
              getValue={(p) => toNum(p.purchasePrice)}
            />
            <ComparisonBar
              selected={selected}
              label="Total Cost"
              getValue={(p) => totalCost(p)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
