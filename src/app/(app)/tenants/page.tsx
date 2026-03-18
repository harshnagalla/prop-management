"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Users, Search, Building2, IndianRupee, ArrowUpDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { toast } from "@/lib/utils/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/lib/db/schema";

type SortKey = "tenantName" | "monthlyRent" | "propertyName";

const selectClassName =
  "bg-transparent border border-border rounded-[var(--radius)] h-9 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function TenantsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("tenantName");

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load properties");
        return r.json();
      })
      .then(setProperties)
      .catch(() => toast.error("Failed to load properties"))
      .finally(() => setLoading(false));
  }, []);

  const tenantProperties = useMemo(() => {
    return properties.filter((p) => p.tenantName && p.tenantName.trim() !== "");
  }, [properties]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = tenantProperties.filter((p) => {
      if (q === "") return true;
      return (
        (p.tenantName || "").toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "tenantName":
          return (a.tenantName || "").localeCompare(b.tenantName || "");
        case "monthlyRent": {
          const rentA = parseFloat(a.monthlyRent || "0");
          const rentB = parseFloat(b.monthlyRent || "0");
          return rentB - rentA;
        }
        case "propertyName":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [tenantProperties, search, sortBy]);

  const uniquePropertyCount = useMemo(() => {
    return new Set(tenantProperties.map((p) => p.id)).size;
  }, [tenantProperties]);

  if (loading) {
    return (
      <div className="space-y-6 pt-12 md:pt-0 animate-pulse">
        <div className="h-9 w-52 bg-muted rounded-[var(--radius)]" />
        <div className="h-5 w-72 bg-muted rounded-[var(--radius)]" />
        <div className="h-12 bg-muted rounded-[var(--radius)]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-[var(--radius)] p-5 space-y-3"
            >
              <div className="h-6 w-36 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="h-5 w-24 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tenant Directory</h1>
        {tenantProperties.length > 0 && (
          <p className="text-muted-foreground mt-1">
            {tenantProperties.length} active tenant{tenantProperties.length !== 1 ? "s" : ""} across{" "}
            {uniquePropertyCount} propert{uniquePropertyCount !== 1 ? "ies" : "y"}
          </p>
        )}
      </div>

      {/* Search and sort bar */}
      {tenantProperties.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  placeholder="Search by tenant or property name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown size={14} className="text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className={selectClassName}
                >
                  <option value="tenantName">Tenant Name</option>
                  <option value="monthlyRent">Rent Amount</option>
                  <option value="propertyName">Property Name</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {tenantProperties.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={Users}
            title="No tenants recorded"
            description="Add tenant names to your properties to see them here."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={Search}
            title="No tenants match your search"
            description="Try adjusting your search terms."
            action={
              <Button onClick={() => setSearch("")} variant="outline">
                Clear Search
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden transition-shadow hover:shadow-[var(--shadow-card-hover)]"
            >
              <CardContent className="p-5 space-y-3">
                {/* Tenant name */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {p.tenantName}
                    </h3>
                    <Link
                      href={`/properties/${p.id}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
                    >
                      <Building2 size={13} />
                      <span className="truncate">{p.name}</span>
                    </Link>
                  </div>
                  <Badge variant="success" className="shrink-0">
                    Occupied
                  </Badge>
                </div>

                {/* Rent */}
                {p.monthlyRent && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <IndianRupee size={14} className="text-muted-foreground" />
                    <span className="font-semibold">
                      {formatCurrency(p.monthlyRent)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                )}

                {/* Quick action */}
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href="/income">Record Payment</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
