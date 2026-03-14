"use client";

import { useEffect, useState } from "react";
import { IndianRupee, Plus } from "lucide-react";
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
  propertyName: string | null;
}

export default function IncomePage() {
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const now = new Date();
  const [form, setForm] = useState({
    propertyId: "",
    amount: "",
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    tenantName: "",
    isReceived: true,
    receivedDate: now.toISOString().split("T")[0],
  });

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

  // Auto-fill rent amount when property selected
  const onPropertyChange = (id: string) => {
    const prop = properties.find((p) => p.id === id);
    setForm((f) => ({
      ...f,
      propertyId: id,
      amount: prop?.monthlyRent || f.amount,
      tenantName: prop?.tenantName || f.tenantName,
    }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/rental-income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        month: parseInt(form.month),
        year: parseInt(form.year),
        receivedDate: form.receivedDate || null,
        tenantName: form.tenantName || null,
      }),
    });
    setShowAdd(false);
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
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {formatCurrency(entry.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.isReceived ? "Received" : "Pending"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Record Rental Payment">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Property *</label>
            <select
              required
              value={form.propertyId}
              onChange={(e) => onPropertyChange(e.target.value)}
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
                value={form.month}
                onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
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
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Amount (₹) *</label>
              <input
                type="number"
                required
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Tenant</label>
              <input
                value={form.tenantName}
                onChange={(e) => setForm((f) => ({ ...f, tenantName: e.target.value }))}
                className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Received Date</label>
            <input
              type="date"
              value={form.receivedDate}
              onChange={(e) => setForm((f) => ({ ...f, receivedDate: e.target.value }))}
              className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-sm text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
