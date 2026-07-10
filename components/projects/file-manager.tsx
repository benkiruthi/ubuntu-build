"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { formatDate } from "../../lib/utils";

interface ProjectFile {
  id: string;
  name: string;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  created_at: string;
}

const TYPE_ICON: Record<string, string> = {
  document: "📄",
  image: "🖼️",
  cad: "📐",
  other: "📎",
};

const ACCEPT =
  ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.svg,.dwg,.dxf,.rvt,.xlsx,.xls,.ppt,.pptx,.zip";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileManager({
  projectId,
  initialFiles,
}: {
  projectId: string;
  initialFiles: ProjectFile[];
}) {
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      const newFile = await res.json();
      setFiles((prev) => [newFile, ...prev]);
      toast.success(`${file.name} uploaded.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDownload(file: ProjectFile) {
    setDownloading(file.id);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/files/signed-url?path=${encodeURIComponent(file.storage_path)}`
      );
      if (!res.ok) throw new Error("Could not get download URL");
      const { url } = await res.json();
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
    } catch {
      toast.error("Could not download file.");
    } finally {
      setDownloading(null);
    }
  }

  async function handleDelete(file: ProjectFile) {
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    setDeleting(file.id);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/files?fileId=${file.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast.success("File deleted.");
    } catch {
      toast.error("Could not delete file.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-amber-600"
        style={{ borderColor: "var(--border)" }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-3xl mb-2">📁</div>
        <p className="font-medium text-sm">Click to upload a file</p>
        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
          PDF, Word, Excel, images, CAD files — up to 20 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleUpload}
          className="hidden"
        />
        {uploading && (
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
              <div
                className="h-full rounded-full animate-pulse"
                style={{ background: "var(--primary)", width: "60%" }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>Uploading…</p>
          </div>
        )}
      </div>

      {/* File list */}
      {files.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: "var(--muted-foreground)" }}>
          No files yet. Upload drawings, BOQs, or any project documents.
        </p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{TYPE_ICON[file.file_type] ?? "📎"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {formatBytes(file.size_bytes)} · {formatDate(file.created_at)}
                    </p>
                  </div>
                  <Badge variant="default" className="text-xs capitalize flex-shrink-0">
                    {file.file_type}
                  </Badge>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={downloading === file.id}
                      onClick={() => handleDownload(file)}
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={deleting === file.id}
                      onClick={() => handleDelete(file)}
                      className="text-red-500 hover:text-red-600"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
