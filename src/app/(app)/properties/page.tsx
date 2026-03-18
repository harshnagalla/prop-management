"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus, Pencil, Trash2, Search, Home, Factory, Landmark, TreePine, Layers, LayoutGrid, List, Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { formatCurrency, formatPercent, calcRentalYield } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { toast } from "@/lib/utils/toast";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/lib/db/schema";

const PROPERTY_TYPES = ["residential", "commercial", "industrial", "land", "mixed"] as const;
const STATUSES = ["occupied", "vacant", "under_renovation", "for_sale", "sold"] as const;

const selectClassName =
  "mt-1 w-full bg-transparent border border-border rounded-[var(--radius)] h-9 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const textareaClassName =
  "mt-1 w-full bg-transparent border border-border rounded-[var(--radius)] px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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

function PropertyForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Property>;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    address: initial?.address || "",
    city: initial?.city || "Ahmedabad",
    type: initial?.type || "residential",
    status: initial?.status || "vacant",
    purchasePrice: initial?.purchasePrice || "",
    purchaseDate: initial?.purchaseDate
      ? new Date(initial.purchaseDate).toISOString().split("T")[0]
      : "",
    currentValue: initial?.currentValue || "",
    area: initial?.area || "",
    areaUnit: initial?.areaUnit || "sqft",
    monthlyRent: initial?.monthlyRent || "",
    tenantName: initial?.tenantName || "",
    notes: initial?.notes || "",
    dastavejNo: initial?.dastavejNo || "",
    registrationDate: initial?.registrationDate
      ? new Date(initial.registrationDate).toISOString().split("T")[0]
      : "",
    stampDuty: initial?.stampDuty || "",
    registrationCharges: initial?.registrationCharges || "",
    ownership: initial?.ownership || "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...form,
          purchasePrice: form.purchasePrice || null,
          currentValue: form.currentValue || null,
          area: form.area || null,
          monthlyRent: form.monthlyRent || null,
          purchaseDate: form.purchaseDate || null,
          tenantName: form.tenantName || null,
          notes: form.notes || null,
          dastavejNo: form.dastavejNo || null,
          registrationDate: form.registrationDate || null,
          stampDuty: form.stampDuty || null,
          registrationCharges: form.registrationCharges || null,
          ownership: form.ownership || null,
        });
      }}
      className="space-y-5"
    >
      {/* Basic Info */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Basic Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="col-span-1 sm:col-span-2">
            <label className="text-sm font-medium">Name *</label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              className="mt-1"
              placeholder="e.g. Bodakdev Flat 301"
            />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="text-sm font-medium">Address *</label>
            <Input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">City</label>
            <Input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Type</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className={selectClassName}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className={selectClassName}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Area</label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
              />
              <select
                value={form.areaUnit}
                onChange={(e) => set("areaUnit", e.target.value)}
                className="bg-transparent border border-border rounded-[var(--radius)] h-9 px-2 text-sm text-foreground w-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <option value="sqft">sqft</option>
                <option value="sqm">sqm</option>
                <option value="sqyd">sqyd</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Info */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Financial Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium">Purchase Price (&#8377;)</label>
            <Input
              type="number"
              value={form.purchasePrice}
              onChange={(e) => set("purchasePrice", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Current Value (&#8377;)</label>
            <Input
              type="number"
              value={form.currentValue}
              onChange={(e) => set("currentValue", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Purchase Date</label>
            <Input
              type="date"
              value={form.purchaseDate}
              onChange={(e) => set("purchaseDate", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Monthly Rent (&#8377;)</label>
            <Input
              type="number"
              value={form.monthlyRent}
              onChange={(e) => set("monthlyRent", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Registration & Legal */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Registration & Legal</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium">Dastavej No.</label>
            <Input
              value={form.dastavejNo}
              onChange={(e) => set("dastavejNo", e.target.value)}
              className="mt-1"
              placeholder="e.g. 1870/2006"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Registration Date</label>
            <Input
              type="date"
              value={form.registrationDate}
              onChange={(e) => set("registrationDate", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Stamp Duty (&#8377;)</label>
            <Input
              type="number"
              value={form.stampDuty}
              onChange={(e) => set("stampDuty", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Registration Charges (&#8377;)</label>
            <Input
              type="number"
              value={form.registrationCharges}
              onChange={(e) => set("registrationCharges", e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="text-sm font-medium">Ownership</label>
            <Input
              value={form.ownership}
              onChange={(e) => set("ownership", e.target.value)}
              className="mt-1"
              placeholder="e.g. 50% Siva, 50% NMP"
            />
          </div>
        </div>
      </div>

      {/* Tenant Info */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tenant & Notes</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium">Tenant Name</label>
            <Input
              value={form.tenantName}
              onChange={(e) => set("tenantName", e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className={textareaClassName}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="default">
          {initial ? "Update" : "Add Property"}
        </Button>
      </div>
    </form>
  );
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = properties.filter((p) => {
    const matchesSearch = search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase()) ||
      (p.city || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || p.type === filterType;
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filtersActive = search !== "" || filterType !== "all" || filterStatus !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterStatus("all");
  };

  const load = () => {
    fetch("/api/properties")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load properties");
        return r.json();
      })
      .then(setProperties)
      .catch(() => toast.error("Failed to load properties"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save property");
      toast.success("Property added");
      setShowAdd(false);
      load();
    } catch {
      toast.error("Failed to save property");
    }
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/properties/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update property");
      toast.success("Property updated");
      setEditing(null);
      load();
    } catch {
      toast.error("Failed to update property");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property and all its bills/documents?")) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete property");
      toast.success("Property deleted");
      load();
    } catch {
      toast.error("Failed to delete property");
    }
  };

  // Status tab counts
  const statusCounts = {
    all: properties.length,
    occupied: properties.filter((p) => p.status === "occupied").length,
    vacant: properties.filter((p) => p.status === "vacant").length,
    for_sale: properties.filter((p) => p.status === "for_sale").length,
    sold: properties.filter((p) => p.status === "sold").length,
  };

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  function getPropertyIcon(type: string | null) {
    switch (type) {
      case "residential": return Home;
      case "commercial": return Factory;
      case "industrial": return Factory;
      case "land": return TreePine;
      case "mixed": return Layers;
      default: return Building2;
    }
  }

  function getPropertyColor(type: string | null) {
    switch (type) {
      case "residential": return "bg-blue-50 text-blue-600";
      case "commercial": return "bg-amber-50 text-amber-600";
      case "industrial": return "bg-slate-100 text-slate-600";
      case "land": return "bg-green-50 text-green-600";
      case "mixed": return "bg-purple-50 text-purple-600";
      default: return "bg-primary/5 text-primary";
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 pt-12 md:pt-0 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-9 w-44 bg-muted rounded-[var(--radius)]" />
          <div className="h-10 w-44 bg-muted rounded-[var(--radius)]" />
        </div>
        <div className="h-12 bg-muted rounded-[var(--radius)]" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-[var(--radius)] overflow-hidden">
              <div className="h-40 bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-40 bg-muted rounded" />
                <div className="h-3 w-56 bg-muted rounded" />
                <div className="h-5 w-20 bg-muted rounded-full" />
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Properties</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = "/import"} className="gap-2">
            <Upload size={16} /> <span className="hidden sm:inline">Import</span>
          </Button>
          <Button onClick={() => setShowAdd(true)} className="gap-2">
            <Plus size={16} /> <span className="hidden sm:inline">Add Property</span>
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      {properties.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status tabs */}
              <div className="flex gap-1 overflow-x-auto">
                {[
                  { key: "all", label: "All" },
                  { key: "occupied", label: "Occupied" },
                  { key: "vacant", label: "Vacant" },
                  { key: "for_sale", label: "For Sale" },
                  { key: "sold", label: "Sold" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterStatus(tab.key)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                      filterStatus === tab.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {tab.label} ({statusCounts[tab.key as keyof typeof statusCounts] || 0})
                  </button>
                ))}
              </div>

              {/* Search + view toggle */}
              <div className="flex gap-2 items-center">
                <div className="relative w-full md:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search by name, address..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="hidden md:flex border border-border rounded-[var(--radius)] overflow-hidden shrink-0">
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property cards */}
      {properties.length === 0 ? (
        <div className="py-4 space-y-6">
          {/* Import section */}
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
                <FileSpreadsheet size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Import your property sheet</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                Drop your CSV or Excel file and we&apos;ll import all properties instantly. Detects multi-unit buildings automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <Button onClick={() => window.location.href = "/import"} className="gap-2">
                  <Upload size={16} /> Import from CSV / Excel
                </Button>
                <Button variant="outline" onClick={() => setShowAdd(true)} className="gap-2">
                  <Plus size={16} /> Add Manually
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={Building2}
            title="No properties match filters"
            description="Try adjusting your search or filter criteria"
            action={
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            }
          />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((p) => {
            const Icon = getPropertyIcon(p.type);
            const colorClass = getPropertyColor(p.type);
            const yld = calcRentalYield(p.monthlyRent, p.currentValue);
            return (
              <Link key={p.id} href={`/properties/${p.id}`} className="group">
                <Card className="overflow-hidden transition-shadow hover:shadow-[var(--shadow-card-hover)]">
                  {/* Compact header with icon + name */}
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
                        <Icon size={20} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                          {p.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.address}{p.city ? `, ${p.city}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={getStatusBadgeVariant(p.status || "vacant")}>
                        {p.status?.replace("_", " ")}
                      </Badge>
                      {p.type && (
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                          {p.type}
                        </Badge>
                      )}
                      {p.ownership && (
                        <Badge variant="outline" className="text-[10px]">
                          {p.ownership}
                        </Badge>
                      )}
                    </div>

                    {/* Key numbers — compact row */}
                    <div className="flex items-center gap-3 text-xs pt-1">
                      <span className="font-bold text-sm">{formatCurrency(p.currentValue || p.purchasePrice)}</span>
                      {p.monthlyRent && (
                        <span className="text-muted-foreground">{formatCurrency(p.monthlyRent)}/mo</span>
                      )}
                      {yld > 0 && (
                        <span className={cn("font-semibold", yld > 5 ? "text-success" : yld > 3 ? "text-foreground" : "text-warning")}>
                          {formatPercent(yld)}
                        </span>
                      )}
                    </div>

                    {/* Total cost line */}
                    {(p.stampDuty || p.registrationCharges) && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                        <span className="text-muted-foreground">Total Cost</span>
                        <span className="font-bold text-primary">
                          {formatCurrency(parseFloat(p.purchasePrice || "0") + parseFloat(p.stampDuty || "0") + parseFloat(p.registrationCharges || "0"))}
                        </span>
                      </div>
                    )}

                    {/* Extra info */}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      {p.dastavejNo && <span>Dastavej: {p.dastavejNo}</span>}
                      {p.tenantName && <span>Tenant: {p.tenantName}</span>}
                    </div>
                  </CardContent>

                  {/* Actions bar */}
                  <div className="px-5 pb-4 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.preventDefault(); setEditing(p); }}
                      className="h-8 w-8"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.preventDefault(); handleDelete(p.id); }}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="space-y-3">
          {filtered.map((p) => {
            const yld = calcRentalYield(p.monthlyRent, p.currentValue);
            const Icon = getPropertyIcon(p.type);
            const colorClass = getPropertyColor(p.type);
            return (
              <Link key={p.id} href={`/properties/${p.id}`} className="group block">
                <Card className="transition-shadow hover:shadow-[var(--shadow-card-hover)]">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn("w-14 h-14 rounded-[var(--radius)] flex items-center justify-center shrink-0", colorClass)}>
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{p.name}</h3>
                        <Badge variant={getStatusBadgeVariant(p.status || "vacant")} className="shrink-0">
                          {p.status?.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {p.address}{p.city ? `, ${p.city}` : ""}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 text-sm shrink-0">
                      {p.currentValue && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Value</p>
                          <p className="font-semibold">{formatCurrency(p.currentValue)}</p>
                        </div>
                      )}
                      {p.monthlyRent && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Rent/mo</p>
                          <p className="font-semibold">{formatCurrency(p.monthlyRent)}</p>
                        </div>
                      )}
                      {yld > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Yield</p>
                          <p className={cn("font-semibold", yld > 5 ? "text-success" : yld > 3 ? "text-foreground" : "text-warning")}>
                            {formatPercent(yld)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); setEditing(p); }} className="h-8 w-8">
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); handleDelete(p.id); }} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Property"
      >
        <PropertyForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Property"
      >
        {editing && (
          <PropertyForm
            initial={editing}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
