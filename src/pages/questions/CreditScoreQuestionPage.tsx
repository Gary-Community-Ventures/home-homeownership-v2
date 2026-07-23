import { ExternalLink } from "lucide-react";
import { DocumentUploadCard } from "@/components/home/DocumentUploadCard";

export function CreditScoreQuestionPage({ answerValue, creditScoreOptions, updateAnswer, documents, onUploadDocuments, onRemoveDocument }: any) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {creditScoreOptions.map((option: any) => {
          const numericAnswer = Number(answerValue);
          const isSelected = numericAnswer >= option.min && numericAnswer <= option.max;

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => updateAnswer(option.value)}
              className={`rounded-3xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? "border-primary bg-primary/10 shadow-glow" : "bg-white/75"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black tracking-tight">{option.label}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{option.range}</p>
                </div>
                <span className={`h-4 w-4 rounded-full border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
              </div>
            </button>
          );
        })}
      </div>

      <a
        href="https://www.creditkarma.com/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm leading-6 transition hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="text-muted-foreground">
          Not sure of your score? Get a <span className="font-bold text-primary">free estimate from Credit Karma</span> — no hard inquiry, no impact on your credit.
        </span>
        <ExternalLink className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      </a>

      <DocumentUploadCard
        category="credit"
        title="Verify with your credit report"
        verifiedTitle="Credit verified"
        description="A recent credit report backs up the score you entered. A soft-pull report (like the free Credit Karma one above) works fine."
        verifiedDescription="A participating lender in the pilot could pull this straight from your Backpack instead of running a fresh check."
        uploadLabel="Upload a credit report"
        documents={documents}
        onUpload={onUploadDocuments}
        onRemove={onRemoveDocument}
      />
    </div>
  );
}
