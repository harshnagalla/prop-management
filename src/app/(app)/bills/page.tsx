"use client";

import { useEffect, useState } from "react";
import { Receipt, Plus, Upload, Pencil, Trash2 } from "lucide-react";
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
      className="space-y-4"
    >
      <div>
        <label className="text-sm text-muted-foreground">Property *</label>
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Category</label>
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
          <label className="text-sm text-muted-foreground">Amount (*) *</label>
          <Input
            type="number"
            required
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Vendor</label>
          <Input
            value={form.vendor}
            onChange={(e) => set("vendor", e.target.value)}
            className="mt-1"
            placeholder="e.g. Torrent Power"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Due Date</label>
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Paid Date</label>
          <Input
            type="date"
            value={form.paidDate}
            onChange={(e) => set("paidDate", e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
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
      <div>
        <label className="text-sm text-muted-foreground">Reference #</label>
        <Input
          value={form.referenceNumber}
          onChange={(e) => set("referenceNumber", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          className={textareaClassName}
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
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
          <div><div className="h-8 w-28 bg-muted rounded-[var(--radius)]" /><div className="h-4 w-52 bg-muted rounded mt-2" /></div>
          <div className="flex gap-2"><div className="h-10 w-28 bg-muted rounded-[var(--radius)]" /><div className="h-10 w-28 bg-muted rounded-[var(--radius)]" /></div>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-border flex gap-4">
              {["w-28","w-24","w-28","w-20","w-24","w-16","w-20"].map((w, i) => (
                <div key={i} className={`h-4 ${w} bg-muted rounded`} />
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 border-b border-border/50 flex gap-4">
                {["w-28","w-24","w-28","w-20","w-24","w-16","w-20"].map((w, j) => (
                  <div key={j} className={`h-4 ${w} bg-muted rounded`} />
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
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
          <Button variant="outline" onClick={() => setShowScan(true)}>
            <Upload size={16} className="mr-2" /> Scan Bill
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setAddFormData({});
              setShowAdd(true);
            }}
          >
            <Plus size={16} className="mr-2" /> Add Bill
          </Button>
        </div>
      </div>

      {bills.length === 0 ? (
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
      ) : (
        <Card>
          <CardContent className="p-0">
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
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="p-4 font-medium">
                        {b.propertyName || "\u2014"}
                      </td>
                      <td className="p-4 capitalize">
                        {b.category.replace("_", " ")}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {b.vendor || "\u2014"}
                      </td>
                      <td className="p-4 text-right font-medium">
                        {formatCurrency(b.amount)}
                      </td>
                      <td className="p-4">{formatDate(b.dueDate)}</td>
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
      )}

      {/* Scan Modal */}
      <Modal open={showScan} onClose={() => setShowScan(false)} title="Scan Bill with AI">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a photo or scan of your bill. AI will extract the details automatically.
          </p>
          <label className="block border-2 border-dashed border-border rounded-[var(--radius)] p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
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
