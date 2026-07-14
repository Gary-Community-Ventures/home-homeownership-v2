import { Check, Target } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SavingsQuestionPage({ currentQuestion, answerValue, updateAnswer, result, formatCurrency }: any) {
  const savings = Number(result?.savings) || 0;
  const target = Math.max(0, Math.round(result?.savingsTarget ?? 0));
  const gap = Math.max(0, Math.round(result?.cashNeededAfterAssistance ?? 0));
  const surplus = Math.max(0, savings - target);
  const progress = target > 0 ? Math.min(100, Math.round((savings / target) * 100)) : 100;
  const isCovered = target > 0 && gap <= 0;
  const showFeedback = (result?.estimatedPrice ?? 0) > 0 && target > 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">$</span>
        <Input
          className="pl-8 text-left text-lg font-semibold"
          type="number"
          min={currentQuestion.min}
          max={currentQuestion.max}
          step={currentQuestion.step}
          value={answerValue}
          onChange={(event) => updateAnswer(event.target.value === "" ? "" : Number(event.target.value))}
        />
      </div>

      {showFeedback ? (
        <div
          aria-live="polite"
          className="space-y-3 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 to-white/85 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              Estimated cash to buy
            </span>
            <span className="text-lg font-black tracking-tight">{formatCurrency(target)}</span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{formatCurrency(savings)} saved so far</span>
            <span className="font-black text-primary">{progress}%</span>
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
            <p className="text-sm leading-6 text-muted-foreground">
              About <span className="font-black text-foreground">{formatCurrency(gap)}</span> to go to reach the estimated
              3.5% down payment plus closing costs and a small cushion.
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-3xl bg-muted/70 p-4 text-sm leading-6 text-muted-foreground">
          Enter your location and home size first, and we'll show how your savings compare to the estimated cash needed to buy.
        </p>
      )}
    </div>
  );
}
