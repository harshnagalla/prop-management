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
  AlertCircle,
  Upload,
  MessageSquare,
  Trash2,
  Sparkles,
  Camera,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatPercent, formatDate, calcRentalYield } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/lib/utils/toast";
import type { Property, Bill, RentalIncome, PropertyRemark } from "@/lib/db/schema";

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

interface PropertyChartData {
  monthlyIncome: Array<{ month: string; amount: number }>;
  monthlyExpenses: Array<{ month: string; amount: number }>;
  expenseByCategory: Array<{ category: string; amount: number }>;
  summary: { totalIncome: number; totalExpenses: number; netIncome: number };
}

const CATEGORIES = [
  "electricity", "water", "municipal_tax", "maintenance", "insurance", "repair", "legal", "other",
] as const;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOC_TYPES = [
  "sale_deed", "agreement", "registration", "tax_receipt", "bill", "photo", "other",
] as const;

const selectClassName =
  "mt-1 w-full bg-transparent border border-border rounded-[var(--radius)] h-9 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const textareaClassName =
  "mt-1 w-full bg-transparent border border-border rounded-[var(--radius)] px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function formatCompactCurrency(value: number): string {
  if (value >= 100000) return `\u20B9${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `\u20B9${(value / 1000).toFixed(0)}K`;
  return `\u20B9${value}`;
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
  const [remarks, setRemarks] = useState<PropertyRemark[]>([]);
  const [chartData, setChartData] = useState<PropertyChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Remarks form state
  const [remarkContent, setRemarkContent] = useState("");
  const [addingRemark, setAddingRemark] = useState(false);

  // Modal states
  const [showAddBill, setShowAddBill] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [showSale, setShowSale] = useState(false);

  // AI scan states
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [docScanning, setDocScanning] = useState(false);
  const [docAiResult, setDocAiResult] = useState<string | null>(null);

  // Sale form state
  const [saleForm, setSaleForm] = useState({
    salePrice: "",
    saleDate: new Date().toISOString().split("T")[0],
    buyer: "",
  });
  const [submittingSale, setSubmittingSale] = useState(false);

  // Bill form state
  const [billForm, setBillForm] = useState({
    category: "electricity" as string,
    amount: "",
    vendor: "",
    referenceNumber: "",
    dueDate: "",
    paidDate: "",
    isPaid: false,
    notes: "",
  });

  // Income form state
  const now = new Date();
  const [incomeForm, setIncomeForm] = useState({
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    amount: "",
    tenantName: "",
    receivedDate: now.toISOString().split("T")[0],
    isReceived: true,
    notes: "",
  });

  // Document form state
  const [docForm, setDocForm] = useState({
    name: "",
    type: "other" as string,
  });
  const [docFile, setDocFile] = useState<{ dataUri: string; mimeType: string; fileSize: number } | null>(null);
  const [docFileName, setDocFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadData = (isInitial = false) => {
    if (!id) return;
    Promise.all([
      fetch(`/api/properties/${id}`),
      fetch(`/api/bills?propertyId=${id}`),
      fetch(`/api/rental-income?propertyId=${id}`),
      fetch(`/api/documents?propertyId=${id}`),
      fetch(`/api/properties/${id}/charts`),
      fetch(`/api/properties/${id}/remarks`),
    ])
      .then(async ([propRes, billsRes, incomeRes, docsRes, chartsRes, remarksRes]) => {
        if (!propRes.ok) {
          if (propRes.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error("Failed to load property");
        }
        const [propData, billsData, incomeData, docsData, chartsData, remarksData] = await Promise.all([
          propRes.json(),
          billsRes.ok ? billsRes.json() : [],
          incomeRes.ok ? incomeRes.json() : [],
          docsRes.ok ? docsRes.json() : [],
          chartsRes.ok ? chartsRes.json() : null,
          remarksRes.ok ? remarksRes.json() : [],
        ]);
        setProperty(propData);
        setBills(billsData);
        setIncome(incomeData);
        setDocuments(docsData);
        setChartData(chartsData);
        setRemarks(remarksData);
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => {
        if (isInitial) setLoading(false);
      });
  };

  useEffect(() => {
    loadData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const resetBillForm = () => {
    setBillForm({ category: "electricity", amount: "", vendor: "", referenceNumber: "", dueDate: "", paidDate: "", isPaid: false, notes: "" });
  };

  const resetIncomeForm = (prop?: Property | null) => {
    const n = new Date();
    setIncomeForm({
      month: String(n.getMonth() + 1),
      year: String(n.getFullYear()),
      amount: prop?.monthlyRent || "",
      tenantName: prop?.tenantName || "",
      receivedDate: n.toISOString().split("T")[0],
      isReceived: true,
      notes: "",
    });
  };

  const resetDocForm = () => {
    setDocForm({ name: "", type: "other" });
    setDocFile(null);
    setDocFileName("");
    setDocScanning(false);
    setDocAiResult(null);
  };

  const handleBillScan = async (file: File) => {
    setScanning(true);
    setScanComplete(false);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setScanPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      try {
        const res = await fetch("/api/ai/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: base64,
            mimeType: file.type,
            mode: "bill",
          }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setBillForm((f) => ({
          ...f,
          amount: String(data.amount || f.amount),
          category: data.category || f.category,
          vendor: data.vendor || f.vendor,
          referenceNumber: data.referenceNumber || f.referenceNumber,
          dueDate: data.date || f.dueDate,
        }));
        setScanComplete(true);
        toast.success("AI extracted bill details");
      } catch {
        toast.error("Failed to scan bill. Please enter manually.");
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDocAiScan = async () => {
    if (!docFile) return;
    setDocScanning(true);
    setDocAiResult(null);
    try {
      const base64 = docFile.dataUri.split(",")[1];
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          mimeType: docFile.mimeType,
          mode: "bill",
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      // Auto-fill document name from vendor + date
      const nameParts: string[] = [];
      if (data.vendor) nameParts.push(data.vendor);
      if (data.category) nameParts.push(data.category.replace("_", " "));
      if (data.date) nameParts.push(data.date);
      if (nameParts.length > 0) {
        setDocForm((f) => ({ ...f, name: f.name || nameParts.join(" - ") }));
      }

      // Auto-set document type based on category
      const categoryToDocType: Record<string, string> = {
        electricity: "bill",
        water: "bill",
        municipal_tax: "tax_receipt",
        maintenance: "bill",
        insurance: "bill",
        repair: "bill",
        legal: "agreement",
      };
      if (data.category && categoryToDocType[data.category]) {
        setDocForm((f) => ({ ...f, type: categoryToDocType[data.category] || f.type }));
      }

      // Build display message
      const parts: string[] = [];
      if (data.category) parts.push(data.category.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()));
      if (data.vendor) parts.push(`from ${data.vendor}`);
      if (data.amount) parts.push(`- ${formatCurrency(String(data.amount))}`);
      setDocAiResult(parts.length > 0 ? `AI detected: ${parts.join(" ")}` : "AI could not detect document details");
      toast.success("AI analyzed document");
    } catch {
      toast.error("Failed to analyze document");
      setDocAiResult(null);
    } finally {
      setDocScanning(false);
    }
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          category: billForm.category,
          amount: billForm.amount,
          dueDate: billForm.dueDate || null,
          paidDate: billForm.paidDate || null,
          isPaid: billForm.isPaid,
          vendor: billForm.vendor || null,
          referenceNumber: billForm.referenceNumber || null,
          notes: billForm.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Bill added");
      setShowAddBill(false);
      resetBillForm();
      loadData();
    } catch {
      toast.error("Failed to save bill");
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/rental-income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          amount: incomeForm.amount,
          month: parseInt(incomeForm.month),
          year: parseInt(incomeForm.year),
          receivedDate: incomeForm.receivedDate || null,
          isReceived: incomeForm.isReceived,
          tenantName: incomeForm.tenantName || null,
          notes: incomeForm.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Payment recorded");
      setShowAddIncome(false);
      resetIncomeForm(property);
      loadData();
    } catch {
      toast.error("Failed to record payment");
    }
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) return;
    setUploading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          name: docForm.name,
          type: docForm.type,
          file: docFile.dataUri,
          mimeType: docFile.mimeType,
          fileSize: docFile.fileSize,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Document uploaded");
      setShowAddDoc(false);
      resetDocForm();
      loadData();
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleMarkAsSold = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSale(true);
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "sold",
          salePrice: saleForm.salePrice,
          saleDate: saleForm.saleDate || null,
          buyer: saleForm.buyer || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Property marked as sold");
      setShowSale(false);
      setSaleForm({ salePrice: "", saleDate: new Date().toISOString().split("T")[0], buyer: "" });
      loadData();
    } catch {
      toast.error("Failed to record sale");
    } finally {
      setSubmittingSale(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      e.target.value = "";
      return;
    }
    setDocFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setDocFile({
        dataUri: reader.result as string,
        mimeType: file.type,
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

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
      <div className="flex items-start justify-between gap-4 flex-wrap">
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
          {property.ownership && (
            <p className="text-sm text-muted-foreground">
              Ownership: {property.ownership}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {property.status !== "sold" && (
            <>
              <Button variant="outline" size="sm" onClick={() => { resetBillForm(); setShowAddBill(true); }}>
                <Receipt size={14} className="mr-1.5" />
                Add Bill
              </Button>
              <Button variant="outline" size="sm" onClick={() => { resetIncomeForm(property); setShowAddIncome(true); }}>
                <IndianRupee size={14} className="mr-1.5" />
                Record Payment
              </Button>
              <Button variant="outline" size="sm" onClick={() => { resetDocForm(); setShowAddDoc(true); }}>
                <Upload size={14} className="mr-1.5" />
                Upload Document
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowSale(true)}>
                Mark as Sold
              </Button>
            </>
          )}
        </div>
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
          <Tabs.Trigger
            value="remarks"
            className="px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors whitespace-nowrap"
          >
            Remarks ({remarks.length})
          </Tabs.Trigger>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview" className="pt-6 space-y-6">
          {/* Sale summary when sold */}
          {property.status === "sold" && (() => {
            const totalCost = parseFloat(property.purchasePrice || "0") + parseFloat(property.stampDuty || "0") + parseFloat(property.registrationCharges || "0");
            const profitLoss = parseFloat(property.salePrice || "0") - totalCost;
            return (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-destructive mb-3">Sold</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Sale Price</p>
                      <p className="text-lg font-semibold">{formatCurrency(property.salePrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sale Date</p>
                      <p className="text-sm font-medium">{formatDate(property.saleDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Buyer</p>
                      <p className="text-sm font-medium">{property.buyer || "\u2014"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Profit / Loss</p>
                      <p className={cn("text-lg font-semibold", profitLoss >= 0 ? "text-success" : "text-destructive")}>
                        {profitLoss >= 0 ? "+" : ""}{formatCurrency(profitLoss)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

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

          {/* Registration Details */}
          {(property.stampDuty || property.registrationCharges) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.stampDuty && (
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Stamp Duty</p>
                    <p className="text-lg font-semibold mt-1">{formatCurrency(property.stampDuty)}</p>
                  </CardContent>
                </Card>
              )}
              {property.registrationCharges && (
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Registration Charges</p>
                    <p className="text-lg font-semibold mt-1">{formatCurrency(property.registrationCharges)}</p>
                  </CardContent>
                </Card>
              )}
              {property.purchasePrice && (
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Cost</p>
                    <p className="text-lg font-semibold mt-1">
                      {formatCurrency(
                        parseFloat(property.purchasePrice || "0") +
                        parseFloat(property.stampDuty || "0") +
                        parseFloat(property.registrationCharges || "0")
                      )}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

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
            {property.dastavejNo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText size={14} />
                <span>Dastavej No: {property.dastavejNo}</span>
              </div>
            )}
            {property.registrationDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>Registered: {formatDate(property.registrationDate)}</span>
              </div>
            )}
          </div>

          {/* Net Income Summary */}
          {chartData && (
            <Card>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Total Income
                    </p>
                    <p className={cn("text-lg font-semibold mt-1", chartData.summary.totalIncome > 0 && "text-success")}>
                      {formatCurrency(chartData.summary.totalIncome)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Total Expenses
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      {formatCurrency(chartData.summary.totalExpenses)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Net Income
                    </p>
                    <p
                      className={cn(
                        "text-lg font-semibold mt-1",
                        chartData.summary.netIncome >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {formatCurrency(chartData.summary.netIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Income vs Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Monthly trends over last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const areaData = chartData
                  ? chartData.monthlyIncome.map((inc, i) => ({
                      month: inc.month,
                      income: inc.amount,
                      expenses: chartData.monthlyExpenses[i]?.amount ?? 0,
                    }))
                  : [];
                const hasData = areaData.some((d) => d.income > 0 || d.expenses > 0);

                if (!hasData) {
                  return (
                    <div className="p-8 text-center text-muted-foreground">
                      <AlertCircle className="mx-auto mb-2" size={24} />
                      <p>No data yet. Add income and bills to see trends.</p>
                    </div>
                  );
                }

                return (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={areaData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                      <defs>
                        <linearGradient id="propIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="propExpenseGrad" x1="0" y1="0" x2="0" y2="1">
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
                        fill="url(#propIncomeGrad)"
                        strokeWidth={2}
                        name="income"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="var(--color-destructive)"
                        fill="url(#propExpenseGrad)"
                        strokeWidth={2}
                        name="expenses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                );
              })()}
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
                <ResponsiveContainer width="100%" height={280}>
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
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => { resetDocForm(); setShowAddDoc(true); }}>
              <Upload size={14} className="mr-1.5" />
              Upload Document
            </Button>
          </div>
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

        {/* Remarks Tab */}
        <Tabs.Content value="remarks" className="pt-6 space-y-6">
          {/* Add remark form */}
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              value={remarkContent}
              onChange={(e) => setRemarkContent(e.target.value)}
              rows={3}
              placeholder="Add a remark... (value update, construction note, event)"
              className={cn(textareaClassName, "mt-0 flex-1")}
            />
            <div className="flex sm:items-end">
              <Button
                variant="default"
                size="sm"
                disabled={!remarkContent.trim() || addingRemark}
                onClick={async () => {
                  setAddingRemark(true);
                  try {
                    const res = await fetch(`/api/properties/${id}/remarks`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ content: remarkContent.trim() }),
                    });
                    if (!res.ok) throw new Error();
                    toast.success("Remark added");
                    setRemarkContent("");
                    loadData();
                  } catch {
                    toast.error("Failed to add remark");
                  } finally {
                    setAddingRemark(false);
                  }
                }}
              >
                {addingRemark ? "Adding..." : "Add Remark"}
              </Button>
            </div>
          </div>

          {/* Timeline */}
          {remarks.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No remarks yet"
              description="Add notes about value changes, construction, events, or anything worth tracking."
            />
          ) : (
            <div className="border-l-2 border-border ml-4 pl-4 space-y-4">
              {remarks.map((remark) => (
                <Card key={remark.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {remark.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(remark.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(remark.createdAt).toLocaleTimeString("en-IN", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={async () => {
                          if (!confirm("Delete this remark?")) return;
                          try {
                            const res = await fetch(
                              `/api/properties/${id}/remarks?remarkId=${remark.id}`,
                              { method: "DELETE" }
                            );
                            if (!res.ok) throw new Error();
                            toast.success("Remark deleted");
                            loadData();
                          } catch {
                            toast.error("Failed to delete remark");
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>

      {/* Add Bill Modal — Split View with AI Scan */}
      <Modal open={showAddBill} onClose={() => { setShowAddBill(false); setScanPreview(null); setScanComplete(false); }} title="Add Bill" wide>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left panel: Upload/Scan area */}
          <div className="md:w-[280px] shrink-0 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles size={16} className="text-primary" />
              AI Bill Scanner
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a bill photo and AI will fill the form automatically.
            </p>

            {!scanPreview ? (
              <label className="block border-2 border-dashed border-border rounded-[var(--radius)] p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Camera className="mx-auto mb-2 text-muted-foreground" size={28} />
                <p className="text-sm text-muted-foreground">
                  Click to upload bill image
                </p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or PDF</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBillScan(file);
                  }}
                  disabled={scanning}
                />
              </label>
            ) : (
              <div className="space-y-3">
                {/* Image preview */}
                <div className="border border-border rounded-[var(--radius)] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scanPreview}
                    alt="Bill preview"
                    className="w-full h-40 object-cover"
                  />
                </div>

                {/* Status indicator */}
                {scanning && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    AI extracting...
                  </div>
                )}
                {scanComplete && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 size={16} />
                    Fields auto-filled
                  </div>
                )}

                {/* Re-upload option */}
                <label className="block text-center cursor-pointer">
                  <p className="text-xs text-primary hover:underline">Upload different image</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBillScan(file);
                    }}
                    disabled={scanning}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Right panel: Bill form */}
          <div className="flex-1 min-w-0">
            <form onSubmit={handleAddBill} className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Bill Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={billForm.category}
                      onChange={(e) => setBillForm((f) => ({ ...f, category: e.target.value }))}
                      className={selectClassName}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount *</label>
                    <Input
                      type="number"
                      required
                      value={billForm.amount}
                      onChange={(e) => setBillForm((f) => ({ ...f, amount: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                  <div>
                    <label className="text-sm font-medium">Vendor</label>
                    <Input
                      value={billForm.vendor}
                      onChange={(e) => setBillForm((f) => ({ ...f, vendor: e.target.value }))}
                      className="mt-1"
                      placeholder="e.g. Torrent Power"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reference #</label>
                    <Input
                      value={billForm.referenceNumber}
                      onChange={(e) => setBillForm((f) => ({ ...f, referenceNumber: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Dates & Status</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={billForm.dueDate}
                      onChange={(e) => setBillForm((f) => ({ ...f, dueDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Paid Date</label>
                    <Input
                      type="date"
                      value={billForm.paidDate}
                      onChange={(e) => setBillForm((f) => ({ ...f, paidDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={billForm.isPaid}
                        onChange={(e) => setBillForm((f) => ({ ...f, isPaid: e.target.checked }))}
                        className="rounded"
                      />
                      Paid
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Notes</p>
                <textarea
                  value={billForm.notes}
                  onChange={(e) => setBillForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className={textareaClassName}
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <Button type="button" variant="outline" onClick={() => { setShowAddBill(false); setScanPreview(null); setScanComplete(false); }}>
                  Cancel
                </Button>
                <Button type="submit" variant="default">
                  Add Bill
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      {/* Record Income Modal */}
      <Modal open={showAddIncome} onClose={() => setShowAddIncome(false)} title="Record Rental Payment">
        <form onSubmit={handleAddIncome} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Payment Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium">Month</label>
                <select
                  value={incomeForm.month}
                  onChange={(e) => setIncomeForm((f) => ({ ...f, month: e.target.value }))}
                  className={selectClassName}
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Year</label>
                <Input
                  type="number"
                  value={incomeForm.year}
                  onChange={(e) => setIncomeForm((f) => ({ ...f, year: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
              <div>
                <label className="text-sm font-medium">Amount *</label>
                <Input
                  type="number"
                  required
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm((f) => ({ ...f, amount: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tenant</label>
                <Input
                  value={incomeForm.tenantName}
                  onChange={(e) => setIncomeForm((f) => ({ ...f, tenantName: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Date & Status</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium">Received Date</label>
                <Input
                  type="date"
                  value={incomeForm.receivedDate}
                  onChange={(e) => setIncomeForm((f) => ({ ...f, receivedDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={incomeForm.isReceived}
                    onChange={(e) => setIncomeForm((f) => ({ ...f, isReceived: e.target.checked }))}
                    className="rounded"
                  />
                  Received
                </label>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Notes</p>
            <textarea
              value={incomeForm.notes}
              onChange={(e) => setIncomeForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className={textareaClassName}
            />
          </div>

          <div className="flex gap-3 justify-end pt-3">
            <Button type="button" variant="outline" onClick={() => setShowAddIncome(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mark as Sold Modal */}
      <Modal open={showSale} onClose={() => setShowSale(false)} title="Mark Property as Sold">
        <form onSubmit={handleMarkAsSold} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sale Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium">Sale Price (&#8377;) *</label>
                <Input
                  type="number"
                  required
                  value={saleForm.salePrice}
                  onChange={(e) => setSaleForm((f) => ({ ...f, salePrice: e.target.value }))}
                  className="mt-1"
                  placeholder="e.g. 5000000"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sale Date</label>
                <Input
                  type="date"
                  value={saleForm.saleDate}
                  onChange={(e) => setSaleForm((f) => ({ ...f, saleDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="text-sm font-medium">Buyer</label>
                <Input
                  value={saleForm.buyer}
                  onChange={(e) => setSaleForm((f) => ({ ...f, buyer: e.target.value }))}
                  className="mt-1"
                  placeholder="Name of the buyer (optional)"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3">
            <Button type="button" variant="outline" onClick={() => setShowSale(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={submittingSale}>
              {submittingSale ? "Saving..." : "Mark as Sold"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal open={showAddDoc} onClose={() => { setShowAddDoc(false); resetDocForm(); }} title="Upload Document">
        <form onSubmit={handleAddDoc} className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Document Details</p>
            <div className="mt-5">
              <label className="text-sm font-medium">File *</label>
              <Input
                type="file"
                required
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
                className="mt-1"
              />
              {docFileName && docFile && (
                <div className="mt-1.5 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {docFileName} ({formatFileSize(docFile.fileSize)})
                  </p>
                  {/* AI Scan option for images and PDFs */}
                  {docFile.mimeType && (docFile.mimeType.startsWith("image/") || docFile.mimeType === "application/pdf") && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDocAiScan}
                        disabled={docScanning}
                        className="gap-2"
                      >
                        {docScanning ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            AI Scan
                          </>
                        )}
                      </Button>
                      {docAiResult && (
                        <p className="text-xs text-primary font-medium">{docAiResult}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Max 10MB. Images, PDFs, and documents accepted.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
              <div>
                <label className="text-sm font-medium">Document Name *</label>
                <Input
                  required
                  value={docForm.name}
                  onChange={(e) => setDocForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1"
                  placeholder="e.g. Sale Deed 2024"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Document Type</label>
                <select
                  value={docForm.type}
                  onChange={(e) => setDocForm((f) => ({ ...f, type: e.target.value }))}
                  className={selectClassName}
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3">
            <Button type="button" variant="outline" onClick={() => { setShowAddDoc(false); resetDocForm(); }}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={uploading || !docFile}>
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
