"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatPercent, calcRentalYield } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import type { Property } from "@/lib/db/schema";

const PROPERTY_TYPES = ["residential", "commercial", "industrial", "land", "mixed"] as const;
const STATUSES = ["occupied", "vacant", "under_renovation", "for_sale"] as const;

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
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm text-muted-foreground">Name *</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. Bodakdev Flat 301"
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm text-muted-foreground">Address *</label>
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            required
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">City</label>
          <input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Type</label>
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
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
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Purchase Price (₹)</label>
          <input
            type="number"
            value={form.purchasePrice}
            onChange={(e) => set("purchasePrice", e.target.value)}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Current Value (₹)</label>
          <input
            type="number"
            value={form.currentValue}
            onChange={(e) => set("currentValue", e.target.value)}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Purchase Date</label>
          <input
            type="date"
            value={form.purchaseDate}
            onChange={(e) => set("purchaseDate", e.target.value)}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Area</label>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={form.areaUnit}
              onChange={(e) => set("areaUnit", e.target.value)}
              className="bg-muted border border-border rounded-lg px-2 py-2 text-sm w-24"
            >
              <option value="sqft">sqft</option>
              <option value="sqm">sqm</option>
              <option value="sqyd">sqyd</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Monthly Rent (₹)</label>
          <input
            type="number"
            value={form.monthlyRent}
            onChange={(e) => set("monthlyRent", e.target.value)}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Tenant Name</label>
          <input
            value={form.tenantName}
            onChange={(e) => set("tenantName", e.target.value)}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm text-muted-foreground">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          {initial ? "Update" : "Add Property"}
        </button>
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
      .then((r) => r.json())
      .then(setProperties)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (data: Record<string, unknown>) => {
    await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowAdd(false);
    load();
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editing) return;
    await fetch(`/api/properties/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property and all its bills/documents?")) return;
    await fetch(`/api/properties/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-xl" />;
  }

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {properties.length} properties in portfolio
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
        >
          <Plus size={16} /> Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Add your first property to start tracking your portfolio"
          action={
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
            >
              Add Property
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => {
            const yld = calcRentalYield(p.monthlyRent, p.currentValue);
            return (
              <div
                key={p.id}
                className="bg-card border border-border rounded-xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.address}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      p.status === "occupied"
                        ? "bg-accent/10 text-accent"
                        : p.status === "vacant"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {p.status?.replace("_", " ")}
                  </span>
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
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Yield</p>
                    <p
                      className={cn(
                        "font-medium",
                        yld > 5
                          ? "text-accent"
                          : yld > 3
                          ? "text-foreground"
                          : "text-warning"
                      )}
                    >
                      {yld > 0 ? formatPercent(yld) : "—"}
                    </p>
                  </div>
                </div>

                {p.tenantName && (
                  <p className="text-xs text-muted-foreground">
                    Tenant: {p.tenantName}
                  </p>
                )}

                <div className="flex gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => setEditing(p)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
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
