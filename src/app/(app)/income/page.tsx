"use client";

import { useEffect, useState } from "react";
import { IndianRupee, Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import type { Property } from "@/lib/db/schema";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface IncomeEntry {
  id: string;
  propertyId: string;
  amount: string;
  month: number;
  year: number;
  receivedDate: string | null;
  isReceived: boolean;
  tenantName: string | null;
  notes: string | null;
  propertyName: string | null;
}

function IncomeForm({
  initial,
  properties,
  onSubmit,
  onCancel,
  submitLabel,
  onPropertyChange,
}: {
  initial?: Partial<IncomeEntry>;
  properties: Property[];
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  submitLabel: string;
  onPropertyChange?: (id: string, setForm: React.Dispatch<React.SetStateAction<Record<string, string | boolean>>>) => void;
}) {
  const now = new Date();
  const [form, setForm] = useState<Record<string, string | boolean>>({
    propertyId: initial?.propertyId || "",
    amount: initial?.amount || "",
    month: String(initial?.month || now.getMonth() + 1),
    year: String(initial?.year || now.getFullYear()),
    receivedDate: initial?.receivedDate
      ? new Date(initial.receivedDate).toISOString().split("T")[0]
      : now.toISOString().split("T")[0],
    isReceived: initial?.isReceived ?? true,
    tenantName: initial?.tenantName || "",
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
          amount: form.amount,
          month: parseInt(form.month as string),
          year: parseInt(form.year as string),
          receivedDate: (form.receivedDate as string) || null,
          isReceived: form.isReceived,
          tenantName: (form.tenantName as string) || null,
          notes: (form.notes as string) || null,
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="text-sm text-muted-foreground">Property *</label>
        <select
          required
          value={form.propertyId as string}
          onChange={(e) => {
            if (onPropertyChange) {
              onPropertyChange(e.target.value, setForm);
            } else {
              set("propertyId", e.target.value);
            }
          }}
          className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select property</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Month</label>
          <select
            value={form.month as string}
            onChange={(e) => set("month", e.target.value)}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Year</label>
          <input
            type="number"
            value={form.year as string}
            onChange={(e) => set("year", e.target.value)}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Amount (*) *</label>
          <input
            type="number"
            required
            value={form.amount as string}
            onChange={(e) => set("amount", e.target.value)}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Tenant</label>
          <input
            value={form.tenantName as string}
            onChange={(e) => set("tenantName", e.target.value)}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Received Date</label>
          <input
            type="date"
            value={form.receivedDate as string}
            onChange={(e) => set("receivedDate", e.target.value)}
            className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isReceived as boolean}
              onChange={(e) => set("isReceived", e.target.checked)}
              className="rounded"
            />
            Received
          </label>
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Notes</label>
        <textarea
          value={form.notes as string}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
        />
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
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function IncomePage() {
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<IncomeEntry | null>(null);

  const load = () => {
    Promise.all([
      fetch("/api/rental-income").then((r) => r.json()),
      fetch("/api/properties").then((r) => r.json()),
    ]).then(([i, p]) => {
      setIncome(i);
      setProperties(p);
      setLoading(false);
    });
  };

  useEffect(load, []);

  // Auto-fill rent amount when property selected (for add form only)
  const onPropertyChange = (
    id: string,
    setForm: React.Dispatch<React.SetStateAction<Record<string, string | boolean>>>
  ) => {
    const prop = properties.find((p) => p.id === id);
    setForm((f) => ({
      ...f,
      propertyId: id,
      amount: prop?.monthlyRent || f.amount,
      tenantName: prop?.tenantName || f.tenantName,
    }));
  };

  const handleAdd = async (data: Record<string, unknown>) => {
    await fetch("/api/rental-income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowAdd(false);
    load();
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editing) return;
    await fetch(`/api/rental-income/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this income record? This action cannot be undone.")) return;
    await fetch(`/api/rental-income/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  // Group by month/year
  const grouped = income.reduce(
    (acc, entry) => {
      const key = `${entry.year}-${String(entry.month).padStart(2, "0")}`;
      if (!acc[key]) acc[key] = { entries: [], total: 0 };
      acc[key].entries.push(entry);
      acc[key].total += parseFloat(entry.amount);
      return acc;
    },
    {} as Record<string, { entries: IncomeEntry[]; total: number }>
  );

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rental Income</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track rent payments by property
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
        >
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {income.length === 0 ? (
        <EmptyState
          icon={IndianRupee}
          title="No income recorded"
          description="Record rental payments as they come in"
          action={
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
            >
              Record Payment
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([key, group]) => {
              const [year, month] = key.split("-");
              return (
                <div
                  key={key}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">
                      {MONTHS[parseInt(month) - 1]} {year}
                    </h3>
                    <span className="text-sm font-medium text-accent">
                      {formatCurrency(group.total)}
                    </span>
                  </div>
                  <div className="divide-y divide-border/50">
                    {group.entries.map((entry) => (
                      <div key={entry.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{entry.propertyName}</p>
                          {entry.tenantName && (
                            <p className="text-xs text-muted-foreground">
                              {entry.tenantName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              {formatCurrency(entry.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.isReceived ? "Received" : "Pending"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditing(entry)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Add Income Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Record Rental Payment">
        <IncomeForm
          properties={properties}
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          submitLabel="Record Payment"
          onPropertyChange={onPropertyChange}
        />
      </Modal>

      {/* Edit Income Modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Income Record"
      >
        {editing && (
          <IncomeForm
            initial={editing}
            properties={properties}
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
            submitLabel="Update Record"
          />
        )}
      </Modal>
    </div>
  );
}
