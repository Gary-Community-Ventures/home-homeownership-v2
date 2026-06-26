import { Banknote, Calculator, ChevronRight, ExternalLink, Home, Landmark, PiggyBank, ReceiptText, ShieldCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { createPortal } from "react-dom";

function getBedroomsLabel(bedrooms: number) {
  if (bedrooms <= 0) return "Empty lot";
  return `${bedrooms} bedroom${bedrooms === 1 ? "" : "s"}`;
}

function IncomeImpactVisualization({ answers, result, formatCurrency }: { answers: any; result: any; formatCurrency: (value: number) => string }) {
  const annualIncome = Math.max(0, Number(answers.income) || 0);
  const monthlyIncome = annualIncome / 12;
  const targetRatio = result.paymentToIncomeTarget ?? 0.3;
  const targetAnnualIncome = result.monthlyPayment > 0 ? (result.monthlyPayment * 12) / Math.max(targetRatio, 0.01) : 0;
  const targetMonthlyIncome = targetAnnualIncome / 12;
  const monthlyIncomeGap = Math.max(0, targetMonthlyIncome - monthlyIncome);
  const incomeProgress = targetAnnualIncome > 0 ? Math.min(100, (annualIncome / targetAnnualIncome) * 100) : 100;
  const incomeProgressWidth = `${incomeProgress}%`;
  const incomeGapWidth = `${Math.max(0, 100 - incomeProgress)}%`;
  const showIncomeLabel = incomeProgress >= 18;
  const showIncomeNeededLabel = incomeProgress <= 82;
  const housingTargetWidth = `${Math.min(100, targetRatio * 100)}%`;
  const otherTargetWidth = `${Math.max(0, 100 - targetRatio * 100)}%`;
  const targetRatioLabel = `${Math.round(targetRatio * 100)}%`;
  const targetHousingAmount = monthlyIncome * targetRatio;
  const targetOtherAmount = Math.max(0, monthlyIncome - targetHousingAmount);

  return (
    <div>
      <div>
        <div className="mb-3 text-base font-black">
          <span>Compare your income to the income needed</span>
        </div>
        <div className="overflow-hidden rounded-full bg-secondary/70 shadow-inner" aria-label={`Income is ${Math.round(incomeProgress)} percent of the target income`}>
          <div className="flex h-16 text-sm font-black leading-none">
            <div className={`flex items-center justify-center bg-primary text-primary-foreground ${showIncomeLabel ? "px-2" : "px-0"}`} style={{ width: incomeProgressWidth }}>
              {showIncomeLabel ? "Your income" : null}
            </div>
            <div className={`flex items-center justify-center bg-secondary text-secondary-foreground ${showIncomeNeededLabel ? "px-2" : "px-0"}`} style={{ width: incomeGapWidth }}>
              {showIncomeNeededLabel ? "Income needed" : null}
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm">
          <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-3">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-black text-foreground">Your income</span>
                <span className="shrink-0 font-black text-primary">{formatCurrency(monthlyIncome)}/mo</span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-4 text-muted-foreground">What you have available each month.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-3">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-secondary-foreground/60" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-black text-secondary-foreground">Income needed</span>
                <span className="shrink-0 font-black text-secondary-foreground">{formatCurrency(monthlyIncomeGap)}/mo</span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-4 text-secondary-foreground/80">Additional income needed to reach the target.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-muted p-3">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-muted-foreground/45" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-black text-foreground">Full bar</span>
                <span className="shrink-0 font-black text-foreground">{formatCurrency(targetMonthlyIncome)}/mo</span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-4 text-muted-foreground">The monthly income target for this estimated mortgage.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-primary/10 pt-6">
        <div className="mb-3 flex items-center justify-between gap-3 text-base font-black">
          <span>Split monthly income into mortgage and remaining budget</span>
        </div>
        <div className="relative overflow-hidden rounded-full bg-secondary/70 shadow-inner" aria-label={`Suggested allocation puts ${targetRatioLabel} of income toward housing`}>
          <div className="flex h-16 text-sm font-black leading-none">
            <div className="flex items-center justify-center bg-primary px-2 text-primary-foreground" style={{ width: housingTargetWidth }}>
              Housing {targetRatioLabel}
            </div>
            <div className="flex items-center justify-center bg-secondary px-2 text-secondary-foreground" style={{ width: otherTargetWidth }}>
              Remaining budget
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm">
          <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-3">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-black text-foreground">Housing</span>
                <span className="shrink-0 font-black text-primary">{formatCurrency(targetHousingAmount)}/mo</span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-4 text-muted-foreground">Recommended maximum for the mortgage.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-3">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-secondary-foreground/60" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-black text-secondary-foreground">Remaining budget</span>
                <span className="shrink-0 font-black text-secondary-foreground">{formatCurrency(targetOtherAmount)}/mo</span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-4 text-secondary-foreground/80">Income left for utilities, food, debt, savings, and other costs.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-muted p-3">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-muted-foreground/45" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-black text-foreground">Full bar</span>
                <span className="shrink-0 font-black text-foreground">{formatCurrency(monthlyIncome)}/mo</span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-4 text-muted-foreground">Your total monthly income split into suggested buckets.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ImpactPage({
  currentQuestion,
  answerValue,
  answers,
  result,
  resources,
  formatCurrency,
  explainImpact,
  getAssistanceProgram,
  getCreditScoreOption,
  getLocationsLabel,
  CreditScoreExplanation,
  HouseSizeSvg,
}: {
  currentQuestion: any;
  answerValue: any;
  answers: any;
  result: any;
  resources: any[];
  formatCurrency: (value: number) => string;
  explainImpact: (question: any, answers: any, result: any) => { headline: string; explanation: string };
  getAssistanceProgram: (programId: string) => any;
  getCreditScoreOption: (score: number) => { range: string };
  getLocationsLabel: (locations: string[]) => string;
  CreditScoreExplanation: React.ComponentType<any>;
  HouseSizeSvg: React.ComponentType<{ bedrooms: number; squareFeet: number; compact?: boolean }>;
}) {
  const [openBedroomModal, setOpenBedroomModal] = useState<"monthly" | "downPayment" | null>(null);
  const isBedroomImpact = currentQuestion.key === "bedrooms";
  const bedroomCount = Number(answerValue) || 0;
  const impact = explainImpact(currentQuestion, answers, result);
  const modeledLocationLabel = getLocationsLabel([result.modeledLocation]);
  const shortModeledLocationLabel = modeledLocationLabel.replace(/\s+County$/, "");
  const monthlyBreakdown = result.monthlyPaymentBreakdown ?? {};
  const bedroomExplainers = [
    {
      key: "monthly" as const,
      Icon: Calculator,
      title: "Learn about the monthly amount needed",
      modalTitle: "What's in the monthly estimate",
      amount: `${formatCurrency(result.monthlyPayment)}/mo`,
      summary: null,
      items: [
        {
          Icon: Home,
          label: "Principal + interest",
          value: `${formatCurrency(monthlyBreakdown.principalAndInterest ?? result.monthlyPayment)}/mo`,
          description: "The loan payment for the modeled home price after the down payment and any selected assistance.",
        },
        {
          Icon: ReceiptText,
          label: "Property taxes + homeowners insurance",
          value: `${formatCurrency(monthlyBreakdown.taxesAndInsurance ?? 0)}/mo`,
          description: "A monthly estimate for annual property taxes and insurance, spread across the year.",
        },
        {
          Icon: ShieldCheck,
          label: "Mortgage insurance",
          value: `${formatCurrency(monthlyBreakdown.mortgageInsurance ?? 0)}/mo`,
          description: "Usually required when the modeled down payment is below 20%; it protects the lender.",
        },
      ],
      note: null,
    },
    {
      key: "downPayment" as const,
      Icon: PiggyBank,
      title: "Learn about the upfront cash needed",
      modalTitle: "Upfront cash needed",
      amount: formatCurrency(result.savingsTarget),
      summary: null,
      items: [
        {
          Icon: Banknote,
          label: "Down payment",
          value: formatCurrency(result.cashDownPaymentTarget),
          description: "Your estimated portion of the down payment after selected assistance is applied.",
        },
        {
          Icon: ReceiptText,
          label: "Closing costs",
          value: formatCurrency(result.savingsDeductions),
          description: "A planning estimate for lender fees, title costs, escrow setup, and prepaid taxes or insurance.",
        },
        {
          Icon: Landmark,
          label: "Assistance",
          value: `-${formatCurrency(result.assistanceAmount)}`,
          description: "Selected program help that reduces the cash you need to bring for the modeled down payment.",
        },
      ],
      note: null,
    },
  ];
  const selectedBedroomExplainer = bedroomExplainers.find((explainer) => explainer.key === openBedroomModal);
  const selectedBedroomExplainerItems = selectedBedroomExplainer?.items.filter((item) => item.label !== "Assistance" || result.assistanceAmount > 0) ?? [];

  return (
    <div className="space-y-4">
      {isBedroomImpact ? (
        <div className="grid gap-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-foreground">{getBedroomsLabel(bedroomCount)} in {shortModeledLocationLabel}</h3>
            <HouseSizeSvg bedrooms={bedroomCount} squareFeet={result.estimatedSquareFeet} compact />
          </div>
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Needed per month</p>
                <p className="mt-1 text-2xl font-black tracking-tight text-foreground">{formatCurrency(result.monthlyPayment)}/mo</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Upfront cash needed</p>
                <p className="mt-1 text-2xl font-black tracking-tight text-foreground">{formatCurrency(result.savingsTarget)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : currentQuestion.key !== "income" ? (
        <div className="rounded-3xl border border-primary/15 bg-primary/10 p-4">
          <h3 className="text-xl font-black tracking-tight text-foreground">{impact.headline}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{impact.explanation}</p>
        </div>
      ) : null}

      {currentQuestion.key === "creditScore" ? <CreditScoreExplanation answers={answers} result={result} /> : null}

      {currentQuestion.key === "income" ? (
        <IncomeImpactVisualization answers={answers} result={result} formatCurrency={formatCurrency} />
      ) : isBedroomImpact ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {bedroomExplainers.map((explainer) => (
              <button
                key={explainer.key}
                type="button"
                onClick={() => setOpenBedroomModal(explainer.key)}
                className="group cursor-pointer rounded-3xl border border-primary/20 bg-white/85 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <explainer.Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-black tracking-tight text-foreground">{explainer.title}</span>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground" aria-hidden="true">
                    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selectedBedroomExplainer ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4" role="presentation" onClick={() => setOpenBedroomModal(null)}>
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="bedroom-impact-modal-title"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <selectedBedroomExplainer.Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 id="bedroom-impact-modal-title" className="text-2xl font-black tracking-tight text-foreground">{selectedBedroomExplainer.modalTitle}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenBedroomModal(null)}
                    className="rounded-full px-3 py-1 text-2xl font-black leading-none text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Close explanation"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-5 rounded-3xl bg-primary/10 p-4 text-center">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-primary">Estimate</div>
                  <div className="mt-1 text-4xl font-black tracking-tight text-foreground">{selectedBedroomExplainer.amount}</div>
                  <div className="mt-1 text-sm font-bold text-muted-foreground">{getBedroomsLabel(bedroomCount)} · {modeledLocationLabel}</div>
                </div>
                {selectedBedroomExplainer.summary ? <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">{selectedBedroomExplainer.summary}</p> : null}
                <ul className="mt-4 grid gap-3" aria-label={`${selectedBedroomExplainer.modalTitle} details`}>
                  {selectedBedroomExplainerItems.map((item) => (
                    <li key={item.label} className="flex items-start gap-3 rounded-2xl border bg-white/80 p-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <item.Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-black text-foreground">{item.label}</span>
                          <span className="shrink-0 text-sm font-black text-primary">{item.value}</span>
                        </span>
                        <span className="mt-1 block text-sm font-semibold leading-5 text-muted-foreground">{item.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                {selectedBedroomExplainer.note ? <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-3 text-sm font-bold leading-6 text-muted-foreground">{selectedBedroomExplainer.note}</div> : null}
                <button
                  type="button"
                  onClick={() => setOpenBedroomModal(null)}
                  className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-black text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Got it
                </button>
              </div>
            </div>,
            document.body,
          ) : null}
        </>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-3xl border bg-white/75 p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="flex items-start justify-between gap-3 font-black tracking-tight">
                <span>{resource.title}</span>
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-primary" aria-hidden="true" />
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{resource.description}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
