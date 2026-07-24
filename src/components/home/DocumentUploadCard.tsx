import { useRef } from "react";
import type { ChangeEvent } from "react";
import { FileCheck2, Upload } from "lucide-react";
import type { DocumentCategory, DocumentRecord } from "@/App";

export function DocumentUploadCard({
  category,
  title,
  verifiedTitle,
  description,
  verifiedDescription,
  uploadLabel,
  compact = false,
  documents,
  onUpload,
  onRemove,
}: {
  category: DocumentCategory;
  title: string;
  verifiedTitle?: string;
  description: string;
  verifiedDescription?: string;
  uploadLabel?: string;
  compact?: boolean;
  documents: DocumentRecord[];
  onUpload: (category: DocumentCategory, files: FileList) => void;
  onRemove: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const items = documents.filter((doc) => doc.category === category);
  const verifiedCount = items.filter((doc) => doc.status === "verified").length;
  const isVerified = items.length > 0 && verifiedCount === items.length;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) onUpload(category, event.target.files);
    event.target.value = "";
  }

  return (
    <div className={`rounded-3xl border ${compact ? "p-3" : "p-4"} ${isVerified ? "border-primary/30 bg-primary/10" : "border-primary/20 bg-primary/5"}`}>
      <div className="flex items-start gap-3">
        <span
          className={`flex shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow ${compact ? "h-8 w-8" : "h-10 w-10"}`}
          aria-hidden="true"
        >
          {isVerified ? <FileCheck2 className={compact ? "h-4 w-4" : "h-5 w-5"} /> : <Upload className={compact ? "h-4 w-4" : "h-5 w-5"} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-black tracking-tight ${compact ? "text-xs" : "text-sm"}`}>{isVerified ? (verifiedTitle ?? title) : title}</p>
          <p className={`mt-1 leading-6 text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
            {isVerified ? (verifiedDescription ?? description) : description}
          </p>

          <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFileChange} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md ${
              compact ? "px-3 py-1.5 text-[0.7rem]" : "px-3.5 py-2 text-xs"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            {items.length ? "Upload another" : (uploadLabel ?? "Upload a document")}
          </button>

          {items.length ? (
            <div className="mt-3 space-y-2">
              {items.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-3 py-2">
                  <p className="truncate text-xs font-bold">{doc.name}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    {doc.status === "verifying" ? (
                      <span className="text-[0.7rem] font-bold text-muted-foreground">Verifying…</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-primary">
                        <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Verified
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemove(doc.id)}
                      aria-label={`Remove ${doc.name}`}
                      className="text-xs font-bold text-muted-foreground transition hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
