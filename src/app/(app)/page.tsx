"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  IndianRupee,
  TrendingUp,
  Receipt,
  Home,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface DashboardData {
  properties: {
    total: number;
    occupied: number;
    vacant: number;
    occupancyRate: number;
  };
  financials: {
    totalPortfolioValue: number;
    totalPurchaseValue: number;
    appreciation: number;
    monthlyRentalIncome: number;
    annualRentalIncome: number;
    avgRentalYield: number;
    totalBills: number;
    unpaidBills: number;
    totalIncomeReceived: number;
    thisMonthIncome: number;
  };
  propertyList: Array<{
    id: string;
    name: string;
    status: string;
    type: string;
    monthlyRent: number;
    currentValue: number;
    purchasePrice: number;
    rentalYield: number;
    roi: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { properties: props, financials, propertyList } = data;

  return (
    <div className="space-y-8 pt-12 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold">Mission Control</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Portfolio overview at a glance
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Value"
          value={formatCurrency(financials.totalPortfolioValue)}
          icon={TrendingUp}
          trend={
            financials.appreciation !== 0
              ? {
                  value: formatPercent(financials.appreciation) + " appreciation",
                  positive: financials.appreciation > 0,
                }
              : undefined
          }
        />
        <StatCard
          title="Monthly Rental Income"
          value={formatCurrency(financials.monthlyRentalIncome)}
          subtitle={`${formatCurrency(financials.annualRentalIncome)}/year`}
          icon={IndianRupee}
        />
        <StatCard
          title="Properties"
          value={String(props.total)}
          subtitle={`${props.occupied} occupied · ${props.vacant} vacant`}
          icon={Building2}
        />
        <StatCard
          title="Avg Rental Yield"
          value={formatPercent(financials.avgRentalYield)}
          subtitle="Annual yield on current value"
          icon={BarChart3}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Occupancy Rate"
          value={formatPercent(props.occupancyRate)}
          icon={Home}
        />
        <StatCard
          title="Unpaid Bills"
          value={formatCurrency(financials.unpaidBills)}
          subtitle={`of ${formatCurrency(financials.totalBills)} total`}
          icon={Receipt}
          className={financials.unpaidBills > 0 ? "border-warning/30" : ""}
        />
        <StatCard
          title="This Month Income"
          value={formatCurrency(financials.thisMonthIncome)}
          subtitle="Received this month"
          icon={IndianRupee}
        />
      </div>

      {/* Property performance table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Property Performance</h2>
        </div>
        {propertyList.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <AlertCircle className="mx-auto mb-2" size={24} />
            <p>No properties yet. Add your first property to see analytics.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-4 font-medium">Property</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Value</th>
                  <th className="text-right p-4 font-medium">Monthly Rent</th>
                  <th className="text-right p-4 font-medium">Yield</th>
                  <th className="text-right p-4 font-medium">ROI</th>
                </tr>
              </thead>
              <tbody>
                {propertyList.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          p.status === "occupied"
                            ? "bg-accent/10 text-accent"
                            : p.status === "vacant"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {formatCurrency(p.currentValue)}
                    </td>
                    <td className="p-4 text-right">
                      {p.monthlyRent > 0
                        ? formatCurrency(p.monthlyRent)
                        : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={cn(
                          p.rentalYield > 5
                            ? "text-accent"
                            : p.rentalYield > 3
                            ? "text-foreground"
                            : "text-warning"
                        )}
                      >
                        {p.rentalYield > 0 ? formatPercent(p.rentalYield) : "—"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {p.roi > 0 ? formatPercent(p.roi) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
