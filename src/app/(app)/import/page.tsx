"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, Check, AlertCircle, Sparkles, FileImage, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Import</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Scan bills and import spreadsheets with AI
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
        <label
          className={`block relative rounded-2xl cursor-pointer transition-all overflow-hidden ${
            extracting
              ? ""
              : "hover:shadow-lg"
          }`}
        >
          {/* Animated gradient border for scanning state */}
          <div className={`absolute inset-0 rounded-2xl ${
            extracting
              ? "bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] p-[2px]"
              : "border-2 border-dashed border-border hover:border-primary/50"
          }`}>
            {extracting && <div className="absolute inset-[2px] rounded-[14px] bg-background" />}
          </div>

          <div className={`relative bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent rounded-2xl p-8 sm:p-16`}>
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
                  <p className="text-base font-semibold">
                    AI is analyzing your file...
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Extracting property data with Gemini
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Upload size={32} className="text-primary" />
                </div>
                <p className="text-lg font-semibold mb-2">
                  Drag & drop or click to upload
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Our AI will automatically extract property data from your files
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                    <FileImage size={12} /> Images
                  </Badge>
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                    <FileText size={12} /> PDF
                  </Badge>
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                    <FileSpreadsheet size={12} /> Excel / CSV
                  </Badge>
                </div>
              </div>
            )}
          </div>

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
                className={`cursor-pointer transition-all ${
                  selected.has(idx)
                    ? "border-primary/50 bg-primary/5 shadow-sm"
                    : "hover:shadow-sm"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{prop.name}</p>
                        {prop.type && (
                          <Badge variant="secondary" className="text-[10px]">
                            {prop.type}
                          </Badge>
                        )}
                      </div>
                      {prop.address && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {prop.address}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
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
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-b from-primary/5 to-transparent">
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
          </div>
        </Card>
      )}
    </div>
  );
}
