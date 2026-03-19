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
  Plus,
  Camera,
  Upload,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils/cn";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

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
    thisMonthBills: number;
    expectedMonthlyRent: number;
  };
  ownershipBreakdown: {
    fullyOwned: number;
    fullyOwnedValue: number;
    shared: number;
    sharedValue: number;
    yourShareValue: number;
    totalPortfolioValue: number;
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

interface ChartData {
  monthlyIncome: Array<{ month: string; amount: number }>;
  expenseByCategory: Array<{ category: string; amount: number }>;
  monthlyExpenses: Array<{ month: string; amount: number }>;
}

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

function getYieldBadgeVariant(yld: number) {
  if (yld > 5) return "success" as const;
  if (yld > 3) return "secondary" as const;
  return "warning" as const;
}

function formatCompactCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

function formatCategoryLabel(category: string): string {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const PIE_COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-destructive)",
  "var(--color-info)",
  "var(--color-accent)",
];

function SortHeader({ label, sortKey: key, currentKey, currentDir, onSort, className }: {
  label: string;
  sortKey: string;
  currentKey: string;
  currentDir: "asc" | "desc";
  onSort: (key: string) => void;
  className?: string;
}) {
  const active = currentKey === key;
  return (
    <th
      className={cn(
        "text-left p-4 text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground select-none transition-colors",
        className
      )}
      onClick={() => onSort(key)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (currentDir === "asc" ? " ↑" : " ↓")}
      </span>
    </th>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/dashboard/charts").then((r) => r.json()),
    ])
      .then(([dashboardData, charts]) => {
        setData(dashboardData);
        setChartData(charts);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-10 pt-12 md:pt-0">
        {/* Welcome skeleton */}
        <div className="space-y-3">
          <div className="h-10 bg-gradient-to-r from-muted to-muted/60 rounded-[var(--radius)] w-64" />
          <div className="h-4 bg-muted rounded-[var(--radius)] w-80" />
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-xl" />
          ))}
        </div>

        {/* Stat cards skeleton */}
        <div className="space-y-3">
          <div className="h-5 bg-muted rounded-[var(--radius)] w-36" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-gradient-to-br from-muted to-muted/40 rounded-[var(--radius)]" />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-5 bg-muted rounded-[var(--radius)] w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-gradient-to-br from-muted to-muted/40 rounded-[var(--radius)]" />
            ))}
          </div>
        </div>

        {/* Charts skeleton */}
        <div className="space-y-3">
          <div className="h-5 bg-muted rounded-[var(--radius)] w-40" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="h-80 bg-muted rounded-[var(--radius)]" />
            <div className="h-80 bg-muted rounded-[var(--radius)]" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="h-64 bg-muted rounded-[var(--radius)]" />
      </div>
    );
  }

  if (!data) return null;

  const { properties: props, financials, propertyList, ownershipBreakdown } = data;

  const sortedProperties = [...propertyList].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey as keyof typeof a];
    const bVal = b[sortKey as keyof typeof b];
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Merge income and expenses into a single dataset for the area chart
  const areaChartData = chartData
    ? chartData.monthlyIncome.map((inc, i) => ({
        month: inc.month,
        income: inc.amount,
        expenses: chartData.monthlyExpenses[i]?.amount ?? 0,
      }))
    : [];

  const hasChartData =
    areaChartData.some((d) => d.income > 0 || d.expenses > 0) ||
    (chartData?.expenseByCategory && chartData.expenseByCategory.length > 0);

  return (
    <div className="space-y-10 pt-12 md:pt-0">
      {/* Welcome header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Mission Control
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Your portfolio overview at a glance. Track performance, income, and expenses in real time.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Link href="/properties" className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
            <Plus size={15} className="text-blue-600" />
          </div>
          <span className="text-sm font-medium text-foreground/80 truncate">Add Property</span>
        </Link>
        <Link href="/income" className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors min-w-0">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors shrink-0">
            <IndianRupee size={15} className="text-green-600" />
          </div>
          <span className="text-sm font-medium text-foreground/80 truncate">Record Payment</span>
        </Link>
        <Link href="/bills" className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors shrink-0">
            <Camera size={15} className="text-violet-600" />
          </div>
          <span className="text-sm font-medium text-foreground/80 truncate">Scan Bill</span>
        </Link>
        <Link href="/import" className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors shrink-0">
            <Upload size={15} className="text-amber-600" />
          </div>
          <span className="text-sm font-medium text-foreground/80 truncate">Import Data</span>
        </Link>
      </div>

      {/* This Month at a Glance */}
      {financials.expectedMonthlyRent > 0 && (() => {
        const collectionRate = financials.expectedMonthlyRent > 0
          ? Math.min(Math.round((financials.thisMonthIncome / financials.expectedMonthlyRent) * 100), 100)
          : 0;
        const netIncome = financials.thisMonthIncome - financials.thisMonthBills;
        const monthName = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
        return (
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4">{monthName} at a Glance</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rent Collected</span>
                  <span className="font-semibold text-success">
                    {formatCurrency(financials.thisMonthIncome)} / {formatCurrency(financials.expectedMonthlyRent)}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div
                    className="h-2 bg-success rounded-full transition-all duration-500"
                    style={{ width: `${collectionRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bills This Month</span>
                  <span className="font-semibold">{formatCurrency(financials.thisMonthBills)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Net Income</span>
                  <span className={cn("font-semibold", netIncome >= 0 ? "text-success" : "text-destructive")}>
                    {netIncome >= 0 ? "+" : ""}{formatCurrency(netIncome)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Key Metrics section */}
      <div className="space-y-4">
        <SectionHeader title="Key Metrics" subtitle="High-level portfolio performance" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Portfolio Value"
            value={formatCurrency(financials.totalPortfolioValue)}
            subtitle={ownershipBreakdown.shared > 0 ? `Your share: ${formatCurrency(ownershipBreakdown.yourShareValue)}` : undefined}
            icon={TrendingUp}
            variant="blue"
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
            variant="green"
          />
          <StatCard
            title="Properties"
            value={String(props.total)}
            subtitle={`${props.occupied} occupied \u00b7 ${props.vacant} vacant`}
            icon={Building2}
            variant="purple"
          />
          <StatCard
            title="Avg Rental Yield"
            value={formatPercent(financials.avgRentalYield)}
            subtitle="Annual yield on current value"
            icon={BarChart3}
            variant="amber"
          />
        </div>
      </div>

      {/* Operational Stats section */}
      <div className="space-y-4">
        <SectionHeader title="Operations" subtitle="Occupancy, billing, and monthly collections" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Occupancy Rate"
            value={formatPercent(props.occupancyRate)}
            icon={Home}
            variant="slate"
          />
          <StatCard
            title="Unpaid Bills"
            value={formatCurrency(financials.unpaidBills)}
            subtitle={`of ${formatCurrency(financials.totalBills)} total`}
            icon={Receipt}
            variant={financials.unpaidBills > 0 ? "rose" : "slate"}
            className={financials.unpaidBills > 0 ? "border-rose-300/60" : ""}
          />
          <StatCard
            title="This Month Income"
            value={formatCurrency(financials.thisMonthIncome)}
            subtitle="Received this month"
            icon={IndianRupee}
            variant="green"
          />
          <StatCard
            title="Net Cash Flow"
            value={formatCurrency(financials.totalIncomeReceived - financials.totalBills)}
            subtitle="All-time income minus bills"
            icon={TrendingUp}
            variant={financials.totalIncomeReceived - financials.totalBills >= 0 ? "green" : "rose"}
          />
        </div>
      </div>

      {/* Charts section */}
      <div className="space-y-4">
        <SectionHeader title="Financial Trends" subtitle="Income, expenses, and spending patterns" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Income vs Expenses Area Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Monthly trends over last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              {!hasChartData || areaChartData.every((d) => d.income === 0 && d.expenses === 0) ? (
                <div className="p-8 text-center text-muted-foreground">
                  <AlertCircle className="mx-auto mb-2" size={24} />
                  <p>No data yet. Add income and bills to see trends.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={areaChartData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-destructive)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="var(--color-destructive)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tickFormatter={formatCompactCurrency}
                      tick={{ fontSize: 12 }}
                      width={60}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === "income" ? "Income" : "Expenses",
                      ]}
                      labelStyle={{ fontWeight: 600 }}
                      contentStyle={{
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-card)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="var(--color-success)"
                      fill="url(#incomeGrad)"
                      strokeWidth={2}
                      name="income"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="var(--color-destructive)"
                      fill="url(#expenseGrad)"
                      strokeWidth={2}
                      name="expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Expense Breakdown Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Total spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              {!chartData?.expenseByCategory || chartData.expenseByCategory.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <AlertCircle className="mx-auto mb-2" size={24} />
                  <p>No expenses recorded yet. Add bills to see breakdown.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.expenseByCategory}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      paddingAngle={2}
                    >
                      {chartData.expenseByCategory.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Amount"]}
                      contentStyle={{
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-card)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      formatter={(value: string) => formatCategoryLabel(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Ownership Chart */}
        {ownershipBreakdown.shared > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Portfolio Ownership</CardTitle>
              <CardDescription>Breakdown by ownership structure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Fully Owned", value: ownershipBreakdown.fullyOwnedValue },
                        { name: "Shared", value: ownershipBreakdown.sharedValue },
                      ].filter((d) => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      paddingAngle={2}
                    >
                      <Cell fill="var(--color-primary)" />
                      <Cell fill="var(--color-warning)" />
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Value"]}
                      contentStyle={{
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-card)",
                      }}
                    />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your Total Share</p>
                    <p className="text-xl font-bold text-primary mt-1">{formatCurrency(ownershipBreakdown.yourShareValue)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Fully Owned:</span>
                    <span className="font-medium">{ownershipBreakdown.fullyOwned} properties ({formatCurrency(ownershipBreakdown.fullyOwnedValue)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span className="text-muted-foreground">Shared:</span>
                    <span className="font-medium">{ownershipBreakdown.shared} properties (your share: {formatCurrency(ownershipBreakdown.yourShareValue - ownershipBreakdown.fullyOwnedValue)})</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Property performance table */}
      <div className="space-y-4">
        <SectionHeader title="Property Performance" subtitle="Track yield, ROI, and occupancy across your portfolio" />
        <Card>
          <CardContent className="p-0">
            {propertyList.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <AlertCircle className="mx-auto mb-2" size={24} />
                <p>No properties yet. Add your first property to see analytics.</p>
              </div>
            ) : (
              <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <SortHeader label="Property" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                      <th className="text-left p-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                      <SortHeader label="Value" sortKey="currentValue" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                      <SortHeader label="Monthly Rent" sortKey="monthlyRent" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                      <SortHeader label="Yield" sortKey="rentalYield" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                      <SortHeader label="ROI" sortKey="roi" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProperties.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-border/40 hover:bg-primary/[0.03] transition-colors"
                      >
                        <td className="p-4 font-medium">
                          <Link href={`/properties/${p.id}`} className="text-primary hover:underline">
                            {p.name}
                          </Link>
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadgeVariant(p.status)}>
                            {p.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-4 text-right tabular-nums">
                          {formatCurrency(p.currentValue)}
                        </td>
                        <td className="p-4 text-right tabular-nums">
                          {p.monthlyRent > 0
                            ? formatCurrency(p.monthlyRent)
                            : "\u2014"}
                        </td>
                        <td className="p-4 text-right">
                          {p.rentalYield > 0 ? (
                            <Badge variant={getYieldBadgeVariant(p.rentalYield)}>
                              {formatPercent(p.rentalYield)}
                            </Badge>
                          ) : (
                            "\u2014"
                          )}
                        </td>
                        <td className="p-4 text-right tabular-nums">
                          {p.roi > 0 ? formatPercent(p.roi) : "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden divide-y divide-border/40">
                {propertyList.map((p) => (
                  <div key={p.id} className="p-4 space-y-3 hover:bg-primary/[0.03] transition-colors">
                    <div className="flex items-center justify-between">
                      <Link href={`/properties/${p.id}`} className="font-medium text-sm text-primary hover:underline">
                        {p.name}
                      </Link>
                      <Badge variant={getStatusBadgeVariant(p.status)}>
                        {p.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">Monthly Rent</p>
                        <p className="font-medium tabular-nums mt-0.5">
                          {p.monthlyRent > 0 ? formatCurrency(p.monthlyRent) : "\u2014"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">Yield</p>
                        <p className="font-medium mt-0.5">
                          {p.rentalYield > 0 ? (
                            <Badge variant={getYieldBadgeVariant(p.rentalYield)}>
                              {formatPercent(p.rentalYield)}
                            </Badge>
                          ) : (
                            "\u2014"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">ROI</p>
                        <p className="font-medium tabular-nums mt-0.5">
                          {p.roi > 0 ? formatPercent(p.roi) : "\u2014"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs font-medium">Value</p>
                        <p className="font-medium tabular-nums mt-0.5">{formatCurrency(p.currentValue)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
