import { useRef } from "react";
import type { ChangeEvent } from "react";
import { FileCheck2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

const incomeFrequencyOptions = [
  { value: "weekly", label: "Weekly", multiplier: 52 },
  { value: "biweekly", label: "Every 2 weeks", multiplier: 26 },
  { value: "monthly", label: "Monthly", multiplier: 12 },
  { value: "annual", label: "Annual", multiplier: 1 },
];

export function IncomeQuestionPage({ currentQuestion, answerValue, answers, setAnswers, updateAnswer, paystubs, onUploadPaystubs, onRemovePaystub }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const verifiedCount = paystubs.filter((paystub: any) => paystub.status === "verified").length;
  const isVerified = paystubs.length > 0 && verifiedCount === paystubs.length;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) onUploadPaystubs(event.target.files);
    event.target.value = "";
  }

  const selectedFrequency = incomeFrequencyOptions.find((option) => option.value === answers.incomeFrequency) ?? incomeFrequencyOptions[3];
  const displayedIncome = answerValue === "" ? "" : Math.round(Number(answerValue) / selectedFrequency.multiplier);

  function updateIncomeFrequency(nextFrequency: (typeof incomeFrequencyOptions)[number]) {
    setAnswers((current: any) => {
      const currentFrequency = incomeFrequencyOptions.find((option) => option.value === current.incomeFrequency) ?? incomeFrequencyOptions[3];
      const currentDisplayedIncome = current.income === "" ? "" : Math.round(Number(current.income) / currentFrequency.multiplier);

      return {
        ...current,
        incomeFrequency: nextFrequency.value,
        income: currentDisplayedIncome === "" ? "" : currentDisplayedIncome * nextFrequency.multiplier,
      };
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Income frequency</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {incomeFrequencyOptions.map((option) => {
            const isSelected = selectedFrequency.value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateIncomeFrequency(option)}
                className={`rounded-2xl border px-3 py-2 text-sm font-black transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? "border-primary bg-primary/10 text-primary shadow-glow" : "bg-white/80 text-foreground"}`}
                aria-pressed={isSelected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">$</span>
        <Input
          className="pl-8 text-left text-lg font-semibold"
          type="number"
          min={Math.round(currentQuestion.min / selectedFrequency.multiplier)}
          max={Math.round(currentQuestion.max / selectedFrequency.multiplier)}
          step={Math.max(1, Math.round(currentQuestion.step / selectedFrequency.multiplier))}
          value={displayedIncome}
          onChange={(event) => updateAnswer(event.target.value === "" ? "" : Number(event.target.value) * selectedFrequency.multiplier)}
        />
      </div>

      <div className={`rounded-3xl border p-4 ${isVerified ? "border-primary/30 bg-primary/10" : "border-primary/20 bg-primary/5"}`}>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow" aria-hidden="true">
            {isVerified ? <FileCheck2 className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black tracking-tight">
              {isVerified ? "Income verified" : "Verify this income with a paystub"}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {isVerified
                ? "A participating lender or property in the pilot could pull this straight from your Backpack instead of asking you for it again at application time."
                : "Upload paystubs covering your last 30 days of pay. Once verified, you won't need to hand this over again when you apply."}
            </p>

            <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md"
            >
              <Upload className="h-3.5 w-3.5" />
              {paystubs.length ? "Upload another paystub" : "Upload a paystub"}
            </button>

            {paystubs.length ? (
              <div className="mt-3 space-y-2">
                {paystubs.map((paystub: any) => (
                  <div key={paystub.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-3 py-2">
                    <p className="truncate text-xs font-bold">{paystub.name}</p>
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
    </div>
  );
}
