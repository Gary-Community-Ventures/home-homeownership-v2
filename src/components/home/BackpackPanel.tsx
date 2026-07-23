import { useState } from "react";
import { ChevronDown, Download, Lock, Trash2 } from "lucide-react";
import type { QuestionKey } from "@/App";

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
}: {
  answeredKeys: QuestionKey[];
  onExport: () => void;
  onErase: () => void;
  showActions: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const answeredCount = BACKPACK_FIELDS.filter((field) => answeredKeys.includes(field.key)).length;

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
            <p className="truncate text-xs font-semibold text-muted-foreground">{answeredCount} of {BACKPACK_FIELDS.length} saved · yours to keep</p>
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
        <div className="space-y-3 border-t border-primary/15 px-4 py-4">
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
      ) : null}
    </div>
  );
}
