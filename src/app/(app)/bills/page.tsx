"use client";

import { useEffect, useState } from "react";
import { Receipt, Plus, Upload, Pencil, Trash2, Search, LayoutGrid, List, Zap, Droplets, Landmark, Wrench, Shield, Hammer, Scale, MoreHorizontal } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { toast } from "@/lib/utils/toast";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/lib/db/schema";

const CATEGORIES = [
  "electricity",
  "water",
  "municipal_tax",
  "maintenance",
  "insurance",
  "repair",
  "legal",
  "other",
] as const;

const selectClassName =
  "mt-1 w-full bg-transparent border border-border rounded-[var(--radius)] h-9 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const textareaClassName =
  "mt-1 w-full bg-transparent border border-border rounded-[var(--radius)] px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface BillWithProperty {
  id: string;
  propertyId: string;
  category: string;
  amount: string;
  dueDate: string | null;
  paidDate: string | null;
  isPaid: boolean;
  vendor: string | null;
  referenceNumber: string | null;
  notes: string | null;
  propertyName: string | null;
  createdAt: string;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "electricity": return Zap;
    case "water": return Droplets;
    case "municipal_tax": return Landmark;
    case "maintenance": return Wrench;
    case "insurance": return Shield;
    case "repair": return Hammer;
    case "legal": return Scale;
    default: return MoreHorizontal;
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case "electricity": return "bg-amber-400";
    case "water": return "bg-blue-400";
    case "municipal_tax": return "bg-purple-400";
    case "maintenance": return "bg-slate-400";
    case "insurance": return "bg-emerald-400";
    case "repair": return "bg-orange-400";
    case "legal": return "bg-rose-400";
    default: return "bg-gray-400";
  }
}

function getCategoryIconColor(category: string) {
  switch (category) {
    case "electricity": return "bg-amber-50 text-amber-600";
    case "water": return "bg-blue-50 text-blue-600";
    case "municipal_tax": return "bg-purple-50 text-purple-600";
    case "maintenance": return "bg-slate-100 text-slate-600";
    case "insurance": return "bg-emerald-50 text-emerald-600";
    case "repair": return "bg-orange-50 text-orange-600";
    case "legal": return "bg-rose-50 text-rose-600";
    default: return "bg-gray-50 text-gray-600";
  }
}

function BillForm({
  initial,
  properties,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: Partial<BillWithProperty>;
  properties: Property[];
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState({
    propertyId: initial?.propertyId || "",
    category: initial?.category || "electricity",
    amount: initial?.amount || "",
    dueDate: initial?.dueDate
      ? new Date(initial.dueDate).toISOString().split("T")[0]
      : "",
    paidDate: initial?.paidDate
      ? new Date(initial.paidDate).toISOString().split("T")[0]
      : "",
    isPaid: initial?.isPaid || false,
    vendor: initial?.vendor || "",
    referenceNumber: initial?.referenceNumber || "",
    notes: initial?.notes || "",
  });

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          propertyId: form.propertyId,
          category: form.category,
          amount: form.amount,
          dueDate: form.dueDate || null,
          paidDate: form.paidDate || null,
          isPaid: form.isPaid,
          vendor: form.vendor || null,
          referenceNumber: form.referenceNumber || null,
          notes: form.notes || null,
        });
      }}
      className="space-y-5"
    >
      {/* Bill Details */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Bill Details</p>
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium">Property *</label>
            <select
              required
              value={form.propertyId}
              onChange={(e) => set("propertyId", e.target.value)}
              className={selectClassName}
            >
              <option value="">Select property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
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
              <label className="text-sm font-medium">Amount (*) *</label>
              <Input
                type="number"
                required
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium">Vendor</label>
              <Input
                value={form.vendor}
                onChange={(e) => set("vendor", e.target.value)}
                className="mt-1"
                placeholder="e.g. Torrent Power"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reference #</label>
              <Input
                value={form.referenceNumber}
                onChange={(e) => set("referenceNumber", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dates & Status */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Dates & Status</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium">Due Date</label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Paid Date</label>
            <Input
              type="date"
              value={form.paidDate}
              onChange={(e) => set("paidDate", e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isPaid}
                onChange={(e) => set("isPaid", e.target.checked)}
                className="rounded"
              />
              Paid
            </label>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Notes</p>
        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className={textareaClassName}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="default">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

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
        {active && (currentDir === "asc" ? " \u2191" : " \u2193")}
      </span>
    </th>
  );
}

export default function BillsPage() {
  const [bills, setBills] = useState<BillWithProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<BillWithProperty | null>(null);
  const [showScan, setShowScan] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<Record<string, unknown> | null>(null);
  const [addFormData, setAddFormData] = useState<Partial<BillWithProperty>>({});
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProperty, setFilterProperty] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = bills.filter((b) => {
    const matchesSearch = search === "" ||
      (b.vendor || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.propertyName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.referenceNumber || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "all" || b.category === filterCategory;
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "paid" ? b.isPaid : !b.isPaid);
    const matchesProperty = filterProperty === "all" || b.propertyId === filterProperty;
    return matchesSearch && matchesCategory && matchesStatus && matchesProperty;
  });

  const filtersActive = search !== "" || filterCategory !== "all" || filterStatus !== "all" || filterProperty !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterCategory("all");
    setFilterStatus("all");
    setFilterProperty("all");
  };

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const aRaw = a[sortKey as keyof BillWithProperty];
    const bRaw = b[sortKey as keyof BillWithProperty];
    let aVal: string | number | boolean | null = aRaw ?? "";
    let bVal: string | number | boolean | null = bRaw ?? "";
    if (typeof aVal === "string" && !isNaN(parseFloat(aVal)) && aVal !== "") {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal as string);
    }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Status counts
  const statusCounts = {
    all: bills.length,
    paid: bills.filter((b) => b.isPaid).length,
    unpaid: bills.filter((b) => !b.isPaid).length,
  };

  const load = () => {
    Promise.all([
      fetch("/api/bills").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
      fetch("/api/properties").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
    ])
      .then(([b, p]) => {
        setBills(b);
        setProperties(p);
      })
      .catch(() => toast.error("Failed to load bills"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Bill added");
      setShowAdd(false);
      setAddFormData({});
      load();
    } catch {
      toast.error("Failed to save bill");
    }
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/bills/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Bill updated");
      setEditing(null);
      load();
    } catch {
      toast.error("Failed to update bill");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bill? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/bills/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Bill deleted");
      load();
    } catch {
      toast.error("Failed to delete bill");
    }
  };

  const handleScan = async (file: File) => {
    setScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
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
        const data = await res.json();
        setScanResult(data);

        const scanned: Partial<BillWithProperty> = {
          amount: String(data.amount || ""),
          category: data.category || "electricity",
          vendor: data.vendor || "",
          referenceNumber: data.referenceNumber || "",
          dueDate: data.date || "",
        };

        // Try to match property
        if (data.propertyHint && properties.length > 0) {
          const hint = data.propertyHint.toLowerCase();
          const match = properties.find(
            (p) =>
              p.address.toLowerCase().includes(hint) ||
              p.name.toLowerCase().includes(hint) ||
              hint.includes(p.name.toLowerCase())
          );
          if (match) {
            scanned.propertyId = match.id;
          }
        }

        setAddFormData(scanned);
        setShowScan(false);
        setShowAdd(true);
      } catch {
        toast.error("Failed to scan bill. Please enter manually.");
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-12 md:pt-0 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-28 bg-muted rounded-[var(--radius)]" />
            <div className="h-4 w-52 bg-muted rounded mt-3" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-muted rounded-[var(--radius)]" />
            <div className="h-10 w-28 bg-muted rounded-[var(--radius)]" />
          </div>
        </div>
        <div className="h-16 bg-muted rounded-[var(--radius)]" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card border border-border rounded-[var(--radius)] overflow-hidden">
              <div className="h-1.5 bg-muted" />
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-[var(--radius)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-7 w-28 bg-muted rounded" />
                <div className="flex gap-4">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
            </div>
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bills</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtersActive
              ? `${filtered.length} of ${bills.length} bills`
              : "Track expenses across properties"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowScan(true)} className="gap-2">
            <Upload size={16} /> <span className="hidden sm:inline">Scan Bill</span>
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setAddFormData({});
              setShowAdd(true);
            }}
            className="gap-2"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add Bill</span>
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      {bills.length > 0 && (
        <div className="space-y-3">
          {/* Status tabs — clean underline style */}
          <div className="flex items-center gap-1">
            <div className="flex gap-4 border-b border-border overflow-x-auto flex-1">
              {[
                { key: "all", label: "All" },
                { key: "paid", label: "Paid" },
                { key: "unpaid", label: "Unpaid" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={cn(
                    "pb-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px",
                    filterStatus === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label} ({statusCounts[tab.key as keyof typeof statusCounts]})
                </button>
              ))}
            </div>
            <div className="flex border border-border rounded-[var(--radius)] overflow-hidden shrink-0 ml-2">
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
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Search + filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative w-full sm:w-56">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search vendor, property..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`${selectClassName} mt-0 w-full sm:w-40`}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
            <select
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
              className={`${selectClassName} mt-0 w-full sm:w-44`}
            >
              <option value="all">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {bills.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={Receipt}
            title="No bills tracked"
            description="Add bills manually or scan them with AI"
            action={
              <Button onClick={() => setShowAdd(true)} variant="default">
                Add Bill
              </Button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={Receipt}
            title="No bills match filters"
            description="Try adjusting your search or filter criteria"
            action={
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            }
          />
        </div>
      ) : viewMode === "grid" ? (
        /* Grid view - bill cards */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sorted.map((b) => {
            const Icon = getCategoryIcon(b.category);
            const iconColor = getCategoryIconColor(b.category);
            const barColor = getCategoryColor(b.category);
            return (
              <Card key={b.id} className="overflow-hidden transition-shadow hover:shadow-[var(--shadow-card-hover)]">
                {/* Category color bar */}
                <div className={cn("h-1.5", barColor)} />

                <CardContent className="p-5 space-y-4">
                  {/* Header: icon + property + badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-10 h-10 rounded-[var(--radius)] flex items-center justify-center shrink-0", iconColor)}>
                        <Icon size={20} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{b.propertyName || "\u2014"}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {b.category.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    {b.isPaid ? (
                      <Badge variant="success" className="shrink-0">Paid</Badge>
                    ) : (
                      <Badge variant="destructive" className="shrink-0">Unpaid</Badge>
                    )}
                  </div>

                  {/* Amount */}
                  <p className="text-2xl font-bold tabular-nums tracking-tight">
                    {formatCurrency(b.amount)}
                  </p>

                  {/* Details */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {b.vendor && (
                      <span className="truncate">{b.vendor}</span>
                    )}
                    {b.vendor && b.dueDate && (
                      <span className="shrink-0">&middot;</span>
                    )}
                    {b.dueDate && (
                      <span className="tabular-nums shrink-0">{formatDate(b.dueDate)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing(b)}
                      className="h-8 w-8"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(b.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <>
          {/* Desktop table (list view) */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <SortHeader label="Property" sortKey="propertyName" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                      <SortHeader label="Category" sortKey="category" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                      <th className="text-left p-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Vendor</th>
                      <SortHeader label="Amount" sortKey="amount" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-right" />
                      <SortHeader label="Due Date" sortKey="dueDate" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                      <SortHeader label="Status" sortKey="isPaid" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} className="text-center" />
                      <th className="text-right p-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((b, idx) => (
                      <tr
                        key={b.id}
                        className={cn(
                          "border-b border-border/50 hover:bg-muted/40 transition-colors",
                          idx % 2 === 1 && "bg-muted/20"
                        )}
                      >
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full shrink-0", getCategoryColor(b.category))} />
                            {b.propertyName || "\u2014"}
                          </div>
                        </td>
                        <td className="p-4 capitalize">
                          {b.category.replace("_", " ")}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {b.vendor || "\u2014"}
                        </td>
                        <td className="p-4 text-right font-medium tabular-nums">
                          {formatCurrency(b.amount)}
                        </td>
                        <td className="p-4 tabular-nums">{formatDate(b.dueDate)}</td>
                        <td className="p-4 text-center">
                          {b.isPaid ? (
                            <Badge variant="success">Paid</Badge>
                          ) : (
                            <Badge variant="destructive">Unpaid</Badge>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditing(b)}
                              className="h-8 w-8"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(b.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile card list (list view on mobile) */}
          <div className="md:hidden space-y-3">
            {sorted.map((b) => {
              const Icon = getCategoryIcon(b.category);
              const iconColor = getCategoryIconColor(b.category);
              return (
                <Card key={b.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-[var(--radius)] flex items-center justify-center shrink-0", iconColor)}>
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{b.propertyName || "\u2014"}</p>
                        {b.isPaid ? (
                          <Badge variant="success" className="shrink-0">Paid</Badge>
                        ) : (
                          <Badge variant="destructive" className="shrink-0">Unpaid</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {b.category.replace("_", " ")}{b.vendor ? ` \u00b7 ${b.vendor}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold tabular-nums">{formatCurrency(b.amount)}</p>
                      {b.dueDate && (
                        <p className="text-xs text-muted-foreground tabular-nums mt-0.5">{formatDate(b.dueDate)}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(b)} className="h-8 w-8">
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Scan Modal */}
      <Modal open={showScan} onClose={() => setShowScan(false)} title="Scan Bill with AI">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a photo or scan of your bill. AI will extract the details automatically.
          </p>
          <label className="block border-2 border-dashed border-border rounded-[var(--radius)] p-6 sm:p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="mx-auto mb-2 text-muted-foreground" size={32} />
            <p className="text-sm text-muted-foreground">
              {scanning ? "Processing..." : "Click to upload or drag a bill image"}
            </p>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleScan(file);
              }}
              disabled={scanning}
            />
          </label>
          {scanning && (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          )}
          {scanResult && (
            <div className="bg-muted rounded-[var(--radius)] p-3 text-xs">
              <p className="font-medium mb-1">AI extracted:</p>
              <pre className="text-muted-foreground overflow-auto">
                {JSON.stringify(scanResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Modal>

      {/* Add Bill Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Bill">
        <BillForm
          initial={addFormData}
          properties={properties}
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          submitLabel="Add Bill"
        />
      </Modal>

      {/* Edit Bill Modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Bill"
      >
        {editing && (
          <BillForm
            initial={editing}
            properties={properties}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
            submitLabel="Update Bill"
          />
        )}
      </Modal>
    </div>
  );
}
