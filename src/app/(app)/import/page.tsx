"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

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
            address: prop.address || "—",
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
    <div className="space-y-6 pt-12 md:pt-0 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">AI Import</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload a spreadsheet or photo — AI extracts property data automatically
        </p>
      </div>

      {step === "upload" && (
        <label className="block border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors">
          {extracting ? (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">
                AI is analyzing your file...
              </p>
            </div>
          ) : (
            <>
              <FileSpreadsheet
                className="mx-auto mb-3 text-muted-foreground"
                size={40}
              />
              <p className="font-medium mb-1">Upload your Excel or property data</p>
              <p className="text-sm text-muted-foreground">
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {extracted.length} properties. Select which to import:
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setStep("upload")}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Re-upload
              </button>
              <button
                onClick={handleImport}
                disabled={selected.size === 0 || importing}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
              >
                {importing
                  ? "Importing..."
                  : `Import ${selected.size} Properties`}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {extracted.map((prop, idx) => (
              <div
                key={idx}
                onClick={() => toggleSelect(idx)}
                className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${
                  selected.has(idx)
                    ? "border-primary/50 bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
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
                    <p className="font-medium">{prop.name}</p>
                    {prop.address && (
                      <p className="text-xs text-muted-foreground">
                        {prop.address}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      {prop.purchasePrice && (
                        <span>
                          Bought: {formatCurrency(prop.purchasePrice)}
                        </span>
                      )}
                      {prop.currentValue && (
                        <span>
                          Value: {formatCurrency(prop.currentValue)}
                        </span>
                      )}
                      {prop.monthlyRent && (
                        <span>
                          Rent: {formatCurrency(prop.monthlyRent)}/mo
                        </span>
                      )}
                      {prop.area && <span>{prop.area} sqft</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <Check size={32} className="text-accent" />
          </div>
          <h2 className="text-xl font-semibold">Import Complete</h2>
          <p className="text-muted-foreground">
            {results.success} properties imported successfully
            {results.failed > 0 && (
              <span className="text-destructive">
                , {results.failed} failed
              </span>
            )}
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={() => {
                setStep("upload");
                setExtracted([]);
              }}
              className="px-4 py-2 text-sm border border-border rounded-lg"
            >
              Import More
            </button>
            <a
              href="/properties"
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg"
            >
              View Properties
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
