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
import { formatCurrency, formatCurrencyIndian, formatPercent } from "@/lib/utils/format";

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
  ownershipByPerson: Array<{ name: string; count: number; value: number }>;
  areaStats: { totalCarpetArea: number; totalBuiltUpArea: number; totalLandArea: number; unit: string };
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
    ownershipPercent: number;
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

  const netCashFlow = financials.totalIncomeReceived - financials.totalBills;

  return (
    <div className="space-y-8 pt-12 md:pt-0">
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Top stats — 4 key numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-blue-50/60">
          <p className="text-xs text-muted-foreground">Portfolio Value</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(financials.totalPortfolioValue)}</p>
          {ownershipBreakdown.shared > 0 && <p className="text-xs text-blue-600 mt-0.5">Your share: {formatCurrency(ownershipBreakdown.yourShareValue)}</p>}
        </div>
        <div className="p-4 rounded-xl bg-emerald-50/60">
          <p className="text-xs text-muted-foreground">Monthly Rent</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(financials.monthlyRentalIncome)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatPercent(financials.avgRentalYield)} yield</p>
        </div>
        <div className="p-4 rounded-xl bg-violet-50/60">
          <p className="text-xs text-muted-foreground">Properties</p>
          <p className="text-xl font-bold mt-1">{props.total}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{props.occupied} occupied · {props.vacant} vacant</p>
        </div>
        <div className={cn("p-4 rounded-xl", netCashFlow >= 0 ? "bg-emerald-50/60" : "bg-red-50/60")}>
          <p className="text-xs text-muted-foreground">Net Cash Flow</p>
          <p className={cn("text-xl font-bold mt-1", netCashFlow >= 0 ? "text-emerald-700" : "text-red-700")}>{netCashFlow >= 0 ? "+" : ""}{formatCurrency(netCashFlow)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Income minus bills</p>
        </div>
      </div>

      {/* Charts + Ownership — 2 col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Income vs Expenses */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {!hasChartData || areaChartData.every((d) => d.income === 0 && d.expenses === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-12">Add income and bills to see trends</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-destructive)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-destructive)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tickFormatter={formatCompactCurrency} tick={{ fontSize: 10 }} width={50} />
                  <Tooltip formatter={(value: number, name: string) => [formatCurrencyIndian(value), name === "income" ? "Income" : "Expenses"]}
                    contentStyle={{ borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="income" stroke="var(--color-success)" fill="url(#incGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="var(--color-destructive)" fill="url(#expGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Ownership pie */}
        {data.ownershipByPerson.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ownership Split</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.ownershipByPerson} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}>
                    {data.ownershipByPerson.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrencyIndian(value), "Value"]}
                    contentStyle={{ borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {!chartData?.expenseByCategory || chartData.expenseByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">Add bills to see breakdown</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={chartData.expenseByCategory} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}>
                      {chartData.expenseByCategory.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrencyIndian(value), "Amount"]}
                      contentStyle={{ borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                    <Legend verticalAlign="bottom" formatter={formatCategoryLabel} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Area stats — compact row */}
      {(data.areaStats.totalCarpetArea > 0 || data.areaStats.totalBuiltUpArea > 0 || data.areaStats.totalLandArea > 0) && (
        <div className="flex flex-wrap gap-6 text-sm">
          {data.areaStats.totalCarpetArea > 0 && <div><span className="text-muted-foreground">Total Carpet: </span><span className="font-semibold">{data.areaStats.totalCarpetArea.toFixed(1)} Sq.Mt</span></div>}
          {data.areaStats.totalBuiltUpArea > 0 && <div><span className="text-muted-foreground">Total Built-up: </span><span className="font-semibold">{data.areaStats.totalBuiltUpArea.toFixed(1)} Sq.Mt</span></div>}
          {data.areaStats.totalLandArea > 0 && <div><span className="text-muted-foreground">Total Land: </span><span className="font-semibold">{data.areaStats.totalLandArea.toFixed(1)} Sq.Mt</span></div>}
        </div>
      )}

      {/* Property table */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Properties</h2>
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
                        formatCurrencyIndian(value),
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
                      formatter={(value: number) => [formatCurrencyIndian(value), "Amount"]}
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
                      formatter={(value: number) => [formatCurrencyIndian(value), "Value"]}
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
                      <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                      <SortHeader label="Value" sortKey="currentValue" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                      <SortHeader label="Monthly Rent" sortKey="monthlyRent" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                      <SortHeader label="Yield" sortKey="rentalYield" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                      <SortHeader label="ROI" sortKey="roi" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                      <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Ownership</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProperties.map((p, idx) => (
                      <tr
                        key={p.id}
                        className={cn(
                          "border-b border-border/30 hover:bg-primary/[0.03] transition-colors",
                          idx % 2 === 1 && "bg-muted/20"
                        )}
                      >
                        <td className="px-4 py-3 font-medium">
                          <Link href={`/properties/${p.id}`} className="text-primary hover:underline">
                            {p.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusBadgeVariant(p.status)}>
                            {p.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatCurrency(p.currentValue)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {p.monthlyRent > 0
                            ? formatCurrency(p.monthlyRent)
                            : "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p.rentalYield > 0 ? (
                            <Badge variant={getYieldBadgeVariant(p.rentalYield)}>
                              {formatPercent(p.rentalYield)}
                            </Badge>
                          ) : (
                            "\u2014"
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {p.roi > 0 ? formatPercent(p.roi) : "\u2014"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {p.ownershipPercent < 100 ? (
                            <Badge variant="warning">{p.ownershipPercent}%</Badge>
                          ) : (
                            "100%"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {propertyList.length > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-border bg-muted/40 font-semibold">
                        <td className="px-4 py-3">Total ({propertyList.length})</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatCurrency(propertyList.reduce((s, p) => s + p.currentValue, 0))}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatCurrency(propertyList.reduce((s, p) => s + p.monthlyRent, 0))}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {(() => {
                            const yields = propertyList.filter((p) => p.rentalYield > 0);
                            return yields.length > 0 ? formatPercent(yields.reduce((s, p) => s + p.rentalYield, 0) / yields.length) : "\u2014";
                          })()}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {(() => {
                            const rois = propertyList.filter((p) => p.roi > 0);
                            return rois.length > 0 ? formatPercent(rois.reduce((s, p) => s + p.roi, 0) / rois.length) : "\u2014";
                          })()}
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  )}
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
