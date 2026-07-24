import { Check, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { DocumentUploadCard } from "@/components/home/DocumentUploadCard";

export function SavingsQuestionPage({ currentQuestion, answerValue, updateAnswer, result, formatCurrency, documents, onUploadDocuments, onRemoveDocument }: any) {
  const savings = Number(result?.savings) || 0;
  const target = Math.max(0, Math.round(result?.savingsTarget ?? 0));
  const gap = Math.max(0, Math.round(result?.cashNeededAfterAssistance ?? 0));
  const surplus = Math.max(0, savings - target);
  const estimateReady = (result?.estimatedPrice ?? 0) > 0;
  const isCovered = estimateReady && gap <= 0;

  const rangeMin = currentQuestion.min ?? 0;
  const rangeMax = currentQuestion.max ?? 200000;
  const step = currentQuestion.step ?? 1000;
  // Scale the bar around the goal (roughly mid-track) with headroom to overshoot; kept stable so the
  // thumb doesn't recoil as the amount changes.
  const sliderMax = Math.min(rangeMax, Math.max(50000, Math.ceil((target * 2) / 10000) * 10000));
  const sliderValue = Math.min(Math.max(savings, rangeMin), sliderMax);
  const goalPercent = sliderMax > 0 ? Math.min(100, (target / sliderMax) * 100) : 0;
  const closingCosts = Math.max(0, result?.savingsDeductions ?? 0);
  const closingCostPercentOfPrice = (result?.estimatedPrice ?? 0) > 0 ? Math.round((closingCosts / result.estimatedPrice) * 1000) / 10 : 0;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Enter how much you have saved</p>
        <div className="relative mt-2">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">$</span>
          <Input
            className="pl-8 text-left text-lg font-semibold"
            type="number"
            min={rangeMin}
            max={rangeMax}
            step={step}
            value={answerValue}
            onChange={(event) => updateAnswer(event.target.value === "" ? "" : Number(event.target.value))}
            aria-label="Your savings"
          />
        </div>
      </div>

      {estimateReady ? (
        <div className="space-y-4" aria-live="polite">
          <div>
            <div className="relative pt-7">
              {goalPercent > 2 && goalPercent < 100 ? (
                <div className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${goalPercent}%` }}>
                  <span className="whitespace-nowrap rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-primary">
                    Goal {formatCurrency(target)}
                  </span>
                  <span className="mt-0.5 h-2.5 w-px bg-primary/50" aria-hidden="true" />
                </div>
              ) : null}
              <Slider
                min={rangeMin}
                max={sliderMax}
                step={step}
                value={[sliderValue]}
                onValueChange={([value]) => updateAnswer(value)}
                aria-label="Adjust how much you have saved"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{formatCurrency(0)}</span>
              <span>{formatCurrency(sliderMax)}</span>
            </div>
            <p className="mt-1 text-[0.7rem] leading-4 text-muted-foreground">
              That goal includes {formatCurrency(closingCosts)} in closing costs (~{closingCostPercentOfPrice}% of price)
            </p>
          </div>

          {isCovered ? (
            <p className="inline-flex items-start gap-2 text-sm font-semibold leading-6 text-primary">
              <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Your savings cover the estimated target
                {surplus > 0 ? <> — about {formatCurrency(surplus)} to spare.</> : "."}
              </span>
            </p>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-black tracking-tight">Down payment assistance could help close this gap</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Many Colorado programs cover part or all of the down payment. We'll explore down payment assistance programs in
                  later steps, where you can add one and see how much of the {formatCurrency(gap)} it could cover.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-3xl bg-muted/70 p-4 text-sm leading-6 text-muted-foreground">
          Enter your location and home size first, and we'll show how your savings compare to the estimated cash needed to buy.
        </p>
      )}

      <DocumentUploadCard
        category="assets"
        title="Verify your savings with a bank or asset statement"
        verifiedTitle="Savings verified"
        description="Shows a lender where your down payment is coming from and how much you have in reserve."
        verifiedDescription="This statement travels in your Backpack — a participating lender could use it instead of asking you to re-submit one."
        uploadLabel="Upload a statement"
        documents={documents}
        onUpload={onUploadDocuments}
        onRemove={onRemoveDocument}
      />

      <DocumentUploadCard
        category="giftLetter"
        title="Using gift funds toward your down payment?"
        verifiedTitle="Gift letter verified"
        description="Several assistance programs allow gift funds for part of the contribution, but need a signed gift letter to prove it isn't a loan."
        verifiedDescription="Your gift letter is on file — programs that allow gift funds can pull it instead of asking for a new one."
        uploadLabel="Upload a gift letter"
        documents={documents}
        onUpload={onUploadDocuments}
        onRemove={onRemoveDocument}
      />
    </div>
  );
}
