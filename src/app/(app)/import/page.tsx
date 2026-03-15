"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ExtractedProperty {
  name: string;
  address?: string;
  type?: string;
  purchasePrice?: number;
  currentValue?: number;
  monthlyRent?: number;
  tenantName?: string;
  area?: number;
}

export default function ImportPage() {
  const [step, setStep] = useState<"upload" | "review" | "done">("upload");
  const [extracting, setExtracting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedProperty[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [results, setResults] = useState({ success: 0, failed: 0 });

  const handleFile = async (file: File) => {
    setExtracting(true);
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
            mode: "spreadsheet",
          }),
        });
        const data = await res.json();
        const props = data.properties || [];
        setExtracted(props);
        setSelected(new Set(props.map((_: unknown, i: number) => i)));
        setStep("review");
      } catch {
        alert("Failed to extract data. Please try a clearer image or different format.");
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImport = async () => {
    setImporting(true);
    let success = 0;
    let failed = 0;

    for (const idx of selected) {
      const prop = extracted[idx];
      try {
        const res = await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: prop.name,
            address: prop.address || "\u2014",
            type: prop.type || "residential",
            status: prop.monthlyRent ? "occupied" : "vacant",
            purchasePrice: prop.purchasePrice || null,
            currentValue: prop.currentValue || null,
            monthlyRent: prop.monthlyRent || null,
            tenantName: prop.tenantName || null,
            area: prop.area || null,
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

  return (
    <div className="space-y-8 pt-12 md:pt-0 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Import</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Upload a spreadsheet or photo — AI extracts property data automatically
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
                  ? "bg-primary"
                  : "bg-border"
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
                 (s.key === "review" && step === "done") ? (
                  <Check size={14} />
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`text-sm font-medium ${
                step === s.key ? "text-foreground" : "text-muted-foreground"
              }`}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {step === "upload" && (
        <label className="block border-2 border-dashed border-border rounded-[var(--radius)] p-8 sm:p-16 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
          {extracting ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
              <p className="text-sm font-medium text-muted-foreground">
                AI is analyzing your file...
              </p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet
                  className="text-primary"
                  size={28}
                />
              </div>
              <p className="text-base font-semibold mb-1.5">Drop your file here or click to browse</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Supports images of spreadsheets, PDFs, Excel files, or photos of written records
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/*,.pdf,.xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            disabled={extracting}
          />
        </label>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-muted-foreground">
              Found <span className="font-semibold text-foreground">{extracted.length}</span> properties. Select which to import:
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Re-upload
              </Button>
              <Button
                variant="default"
                size="lg"
                className="shadow-sm"
                onClick={handleImport}
                disabled={selected.size === 0 || importing}
              >
                {importing
                  ? "Importing..."
                  : `Import ${selected.size} Properties`}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {extracted.map((prop, idx) => (
              <Card
                key={idx}
                onClick={() => toggleSelect(idx)}
                className={`cursor-pointer transition-colors ${
                  selected.has(idx)
                    ? "border-primary/50 bg-primary/5"
                    : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                        selected.has(idx)
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {selected.has(idx) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{prop.name}</p>
                      {prop.address && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {prop.address}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3">
                        {prop.purchasePrice && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bought</p>
                            <p className="text-sm font-semibold mt-0.5">{formatCurrency(prop.purchasePrice)}</p>
                          </div>
                        )}
                        {prop.currentValue && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Value</p>
                            <p className="text-sm font-semibold mt-0.5">{formatCurrency(prop.currentValue)}</p>
                          </div>
                        )}
                        {prop.monthlyRent && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rent/mo</p>
                            <p className="text-sm font-semibold mt-0.5">{formatCurrency(prop.monthlyRent)}</p>
                          </div>
                        )}
                        {prop.area && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Area</p>
                            <p className="text-sm font-semibold mt-0.5">{prop.area} sqft</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === "done" && (
        <Card>
          <CardContent className="p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Import Complete</h2>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{results.success}</span> properties imported successfully
              {results.failed > 0 && (
                <span className="text-destructive">
                  , {results.failed} failed
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("upload");
                  setExtracted([]);
                }}
              >
                Import More
              </Button>
              <Button variant="default" size="lg" className="shadow-sm" asChild>
                <a href="/properties">View Properties</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
