"use client";

import { useEffect, useState } from "react";
import { Receipt, Plus, Upload } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
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

export default function BillsPage() {
  const [bills, setBills] = useState<BillWithProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<Record<string, unknown> | null>(null);

  const [form, setForm] = useState({
    propertyId: "",
    category: "electricity" as string,
    amount: "",
    dueDate: "",
    vendor: "",
    referenceNumber: "",
    notes: "",
  });

  const load = () => {
    Promise.all([
      fetch("/api/bills").then((r) => r.json()),
      fetch("/api/properties").then((r) => r.json()),
    ]).then(([b, p]) => {
      setBills(b);
      setProperties(p);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: form.amount,
        dueDate: form.dueDate || null,
        vendor: form.vendor || null,
        referenceNumber: form.referenceNumber || null,
        notes: form.notes || null,
      }),
    });
    setShowAdd(false);
    setForm({
      propertyId: "",
      category: "electricity",
      amount: "",
      dueDate: "",
      vendor: "",
      referenceNumber: "",
      notes: "",
    });
    load();
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
        setForm((f) => ({
          ...f,
          amount: String(data.amount || f.amount),
          category: data.category || f.category,
          vendor: data.vendor || f.vendor,
          referenceNumber: data.referenceNumber || f.referenceNumber,
          dueDate: data.date || f.dueDate,
        }));

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
            setForm((f) => ({ ...f, propertyId: match.id }));
          }
        }

        setShowScan(false);
        setShowAdd(true);
      } catch {
        alert("Failed to scan bill. Please enter manually.");
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const markPaid = async (id: string) => {
    await fetch("/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPaid: true, paidDate: new Date().toISOString() }),
    });
    load();
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-xl" />;
  }

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bills</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track expenses across properties
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScan(true)}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/70 border border-border"
          >
            <Upload size={16} /> Scan Bill
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
          >
            <Plus size={16} /> Add Bill
          </button>
        </div>
      </div>

      {bills.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No bills tracked"
          description="Add bills manually or scan them with AI"
          action={
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
            >
              Add Bill
            </button>
          }
        />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-4 font-medium">Property</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Vendor</th>
                  <th className="text-right p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Due Date</th>
                  <th className="text-center p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="p-4 font-medium">
                      {b.propertyName || "—"}
                    </td>
                    <td className="p-4 capitalize">
                      {b.category.replace("_", " ")}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {b.vendor || "—"}
                    </td>
                    <td className="p-4 text-right font-medium">
                      {formatCurrency(b.amount)}
                    </td>
                    <td className="p-4">{formatDate(b.dueDate)}</td>
                    <td className="p-4 text-center">
                      {b.isPaid ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-warning/10 text-warning">
                          Unpaid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scan Modal */}
      <Modal open={showScan} onClose={() => setShowScan(false)} title="Scan Bill with AI">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a photo or scan of your bill. AI will extract the details automatically.
          </p>
          <label className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
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
          {scanResult && (
            <div className="bg-muted rounded-lg p-3 text-xs">
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
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Property *</label>
            <select
              required
              value={form.propertyId}
              onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
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
              <label className="text-sm text-muted-foreground">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Vendor</label>
              <input
                value={form.vendor}
                onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
                className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Torrent Power"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Reference #</label>
            <input
              value={form.referenceNumber}
              onChange={(e) => setForm((f) => ({ ...f, referenceNumber: e.target.value }))}
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
              Add Bill
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
