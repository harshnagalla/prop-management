"use client";

import { useEffect, useState } from "react";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { toast } from "@/lib/utils/toast";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Property } from "@/lib/db/schema";

const DOC_TYPES = [
  "sale_deed",
  "agreement",
  "registration",
  "tax_receipt",
  "bill",
  "photo",
  "other",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const selectClassName =
  "mt-1 w-full bg-transparent border border-border rounded-[var(--radius)] h-9 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface DocEntry {
  id: string;
  propertyId: string;
  name: string;
  type: string;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterProperty, setFilterProperty] = useState("");
  const [fileError, setFileError] = useState("");

  const [form, setForm] = useState({
    propertyId: "",
    name: "",
    type: "other" as string,
  });

  const load = () => {
    Promise.all([
      fetch("/api/documents").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
      fetch("/api/properties").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
    ])
      .then(([d, p]) => {
        setDocs(d);
        setProperties(p);
      })
      .catch(() => toast.error("Failed to load documents"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size exceeds 10MB limit. Please choose a smaller file.");
      toast.error("File too large. Maximum 10MB.");
      e.target.value = "";
      return;
    }

    // Auto-fill document name from filename if empty
    if (!form.name) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setForm((f) => ({ ...f, name: nameWithoutExt }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.getElementById("doc-file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size exceeds 10MB limit. Please choose a smaller file.");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            file: base64,
            fileSize: file.size,
            mimeType: file.type,
          }),
        });
        if (!res.ok) throw new Error();
        toast.success("Document uploaded");
        setShowUpload(false);
        setForm({ propertyId: "", name: "", type: "other" });
        setFileError("");
        load();
      } catch {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Document deleted");
      load();
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const filtered = filterProperty
    ? docs.filter((d) => d.propertyId === filterProperty)
    : docs;

  const getPropertyName = (propertyId: string) => {
    const prop = properties.find((p) => p.id === propertyId);
    return prop?.name || "";
  };

  if (loading) {
    return (
      <div className="space-y-8 pt-12 md:pt-0 animate-pulse">
        <div className="flex items-center justify-between">
          <div><div className="h-9 w-44 bg-muted rounded-[var(--radius)]" /><div className="h-4 w-56 bg-muted rounded mt-3" /></div>
          <div className="h-10 w-28 bg-muted rounded-[var(--radius)]" />
        </div>
        <div className="h-9 w-40 bg-muted rounded-[var(--radius)]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div><div className="h-4 w-28 bg-muted rounded" /><div className="h-3 w-20 bg-muted rounded mt-1.5" /></div>
                </div>
                <div className="flex justify-between"><div className="h-3 w-24 bg-muted rounded" /><div className="h-3 w-16 bg-muted rounded" /></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-12 md:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Property papers and records
          </p>
        </div>
        <Button variant="default" size="lg" className="shadow-sm" onClick={() => setShowUpload(true)}>
          <Upload size={18} className="mr-2" /> Upload
        </Button>
      </div>

      {/* Filter */}
      {properties.length > 0 && (
        <select
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
          className="bg-transparent border border-border rounded-[var(--radius)] h-9 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <option value="">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents"
          description="Upload property papers, sale deeds, and other records"
          action={
            <Button onClick={() => setShowUpload(true)} variant="default">
              Upload Document
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {doc.type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {getPropertyName(doc.propertyId) && (
                    <p className="text-xs font-medium text-muted-foreground">{getPropertyName(doc.propertyId)}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{formatDate(doc.createdAt)}</span>
                    <span className="text-xs font-medium text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                  </div>
                </div>
                <div className="flex gap-1 pt-4 mt-4 border-t border-border">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={`/api/documents/${doc.id}?download=true`}>
                      <Download size={14} />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showUpload}
        onClose={() => {
          setShowUpload(false);
          setFileError("");
        }}
        title="Upload Document"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Property *</label>
            <select
              required
              value={form.propertyId}
              onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
              className={selectClassName}
            >
              <option value="">Select property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Document Name *</label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1"
              placeholder="e.g. Sale Deed - Bodakdev"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className={selectClassName}
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">File *</label>
            <input
              id="doc-file"
              type="file"
              required
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mt-1 w-full bg-transparent border border-border rounded-[var(--radius)] px-3 py-2 text-sm file:mr-4 file:bg-primary file:text-primary-foreground file:border-0 file:rounded-[var(--radius)] file:px-3 file:py-1 file:text-xs"
            />
            {fileError && (
              <p className="mt-1 text-xs text-destructive">{fileError}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Max file size: 10MB</p>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUpload(false);
                setFileError("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={uploading || !!fileError}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
