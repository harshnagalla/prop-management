"use client";

import { useEffect, useState } from "react";
import { FileText, Upload, Download, Trash2, Image, Receipt, Search, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { toast } from "@/lib/utils/toast";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: typeof FileText }> = {
  sale_deed: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/40", icon: FileText },
  agreement: { color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/40", icon: FileText },
  registration: { color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/40", icon: FileText },
  tax_receipt: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/40", icon: Receipt },
  bill: { color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/60", icon: Receipt },
  photo: { color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/40", icon: Image },
  other: { color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800/60", icon: FileText },
};

const TYPE_BADGE_VARIANT: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
  sale_deed: "default",
  agreement: "default",
  registration: "default",
  tax_receipt: "warning",
  bill: "secondary",
  photo: "success",
  other: "outline",
};

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

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.other;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterProperty, setFilterProperty] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  const filtered = docs
    .filter((d) => !filterProperty || d.propertyId === filterProperty)
    .filter((d) => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getPropertyName = (propertyId: string) => {
    const prop = properties.find((p) => p.id === propertyId);
    return prop?.name || "";
  };

  if (loading) {
    return (
      <div className="space-y-8 pt-12 md:pt-0 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-44 bg-muted rounded-[var(--radius)]" />
            <div className="h-4 w-56 bg-muted rounded mt-3" />
          </div>
          <div className="h-10 w-28 bg-muted rounded-[var(--radius)]" />
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="h-9 flex-1 bg-muted rounded-[var(--radius)]" />
              <div className="h-9 w-40 bg-muted rounded-[var(--radius)]" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-16 bg-muted" />
              <CardContent className="p-5 space-y-3">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
                <div className="flex justify-between pt-2">
                  <div className="h-5 w-20 bg-muted rounded-full" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-12 md:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Your property document vault
          </p>
        </div>
        <Button variant="default" size="lg" className="shadow-sm" onClick={() => setShowUpload(true)}>
          <Upload size={18} className="mr-2" /> Upload
        </Button>
      </div>

      {/* Search & Filter Bar */}
      {properties.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  value={filterProperty}
                  onChange={(e) => setFilterProperty(e.target.value)}
                  className="bg-transparent border border-border rounded-[var(--radius)] h-9 pl-9 pr-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background min-w-[180px]"
                >
                  <option value="">All Properties</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
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
          {filtered.map((doc) => {
            const config = getTypeConfig(doc.type);
            const IconComponent = config.icon;
            const badgeVariant = TYPE_BADGE_VARIANT[doc.type] || "outline";

            return (
              <Card key={doc.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                {/* Colored header strip */}
                <div className={`${config.bg} px-5 py-4 flex items-center gap-3`}>
                  <div className={`w-10 h-10 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center shrink-0 shadow-sm`}>
                    <IconComponent size={20} className={config.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    {getPropertyName(doc.propertyId) && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {getPropertyName(doc.propertyId)}
                      </p>
                    )}
                  </div>
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* Badge + meta row */}
                  <div className="flex items-center justify-between">
                    <Badge variant={badgeVariant}>
                      {doc.type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(doc.fileSize)}
                    </span>
                  </div>

                  {/* Date + actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(doc.createdAt)}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={`/api/documents/${doc.id}?download=true`} title="Download">
                          <Download size={14} />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
