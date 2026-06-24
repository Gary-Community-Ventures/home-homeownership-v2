import { useState } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";
import { ContactCard } from "@/components/home/ContactCard";
import { WalkingPersonSvg } from "@/components/home/HomeVisuals";

type Contact = Parameters<typeof ContactCard>[0]["contact"];

const questionnaireQuestions = {
  lender: [
    {
      question: "What loan programs and down payment assistance options do you work with for first-time buyers?",
      idealAnswer: "They can name specific programs, eligibility basics, lender requirements, and how often they close loans using them.",
      why: "Program rules can change the loan type, timeline, cash needed, and whether the estimate is realistic.",
    },
    {
      question: "Can you provide a written pre-approval estimate with rate, monthly payment, and cash-to-close?",
      idealAnswer: "They provide a clear written estimate that separates principal, interest, taxes, insurance, HOA, closing costs, and reserves.",
      why: "A written estimate makes it easier to compare lenders and avoid surprises before making offers.",
    },
    {
      question: "What credit score, debt-to-income ratio, and savings do I need for the options you recommend?",
      idealAnswer: "They explain the minimums, the stronger target numbers, and what would improve your approval odds.",
      why: "These are the biggest approval levers and help you know what to fix before paying for inspections or applications.",
    },
    {
      question: "Which costs can change before closing, and how much should I keep aside for reserves?",
      idealAnswer: "They identify variable costs, explain when numbers lock, and recommend a practical reserve cushion after closing.",
      why: "Cash-to-close can move as taxes, insurance, rates, and credits update, so reserves protect you from last-minute gaps.",
    },
    {
      question: "How quickly can you close, and who will be my main contact during underwriting?",
      idealAnswer: "They give a typical timeline, known bottlenecks, and a direct contact who can answer file-specific questions.",
      why: "Reliable communication and timing matter when your offer has deadlines or program approvals.",
    },
  ],
  realtor: [
    {
      question: "How familiar are you with my target neighborhoods, HOAs, and first-time buyer programs?",
      idealAnswer: "They know local inventory, common HOA issues, taxes, insurance patterns, and any program rules that affect offers.",
      why: "Local experience helps you avoid homes that look affordable but fail program, HOA, or monthly-payment requirements.",
    },
    {
      question: "What price range and home types should I focus on based on this budget?",
      idealAnswer: "They translate your lender numbers into a practical search range and explain tradeoffs by home type and location.",
      why: "A clear search range saves time and reduces the risk of falling for homes that do not fit your real payment target.",
    },
    {
      question: "How do you help evaluate inspection issues, resale tradeoffs, and offer risks?",
      idealAnswer: "They walk through red flags, likely repair costs, negotiation options, and how each issue could affect resale.",
      why: "The cheapest home can become expensive if repairs, layout, or resale limitations are missed.",
    },
    {
      question: "What costs beyond the purchase price should I expect in this area?",
      idealAnswer: "They discuss HOA dues, utilities, taxes, insurance, inspections, appraisal gaps, repairs, and moving costs.",
      why: "Monthly and upfront costs beyond price determine whether the home is sustainable after closing.",
    },
    {
      question: "How do you coordinate with my lender and assistance program requirements before we make an offer?",
      idealAnswer: "They verify financing constraints, timelines, required contract language, and property eligibility before offer submission.",
      why: "Early coordination prevents offers that cannot close because of loan, assistance, or property restrictions.",
    },
  ],
};
type UpdateStepKey = "location" | "bedrooms" | "income" | "savings" | "creditScore" | "assistanceProgram";

const incomeFrequencyLabels: Record<string, string> = {
  weekly: "weekly",
  biweekly: "every 2 weeks",
  monthly: "monthly",
  annual: "annual",
};

export function SummaryNextStepsPage({
  answers,
  result,
  selectedLender,
  selectedRealtor,
  lenderOptions,
  realtorOptions,
  getAssistanceProgram,
  getLocationsLabel,
  getCreditScoreOption,
  getCreditScoreMilestone,
  formatCurrency,
  onUpdateStep,
  onFindLender,
  onFindRealtor,
}: {
  answers: any;
  result: any;
  selectedLender: Contact | null;
  selectedRealtor: Contact | null;
  lenderOptions: Contact[];
  realtorOptions: Contact[];
  getAssistanceProgram: (programId: string) => any;
  getLocationsLabel: (locations: string[]) => string;
  getCreditScoreOption: (score: number) => { range: string };
  getCreditScoreMilestone: (score: number) => string;
  formatCurrency: (value: number) => string;
  onUpdateStep: (step: UpdateStepKey) => void;
  onFindLender: () => void;
  onFindRealtor: () => void;
}) {
  const [questionnaireType, setQuestionnaireType] = useState<"lender" | "realtor" | null>(null);
  const program = getAssistanceProgram(answers.assistanceProgram);
  const selectedAffordableProgram = result.selectedAffordablePrograms[0];
  const bedroomsLabel = answers.bedrooms === 0 ? "empty lot" : `${answers.bedrooms} bedroom${answers.bedrooms === 1 ? "" : "s"}`;
  const incomeProgress = Math.round(Math.max(0, Math.min(100, result.monthlyPaymentReadiness)));
  const downPaymentProgress = Math.round(Math.max(0, Math.min(100, result.downPaymentReadiness)));
  const paymentToIncomeTarget = result.paymentToIncomeTarget ?? 0.3;
  const paymentToIncomeTargetPercent = Math.round(paymentToIncomeTarget * 100);
  const incomeAvailableForPayment = (Number(answers.income) / 12) * paymentToIncomeTarget;
  const downPaymentCovered = Math.min(result.savingsTarget, result.savings + result.assistanceAmount);
  const incomeFrequencyLabel = incomeFrequencyLabels[answers.incomeFrequency] ?? "annual";
  const summaryItems: { label: string; value: string; step: UpdateStepKey }[] = [
    { label: "Location + home target", value: `${bedroomsLabel} in ${getLocationsLabel(answers.location)}`, step: "bedrooms" },
    { label: "Income", value: answers.income === "" ? "Not entered" : `${formatCurrency(answers.income)} annual (${incomeFrequencyLabel} entry)`, step: "income" },
    { label: "Savings", value: answers.savings === "" ? "Not entered" : formatCurrency(answers.savings), step: "savings" },
    { label: "Credit", value: getCreditScoreOption(answers.creditScore).range, step: "creditScore" },
    { label: selectedAffordableProgram ? "Affordable ownership choice" : "Down payment choice", value: selectedAffordableProgram ? selectedAffordableProgram.name : program.title, step: "assistanceProgram" },
  ];
  const lenderContacts = selectedLender ? [selectedLender, ...lenderOptions.filter((contact) => contact.id !== selectedLender.id)].slice(0, 2) : lenderOptions;
  const realtorContacts = selectedRealtor ? [selectedRealtor, ...realtorOptions.filter((contact) => contact.id !== selectedRealtor.id)].slice(0, 2) : realtorOptions;

  function UpdateButton({ step }: { step: UpdateStepKey }) {
    return (
      <button type="button" onClick={() => onUpdateStep(step)} className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground transition hover:bg-secondary/80">
        Update
      </button>
    );
  }

  function ProgressBar({ label, value, currentAmount, targetAmount, description }: { label: string; value: number; currentAmount: string; targetAmount: string; description: string }) {
    return (
      <div className="rounded-3xl border bg-white/75 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-black tracking-tight">{label}</p>
          <p className="text-sm font-black text-primary">{value}%</p>
        </div>
        <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold text-muted-foreground">
          <span>{currentAmount}</span>
          <span>Target {targetAmount}</span>
        </div>
        <div className="relative h-8 rounded-full bg-gradient-to-r from-primary/25 via-primary/60 to-primary shadow-inner">
          <div className="absolute inset-0.5">
            <div
              className="absolute top-1/2 flex h-7 w-7 items-center justify-center overflow-visible rounded-full border-2 border-white bg-white shadow-lg"
              style={{ left: `${value}%`, transform: `translate(-${value}%, -50%)` }}
              aria-hidden="true"
            >
              <WalkingPersonSvg direction="buy" />
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    );
  }

  const questionnaireModal = questionnaireType ? (
    <div className="questionnaire-print-root fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true" aria-labelledby="questionnaire-title">
      <button type="button" className="questionnaire-print-hide absolute inset-0 cursor-default" onClick={() => setQuestionnaireType(null)} aria-label="Close questionnaire" />
      <div className="questionnaire-print-paper relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4 print:border-0 print:px-0 print:py-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Questions to ask</p>
            <h3 id="questionnaire-title" className="mt-1 text-xl font-black tracking-tight">Bring these to your {questionnaireType} conversation</h3>
          </div>
          <button type="button" onClick={() => setQuestionnaireType(null)} className="questionnaire-print-hide shrink-0 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Close questionnaire">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="questionnaire-print-content no-scrollbar space-y-2.5 overflow-y-auto px-5 py-4">
          {questionnaireQuestions[questionnaireType].map((item) => (
            <div key={item.question} className="questionnaire-print-item rounded-2xl bg-muted/30 px-3 py-2.5 text-sm leading-6">
              <p className="font-black tracking-tight text-foreground">{item.question}</p>
              <p className="mt-2 text-muted-foreground"><span className="font-bold text-foreground">Ideal answer: </span>{item.idealAnswer}</p>
              <p className="mt-1 text-muted-foreground"><span className="font-bold text-foreground">Why it matters: </span>{item.why}</p>
            </div>
          ))}
        </div>
        <div className="questionnaire-print-hide grid gap-2 border-t border-border/70 px-5 py-4 sm:grid-cols-2">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Printer className="mr-2 h-4 w-4" />
            Print questionnaire
          </button>
          <button type="button" onClick={() => setQuestionnaireType(null)} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Done
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-white/85 to-primary/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">How close you are</p>
        <div className="mt-4 grid gap-3">
          <ProgressBar
            label="Income for payment"
            value={incomeProgress}
            currentAmount={`${formatCurrency(incomeAvailableForPayment)} available/mo`}
            targetAmount={`${formatCurrency(result.monthlyPayment)}/mo`}
            description={`This compares a ${paymentToIncomeTargetPercent}% income target with the modeled monthly payment.`}
          />
          <ProgressBar
            label="Down payment and upfront cash"
            value={downPaymentProgress}
            currentAmount={`${formatCurrency(downPaymentCovered)} covered`}
            targetAmount={formatCurrency(result.savingsTarget)}
            description={`Savings plus estimated assistance are measured against the upfront savings target.`}
          />
        </div>
      </div>

      <div className="divide-y divide-border/70">
        {summaryItems.map((item) => (
          <div key={item.step} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
              <p className="mt-1 font-black capitalize tracking-tight">{item.value}</p>
            </div>
            <UpdateButton step={item.step} />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="rounded-3xl border bg-white/75 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Next steps</p>
              <h3 className="mt-1 text-xl font-black tracking-tight">Find a lender</h3>
            </div>
            <button type="button" onClick={() => setQuestionnaireType("lender")} className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Show questionnaire
            </button>
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>• Start with a lender who can give a written pre-approval estimate, compare rates, and confirm cash-to-close.</li>
            <li>• Ask lenders if they work with your selected assistance or affordable ownership program before relying on the estimate.</li>
          </ul>
          <div className="mt-4 divide-y divide-border/70">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Lender options to contact</p>
              <button type="button" onClick={onFindLender} className="text-xs font-bold text-primary underline-offset-4 hover:underline">See all</button>
            </div>
            {lenderContacts.map((contact) => <ContactCard key={contact.id} contact={contact} compact />)}
          </div>
        </div>

        <div className="rounded-3xl border bg-white/75 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Next steps</p>
              <h3 className="mt-1 text-xl font-black tracking-tight">Find a realtor</h3>
            </div>
            <button type="button" onClick={() => setQuestionnaireType("realtor")} className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Show questionnaire
            </button>
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>• Choose a realtor who knows your target area, first-time buyer programs, HOA costs, inspection issues, and resale tradeoffs.</li>
          </ul>
          <div className="mt-4 divide-y divide-border/70">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Realtor options to contact</p>
              <button type="button" onClick={onFindRealtor} className="text-xs font-bold text-primary underline-offset-4 hover:underline">See all</button>
            </div>
            {realtorContacts.map((contact) => <ContactCard key={contact.id} contact={contact} compact />)}
          </div>
        </div>
      </div>

      {questionnaireModal && typeof document !== "undefined" ? createPortal(questionnaireModal, document.body) : null}
    </div>
  );
}
