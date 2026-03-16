"use client";

import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Sparkles,
  FileImage,
  FileText,
  Building2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ImportProperty {
  name: string;
  address: string;
  type: string;
  status: string;
  area: string;
  dastavejNo: string;
  registrationDate: string;
  purchasePrice: number;
  stampDuty: number;
  registrationCharges: number;
  totalCost: number;
  ownership: string;
  remarks: string;
  buildingGroup?: string;
}

interface BuildingGroup {
  building: string;
  units: ImportProperty[];
  expanded: boolean;
}

function parseIndianNumber(str: string): number {
  if (!str) return 0;
  return parseFloat(str.replace(/,/g, "").replace(/[^\d.]/g, "")) || 0;
}

function parseDate(str: string): string {
  if (!str) return "";
  // Handle DD-Mon-YYYY (20-Feb-2006) and DD/MM/YYYY
  const parts = str.trim().split(/[-/]/);
  if (parts.length !== 3) return "";
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  const day = parts[0].padStart(2, "0");
  const month = months[parts[1].toLowerCase()] || parts[1].padStart(2, "0");
  const year = parts[2];
  return `${year}-${month}-${day}`;
}

function parseCSV(text: string): ImportProperty[] {
  const lines = text.split("\n").filter((l) => l.trim());
  const properties: ImportProperty[] = [];

  for (const line of lines) {
    // Parse CSV respecting quoted fields
    const cols: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === "," && !inQuotes) { cols.push(current.trim()); current = ""; }
      else { current += char; }
    }
    cols.push(current.trim());

    // Skip header rows, empty rows, and total row
    const firstCol = cols[0]?.trim();
    if (!firstCol || isNaN(Number(firstCol)) || Number(firstCol) === 0) continue;

    const bldName = cols[1]?.trim() || "";
    const address = cols[2]?.trim() || "";
    const status = cols[3]?.trim().toLowerCase() || "";
    const area = cols[4]?.trim() || "";
    const dastavejNo = cols[5]?.trim() || "";
    const regDate = cols[6]?.trim() || "";
    const propValue = parseIndianNumber(cols[7] || "");
    const stampDuty = parseIndianNumber(cols[8] || "");
    const regCharges = parseIndianNumber(cols[9] || "");
    const totalCost = parseIndianNumber(cols[10] || "");
    const ownership = cols[11]?.trim() || "";
    const remarks = cols[12]?.trim() || "";

    const type = status.includes("resident") ? "residential"
      : status.includes("commerc") ? "commercial"
      : status.includes("industr") ? "industrial"
      : status.includes("land") ? "land"
      : "mixed";

    properties.push({
      name: bldName,
      address,
      type,
      status: "occupied",
      area,
      dastavejNo,
      registrationDate: parseDate(regDate),
      purchasePrice: propValue,
      stampDuty,
      registrationCharges: regCharges,
      totalCost: totalCost || (propValue + stampDuty + regCharges),
      ownership,
      remarks,
      buildingGroup: bldName.toUpperCase(),
    });
  }

  return properties;
}

function groupByBuilding(properties: ImportProperty[]): BuildingGroup[] {
  const groups: Record<string, ImportProperty[]> = {};
  for (const p of properties) {
    const key = p.buildingGroup || p.name;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }
  return Object.entries(groups).map(([building, units]) => ({
    building,
    units,
    expanded: units.length > 1,
  }));
}

export default function ImportPage() {
  const [step, setStep] = useState<"upload" | "review" | "done">("upload");
  const [mode, setMode] = useState<"csv" | "ai">("csv");
  const [extracting, setExtracting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [properties, setProperties] = useState<ImportProperty[]>([]);
  const [groups, setGroups] = useState<BuildingGroup[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [results, setResults] = useState({ success: 0, failed: 0 });
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleCSV = (file: File) => {
    setError("");
    setExtracting(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setError("No properties found in this file. Make sure it matches the expected format.");
          setExtracting(false);
          return;
        }
        setProperties(parsed);
        setGroups(groupByBuilding(parsed));
        setSelected(new Set(parsed.map((_, i) => i)));
        setStep("review");
      } catch {
        setError("Failed to parse CSV file.");
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleAI = async (file: File) => {
    setError("");
    setExtracting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("/api/ai/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, mimeType: file.type || "application/octet-stream", mode: "spreadsheet" }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "AI extraction failed"); setExtracting(false); return; }
        const props: ImportProperty[] = (data.properties || []).map((p: Record<string, unknown>) => ({
          name: (p.name as string) || "",
          address: (p.address as string) || "",
          type: (p.type as string) || "residential",
          status: "occupied",
          area: p.area ? `${p.area} sqft` : "",
          dastavejNo: "",
          registrationDate: "",
          purchasePrice: (p.purchasePrice as number) || (p.currentValue as number) || 0,
          stampDuty: 0,
          registrationCharges: 0,
          totalCost: (p.purchasePrice as number) || 0,
          ownership: "",
          remarks: "",
          buildingGroup: ((p.name as string) || "").toUpperCase(),
        }));
        setProperties(props);
        setGroups(groupByBuilding(props));
        setSelected(new Set(props.map((_: ImportProperty, i: number) => i)));
        setStep("review");
      } catch {
        setError("AI extraction failed. Try CSV format instead.");
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (file: File) => {
    if (file.name.endsWith(".csv")) {
      handleCSV(file);
    } else {
      handleAI(file);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    let success = 0;
    let failed = 0;

    for (const idx of selected) {
      const p = properties[idx];
      try {
        const res = await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: p.name + (p.address.match(/(?:SHED|UNIT|FLAT|SHOP|BLOCK|FF|GF|TF|SF|[A-Z])-?\s*\d+/i)?.[0] ? ` - ${p.address.match(/(?:SHED|UNIT|FLAT|SHOP|BLOCK|FF|GF|TF|SF|[A-Z])-?\s*\d+/i)?.[0]}` : ""),
            address: p.address,
            city: "Ahmedabad",
            type: p.type,
            status: p.status,
            purchasePrice: p.purchasePrice || null,
            currentValue: p.purchasePrice || null,
            area: null,
            areaUnit: "sqft",
            dastavejNo: p.dastavejNo || null,
            registrationDate: p.registrationDate || null,
            stampDuty: p.stampDuty || null,
            registrationCharges: p.registrationCharges || null,
            ownership: p.ownership || null,
            notes: p.remarks || null,
          }),
        });
        if (res.ok) success++;
        else failed++;
      } catch {
        failed++;
      }
    }

    setResults({ success, failed });
    setStep("done");
    setImporting(false);
  };

  const toggleSelect = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleGroup = (groupIdx: number) => {
    setGroups((prev) =>
      prev.map((g, i) => (i === groupIdx ? { ...g, expanded: !g.expanded } : g))
    );
  };

  const toggleGroupSelection = (group: BuildingGroup) => {
    const indices = group.units.map((u) => properties.indexOf(u));
    const allSelected = indices.every((i) => selected.has(i));
    setSelected((prev) => {
      const next = new Set(prev);
      for (const i of indices) {
        if (allSelected) next.delete(i);
        else next.add(i);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8 pt-12 md:pt-0 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Import</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Import your property spreadsheet — CSV parsed instantly, images processed by AI
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-3">
        {[
          { key: "upload", label: "Upload" },
          { key: "review", label: "Review" },
          { key: "done", label: "Done" },
        ].map((s, idx) => (
          <div key={s.key} className="flex items-center gap-3">
            {idx > 0 && (
              <div className={`h-px w-8 ${
                (s.key === "review" && (step === "review" || step === "done")) ||
                (s.key === "done" && step === "done")
                  ? "bg-primary" : "bg-border"
              }`} />
            )}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                step === s.key
                  ? "bg-primary text-primary-foreground"
                  : (s.key === "upload" && (step === "review" || step === "done")) ||
                    (s.key === "review" && step === "done")
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}>
                {(s.key === "upload" && (step === "review" || step === "done")) ||
                 (s.key === "review" && step === "done") ? <Check size={14} /> : idx + 1}
              </div>
              <span className={`text-sm font-medium ${step === s.key ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {step === "upload" && (
        <>
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Mode selector */}
          <div className="flex gap-3">
            <button
              onClick={() => setMode("csv")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                mode === "csv" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <FileSpreadsheet size={24} className={mode === "csv" ? "text-primary" : "text-muted-foreground"} />
              <p className="font-semibold mt-2">CSV / Excel</p>
              <p className="text-xs text-muted-foreground mt-1">Instant parsing — no AI needed. Best for spreadsheets like your property sheet.</p>
            </button>
            <button
              onClick={() => setMode("ai")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                mode === "ai" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <Sparkles size={24} className={mode === "ai" ? "text-primary" : "text-muted-foreground"} />
              <p className="font-semibold mt-2">AI Scan</p>
              <p className="text-xs text-muted-foreground mt-1">Upload images or PDFs. AI extracts property data using Gemini.</p>
            </button>
          </div>

          <label
            className={`block relative rounded-2xl cursor-pointer transition-all overflow-hidden ${
              extracting ? "" : dragOver ? "shadow-xl ring-2 ring-primary" : "hover:shadow-lg"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          >
            <div className={`${extracting
              ? "border-2 border-primary animate-pulse"
              : "border-2 border-dashed border-border hover:border-primary/50"
            } rounded-2xl`}>
              <div className="bg-gradient-to-b from-blue-50/50 to-transparent rounded-2xl p-8 sm:p-14">
                {extracting ? (
                  <div className="space-y-5 text-center">
                    <div className="relative mx-auto w-20 h-20">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {mode === "csv" ? <FileSpreadsheet size={24} className="text-primary" /> : <Sparkles size={24} className="text-primary animate-pulse" />}
                      </div>
                    </div>
                    <p className="text-base font-semibold">
                      {mode === "csv" ? "Parsing spreadsheet..." : "AI analyzing your file..."}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <Upload size={32} className="text-primary" />
                    </div>
                    <p className="text-lg font-semibold mb-2">Drag & drop or click to upload</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                      {mode === "csv"
                        ? "Upload your property CSV/Excel file. We'll parse it instantly and detect multi-unit buildings."
                        : "Upload images or PDFs. AI will extract property data automatically."}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {mode === "csv" ? (
                        <>
                          <Badge variant="secondary" className="gap-1.5 px-3 py-1"><FileSpreadsheet size={12} /> CSV</Badge>
                          <Badge variant="secondary" className="gap-1.5 px-3 py-1"><FileSpreadsheet size={12} /> Excel</Badge>
                        </>
                      ) : (
                        <>
                          <Badge variant="secondary" className="gap-1.5 px-3 py-1"><FileImage size={12} /> Images</Badge>
                          <Badge variant="secondary" className="gap-1.5 px-3 py-1"><FileText size={12} /> PDF</Badge>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <input
              type="file"
              accept={mode === "csv" ? ".csv,.xlsx,.xls" : "image/*,.pdf"}
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              disabled={extracting}
            />
          </label>
        </>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Found <span className="font-semibold text-foreground">{properties.length}</span> properties
                in <span className="font-semibold text-foreground">{groups.length}</span> buildings
              </p>
              {groups.some((g) => g.units.length > 1) && (
                <p className="text-xs text-blue-600 mt-1">
                  <Building2 size={12} className="inline mr-1" />
                  Multi-unit buildings detected — units grouped together
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStep("upload"); setProperties([]); setGroups([]); }}>
                Re-upload
              </Button>
              <Button onClick={handleImport} disabled={selected.size === 0 || importing} size="lg">
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
                        <Button variant="ghost" size="sm" onClick={() => toggleGroupSelection(group)}>
                          {group.units.every((u) => selected.has(properties.indexOf(u))) ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                    </CardHeader>
                    {group.expanded && (
                      <CardContent className="pt-4 space-y-3">
                        {group.units.map((unit) => {
                          const idx = properties.indexOf(unit);
                          return <PropertyRow key={idx} property={unit} idx={idx} selected={selected.has(idx)} onToggle={toggleSelect} />;
                        })}
                      </CardContent>
                    )}
                  </>
                ) : (
                  <CardContent className="p-4">
                    <PropertyRow property={group.units[0]} idx={properties.indexOf(group.units[0])} selected={selected.has(properties.indexOf(group.units[0]))} onToggle={toggleSelect} />
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === "done" && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-b from-primary/5 to-transparent">
            <CardContent className="p-10 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Check size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Import Complete</h2>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{results.success}</span> properties imported
                {results.failed > 0 && <span className="text-destructive">, {results.failed} failed</span>}
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => { setStep("upload"); setProperties([]); setGroups([]); }}>
                  Import More
                </Button>
                <Button asChild><a href="/properties">View Properties</a></Button>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
}

function PropertyRow({ property: p, idx, selected, onToggle }: {
  property: ImportProperty;
  idx: number;
  selected: boolean;
  onToggle: (idx: number) => void;
}) {
  // Extract unit identifier from address
  const unitMatch = p.address.match(/(?:SHED|UNIT|FLAT|SHOP|BLOCK|FF|GF|TF|SF|[A-Z])-?\s*\d+/i);

  return (
    <div
      onClick={() => onToggle(idx)}
      className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all ${
        selected ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/50"
      }`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
        selected ? "border-primary bg-primary" : "border-border"
      }`}>
        {selected && <Check size={12} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold">{p.name}</p>
          {unitMatch && <Badge className="text-[10px]">{unitMatch[0]}</Badge>}
          <Badge variant="secondary" className="text-[10px]">{p.type}</Badge>
          {p.ownership && <Badge variant="outline" className="text-[10px]">{p.ownership}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate">{p.address}</p>
        {p.area && <p className="text-xs text-muted-foreground mt-0.5">{p.area}</p>}

        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs">
          {p.purchasePrice > 0 && (
            <span><span className="text-muted-foreground">Value: </span><span className="font-semibold">{formatCurrency(p.purchasePrice)}</span></span>
          )}
          {p.stampDuty > 0 && (
            <span><span className="text-muted-foreground">Stamp: </span><span className="font-semibold">{formatCurrency(p.stampDuty)}</span></span>
          )}
          {p.totalCost > 0 && (
            <span><span className="text-muted-foreground">Total: </span><span className="font-semibold text-primary">{formatCurrency(p.totalCost)}</span></span>
          )}
          {p.dastavejNo && (
            <span><span className="text-muted-foreground">Dastavej: </span><span className="font-semibold">{p.dastavejNo}</span></span>
          )}
        </div>

        {p.remarks && (
          <p className="text-xs text-muted-foreground mt-1.5 italic truncate">"{p.remarks}"</p>
        )}
      </div>
    </div>
  );
}
