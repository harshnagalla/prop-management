"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Upload, Check, AlertCircle, Sparkles, FileSpreadsheet,
  FileImage, FileText, ArrowRight, IndianRupee, Receipt,
  TrendingUp, TrendingDown, Building2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils/cn";
import type { Property } from "@/lib/db/schema";

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category?: string;
  possibleProperty?: string;
  // User-assigned
  propertyId?: string;
  action?: "income" | "bill" | "skip";
}

const CATEGORIES = [
  { value: "rent_received", label: "Rent Received" },
  { value: "electricity", label: "Electricity" },
  { value: "water", label: "Water" },
  { value: "municipal_tax", label: "Municipal Tax" },
  { value: "maintenance", label: "Maintenance" },
  { value: "insurance", label: "Insurance" },
  { value: "repair", label: "Repair" },
  { value: "transfer", label: "Transfer" },
  { value: "other", label: "Other" },
];

const selectCls = "bg-white border border-slate-200 rounded-lg h-8 px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";

export default function BankImportPage() {
  const [step, setStep] = useState<"upload" | "review" | "done">("upload");
  const [extracting, setExtracting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");
  const [properties, setProperties] = useState<Property[]>([]);
  const [results, setResults] = useState({ income: 0, bills: 0, skipped: 0 });

  useEffect(() => {
    fetch("/api/properties").then((r) => r.json()).then(setProperties).catch(() => {});
  }, []);

  const handleFile = async (file: File) => {
    setError("");
    setExtracting(true);

    try {
      let base64: string;
      let mimeType: string;

      if (file.name.match(/\.(csv|xlsx?|xls)$/i)) {
        // Parse spreadsheet to CSV text, send as text/csv
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              let csvText: string;
              if (file.name.endsWith(".csv")) {
                csvText = e.target?.result as string;
              } else {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: "array" });
                csvText = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
              }
              resolve(csvText);
            } catch { reject(new Error("Failed to parse file")); }
          };
          if (file.name.endsWith(".csv")) reader.readAsText(file);
          else reader.readAsArrayBuffer(file);
        });
        base64 = btoa(unescape(encodeURIComponent(text)));
        mimeType = "text/csv";
      } else {
        // Image/PDF — read as data URL
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        mimeType = file.type || "application/octet-stream";
      }

      const res = await fetch("/api/ai/bank-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, mimeType }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to extract transactions"); setExtracting(false); return; }

      const txns: Transaction[] = (data.transactions || []).map((t: Transaction) => ({
        ...t,
        action: t.type === "credit" ? "income" as const : "bill" as const,
        propertyId: matchProperty(t, properties),
      }));

      setTransactions(txns);
      setSelected(new Set(txns.map((_, i) => i).filter((i) => txns[i].category !== "transfer")));
      setStep("review");
    } catch {
      setError("Failed to process file. Try a different format.");
    } finally {
      setExtracting(false);
    }
  };

  function matchProperty(t: Transaction, props: Property[]): string | undefined {
    const desc = (t.description + " " + (t.possibleProperty || "")).toLowerCase();
    for (const p of props) {
      const name = p.name.toLowerCase();
      if (desc.includes(name) || (name.length > 4 && desc.includes(name.substring(0, name.indexOf(" ") > 0 ? name.indexOf(" ") : name.length)))) {
        return p.id;
      }
    }
    return undefined;
  }

  const handleImport = async () => {
    setImporting(true);
    let income = 0, bills = 0, skipped = 0;

    for (const idx of selected) {
      const t = transactions[idx];
      if (!t.propertyId) { skipped++; continue; }

      try {
        if (t.action === "income") {
          const d = new Date(t.date);
          const res = await fetch("/api/rental-income", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              propertyId: t.propertyId,
              amount: String(t.amount),
              month: d.getMonth() + 1,
              year: d.getFullYear(),
              isReceived: true,
              receivedDate: t.date,
              notes: `Bank: ${t.description}`,
            }),
          });
          if (res.ok) income++; else skipped++;
        } else if (t.action === "bill") {
          const cat = t.category && t.category !== "rent_received" && t.category !== "transfer" ? t.category : "other";
          const res = await fetch("/api/bills", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              propertyId: t.propertyId,
              category: cat,
              amount: String(t.amount),
              dueDate: t.date,
              paidDate: t.date,
              isPaid: true,
              vendor: t.description.substring(0, 100),
              notes: `Bank: ${t.description}`,
            }),
          });
          if (res.ok) bills++; else skipped++;
        } else {
          skipped++;
        }
      } catch { skipped++; }
    }

    setResults({ income, bills, skipped });
    setStep("done");
    setImporting(false);
  };

  const toggleSelect = (i: number) => setSelected((p) => { const n = new Set(p); if (n.has(i)) n.delete(i); else n.add(i); return n; });

  const updateTxn = (i: number, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t, idx) => idx === i ? { ...t, ...updates } : t));
  };

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);
  const totalCredits = transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebits = transactions.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 pt-12 md:pt-0 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bank Statement Import</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Upload your bank statement — AI extracts transactions, matches to properties, records income & bills
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-3">
        {["Upload", "Review", "Done"].map((label, idx) => {
          const keys = ["upload", "review", "done"];
          const currentIdx = keys.indexOf(step);
          const isDone = idx < currentIdx;
          const isCurrent = keys[idx] === step;
          return (
            <div key={label} className="flex items-center gap-3">
              {idx > 0 && <div className={`h-px w-8 ${isDone || isCurrent ? "bg-primary" : "bg-border"}`} />}
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${isCurrent ? "bg-primary text-primary-foreground" : isDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {isDone ? <Check size={14} /> : idx + 1}
                </div>
                <span className={`text-sm font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Upload */}
      {step === "upload" && (
        <label
          className={`block rounded-2xl cursor-pointer transition-all overflow-hidden ${extracting ? "" : dragOver ? "shadow-xl ring-2 ring-primary" : "hover:shadow-lg"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        >
          <div className={`${extracting ? "border-2 border-primary animate-pulse" : "border-2 border-dashed border-border hover:border-primary/50"} rounded-2xl`}>
            <div className="bg-gradient-to-b from-emerald-50/50 to-transparent rounded-2xl p-8 sm:p-14">
              {extracting ? (
                <div className="space-y-5 text-center">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles size={24} className="text-primary animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-semibold">AI analyzing your bank statement...</p>
                    <p className="text-sm text-muted-foreground mt-1">Detecting transactions, matching properties</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                    <IndianRupee size={32} className="text-emerald-600" />
                  </div>
                  <p className="text-lg font-semibold mb-2">Upload your bank statement</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    AI will extract transactions, detect rent payments & bill payments, and match them to your properties
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1"><FileImage size={12} /> Images</Badge>
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1"><FileText size={12} /> PDF</Badge>
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1"><FileSpreadsheet size={12} /> CSV / Excel</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Works with SBI, HDFC, ICICI, Kotak, Axis and all Indian banks</p>
                </div>
              )}
            </div>
          </div>
          <input type="file" accept="image/*,.pdf,.csv,.xlsx,.xls" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} disabled={extracting} />
        </label>
      )}

      {/* Review */}
      {step === "review" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="bg-emerald-50/50 border-emerald-200">
              <CardContent className="p-4 text-center">
                <TrendingUp size={18} className="text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(totalCredits)}</p>
                <p className="text-[10px] text-emerald-600 uppercase tracking-wider">Credits ({transactions.filter((t) => t.type === "credit").length})</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50/50 border-red-200">
              <CardContent className="p-4 text-center">
                <TrendingDown size={18} className="text-red-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-red-700">{formatCurrency(totalDebits)}</p>
                <p className="text-[10px] text-red-600 uppercase tracking-wider">Debits ({transactions.filter((t) => t.type === "debit").length})</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Building2 size={18} className="text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-700">{transactions.filter((t) => t.propertyId).length}</p>
                <p className="text-[10px] text-blue-600 uppercase tracking-wider">Matched to Property</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { key: "all" as const, label: `All (${transactions.length})` },
                { key: "credit" as const, label: `Income (${transactions.filter((t) => t.type === "credit").length})` },
                { key: "debit" as const, label: `Expenses (${transactions.filter((t) => t.type === "debit").length})` },
              ].map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setStep("upload"); setTransactions([]); }}>Re-upload</Button>
              <Button size="sm" onClick={handleImport} disabled={selected.size === 0 || importing}>
                {importing ? "Importing..." : `Import ${selected.size} Transactions`}
              </Button>
            </div>
          </div>

          {/* Transaction list */}
          <div className="space-y-2">
            {filtered.map((t, fi) => {
              const realIdx = transactions.indexOf(t);
              const isSelected = selected.has(realIdx);
              return (
                <Card key={fi} className={cn(
                  "transition-all",
                  isSelected ? (t.type === "credit" ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30") : "opacity-60"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div onClick={() => toggleSelect(realIdx)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 cursor-pointer transition-colors ${isSelected ? "border-primary bg-primary" : "border-border"}`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("text-xs font-bold px-2 py-0.5 rounded",
                            t.type === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                            {t.type === "credit" ? "+" : "−"}₹{t.amount.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-muted-foreground">{t.date}</span>
                          {t.category && t.category !== "other" && (
                            <Badge variant="outline" className="text-[10px]">
                              {CATEGORIES.find((c) => c.value === t.category)?.label || t.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 mt-1 truncate">{t.description}</p>

                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                          <select value={t.propertyId || ""} onChange={(e) => updateTxn(realIdx, { propertyId: e.target.value || undefined })} className={selectCls + " w-full sm:w-44"}>
                            <option value="">Assign property...</option>
                            {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <div className="flex gap-2">
                            <select value={t.action || "skip"} onChange={(e) => updateTxn(realIdx, { action: e.target.value as Transaction["action"] })} className={selectCls + " flex-1 sm:w-32"}>
                              <option value="income">Record Income</option>
                              <option value="bill">Record Bill</option>
                              <option value="skip">Skip</option>
                            </select>
                            <select value={t.category || "other"} onChange={(e) => updateTxn(realIdx, { category: e.target.value })} className={selectCls + " flex-1 sm:w-36"}>
                              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Done */}
      {step === "done" && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-b from-emerald-50 to-transparent">
            <CardContent className="p-10 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <Check size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold">Import Complete</h2>
              <div className="flex justify-center gap-6 text-sm">
                <div><span className="font-bold text-emerald-600">{results.income}</span> income recorded</div>
                <div><span className="font-bold text-red-600">{results.bills}</span> bills recorded</div>
                {results.skipped > 0 && <div><span className="font-bold text-muted-foreground">{results.skipped}</span> skipped</div>}
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => { setStep("upload"); setTransactions([]); }}>Import More</Button>
                <Button asChild><a href="/dashboard">View Dashboard</a></Button>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
}
