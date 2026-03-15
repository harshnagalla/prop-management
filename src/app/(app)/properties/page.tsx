"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
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
const STATUSES = ["occupied", "vacant", "under_renovation", "for_sale"] as const;

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
        });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-1 sm:col-span-2">
          <label className="text-sm text-muted-foreground">Name *</label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className="mt-1"
            placeholder="e.g. Bodakdev Flat 301"
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label className="text-sm text-muted-foreground">Address *</label>
          <Input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">City</label>
          <Input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Type</label>
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
          <label className="text-sm text-muted-foreground">Status</label>
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
          <label className="text-sm text-muted-foreground">Purchase Price (&#8377;)</label>
          <Input
            type="number"
            value={form.purchasePrice}
            onChange={(e) => set("purchasePrice", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Current Value (&#8377;)</label>
          <Input
            type="number"
            value={form.currentValue}
            onChange={(e) => set("currentValue", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Purchase Date</label>
          <Input
            type="date"
            value={form.purchaseDate}
            onChange={(e) => set("purchaseDate", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Area</label>
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
        <div>
          <label className="text-sm text-muted-foreground">Monthly Rent (&#8377;)</label>
          <Input
            type="number"
            value={form.monthlyRent}
            onChange={(e) => set("monthlyRent", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Tenant Name</label>
          <Input
            value={form.tenantName}
            onChange={(e) => set("tenantName", e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label className="text-sm text-muted-foreground">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className={textareaClassName}
          />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
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

  if (loading) {
    return (
      <div className="space-y-6 pt-12 md:pt-0 animate-pulse">
        <div className="flex items-center justify-between">
          <div><div className="h-8 w-40 bg-muted rounded-[var(--radius)]" /><div className="h-4 w-56 bg-muted rounded mt-2" /></div>
          <div className="h-10 w-36 bg-muted rounded-[var(--radius)]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-[var(--radius)] p-5 space-y-4">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {properties.length} properties in portfolio
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} variant="default">
          <Plus size={16} className="mr-2" /> Add Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Add your first property to start tracking your portfolio"
          action={
            <Button onClick={() => setShowAdd(true)} variant="default">
              Add Property
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => {
            const yld = calcRentalYield(p.monthlyRent, p.currentValue);
            return (
              <Card key={p.id}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{p.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {p.address}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(p.status || "vacant")}>
                      {p.status?.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Value</p>
                      <p className="font-medium">
                        {formatCurrency(p.currentValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Purchased</p>
                      <p className="font-medium">
                        {formatCurrency(p.purchasePrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Rent/mo</p>
                      <p className="font-medium">
                        {p.monthlyRent
                          ? formatCurrency(p.monthlyRent)
                          : "\u2014"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Yield</p>
                      <p
                        className={cn(
                          "font-medium",
                          yld > 5
                            ? "text-success"
                            : yld > 3
                            ? "text-foreground"
                            : "text-warning"
                        )}
                      >
                        {yld > 0 ? formatPercent(yld) : "\u2014"}
                      </p>
                    </div>
                  </div>

                  {p.tenantName && (
                    <p className="text-xs text-muted-foreground">
                      Tenant: {p.tenantName}
                    </p>
                  )}

                  <div className="flex gap-1 pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing(p)}
                      className="h-8 w-8"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(p.id)}
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
