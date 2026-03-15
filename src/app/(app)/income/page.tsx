"use client";

import { useEffect, useState } from "react";
import { IndianRupee, Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "@/lib/utils/toast";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/lib/db/schema";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const selectClassName =
  "mt-1 w-full bg-transparent border border-border rounded-[var(--radius)] h-9 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const textareaClassName =
  "mt-1 w-full bg-transparent border border-border rounded-[var(--radius)] px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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
      className="space-y-5"
    >
      {/* Payment Details */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Payment Details</p>
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium">Property *</label>
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
              <label className="text-sm font-medium">Month</label>
              <select
                value={form.month as string}
                onChange={(e) => set("month", e.target.value)}
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
                value={form.year as string}
                onChange={(e) => set("year", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium">Amount (*) *</label>
              <Input
                type="number"
                required
                value={form.amount as string}
                onChange={(e) => set("amount", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tenant</label>
              <Input
                value={form.tenantName as string}
                onChange={(e) => set("tenantName", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Date & Status */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Date & Status</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium">Received Date</label>
            <Input
              type="date"
              value={form.receivedDate as string}
              onChange={(e) => set("receivedDate", e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm font-medium">
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
      </div>

      {/* Notes */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Notes</p>
        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea
            value={form.notes as string}
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

export default function IncomePage() {
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<IncomeEntry | null>(null);

  const load = () => {
    Promise.all([
      fetch("/api/rental-income").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
      fetch("/api/properties").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
    ])
      .then(([i, p]) => {
        setIncome(i);
        setProperties(p);
      })
      .catch(() => toast.error("Failed to load income records"))
      .finally(() => setLoading(false));
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
    try {
      const res = await fetch("/api/rental-income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Payment recorded");
      setShowAdd(false);
      load();
    } catch {
      toast.error("Failed to record payment");
    }
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/rental-income/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Income record updated");
      setEditing(null);
      load();
    } catch {
      toast.error("Failed to update income record");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this income record? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/rental-income/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Income record deleted");
      load();
    } catch {
      toast.error("Failed to delete income record");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pt-12 md:pt-0 animate-pulse">
        <div className="flex items-center justify-between">
          <div><div className="h-9 w-44 bg-muted rounded-[var(--radius)]" /><div className="h-4 w-52 bg-muted rounded mt-3" /></div>
          <div className="h-10 w-40 bg-muted rounded-[var(--radius)]" />
        </div>
        {[1, 2].map((g) => (
          <Card key={g}>
            <CardHeader className="pb-0">
              <div className="flex justify-between">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-5 w-20 bg-muted rounded" />
              </div>
            </CardHeader>
            <CardContent>
              {[1, 2].map((i) => (
                <div key={i} className="py-3 border-b border-border/50 flex justify-between">
                  <div><div className="h-4 w-32 bg-muted rounded" /><div className="h-3 w-24 bg-muted rounded mt-1" /></div>
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
    <div className="space-y-8 pt-12 md:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rental Income</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Track rent payments by property
          </p>
        </div>
        <Button variant="default" onClick={() => setShowAdd(true)}>
          <Plus size={16} className="mr-2" /> Record Payment
        </Button>
      </div>

      {income.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={IndianRupee}
            title="No income recorded"
            description="Record rental payments as they come in"
            action={
              <Button onClick={() => setShowAdd(true)} variant="default">
                Record Payment
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([key, group]) => {
              const [year, month] = key.split("-");
              return (
                <Card key={key}>
                  <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>
                      {MONTHS[parseInt(month) - 1]} {year}
                    </CardTitle>
                    <span className="text-sm font-semibold text-accent tabular-nums">
                      {formatCurrency(group.total)}
                    </span>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="divide-y divide-border/50">
                      {group.entries.map((entry) => (
                        <div key={entry.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-sm">{entry.propertyName}</p>
                            {entry.tenantName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {entry.tenantName}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="sm:text-right">
                              <p className="font-semibold text-sm tabular-nums">
                                {formatCurrency(entry.amount)}
                              </p>
                              {entry.isReceived ? (
                                <Badge variant="success" className="mt-1">Received</Badge>
                              ) : (
                                <Badge variant="warning" className="mt-1">Pending</Badge>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditing(entry)}
                                className="h-8 w-8 min-h-[32px] min-w-[32px]"
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(entry.id)}
                                className="h-8 w-8 min-h-[32px] min-w-[32px] text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
