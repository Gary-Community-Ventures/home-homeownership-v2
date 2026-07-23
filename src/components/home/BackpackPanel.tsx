import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ChevronDown, Download, FileCheck2, Lock, Trash2, Upload, X } from "lucide-react";
import type { PaystubRecord, QuestionKey } from "@/App";

const BACKPACK_FIELDS: { key: QuestionKey; label: string }[] = [
  { key: "location", label: "Location" },
  { key: "bedrooms", label: "Home size" },
  { key: "income", label: "Income" },
  { key: "savings", label: "Savings" },
  { key: "creditScore", label: "Credit" },
  { key: "assistanceProgram", label: "Buying help" },
];

export function BackpackPanel({
  answeredKeys,
  onExport,
  onErase,
  showActions,
  paystubs,
  onUploadPaystubs,
  onRemovePaystub,
}: {
  answeredKeys: QuestionKey[];
  onExport: () => void;
  onErase: () => void;
  showActions: boolean;
  paystubs: PaystubRecord[];
  onUploadPaystubs: (files: FileList) => void;
  onRemovePaystub: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "verification">("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const answeredCount = BACKPACK_FIELDS.filter((field) => answeredKeys.includes(field.key)).length;
  const verifiedCount = paystubs.filter((paystub) => paystub.status === "verified").length;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) onUploadPaystubs(event.target.files);
    event.target.value = "";
  }

  return (
    <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 to-white/85 shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow" aria-hidden="true">
            <Lock className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black tracking-tight">Your Backpack</p>
            <p className="truncate text-xs font-semibold text-muted-foreground">
              {answeredCount} of {BACKPACK_FIELDS.length} saved
              {verifiedCount > 0 ? ` · ${verifiedCount} document${verifiedCount === 1 ? "" : "s"} verified` : ""} · yours to keep
            </p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      <div className="flex flex-wrap gap-2 px-4 pb-4">
        {BACKPACK_FIELDS.map((field) => {
          const isAnswered = answeredKeys.includes(field.key);
          return (
            <span
              key={field.key}
              className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                isAnswered ? "border-primary/25 bg-primary/10 text-primary" : "border-border bg-muted/50 text-muted-foreground"
              }`}
            >
              {isAnswered ? "✓ " : ""}
              {field.label}
            </span>
          );
        })}
      </div>

      {expanded ? (
        <div className="border-t border-primary/15">
          <div className="flex gap-1 px-4 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "overview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/70"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("verification")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "verification" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/70"
              }`}
            >
              Verification{paystubs.length ? ` (${verifiedCount}/${paystubs.length})` : ""}
            </button>
          </div>

          {activeTab === "overview" ? (
            <div className="space-y-3 px-4 pb-4 pt-3">
              <p className="text-xs leading-6 text-muted-foreground">
                This travels with you — the same answers work if you come back later or continue somewhere else, without filling anything in twice.
              </p>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-primary">
                Held by an independent nonprofit trust, not a lender or landlord
              </p>
              <p className="text-xs leading-6 text-muted-foreground">
                Nothing here has been shared outside this browser. You'll approve every share before it happens.
              </p>
              {showActions ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onExport}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export my Backpack
                  </button>
                  <button
                    type="button"
                    onClick={onErase}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground transition hover:bg-secondary/80"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Erase everything
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3 px-4 pb-4 pt-3">
              <p className="text-xs leading-6 text-muted-foreground">
                Upload paystubs covering your last 30 days of pay. Once verified, this is what a participating lender or
                property could pull straight from your Backpack instead of asking you for the same documents again at
                application time.
              </p>

              <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload paystubs
              </button>

              {paystubs.length ? (
                <div className="space-y-2">
                  {paystubs.map((paystub) => (
                    <div key={paystub.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold">{paystub.name}</p>
                        <p className="text-[0.7rem] text-muted-foreground">{paystub.sizeLabel}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {paystub.status === "verifying" ? (
                          <span className="text-[0.7rem] font-bold text-muted-foreground">Verifying…</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-primary">
                            <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Verified
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemovePaystub(paystub.id)}
                          aria-label={`Remove ${paystub.name}`}
                          className="text-muted-foreground transition hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-muted-foreground">No paystubs uploaded yet.</p>
              )}

              <p className="text-[0.7rem] leading-5 text-muted-foreground">
                This is a concept test — files aren't uploaded or stored anywhere. We only keep the file name so you can see
                what verification would look like.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
