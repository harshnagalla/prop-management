"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  IndianRupee,
  FileText,
  Receipt,
  Download,
  Calendar,
  User,
  Ruler,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { formatCurrency, formatPercent, formatDate, calcRentalYield } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Property, Bill, RentalIncome } from "@/lib/db/schema";

type BillWithProperty = Bill & { propertyName: string | null };
type IncomeWithProperty = RentalIncome & { propertyName: string | null };
type DocumentMeta = {
  id: string;
  propertyId: string;
  userId: string;
  name: string;
  type: string;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string;
};

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
    default:
      return "secondary" as const;
  }
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function LoadingSkeleton() {
  return (
    <div className="space-y-8 pt-12 md:pt-0 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-[var(--radius)] p-5 space-y-2">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-6 w-28 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="h-10 w-full bg-muted rounded" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [bills, setBills] = useState<BillWithProperty[]>([]);
  const [income, setIncome] = useState<IncomeWithProperty[]>([]);
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`/api/properties/${id}`),
      fetch(`/api/bills?propertyId=${id}`),
      fetch(`/api/rental-income?propertyId=${id}`),
      fetch(`/api/documents?propertyId=${id}`),
    ])
      .then(async ([propRes, billsRes, incomeRes, docsRes]) => {
        if (!propRes.ok) {
          if (propRes.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error("Failed to load property");
        }
        const [propData, billsData, incomeData, docsData] = await Promise.all([
          propRes.json(),
          billsRes.ok ? billsRes.json() : [],
          incomeRes.ok ? incomeRes.json() : [],
          docsRes.ok ? docsRes.json() : [],
        ]);
        setProperty(propData);
        setBills(billsData);
        setIncome(incomeData);
        setDocuments(docsData);
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (notFound || !property) {
    return (
      <div className="pt-12 md:pt-0">
        <EmptyState
          icon={Building2}
          title="Property not found"
          description="The property you're looking for doesn't exist or you don't have access to it."
          action={
            <Button asChild variant="default">
              <Link href="/properties">Back to Properties</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const yld = calcRentalYield(property.monthlyRent, property.currentValue);

  // Bills summary
  const totalBills = bills.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const unpaidBills = bills.filter((b) => !b.isPaid);
  const unpaidAmount = unpaidBills.reduce((sum, b) => sum + parseFloat(b.amount), 0);

  // Income summary
  const totalReceived = income
    .filter((i) => i.isReceived)
    .reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const currentYear = new Date().getFullYear();
  const thisYearIncome = income
    .filter((i) => i.year === currentYear)
    .reduce((sum, i) => sum + parseFloat(i.amount), 0);

  // Group income by month/year
  const incomeGrouped = income.reduce<Record<string, IncomeWithProperty[]>>((acc, item) => {
    const key = `${item.year}-${String(item.month).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const incomeGroupKeys = Object.keys(incomeGrouped).sort().reverse();

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/properties" className="gap-2">
            <ArrowLeft size={16} />
            Back to Properties
          </Link>
        </Button>
      </div>

      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{property.name}</h1>
          <Badge variant={getStatusBadgeVariant(property.status || "vacant")}>
            {property.status?.replace("_", " ")}
          </Badge>
          {property.type && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {property.type}
            </Badge>
          )}
        </div>
        {(property.address || property.city) && (
          <p className="text-sm text-muted-foreground">
            {property.address}
            {property.city ? `, ${property.city}` : ""}
          </p>
        )}
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="overview">
        <Tabs.List className="flex border-b border-border gap-0 overflow-x-auto">
          <Tabs.Trigger
            value="overview"
            className="px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors whitespace-nowrap"
          >
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="bills"
            className="px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors whitespace-nowrap"
          >
            Bills ({bills.length})
          </Tabs.Trigger>
          <Tabs.Trigger
            value="income"
            className="px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors whitespace-nowrap"
          >
            Income ({income.length})
          </Tabs.Trigger>
          <Tabs.Trigger
            value="documents"
            className="px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors whitespace-nowrap"
          >
            Documents ({documents.length})
          </Tabs.Trigger>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview" className="pt-6 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Value</p>
                <p className="text-lg font-semibold mt-1">{formatCurrency(property.currentValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Purchase Price</p>
                <p className="text-lg font-semibold mt-1">{formatCurrency(property.purchasePrice)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Monthly Rent</p>
                <p className="text-lg font-semibold mt-1">
                  {property.monthlyRent ? formatCurrency(property.monthlyRent) : "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rental Yield</p>
                <p
                  className={cn(
                    "text-lg font-semibold mt-1",
                    yld > 5 ? "text-success" : yld > 3 ? "text-foreground" : "text-warning"
                  )}
                >
                  {yld > 0 ? formatPercent(yld) : "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {property.area && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ruler size={14} />
                <span>
                  {property.area} {property.areaUnit || "sqft"}
                </span>
              </div>
            )}
            {property.tenantName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User size={14} />
                <span>Tenant: {property.tenantName}</span>
              </div>
            )}
            {property.purchaseDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>Purchased: {formatDate(property.purchaseDate)}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {property.notes && (
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Notes</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{property.notes}</p>
              </CardContent>
            </Card>
          )}
        </Tabs.Content>

        {/* Bills Tab */}
        <Tabs.Content value="bills" className="pt-6 space-y-4">
          {/* Bills summary */}
          {bills.length > 0 && (
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total: </span>
                <span className="font-semibold">{formatCurrency(totalBills)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Unpaid: </span>
                <span className={cn("font-semibold", unpaidAmount > 0 && "text-destructive")}>
                  {formatCurrency(unpaidAmount)}
                </span>
              </div>
            </div>
          )}

          {bills.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No bills for this property"
              description="Bills associated with this property will appear here."
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block border border-border rounded-[var(--radius)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vendor</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due Date</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 capitalize">{bill.category.replace("_", " ")}</td>
                        <td className="px-4 py-3 text-muted-foreground">{bill.vendor || "—"}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(bill.amount)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(bill.dueDate)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={bill.isPaid ? "success" : "destructive"}>
                            {bill.isPaid ? "Paid" : "Unpaid"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {bills.map((bill) => (
                  <Card key={bill.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium capitalize">{bill.category.replace("_", " ")}</p>
                          {bill.vendor && (
                            <p className="text-xs text-muted-foreground mt-0.5">{bill.vendor}</p>
                          )}
                        </div>
                        <Badge variant={bill.isPaid ? "success" : "destructive"}>
                          {bill.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <span className="font-semibold">{formatCurrency(bill.amount)}</span>
                        <span className="text-muted-foreground">{formatDate(bill.dueDate)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </Tabs.Content>

        {/* Income Tab */}
        <Tabs.Content value="income" className="pt-6 space-y-4">
          {/* Income summary */}
          {income.length > 0 && (
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Received: </span>
                <span className="font-semibold">{formatCurrency(totalReceived)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{currentYear} Total: </span>
                <span className="font-semibold">{formatCurrency(thisYearIncome)}</span>
              </div>
            </div>
          )}

          {income.length === 0 ? (
            <EmptyState
              icon={IndianRupee}
              title="No income recorded for this property"
              description="Rental income for this property will appear here."
            />
          ) : (
            <div className="space-y-6">
              {incomeGroupKeys.map((key) => {
                const items = incomeGrouped[key];
                const [year, monthStr] = key.split("-");
                const monthNum = parseInt(monthStr);
                return (
                  <div key={key}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                      {MONTH_NAMES[monthNum]} {year}
                    </h3>

                    {/* Desktop table */}
                    <div className="hidden md:block border border-border rounded-[var(--radius)] overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tenant</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Received Date</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.id} className="border-b border-border last:border-0">
                              <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.amount)}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.tenantName || "—"}</td>
                              <td className="px-4 py-3 text-muted-foreground">{formatDate(item.receivedDate)}</td>
                              <td className="px-4 py-3">
                                <Badge variant={item.isReceived ? "success" : "warning"}>
                                  {item.isReceived ? "Received" : "Pending"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                      {items.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold">{formatCurrency(item.amount)}</p>
                                {item.tenantName && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{item.tenantName}</p>
                                )}
                              </div>
                              <Badge variant={item.isReceived ? "success" : "warning"}>
                                {item.isReceived ? "Received" : "Pending"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(item.receivedDate)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Tabs.Content>

        {/* Documents Tab */}
        <Tabs.Content value="documents" className="pt-6 space-y-4">
          {documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents for this property"
              description="Documents uploaded for this property will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                            {doc.type.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</p>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={`/api/documents/${doc.id}?download=true`} download>
                        <Download size={14} className="mr-2" />
                        Download
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
