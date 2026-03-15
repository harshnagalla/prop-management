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
        <div className="space-y-2">
          <div className="h-9 bg-muted rounded-[var(--radius)] w-56" />
          <div className="h-4 bg-muted rounded-[var(--radius)] w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-muted rounded-[var(--radius)]" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-muted rounded-[var(--radius)]" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-[var(--radius)]" />
      </div>
    );
  }

  if (!data) return null;

  const { properties: props, financials, propertyList } = data;

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Portfolio overview at a glance
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          subtitle={`${props.occupied} occupied \u00b7 ${props.vacant} vacant`}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

      {/* Charts section */}
      <div className="space-y-6">
        {/* Income vs Expenses Area Chart */}
        <Card>
          <CardHeader>
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
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={areaChartData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
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
          <CardHeader>
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
              <ResponsiveContainer width="100%" height={300}>
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

      {/* Property performance table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Performance</CardTitle>
          <CardDescription>
            Track yield, ROI, and occupancy across your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <tr className="border-b border-border bg-muted/50">
                    <SortHeader label="Property" sortKey="name" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                    <th className="text-left p-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                    <SortHeader label="Value" sortKey="currentValue" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                    <SortHeader label="Monthly Rent" sortKey="monthlyRent" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                    <SortHeader label="Yield" sortKey="rentalYield" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                    <SortHeader label="ROI" sortKey="roi" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                  </tr>
                </thead>
                <tbody>
                  {sortedProperties.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={cn(
                        "border-b border-border/50 hover:bg-muted/40 transition-colors",
                        idx % 2 === 1 && "bg-muted/20"
                      )}
                    >
                      <td className="p-4 font-medium">{p.name}</td>
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
            <div className="md:hidden space-y-4">
              {propertyList.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{p.name}</p>
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
                  </CardContent>
                </Card>
              ))}
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
