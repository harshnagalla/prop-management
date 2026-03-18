"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils/format";

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

interface PropertyFull {
  id: string;
  name: string;
  address: string;
  city: string | null;
  type: string;
  status: string;
  purchasePrice: string | null;
  purchaseDate: string | null;
  currentValue: string | null;
  area: string | null;
  areaUnit: string | null;
  monthlyRent: string | null;
  tenantName: string | null;
  notes: string | null;
  ownership: string | null;
  dastavejNo: string | null;
  registrationDate: string | null;
  stampDuty: string | null;
  registrationCharges: string | null;
}

function formatCategoryLabel(category: string): string {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getRangeLabel(range: string): string {
  switch (range) {
    case "this_month": return "This Month";
    case "last_3_months": return "Last 3 Months";
    case "this_year": return "This Year";
    case "all_time": return "All Time";
    default: return range;
  }
}

function ReportHeader({ title, range }: { title: string; range: string }) {
  return (
    <div className="report-header">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        </svg>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>BhoomiQ</h1>
      </div>
      <h2 style={{ fontSize: "20px", fontWeight: 600, margin: "16px 0 4px" }}>{title}</h2>
      <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
        Period: {getRangeLabel(range)} | Generated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
      </p>
      <hr style={{ margin: "16px 0", borderColor: "#e5e7eb" }} />
    </div>
  );
}

function PortfolioSummaryReport({ data }: { data: DashboardData }) {
  const { properties: props, financials, propertyList } = data;
  return (
    <div>
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Key Metrics</h3>
      <table className="data-table" style={{ marginBottom: "24px" }}>
        <tbody>
          <tr><td>Total Properties</td><td style={{ textAlign: "right" }}>{props.total}</td></tr>
          <tr><td>Occupied</td><td style={{ textAlign: "right" }}>{props.occupied}</td></tr>
          <tr><td>Vacant</td><td style={{ textAlign: "right" }}>{props.vacant}</td></tr>
          <tr><td>Occupancy Rate</td><td style={{ textAlign: "right" }}>{formatPercent(props.occupancyRate)}</td></tr>
          <tr><td>Portfolio Value</td><td style={{ textAlign: "right" }}>{formatCurrency(financials.totalPortfolioValue)}</td></tr>
          <tr><td>Purchase Value</td><td style={{ textAlign: "right" }}>{formatCurrency(financials.totalPurchaseValue)}</td></tr>
          <tr><td>Appreciation</td><td style={{ textAlign: "right" }}>{formatPercent(financials.appreciation)}</td></tr>
          <tr><td>Monthly Rental Income</td><td style={{ textAlign: "right" }}>{formatCurrency(financials.monthlyRentalIncome)}</td></tr>
          <tr><td>Annual Rental Income</td><td style={{ textAlign: "right" }}>{formatCurrency(financials.annualRentalIncome)}</td></tr>
          <tr><td>Avg Rental Yield</td><td style={{ textAlign: "right" }}>{formatPercent(financials.avgRentalYield)}</td></tr>
          <tr><td>Total Bills</td><td style={{ textAlign: "right" }}>{formatCurrency(financials.totalBills)}</td></tr>
          <tr><td>Unpaid Bills</td><td style={{ textAlign: "right" }}>{formatCurrency(financials.unpaidBills)}</td></tr>
        </tbody>
      </table>

      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Property Overview</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Value</th>
            <th style={{ textAlign: "right" }}>Monthly Rent</th>
            <th style={{ textAlign: "right" }}>Yield</th>
          </tr>
        </thead>
        <tbody>
          {propertyList.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{formatStatus(p.type)}</td>
              <td>{formatStatus(p.status)}</td>
              <td style={{ textAlign: "right" }}>{formatCurrency(p.currentValue)}</td>
              <td style={{ textAlign: "right" }}>{p.monthlyRent > 0 ? formatCurrency(p.monthlyRent) : "\u2014"}</td>
              <td style={{ textAlign: "right" }}>{p.rentalYield > 0 ? formatPercent(p.rentalYield) : "\u2014"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IncomeStatementReport({ chartData }: { chartData: ChartData }) {
  const totalIncome = chartData.monthlyIncome.reduce((sum, m) => sum + m.amount, 0);
  return (
    <div>
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Monthly Income</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Month</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {chartData.monthlyIncome.map((m) => (
            <tr key={m.month}>
              <td>{m.month}</td>
              <td style={{ textAlign: "right" }}>{formatCurrency(m.amount)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 700, borderTop: "2px solid #111" }}>
            <td>Total</td>
            <td style={{ textAlign: "right" }}>{formatCurrency(totalIncome)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ExpenseReport({ chartData }: { chartData: ChartData }) {
  const totalExpenses = chartData.monthlyExpenses.reduce((sum, m) => sum + m.amount, 0);
  const totalByCategory = chartData.expenseByCategory.reduce((sum, c) => sum + c.amount, 0);
  return (
    <div>
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Expenses by Category</h3>
      <table className="data-table" style={{ marginBottom: "24px" }}>
        <thead>
          <tr>
            <th>Category</th>
            <th style={{ textAlign: "right" }}>Amount</th>
            <th style={{ textAlign: "right" }}>% of Total</th>
          </tr>
        </thead>
        <tbody>
          {chartData.expenseByCategory.map((c) => (
            <tr key={c.category}>
              <td>{formatCategoryLabel(c.category)}</td>
              <td style={{ textAlign: "right" }}>{formatCurrency(c.amount)}</td>
              <td style={{ textAlign: "right" }}>{totalByCategory > 0 ? formatPercent((c.amount / totalByCategory) * 100) : "\u2014"}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 700, borderTop: "2px solid #111" }}>
            <td>Total</td>
            <td style={{ textAlign: "right" }}>{formatCurrency(totalByCategory)}</td>
            <td style={{ textAlign: "right" }}>100%</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Monthly Expenses</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Month</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {chartData.monthlyExpenses.map((m) => (
            <tr key={m.month}>
              <td>{m.month}</td>
              <td style={{ textAlign: "right" }}>{formatCurrency(m.amount)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 700, borderTop: "2px solid #111" }}>
            <td>Total</td>
            <td style={{ textAlign: "right" }}>{formatCurrency(totalExpenses)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PropertyDetailsReport({ properties }: { properties: PropertyFull[] }) {
  return (
    <div>
      {properties.map((p) => (
        <div key={p.id} style={{ marginBottom: "32px", pageBreakInside: "avoid" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: "#2563eb" }}>{p.name}</h3>
          <table className="data-table">
            <tbody>
              <tr><td>Address</td><td style={{ textAlign: "right" }}>{p.address}{p.city ? `, ${p.city}` : ""}</td></tr>
              <tr><td>Type</td><td style={{ textAlign: "right" }}>{formatStatus(p.type)}</td></tr>
              <tr><td>Status</td><td style={{ textAlign: "right" }}>{formatStatus(p.status)}</td></tr>
              {p.area && <tr><td>Area</td><td style={{ textAlign: "right" }}>{p.area} {p.areaUnit || "sqft"}</td></tr>}
              {p.ownership && <tr><td>Ownership</td><td style={{ textAlign: "right" }}>{p.ownership}</td></tr>}
              <tr><td>Purchase Price</td><td style={{ textAlign: "right" }}>{formatCurrency(p.purchasePrice)}</td></tr>
              {p.purchaseDate && <tr><td>Purchase Date</td><td style={{ textAlign: "right" }}>{formatDate(p.purchaseDate)}</td></tr>}
              <tr><td>Current Value</td><td style={{ textAlign: "right" }}>{formatCurrency(p.currentValue)}</td></tr>
              <tr><td>Monthly Rent</td><td style={{ textAlign: "right" }}>{formatCurrency(p.monthlyRent)}</td></tr>
              {p.tenantName && <tr><td>Tenant</td><td style={{ textAlign: "right" }}>{p.tenantName}</td></tr>}
              {p.dastavejNo && <tr><td>Dastavej No.</td><td style={{ textAlign: "right" }}>{p.dastavejNo}</td></tr>}
              {p.registrationDate && <tr><td>Registration Date</td><td style={{ textAlign: "right" }}>{formatDate(p.registrationDate)}</td></tr>}
              {p.stampDuty && <tr><td>Stamp Duty</td><td style={{ textAlign: "right" }}>{formatCurrency(p.stampDuty)}</td></tr>}
              {p.registrationCharges && <tr><td>Registration Charges</td><td style={{ textAlign: "right" }}>{formatCurrency(p.registrationCharges)}</td></tr>}
              {p.notes && <tr><td>Notes</td><td style={{ textAlign: "right" }}>{p.notes}</td></tr>}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function PrintContent() {
  const searchParams = useSearchParams();
  const reportType = searchParams.get("type") || "portfolio_summary";
  const range = searchParams.get("range") || "all_time";

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [propertiesData, setPropertiesData] = useState<PropertyFull[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetches: Promise<void>[] = [];

        if (reportType === "portfolio_summary" || reportType === "property_details") {
          fetches.push(
            fetch("/api/dashboard").then((r) => r.json()).then(setDashboardData)
          );
        }

        if (reportType === "income_statement" || reportType === "expense_report") {
          fetches.push(
            fetch("/api/dashboard/charts").then((r) => r.json()).then(setChartData)
          );
        }

        if (reportType === "property_details") {
          fetches.push(
            fetch("/api/properties").then((r) => r.json()).then(setPropertiesData)
          );
        }

        if (reportType === "portfolio_summary") {
          fetches.push(
            fetch("/api/dashboard/charts").then((r) => r.json()).then(setChartData)
          );
        }

        await Promise.all(fetches);
      } catch {
        setError("Failed to fetch report data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [reportType]);

  useEffect(() => {
    if (!loading && !error) {
      // Small delay to ensure DOM is rendered before print dialog
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, error]);

  const reportTitles: Record<string, string> = {
    portfolio_summary: "Portfolio Summary Report",
    income_statement: "Income Statement",
    expense_report: "Expense Report",
    property_details: "Property Details Report",
  };

  if (loading) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
        <p>Loading report data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "#dc2626" }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: white; color: #111; }
        .print-container { max-width: 800px; margin: 0 auto; padding: 32px; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .data-table th { text-align: left; padding: 8px 12px; border-bottom: 2px solid #111; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #374151; }
        .data-table td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        .data-table tbody tr:hover { background: #f9fafb; }
        @media print {
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-container { padding: 0; max-width: 100%; }
          .data-table tbody tr:hover { background: transparent; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="print-container">
        <ReportHeader title={reportTitles[reportType] || "Report"} range={range} />

        {reportType === "portfolio_summary" && dashboardData && (
          <PortfolioSummaryReport data={dashboardData} />
        )}
        {reportType === "income_statement" && chartData && (
          <IncomeStatementReport chartData={chartData} />
        )}
        {reportType === "expense_report" && chartData && (
          <ExpenseReport chartData={chartData} />
        )}
        {reportType === "property_details" && propertiesData && (
          <PropertyDetailsReport properties={propertiesData} />
        )}
      </div>
    </>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
        <p>Loading...</p>
      </div>
    }>
      <PrintContent />
    </Suspense>
  );
}
