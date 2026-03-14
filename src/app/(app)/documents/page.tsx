"use client";

import { useEffect, useState } from "react";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { toast } from "@/lib/utils/toast";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
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
      <div className="space-y-6 pt-12 md:pt-0 animate-pulse">
        <div className="flex items-center justify-between">
          <div><div className="h-8 w-36 bg-muted rounded-lg" /><div className="h-4 w-48 bg-muted rounded mt-2" /></div>
          <div className="h-10 w-28 bg-muted rounded-lg" />
        </div>
        <div className="h-10 w-40 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg" />
                <div><div className="h-4 w-28 bg-muted rounded" /><div className="h-3 w-20 bg-muted rounded mt-1" /></div>
              </div>
              <div className="flex justify-between"><div className="h-3 w-24 bg-muted rounded" /><div className="h-3 w-16 bg-muted rounded" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 md:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Property papers and records
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
        >
          <Upload size={16} /> Upload
        </button>
      </div>

      {/* Filter */}
      {properties.length > 0 && (
        <select
          value={filterProperty}
          onChange={(e) => setFilterProperty(e.target.value)}
          className="bg-muted border border-border rounded-lg px-3 py-2 text-sm"
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
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
            >
              Upload Document
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-card border border-border rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {doc.type.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {getPropertyName(doc.propertyId) && (
                  <p>{getPropertyName(doc.propertyId)}</p>
                )}
                <div className="flex items-center justify-between">
                  <span>{formatDate(doc.createdAt)}</span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                <a
                  href={`/api/documents/${doc.id}?download=true`}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Download size={12} /> Download
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
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
            <label className="text-sm text-muted-foreground">Property *</label>
            <select
              required
              value={form.propertyId}
              onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
              className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Document Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Sale Deed - Bodakdev"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm"
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">File *</label>
            <input
              id="doc-file"
              type="file"
              required
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mt-1 w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm file:mr-4 file:bg-primary file:text-primary-foreground file:border-0 file:rounded file:px-3 file:py-1 file:text-xs"
            />
            {fileError && (
              <p className="mt-1 text-xs text-destructive">{fileError}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Max file size: 10MB</p>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                setShowUpload(false);
                setFileError("");
              }}
              className="px-4 py-2 text-sm text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !!fileError}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
