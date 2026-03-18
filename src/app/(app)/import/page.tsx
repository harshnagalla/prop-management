"use client";

import { useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Upload, FileSpreadsheet, Check, AlertCircle, Sparkles,
  FileImage, FileText, Building2, ChevronDown, ChevronRight,
  ArrowRight, ArrowLeft, Columns3,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ─── Types ─── */
interface ImportProperty {
  name: string; address: string; type: string; status: string; area: string;
  dastavejNo: string; registrationDate: string; purchasePrice: number;
  stampDuty: number; registrationCharges: number; totalCost: number;
  ownership: string; remarks: string; buildingGroup?: string;
}

interface BuildingGroup { building: string; units: ImportProperty[]; expanded: boolean; }

type PropertyField = "name" | "address" | "type" | "area" | "dastavejNo" | "registrationDate" | "purchasePrice" | "stampDuty" | "registrationCharges" | "ownership" | "remarks" | "skip";

const FIELD_OPTIONS: { value: PropertyField; label: string }[] = [
  { value: "skip", label: "— Skip —" },
  { value: "name", label: "Building / Property Name" },
  { value: "address", label: "Address" },
  { value: "type", label: "Type (Residential/Commercial)" },
  { value: "area", label: "Area" },
  { value: "dastavejNo", label: "Dastavej / Registration No." },
  { value: "registrationDate", label: "Registration Date" },
  { value: "purchasePrice", label: "Property Value / Price" },
  { value: "stampDuty", label: "Stamp Duty" },
  { value: "registrationCharges", label: "Registration Charges" },
  { value: "ownership", label: "Ownership / Ratio" },
  { value: "remarks", label: "Remarks / Notes" },
];

/* ─── Utils ─── */
function parseNum(val: unknown): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return parseFloat(String(val).replace(/[₹,Rs.\s]/g, "").replace(/[^\d.]/g, "")) || 0;
}

function parseDate(val: unknown): string {
  if (!val) return "";
  const s = String(val).trim();
  // Excel serial number
  if (/^\d{5}$/.test(s)) {
    const d = new Date((parseInt(s) - 25569) * 86400000);
    return d.toISOString().split("T")[0];
  }
  // DD-Mon-YYYY or DD/MM/YYYY
  const parts = s.split(/[-/]/);
  if (parts.length === 3) {
    const months: Record<string, string> = { jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12" };
    const day = parts[0].padStart(2, "0");
    const month = months[parts[1].toLowerCase()] || parts[1].padStart(2, "0");
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    return `${year}-${month}-${day}`;
  }
  return "";
}

function guessType(val: unknown): string {
  const s = String(val || "").toLowerCase();
  if (s.includes("resident")) return "residential";
  if (s.includes("commerc")) return "commercial";
  if (s.includes("industr")) return "industrial";
  if (s.includes("land")) return "land";
  return "mixed";
}

function autoDetectMapping(headers: string[]): Record<number, PropertyField> {
  const mapping: Record<number, PropertyField> = {};
  const patterns: [RegExp, PropertyField][] = [
    [/bld|building|property\s*name|name/i, "name"],
    [/address|location/i, "address"],
    [/status|type|category/i, "type"],
    [/area|sqft|sq\.?mt|carpet|built/i, "area"],
    [/dastavej|deed|registr.*no|doc.*no/i, "dastavejNo"],
    [/date.*regist|regist.*date/i, "registrationDate"],
    [/value|price|cost|amount/i, "purchasePrice"],
    [/stamp/i, "stampDuty"],
    [/registr.*charge|charge/i, "registrationCharges"],
    [/ratio|owner|share/i, "ownership"],
    [/remark|note|comment/i, "remarks"],
  ];

  headers.forEach((h, i) => {
    for (const [regex, field] of patterns) {
      if (regex.test(h) && !Object.values(mapping).includes(field)) {
        mapping[i] = field;
        break;
      }
    }
    if (!mapping[i]) mapping[i] = "skip";
  });
  return mapping;
}

function groupByBuilding(properties: ImportProperty[]): BuildingGroup[] {
  const groups: Record<string, ImportProperty[]> = {};
  for (const p of properties) {
    const key = p.buildingGroup || p.name;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }
  return Object.entries(groups).map(([building, units]) => ({
    building, units, expanded: units.length > 1,
  }));
}

/* ─── selectClassName ─── */
const selectCls = "w-full bg-white border border-slate-200 rounded-lg h-9 px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";

/* ─── Main ─── */
export default function ImportPage() {
  const [step, setStep] = useState<"upload" | "mapping" | "review" | "done">("upload");
  const [mode, setMode] = useState<"spreadsheet" | "ai">("spreadsheet");
  const [extracting, setExtracting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Spreadsheet data
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<unknown[][]>([]);
  const [mapping, setMapping] = useState<Record<number, PropertyField>>({});
  const [headerRowIdx, setHeaderRowIdx] = useState(0);
  const [dataStartIdx, setDataStartIdx] = useState(1);

  // Properties for review
  const [properties, setProperties] = useState<ImportProperty[]>([]);
  const [groups, setGroups] = useState<BuildingGroup[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [results, setResults] = useState({ success: 0, failed: 0 });
  const [existingProperties, setExistingProperties] = useState<{ id: string; name: string; address: string }[]>([]);
  const [duplicates, setDuplicates] = useState<Set<number>>(new Set());

  // Fetch existing properties for duplicate detection
  useEffect(() => {
    fetch("/api/properties").then((r) => r.json()).then((data) => {
      setExistingProperties(data.map((p: Record<string, string>) => ({ id: p.id, name: p.name, address: p.address })));
    }).catch(() => {});
  }, []);

  function detectDuplicates(props: ImportProperty[]) {
    const dupes = new Set<number>();
    for (let i = 0; i < props.length; i++) {
      const p = props[i];
      const importName = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const existing of existingProperties) {
        const existingName = existing.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        // Match by name similarity or address substring
        if (
          importName === existingName ||
          existingName.includes(importName) ||
          importName.includes(existingName) ||
          (p.address && existing.address && p.address.toLowerCase().includes(existing.address.toLowerCase().substring(0, 30)))
        ) {
          dupes.add(i);
          break;
        }
      }
    }
    return dupes;
  }

  /* ─── File handlers ─── */
  const handleSpreadsheet = useCallback((file: File) => {
    setError("");
    setExtracting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const allRows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        // Find header row (first row with 3+ non-empty cells)
        let hIdx = 0;
        for (let i = 0; i < Math.min(allRows.length, 10); i++) {
          const nonEmpty = (allRows[i] || []).filter((c) => String(c || "").trim()).length;
          if (nonEmpty >= 3) { hIdx = i; break; }
        }

        const hdrs = (allRows[hIdx] || []).map((c) => String(c || "").trim());
        setHeaders(hdrs);
        setRows(allRows);
        setHeaderRowIdx(hIdx);
        setDataStartIdx(hIdx + 1);
        setMapping(autoDetectMapping(hdrs));
        setStep("mapping");
      } catch {
        setError("Failed to parse file. Make sure it's a valid CSV or Excel file.");
      } finally {
        setExtracting(false);
      }
    };
    if (file.name.endsWith(".csv")) {
      // For CSV, read as text then convert
      const textReader = new FileReader();
      textReader.onload = (te) => {
        const wb = XLSX.read(te.target?.result, { type: "string" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const allRows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        let hIdx = 0;
        for (let i = 0; i < Math.min(allRows.length, 10); i++) {
          const nonEmpty = (allRows[i] || []).filter((c) => String(c || "").trim()).length;
          if (nonEmpty >= 3) { hIdx = i; break; }
        }
        const hdrs = (allRows[hIdx] || []).map((c) => String(c || "").trim());
        setHeaders(hdrs);
        setRows(allRows);
        setHeaderRowIdx(hIdx);
        setDataStartIdx(hIdx + 1);
        setMapping(autoDetectMapping(hdrs));
        setStep("mapping");
        setExtracting(false);
      };
      textReader.readAsText(file);
      return;
    }
    reader.readAsArrayBuffer(file);
  }, []);

  const handleAI = useCallback(async (file: File) => {
    setError("");
    setExtracting(true);

    // For CSV/Excel in AI mode, extract text and send to AI
    if (file.name.match(/\.(csv|xlsx?|xls)$/i)) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          let text: string;
          if (file.name.endsWith(".csv")) {
            text = e.target?.result as string;
          } else {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const wb = XLSX.read(data, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            text = XLSX.utils.sheet_to_csv(ws);
          }
          // Send CSV text as base64 to AI
          const base64 = btoa(unescape(encodeURIComponent(text)));
          const res = await fetch("/api/ai/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: base64, mimeType: "text/csv", mode: "spreadsheet" }),
          });
          const result = await res.json();
          if (!res.ok) { setError(result.error || "AI extraction failed"); setExtracting(false); return; }
          finishAIExtract(result);
        } catch {
          setError("AI extraction failed.");
        } finally {
          setExtracting(false);
        }
      };
      if (file.name.endsWith(".csv")) reader.readAsText(file);
      else reader.readAsArrayBuffer(file);
      return;
    }

    // Image/PDF — send as base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("/api/ai/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, mimeType: file.type || "application/octet-stream", mode: "spreadsheet" }),
        });
        const result = await res.json();
        if (!res.ok) { setError(result.error || "AI extraction failed"); setExtracting(false); return; }
        finishAIExtract(result);
      } catch {
        setError("AI extraction failed.");
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const finishAIExtract = (data: Record<string, unknown>) => {
    const props: ImportProperty[] = ((data.properties as Record<string, unknown>[]) || []).map((p) => ({
      name: String(p.name || ""), address: String(p.address || ""), type: String(p.type || "residential"),
      status: "occupied", area: p.area ? `${p.area} sqft` : "", dastavejNo: "",
      registrationDate: "", purchasePrice: parseNum(p.purchasePrice || p.currentValue),
      stampDuty: 0, registrationCharges: 0, totalCost: parseNum(p.purchasePrice),
      ownership: "", remarks: "", buildingGroup: String(p.name || "").toUpperCase(),
    }));
    setProperties(props);
    setGroups(groupByBuilding(props));
    const dupes = detectDuplicates(props);
    setDuplicates(dupes);
    setSelected(new Set(props.map((_, i) => i).filter((i) => !dupes.has(i))));
    setStep("review");
  };

  const handleFile = (file: File) => {
    // CSV/Excel files ALWAYS go through spreadsheet parsing (field mapping)
    // regardless of mode — it's more accurate than AI for structured data
    if (file.name.match(/\.(csv|xlsx?|xls)$/i)) {
      handleSpreadsheet(file);
      return;
    }
    // Images/PDFs go through AI
    handleAI(file);
  };

  /* ─── Apply mapping ─── */
  const applyMapping = () => {
    const dataRows = rows.slice(dataStartIdx).filter((row) => {
      // Skip empty rows and total rows
      const nonEmpty = row.filter((c) => String(c || "").trim()).length;
      return nonEmpty >= 2;
    });

    const nameIdx = Object.entries(mapping).find(([, v]) => v === "name")?.[0];
    if (!nameIdx) { setError("Please map at least the 'Building / Property Name' column."); return; }

    const props: ImportProperty[] = [];
    for (const row of dataRows) {
      const get = (field: PropertyField): string => {
        const idx = Object.entries(mapping).find(([, v]) => v === field)?.[0];
        return idx !== undefined ? String(row[parseInt(idx)] ?? "").trim() : "";
      };

      const name = get("name");
      if (!name) continue;

      const typeRaw = get("type");
      const price = parseNum(row[parseInt(Object.entries(mapping).find(([, v]) => v === "purchasePrice")?.[0] ?? "-1")] ?? 0);
      const stamp = parseNum(row[parseInt(Object.entries(mapping).find(([, v]) => v === "stampDuty")?.[0] ?? "-1")] ?? 0);
      const reg = parseNum(row[parseInt(Object.entries(mapping).find(([, v]) => v === "registrationCharges")?.[0] ?? "-1")] ?? 0);

      props.push({
        name,
        address: get("address"),
        type: guessType(typeRaw),
        status: "occupied",
        area: get("area"),
        dastavejNo: get("dastavejNo"),
        registrationDate: parseDate(get("registrationDate")),
        purchasePrice: price,
        stampDuty: stamp,
        registrationCharges: reg,
        totalCost: price + stamp + reg,
        ownership: get("ownership"),
        remarks: get("remarks"),
        buildingGroup: name.toUpperCase(),
      });
    }

    if (props.length === 0) { setError("No valid rows found. Check your header row and field mapping."); return; }
    setError("");
    setProperties(props);
    setGroups(groupByBuilding(props));
    // Detect duplicates and auto-deselect them
    const dupes = detectDuplicates(props);
    setDuplicates(dupes);
    setSelected(new Set(props.map((_, i) => i).filter((i) => !dupes.has(i))));
    setStep("review");
  };

  /* ─── Import ─── */
  const handleImport = async () => {
    setImporting(true);
    let success = 0, failed = 0;
    for (const idx of selected) {
      const p = properties[idx];
      try {
        const unitMatch = p.address.match(/(?:SHED|UNIT|FLAT|SHOP|BLOCK|FF|GF|TF|SF|[A-Z])-?\s*\d+/i);
        const res = await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: p.name + (unitMatch ? ` - ${unitMatch[0]}` : ""),
            address: p.address, city: "Ahmedabad", type: p.type, status: p.status,
            purchasePrice: p.purchasePrice > 0 ? String(p.purchasePrice) : null,
            currentValue: p.purchasePrice > 0 ? String(p.purchasePrice) : null,
            area: null, areaUnit: "sqft",
            dastavejNo: p.dastavejNo || null,
            registrationDate: p.registrationDate || null,
            stampDuty: p.stampDuty > 0 ? String(p.stampDuty) : null,
            registrationCharges: p.registrationCharges > 0 ? String(p.registrationCharges) : null,
            ownership: p.ownership || null, notes: p.remarks || null,
          }),
        });
        if (res.ok) success++; else failed++;
      } catch { failed++; }
    }
    setResults({ success, failed });
    setStep("done");
    setImporting(false);
  };

  const toggleSelect = (idx: number) => setSelected((prev) => { const n = new Set(prev); if (n.has(idx)) n.delete(idx); else n.add(idx); return n; });
  const toggleGroup = (gi: number) => setGroups((p) => p.map((g, i) => i === gi ? { ...g, expanded: !g.expanded } : g));
  const toggleGroupSel = (g: BuildingGroup) => {
    const ids = g.units.map((u) => properties.indexOf(u));
    const all = ids.every((i) => selected.has(i));
    setSelected((p) => { const n = new Set(p); ids.forEach((i) => all ? n.delete(i) : n.add(i)); return n; });
  };
  const reset = () => { setStep("upload"); setProperties([]); setGroups([]); setHeaders([]); setRows([]); setError(""); };

  const stepLabels = [
    { key: "upload", label: "Upload" },
    ...(mode === "spreadsheet" ? [{ key: "mapping", label: "Map Fields" }] : []),
    { key: "review", label: "Review" },
    { key: "done", label: "Done" },
  ];

  return (
    <div className="space-y-6 pt-12 md:pt-0 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Smart Import</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Import from CSV, Excel, images, or PDFs — with field mapping and AI extraction
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-3">
        {stepLabels.map((s, idx) => {
          const stepOrder = stepLabels.map((sl) => sl.key);
          const currentIdx = stepOrder.indexOf(step);
          const thisIdx = idx;
          const isDone = thisIdx < currentIdx;
          const isCurrent = s.key === step;
          return (
            <div key={s.key} className="flex items-center gap-3">
              {idx > 0 && <div className={`h-px w-8 ${isDone || isCurrent ? "bg-primary" : "bg-border"}`} />}
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${isCurrent ? "bg-primary text-primary-foreground" : isDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {isDone ? <Check size={14} /> : idx + 1}
                </div>
                <span className={`text-sm font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
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

      {/* ═══ Upload ═══ */}
      {step === "upload" && (
        <>
          <div className="flex gap-3">
            <button onClick={() => setMode("spreadsheet")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${mode === "spreadsheet" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
              <FileSpreadsheet size={24} className={mode === "spreadsheet" ? "text-primary" : "text-muted-foreground"} />
              <p className="font-semibold mt-2">CSV / Excel</p>
              <p className="text-xs text-muted-foreground mt-1">Parse and map columns to property fields. Works with any spreadsheet format.</p>
            </button>
            <button onClick={() => setMode("ai")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${mode === "ai" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
              <Sparkles size={24} className={mode === "ai" ? "text-primary" : "text-muted-foreground"} />
              <p className="font-semibold mt-2">AI Scan</p>
              <p className="text-xs text-muted-foreground mt-1">Upload any file — CSV, Excel, images, PDFs. AI extracts data with Gemini.</p>
            </button>
          </div>

          <label className={`block rounded-2xl cursor-pointer transition-all overflow-hidden ${extracting ? "" : dragOver ? "shadow-xl ring-2 ring-primary" : "hover:shadow-lg"}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}>
            <div className={`${extracting ? "border-2 border-primary animate-pulse" : "border-2 border-dashed border-border hover:border-primary/50"} rounded-2xl`}>
              <div className="bg-gradient-to-b from-blue-50/50 to-transparent rounded-2xl p-8 sm:p-14">
                {extracting ? (
                  <div className="space-y-5 text-center">
                    <div className="relative mx-auto w-20 h-20">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {mode === "ai" ? <Sparkles size={24} className="text-primary animate-pulse" /> : <FileSpreadsheet size={24} className="text-primary" />}
                      </div>
                    </div>
                    <p className="text-base font-semibold">{mode === "ai" ? "AI analyzing your file..." : "Parsing spreadsheet..."}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <Upload size={32} className="text-primary" />
                    </div>
                    <p className="text-lg font-semibold mb-2">Drag & drop or click to upload</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                      {mode === "spreadsheet" ? "Upload CSV or Excel. You'll map columns to property fields next." : "Upload any file. AI extracts property data using Gemini."}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Badge variant="secondary" className="gap-1.5 px-3 py-1"><FileSpreadsheet size={12} /> CSV</Badge>
                      <Badge variant="secondary" className="gap-1.5 px-3 py-1"><FileSpreadsheet size={12} /> Excel</Badge>
                      {mode === "ai" && <>
                        <Badge variant="secondary" className="gap-1.5 px-3 py-1"><FileImage size={12} /> Images</Badge>
                        <Badge variant="secondary" className="gap-1.5 px-3 py-1"><FileText size={12} /> PDF</Badge>
                      </>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <input type="file" accept={mode === "spreadsheet" ? ".csv,.xlsx,.xls" : ".csv,.xlsx,.xls,image/*,.pdf"} className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} disabled={extracting} />
          </label>
        </>
      )}

      {/* ═══ Field Mapping ═══ */}
      {step === "mapping" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><Columns3 size={20} /> Map Your Columns</h2>
              <p className="text-sm text-muted-foreground mt-1">We auto-detected some columns. Adjust the mapping below.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset}><ArrowLeft size={14} className="mr-1" /> Back</Button>
              <Button onClick={applyMapping}><ArrowRight size={14} className="mr-1" /> Apply & Preview</Button>
            </div>
          </div>

          {/* Header row selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Header row:</span>
                  <select value={headerRowIdx} onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setHeaderRowIdx(idx);
                    setDataStartIdx(idx + 1);
                    setHeaders((rows[idx] || []).map((c) => String(c || "").trim()));
                    setMapping(autoDetectMapping((rows[idx] || []).map((c) => String(c || "").trim())));
                  }} className={selectCls + " w-20"}>
                    {rows.slice(0, 10).map((_, i) => <option key={i} value={i}>Row {i + 1}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Data starts at:</span>
                  <select value={dataStartIdx} onChange={(e) => setDataStartIdx(parseInt(e.target.value))} className={selectCls + " w-20"}>
                    {rows.slice(0, 15).map((_, i) => <option key={i} value={i}>Row {i + 1}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Column mapping table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-10">#</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Column Header</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Sample Data</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-56">Map To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map((h, i) => {
                      if (!h && !rows[dataStartIdx]?.[i]) return null;
                      const sample = rows[dataStartIdx]?.[i];
                      const sample2 = rows[dataStartIdx + 1]?.[i];
                      return (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/30">
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{i + 1}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-800 max-w-[200px] truncate">{h || <span className="text-muted-foreground italic">empty</span>}</td>
                          <td className="px-4 py-2.5 text-muted-foreground max-w-[200px] truncate">
                            {String(sample || "").substring(0, 40)}
                            {sample2 ? <span className="text-slate-300"> | {String(sample2 || "").substring(0, 30)}</span> : null}
                          </td>
                          <td className="px-4 py-2.5">
                            <select value={mapping[i] || "skip"} onChange={(e) => setMapping((prev) => ({ ...prev, [i]: e.target.value as PropertyField }))} className={selectCls}>
                              {FIELD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ Review ═══ */}
      {step === "review" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Found <span className="font-semibold text-foreground">{properties.length}</span> properties
                in <span className="font-semibold text-foreground">{groups.length}</span> buildings
              </p>
              {groups.some((g) => g.units.length > 1) && (
                <p className="text-xs text-blue-600 mt-1"><Building2 size={12} className="inline mr-1" />Multi-unit buildings detected</p>
              )}
              {duplicates.size > 0 && (
                <p className="text-xs text-amber-600 mt-1"><AlertCircle size={12} className="inline mr-1" />{duplicates.size} possible duplicates detected (auto-deselected)</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset}>Re-upload</Button>
              <Button onClick={handleImport} disabled={selected.size === 0 || importing}>
                {importing ? "Importing..." : `Import ${selected.size} Properties`}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {groups.map((group, gi) => (
              <Card key={gi} className={group.units.length > 1 ? "border-blue-200 bg-blue-50/30" : ""}>
                {group.units.length > 1 ? (
                  <>
                    <CardHeader className="pb-0">
                      <div className="flex items-center justify-between">
                        <button onClick={() => toggleGroup(gi)} className="flex items-center gap-2 text-left">
                          {group.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <Building2 size={18} className="text-blue-600" />
                          <CardTitle className="text-base">{group.building}</CardTitle>
                          <Badge variant="secondary" className="text-[10px]">{group.units.length} units</Badge>
                        </button>
                        <Button variant="ghost" size="sm" onClick={() => toggleGroupSel(group)}>
                          {group.units.every((u) => selected.has(properties.indexOf(u))) ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                    </CardHeader>
                    {group.expanded && (
                      <CardContent className="pt-4 space-y-3">
                        {group.units.map((unit) => { const idx = properties.indexOf(unit); return <PropertyRow key={idx} property={unit} idx={idx} selected={selected.has(idx)} isDuplicate={duplicates.has(idx)} onToggle={toggleSelect} />; })}
                      </CardContent>
                    )}
                  </>
                ) : (
                  <CardContent className="p-4">
                    <PropertyRow property={group.units[0]} idx={properties.indexOf(group.units[0])} selected={selected.has(properties.indexOf(group.units[0]))} isDuplicate={duplicates.has(properties.indexOf(group.units[0]))} onToggle={toggleSelect} />
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Done ═══ */}
      {step === "done" && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-b from-primary/5 to-transparent">
            <CardContent className="p-10 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><Check size={32} className="text-primary" /></div>
              <h2 className="text-xl font-semibold">Import Complete</h2>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{results.success}</span> properties imported
                {results.failed > 0 && <span className="text-destructive">, {results.failed} failed</span>}
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={reset}>Import More</Button>
                <Button asChild><a href="/properties">View Properties</a></Button>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─── Property Row ─── */
function PropertyRow({ property: p, idx, selected, isDuplicate, onToggle }: { property: ImportProperty; idx: number; selected: boolean; isDuplicate?: boolean; onToggle: (idx: number) => void; }) {
  const unitMatch = p.address.match(/(?:SHED|UNIT|FLAT|SHOP|BLOCK|FF|GF|TF|SF|[A-Z])-?\s*\d+/i);
  return (
    <div onClick={() => onToggle(idx)} className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all ${isDuplicate ? "bg-amber-50/50 ring-1 ring-amber-200" : selected ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/50"}`}>
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${selected ? "border-primary bg-primary" : "border-border"}`}>
        {selected && <Check size={12} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold">{p.name}</p>
          {unitMatch && <Badge className="text-[10px]">{unitMatch[0]}</Badge>}
          <Badge variant="secondary" className="text-[10px]">{p.type}</Badge>
          {p.ownership && <Badge variant="outline" className="text-[10px]">{p.ownership}</Badge>}
          {isDuplicate && <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50">Duplicate?</Badge>}
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate">{p.address}</p>
        {p.area && <p className="text-xs text-muted-foreground mt-0.5">{p.area}</p>}
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs">
          {p.purchasePrice > 0 && <span><span className="text-muted-foreground">Value: </span><span className="font-semibold">{formatCurrency(p.purchasePrice)}</span></span>}
          {p.stampDuty > 0 && <span><span className="text-muted-foreground">Stamp: </span><span className="font-semibold">{formatCurrency(p.stampDuty)}</span></span>}
          {p.totalCost > 0 && <span><span className="text-muted-foreground">Total: </span><span className="font-semibold text-primary">{formatCurrency(p.totalCost)}</span></span>}
          {p.dastavejNo && <span><span className="text-muted-foreground">Dastavej: </span><span className="font-semibold">{p.dastavejNo}</span></span>}
        </div>
        {p.remarks && <p className="text-xs text-muted-foreground mt-1.5 italic truncate">&quot;{p.remarks}&quot;</p>}
      </div>
    </div>
  );
}
