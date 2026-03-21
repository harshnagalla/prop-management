"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, ChevronDown, CheckCircle2, List, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { toast } from "@/lib/utils/toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Property } from "@/lib/db/schema";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const filterSelectClassName =
  "appearance-none bg-transparent border border-border rounded-full h-9 pl-3 pr-8 text-sm text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface IncomeEntry {
  id: string;
  propertyId: string;
  amount: string;
  month: number;
  year: number;
  receivedDate: string | null;
  isReceived: boolean;
  tenantName: string | null;
  notes: string | null;
  propertyName: string | null;
}

interface PropertyRentStatus {
  property: Property;
  incomeEntry: IncomeEntry | null;
  status: "collected" | "pending" | "overdue";
}

export default function RentTrackerPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState<Set<string>>(new Set());
  const [recordingAll, setRecordingAll] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/properties").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
      fetch("/api/rental-income").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
    ])
      .then(([p, i]) => {
        setProperties(p);
        setIncome(i);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  // Occupied properties only
  const occupiedProperties = properties.filter(
    (p) => p.status === "occupied" && p.monthlyRent
  );

  // Match income entries for selected month
  const monthIncome = income.filter(
    (e) => e.month === selectedMonth && e.year === selectedYear
  );

  // Build status for each occupied property
  const propertyStatuses: PropertyRentStatus[] = occupiedProperties.map((prop) => {
    const entry = monthIncome.find(
      (e) => e.propertyId === prop.id && e.isReceived
    );
    let status: "collected" | "pending" | "overdue" = "pending";
    if (entry) {
      status = "collected";
    } else {
      const isCurrentMonth =
        selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();
      const isPastMonth =
        selectedYear < now.getFullYear() ||
        (selectedYear === now.getFullYear() && selectedMonth < now.getMonth() + 1);
      if (isPastMonth || (isCurrentMonth && now.getDate() > 10)) {
        status = "overdue";
      }
    }
    return { property: prop, incomeEntry: entry ?? null, status };
  });

  // Summary stats
  const totalExpected = occupiedProperties.reduce(
    (sum, p) => sum + parseFloat(p.monthlyRent || "0"),
    0
  );
  const totalCollected = propertyStatuses
    .filter((s) => s.status === "collected")
    .reduce((sum, s) => sum + parseFloat(s.property.monthlyRent || "0"), 0);
  const totalPending = totalExpected - totalCollected;
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

  const pendingStatuses = propertyStatuses.filter((s) => s.status !== "collected");

  // Record payment for a single property
  const recordPayment = async (prop: Property) => {
    const id = prop.id;
    setRecording((prev) => new Set(prev).add(id));
    try {
      const res = await fetch("/api/rental-income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          amount: prop.monthlyRent,
          month: selectedMonth,
          year: selectedYear,
          isReceived: true,
          receivedDate: new Date().toISOString(),
          tenantName: prop.tenantName || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Rent recorded for ${prop.name}`);
      load();
    } catch {
      toast.error(`Failed to record rent for ${prop.name}`);
    } finally {
      setRecording((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Record all pending
  const recordAllPending = async () => {
    if (pendingStatuses.length === 0) return;
    if (!confirm(`Record rent for ${pendingStatuses.length} pending properties?`)) return;
    setRecordingAll(true);
    let success = 0;
    let failed = 0;
    for (const s of pendingStatuses) {
      try {
        const res = await fetch("/api/rental-income", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: s.property.id,
            amount: s.property.monthlyRent,
            month: selectedMonth,
            year: selectedYear,
            isReceived: true,
            receivedDate: new Date().toISOString(),
            tenantName: s.property.tenantName || null,
          }),
        });
        if (!res.ok) throw new Error();
        success++;
      } catch {
        failed++;
      }
    }
    if (success > 0) toast.success(`Recorded rent for ${success} properties`);
    if (failed > 0) toast.error(`Failed to record ${failed} properties`);
    setRecordingAll(false);
    load();
  };

  // Format compact currency for header
  const formatCompact = (amount: number): string => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return formatCurrency(amount);
  };

  // Year options for selector
  const currentYear = now.getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  if (loading) {
    return (
      <div className="space-y-6 pt-12 md:pt-0 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-48 bg-muted rounded-[var(--radius)]" />
            <div className="h-4 w-64 bg-muted rounded mt-2" />
          </div>
          <div className="h-10 w-40 bg-muted rounded-[var(--radius)]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-[var(--radius)]" />
          ))}
        </div>
        <div className="h-4 bg-muted rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-[var(--radius)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rent Collection</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {MONTHS[selectedMonth - 1]} {selectedYear}
            {totalExpected > 0 && (
              <span className="ml-2">
                — {formatCompact(totalCollected)} of {formatCompact(totalExpected)} collected — {Math.round(collectionRate)}%
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Month selector */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className={filterSelectClassName}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className={filterSelectClassName}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>
        </div>
      </div>

      {occupiedProperties.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={Wallet}
            title="No occupied properties"
            description="Add properties with tenants to start tracking rent collection"
          />
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs font-medium text-muted-foreground">Expected</p>
              <p className="text-lg font-bold tabular-nums mt-1">{formatCurrency(totalExpected)}</p>
            </div>
            <div className="rounded-lg bg-success/5 p-4">
              <p className="text-xs font-medium text-success">Collected</p>
              <p className="text-lg font-bold tabular-nums mt-1 text-success">{formatCurrency(totalCollected)}</p>
            </div>
            <div className="rounded-lg bg-warning/5 p-4">
              <p className="text-xs font-medium text-warning">Pending</p>
              <p className="text-lg font-bold tabular-nums mt-1 text-warning">{formatCurrency(totalPending)}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs font-medium text-muted-foreground">Collection Rate</p>
              <p className="text-lg font-bold tabular-nums mt-1">{Math.round(collectionRate)}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${Math.min(collectionRate, 100)}%` }}
            />
          </div>

          {/* Actions row: Record All + View Toggle */}
          <div className="flex items-center justify-between gap-3">
            {pendingStatuses.length > 0 ? (
              <Button
                variant="default"
                onClick={recordAllPending}
                disabled={recordingAll}
              >
                <CheckCircle2 size={16} className="mr-2" />
                {recordingAll
                  ? "Recording..."
                  : `Record All Pending (${pendingStatuses.length})`}
              </Button>
            ) : (
              <div />
            )}
            <div className="flex border border-border rounded-[var(--radius)] overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "table" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {viewMode === "table" ? (
            /* Summary table view */
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Property</th>
                        <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Tenant</th>
                        <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Expected</th>
                        <th className="text-center px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Received</th>
                        <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground w-40">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyStatuses.map(({ property, incomeEntry, status }, idx) => {
                        const daysOverdue = status === "overdue" && now.getDate() > 10
                          ? now.getDate() - 10
                          : 0;
                        return (
                          <tr
                            key={property.id}
                            className={cn(
                              "border-b border-border/30 hover:bg-muted/30 transition-colors",
                              idx % 2 === 1 && "bg-muted/20"
                            )}
                          >
                            <td className="px-4 py-3 font-medium">{property.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">{property.tenantName || "\u2014"}</td>
                            <td className="px-4 py-3 text-right font-bold tabular-nums">{formatCurrency(property.monthlyRent)}</td>
                            <td className="px-4 py-3 text-center">
                              {status === "collected" ? (
                                <Badge variant="success">Collected</Badge>
                              ) : status === "overdue" ? (
                                <div>
                                  <Badge variant="destructive">Overdue</Badge>
                                  {daysOverdue > 0 && (
                                    <span className="block text-xs text-destructive mt-0.5">{daysOverdue}d overdue</span>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="warning">Pending</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground tabular-nums">
                              {status === "collected" && incomeEntry?.receivedDate
                                ? formatDate(incomeEntry.receivedDate)
                                : "\u2014"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {status !== "collected" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => recordPayment(property)}
                                  disabled={recording.has(property.id) || recordingAll}
                                >
                                  {recording.has(property.id) ? "Recording..." : "Record"}
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border bg-muted/40 font-semibold">
                        <td className="px-4 py-3" colSpan={2}>Total ({propertyStatuses.length})</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(totalExpected)}</td>
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                          {propertyStatuses.filter((s) => s.status === "collected").length} collected
                        </td>
                        <td className="px-4 py-3" colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Property cards grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {propertyStatuses.map(({ property, incomeEntry, status }) => {
                const daysOverdue = status === "overdue" && now.getDate() > 10
                  ? now.getDate() - 10
                  : 0;
                return (
                  <Card key={property.id}>
                    <CardHeader className="flex-row items-start justify-between gap-3 pb-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate">{property.name}</CardTitle>
                        {property.tenantName && (
                          <p className="text-sm text-muted-foreground mt-0.5 truncate">
                            {property.tenantName}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {status === "collected" ? (
                          <Badge variant="success">Collected</Badge>
                        ) : status === "overdue" ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                        {daysOverdue > 0 && (
                          <span className="text-xs text-destructive font-medium">{daysOverdue}d overdue</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xl font-bold tabular-nums">
                            {formatCurrency(property.monthlyRent)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">monthly rent</p>
                        </div>
                        {status === "collected" && incomeEntry?.receivedDate ? (
                          <p className="text-xs text-success">
                            Received {formatDate(incomeEntry.receivedDate)}
                          </p>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => recordPayment(property)}
                            disabled={recording.has(property.id) || recordingAll}
                          >
                            {recording.has(property.id) ? "Recording..." : "Record Payment"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
