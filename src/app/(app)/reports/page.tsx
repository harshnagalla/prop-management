"use client";

import { useState } from "react";
import {
  FileBarChart,
  Building2,
  IndianRupee,
  Receipt,
  FileText,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DateRange = "this_month" | "last_3_months" | "this_year" | "all_time";

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: "this_month", label: "This Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "this_year", label: "This Year" },
  { value: "all_time", label: "All Time" },
];

const reportTypes = [
  {
    id: "portfolio_summary",
    title: "Portfolio Summary",
    description: "Overview of all properties with values, total portfolio worth, and occupancy rate.",
    icon: Building2,
  },
  {
    id: "income_statement",
    title: "Income Statement",
    description: "Monthly income by property for the selected period.",
    icon: IndianRupee,
  },
  {
    id: "expense_report",
    title: "Expense Report",
    description: "Bills by category and property for the selected period.",
    icon: Receipt,
  },
  {
    id: "property_details",
    title: "Property Details",
    description: "Full details of all properties with financial data.",
    icon: FileText,
  },
];

export default function ReportsPage() {
  const [ranges, setRanges] = useState<Record<string, DateRange>>({
    portfolio_summary: "all_time",
    income_statement: "this_year",
    expense_report: "this_year",
    property_details: "all_time",
  });
  const [generating, setGenerating] = useState<string | null>(null);

  function handleGenerate(reportId: string) {
    setGenerating(reportId);
    const range = ranges[reportId] || "all_time";
    const url = `/reports/print?type=${reportId}&range=${range}`;
    window.open(url, "_blank");
    // Reset generating state after a short delay
    setTimeout(() => setGenerating(null), 1500);
  }

  return (
    <div className="space-y-8 pt-12 md:pt-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate portfolio reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {reportTypes.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <report.icon size={20} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <CardTitle>{report.title}</CardTitle>
                  <CardDescription className="mt-1">{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <select
                  value={ranges[report.id]}
                  onChange={(e) =>
                    setRanges((prev) => ({ ...prev, [report.id]: e.target.value as DateRange }))
                  }
                  className="flex-1 h-9 rounded-[var(--radius)] border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {dateRangeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => handleGenerate(report.id)}
                  disabled={generating === report.id}
                  className="gap-2"
                >
                  {generating === report.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FileBarChart size={16} />
                  )}
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
