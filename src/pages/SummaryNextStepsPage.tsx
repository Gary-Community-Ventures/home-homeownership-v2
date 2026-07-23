import { useState } from "react";
import { createPortal } from "react-dom";
import { Building2, Check, CheckCircle2, Clock, Printer, Send, X } from "lucide-react";
import { ContactCard } from "@/components/home/ContactCard";
import { WalkingPersonSvg } from "@/components/home/HomeVisuals";
import { DocumentUploadCard } from "@/components/home/DocumentUploadCard";
import type { DocumentCategory, DocumentRecord } from "@/App";

const IDF_DOCUMENT_LABELS: Record<string, string> = {
  income: "Income (paystub)",
  assets: "Savings / asset statement",
  giftLetter: "Gift letter",
  credit: "Credit report",
  firstTimeBuyer: "First-time buyer proof",
  firstGeneration: "First-generation buyer affidavit",
  disability: "Disability documentation",
  veteran: "Veteran documentation",
  employer: "Employer / workforce letter",
  education: "Homebuyer education certificate",
  preApproval: "Lender pre-approval letter",
  selfId: "Self-identification form",
};

const OTHER_DOCUMENTS: { category: DocumentCategory; title: string; verifiedTitle: string; description: string; verifiedDescription: string; uploadLabel: string }[] = [
  {
    category: "firstTimeBuyer",
    title: "First-time buyer proof",
    verifiedTitle: "First-time buyer status verified",
    description: "Most assistance programs require this — usually shown with a few years of tax transcripts.",
    verifiedDescription: "On file — programs that require first-time buyer status can confirm this without new paperwork.",
    uploadLabel: "Upload proof",
  },
  {
    category: "firstGeneration",
    title: "First-generation buyer affidavit",
    verifiedTitle: "First-generation status verified",
    description: "Needed for programs like CHFA FirstGeneration that prioritize buyers whose parents haven't owned a home.",
    verifiedDescription: "On file for programs that prioritize first-generation buyers.",
    uploadLabel: "Upload affidavit",
  },
  {
    category: "disability",
    title: "Disability documentation",
    verifiedTitle: "Disability documentation verified",
    description: "Required for programs like CHFA HomeAccess or CHAC's disability path.",
    verifiedDescription: "On file for disability-specific assistance programs.",
    uploadLabel: "Upload documentation",
  },
  {
    category: "veteran",
    title: "Veteran documentation (DD-214)",
    verifiedTitle: "Veteran status verified",
    description: "Unlocks veteran-specific exceptions on a few programs.",
    verifiedDescription: "On file for programs with veteran exceptions.",
    uploadLabel: "Upload DD-214",
  },
  {
    category: "employer",
    title: "Employer or workforce verification letter",
    verifiedTitle: "Employer verification confirmed",
    description: "Needed for local workforce programs tied to a specific employer, county, or service area.",
    verifiedDescription: "On file for workforce-restricted assistance programs.",
    uploadLabel: "Upload letter",
  },
  {
    category: "education",
    title: "Homebuyer education certificate",
    verifiedTitle: "Education certificate verified",
    description: "A short course required by many DPA programs before closing — often free through a housing counselor.",
    verifiedDescription: "On file — programs that require homebuyer education can confirm you've completed it.",
    uploadLabel: "Upload certificate",
  },
  {
    category: "preApproval",
    title: "Lender pre-approval letter",
    verifiedTitle: "Pre-approval on file",
    description: "You'll get this once you connect with a lender below — add it here when you have it.",
    verifiedDescription: "Your realtor and any program you apply to can reference this pre-approval.",
    uploadLabel: "Upload pre-approval letter",
  },
  {
    category: "selfId",
    title: "Program self-identification form",
    verifiedTitle: "Self-identification on file",
    description: "A few programs (like the Dearfield Fund) require a self-identification form as part of eligibility.",
    verifiedDescription: "On file for programs that require self-identification.",
    uploadLabel: "Upload form",
  },
];

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
  documents,
  onUploadDocuments,
  onRemoveDocument,
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
  documents: DocumentRecord[];
  onUploadDocuments: (category: DocumentCategory, files: FileList) => void;
  onRemoveDocument: (id: string) => void;
}) {
  const [questionnaireType, setQuestionnaireType] = useState<"lender" | "realtor" | null>(null);
  const [showIdfHandoff, setShowIdfHandoff] = useState(false);
  const [idfSubmitted, setIdfSubmitted] = useState(false);
  const [showBrowseOptions, setShowBrowseOptions] = useState(false);
  const program = getAssistanceProgram(answers.assistanceProgram);
  const selectedAffordableProgram = result.selectedAffordablePrograms[0];
  const bedroomsLabel = answers.bedrooms === 0 ? "empty lot" : `${answers.bedrooms} bedroom${answers.bedrooms === 1 ? "" : "s"}`;
  const incomeProgress = Math.round(Math.max(0, Math.min(100, result.monthlyPaymentReadiness)));
  const downPaymentProgress = Math.round(Math.max(0, Math.min(100, result.downPaymentReadiness)));
  const paymentToIncomeTarget = result.paymentToIncomeTarget ?? 0.3;
  const paymentToIncomeTargetPercent = Math.round(paymentToIncomeTarget * 100);
  const incomeAvailableForPayment = (Number(answers.income) / 12) * paymentToIncomeTarget;
  const downPaymentCovered = Math.min(result.savingsTarget, result.savings);
  const incomeFrequencyLabel = incomeFrequencyLabels[answers.incomeFrequency] ?? "annual";
  const modeledHomeLabel = `${bedroomsLabel} in ${getLocationsLabel([result.modeledLocation])}`;
  const summaryItems: { label: string; value: string; step: UpdateStepKey }[] = [
    { label: "Location + home target", value: `${bedroomsLabel} in ${getLocationsLabel(answers.location)}`, step: "bedrooms" },
    { label: "Income", value: answers.income === "" ? "Not entered" : `${formatCurrency(answers.income)} annual (${incomeFrequencyLabel} entry)`, step: "income" },
    { label: "Savings", value: answers.savings === "" ? "Not entered" : formatCurrency(answers.savings), step: "savings" },
    { label: "Credit", value: getCreditScoreOption(answers.creditScore).range, step: "creditScore" },
    { label: selectedAffordableProgram ? "Affordable ownership choice" : "Down payment choice", value: selectedAffordableProgram ? selectedAffordableProgram.name : program.title, step: "assistanceProgram" },
  ];
  const lenderContacts = selectedLender ? [selectedLender, ...lenderOptions.filter((contact) => contact.id !== selectedLender.id)].slice(0, 2) : lenderOptions;
  const realtorContacts = selectedRealtor ? [selectedRealtor, ...realtorOptions.filter((contact) => contact.id !== selectedRealtor.id)].slice(0, 2) : realtorOptions;

  // Readiness verdict: a single, plain answer built from the two things the score blends.
  const score = Math.round(result.score ?? 0);
  const cashStillNeeded = Math.max(0, Math.round(result.cashNeededAfterAssistance ?? 0));
  const monthlyShortfall = Math.max(0, Math.round((result.monthlyPayment ?? 0) - incomeAvailableForPayment));
  const isReady = score >= 80;
  const isClose = score >= 50 && score < 80;
  // The lower of the two readiness scores is the bigger constraint.
  const limitingFactor: "income" | "cash" = incomeProgress <= downPaymentProgress ? "income" : "cash";
  // At 50%+ readiness, a warm handoff to a real lender partner is worth offering front and center;
  // below that, exploring lenders/realtors independently is still the more honest next step.
  const isGoodPosition = score >= 50;
  const verifiedDocuments = documents.filter((doc) => doc.status === "verified");
  const assistanceProgramLabel = selectedAffordableProgram ? selectedAffordableProgram.name : program.title;
  const isRequestingAssistance = Boolean(selectedAffordableProgram) || answers.assistanceProgram !== "none";
  const readinessHeadline = isReady
    ? "You look ready to buy this home"
    : isClose
      ? "You're getting close to buying this home"
      : "You're still getting ready to buy this home";
  const readyAnswer = isReady
    ? "Based on these estimates, buying this home looks realistic. The main step left is to confirm the numbers with a lender before making offers."
    : isClose
      ? "Not quite yet for this exact home — but you're within reach. Closing one gap below would get you there."
      : "Not yet for this specific home. The estimates show a meaningful gap to close first, but you have a clear target to work toward.";
  const limitingText = isReady
    ? "Both your income and your savings are close to the targets for this home."
    : limitingFactor === "income"
      ? `Monthly payment is the bigger hurdle. The estimated ${formatCurrency(result.monthlyPayment)}/mo is about ${formatCurrency(monthlyShortfall)}/mo above the ${paymentToIncomeTargetPercent}% of income lenders typically look for.`
      : `Upfront cash is the bigger hurdle. After your savings, you'd still need about ${formatCurrency(cashStillNeeded)} for the down payment and closing costs.`;
  const reachingTargetText = isReady
    ? "Confirming these numbers with a lender is the main remaining step."
    : limitingFactor === "income"
      ? "Raising income, choosing a lower price, or a lower rate would bring the monthly payment into a sustainable range — the main thing lenders check."
      : `Covering that ${formatCurrency(cashStillNeeded)} — through more savings or down payment assistance — would let you pay the down payment and closing costs without stretching.`;

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
      <div className="space-y-3 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 to-white/85 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Your readiness</p>
            <h3 className="mt-1 text-2xl font-black leading-tight tracking-tight">{readinessHeadline}</h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-3xl font-black leading-none text-primary">{score}%</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{result.recommendation}</p>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{readyAnswer}</p>
        <p className="text-sm leading-6 text-muted-foreground">
          <span className="font-bold text-foreground">Why this score:</span> it blends two things — your income covers about{" "}
          <strong className="font-bold text-foreground">{incomeProgress}%</strong> of the estimated monthly payment, and your savings cover about{" "}
          <strong className="font-bold text-foreground">{downPaymentProgress}%</strong> of the upfront cash.
        </p>
        <div className="rounded-2xl border border-primary/20 bg-white/70 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Biggest factor right now</p>
          <p className="mt-1 text-sm leading-6 text-foreground">{limitingText}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{reachingTargetText}</p>
        </div>
      </div>

      {isGoodPosition ? (
        <div className="rounded-3xl border-2 border-[#12233f]/15 bg-gradient-to-br from-[#12233f]/5 to-white/90 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#12233f] text-white shadow-md" aria-hidden="true">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#12233f]">Your Backpack makes this fast</p>
              <h3 className="mt-1 text-xl font-black tracking-tight">
                Want to seek your pre-approval and automatically apply for down payment assistance?
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your Backpack already has your answers saved
            {verifiedDocuments.length > 0 ? ` and ${verifiedDocuments.length} document${verifiedDocuments.length === 1 ? "" : "s"} verified` : ""} —
            Impact Development Fund (IDF) can pull this instead of asking you to start from scratch.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-[#12233f]">
            <Clock className="h-4 w-4" aria-hidden="true" />
            Most applications take 15–20 minutes. Yours takes about 2.
          </p>
          <button
            type="button"
            onClick={() => {
              setIdfSubmitted(false);
              setShowIdfHandoff(true);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#12233f] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#193154] hover:shadow-lg"
          >
            Start with Impact Development Fund
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-white/85 to-primary/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">The home you're modeling</p>
        <div className="mt-4 rounded-3xl border bg-white/75 p-4">
          <p className="text-sm font-black capitalize tracking-tight">{modeledHomeLabel}</p>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Purchase price</p>
              <p className="mt-1 font-black tracking-tight">{formatCurrency(result.estimatedPrice)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Upfront cash needed</p>
              <p className="mt-1 font-black tracking-tight">{formatCurrency(result.savingsTarget)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Monthly payment</p>
              <p className="mt-1 font-black tracking-tight">{formatCurrency(result.monthlyPayment)}/mo</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          <ProgressBar
            label="Income for payment"
            value={incomeProgress}
            currentAmount={`${formatCurrency(incomeAvailableForPayment)} available/mo`}
            targetAmount={`${formatCurrency(result.monthlyPayment)}/mo`}
            description={`This compares a ${paymentToIncomeTargetPercent}% income target with the modeled monthly payment.`}
          />
          <ProgressBar
            label="Upfront cash"
            value={downPaymentProgress}
            currentAmount={`${formatCurrency(downPaymentCovered)} saved`}
            targetAmount={formatCurrency(result.savingsTarget)}
            description={cashStillNeeded > 0
              ? `Total upfront cash after your selected down payment assistance is ${formatCurrency(result.savingsTarget)} (down payment plus closing costs). You've saved ${formatCurrency(downPaymentCovered)}, so about ${formatCurrency(cashStillNeeded)} is still needed.`
              : `Total upfront cash after your selected down payment assistance is ${formatCurrency(result.savingsTarget)} (down payment plus closing costs). Your savings cover it.`}
          />
        </div>
      </div>

      <div className="rounded-3xl border bg-white/60 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Your answers</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Tap Update on any answer to change it and see your readiness recalculate.</p>
        <div className="mt-2 divide-y divide-border/70">
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
      </div>

      <div className="rounded-3xl border bg-white/60 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Before you connect below</p>
        <h3 className="mt-1 text-xl font-black tracking-tight">Other documents your lender may ask for</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Income, savings, and credit are already covered earlier in your Backpack. These depend on which programs and
          eligibility paths you're exploring — add what applies to you now, or bring the rest to your first conversation.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {OTHER_DOCUMENTS.map((doc) => (
            <DocumentUploadCard
              key={doc.category}
              category={doc.category}
              title={doc.title}
              verifiedTitle={doc.verifiedTitle}
              description={doc.description}
              verifiedDescription={doc.verifiedDescription}
              uploadLabel={doc.uploadLabel}
              documents={documents}
              onUpload={onUploadDocuments}
              onRemove={onRemoveDocument}
              compact
            />
          ))}
        </div>
      </div>

      {!isGoodPosition ? (
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
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Get a written pre-approval and confirm they work with your chosen program.</p>
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
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Choose one who knows your area and first-time buyer programs.</p>
            <div className="mt-4 divide-y divide-border/70">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Realtor options to contact</p>
                <button type="button" onClick={onFindRealtor} className="text-xs font-bold text-primary underline-offset-4 hover:underline">See all</button>
              </div>
              {realtorContacts.map((contact) => <ContactCard key={contact.id} contact={contact} compact />)}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border bg-white/50 p-4">
          <button
            type="button"
            onClick={() => setShowBrowseOptions((current) => !current)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Prefer to browse on your own?</p>
              <p className="mt-1 text-sm text-muted-foreground">You can still explore independent lenders and realtors instead of IDF.</p>
            </div>
            <span className="shrink-0 text-xs font-bold text-muted-foreground underline-offset-4 hover:underline">
              {showBrowseOptions ? "Hide" : "Show options"}
            </span>
          </button>
          {showBrowseOptions ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onFindLender}
                className="rounded-full bg-secondary px-3.5 py-2 text-xs font-bold text-secondary-foreground transition hover:bg-secondary/80"
              >
                Browse lenders
              </button>
              <button
                type="button"
                onClick={onFindRealtor}
                className="rounded-full bg-secondary px-3.5 py-2 text-xs font-bold text-secondary-foreground transition hover:bg-secondary/80"
              >
                Browse realtors
              </button>
            </div>
          ) : null}
        </div>
      )}

      {questionnaireModal && typeof document !== "undefined" ? createPortal(questionnaireModal, document.body) : null}
      {showIdfHandoff && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3" role="dialog" aria-modal="true" aria-labelledby="idf-title">
              <button type="button" className="absolute inset-0 cursor-default" onClick={() => setShowIdfHandoff(false)} aria-label="Close" />
              <div className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center gap-2 border-b bg-[#f3f1ea] px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e05d44]" aria-hidden="true" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e0b44d]" aria-hidden="true" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4da35e]" aria-hidden="true" />
                  <span className="ml-2 truncate rounded-full bg-white px-3 py-1 text-[0.7rem] font-semibold text-muted-foreground shadow-inner">
                    partner.impactdevelopmentfund.org/apply
                  </span>
                </div>

                <div className="no-scrollbar overflow-y-auto">
                  <div className="bg-[#12233f] px-5 py-4 text-white">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15" aria-hidden="true">
                        <Building2 className="h-5 w-5" />
                      </span>
                      <div>
                        <p id="idf-title" className="text-sm font-black tracking-tight">Impact Development Fund</p>
                        <p className="text-[0.7rem] font-semibold text-white/70">Pre-approval + down payment assistance</p>
                      </div>
                    </div>
                  </div>

                  {idfSubmitted ? (
                    <div className="space-y-4 p-5 text-center">
                      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#12233f]/10 text-[#12233f]">
                        <CheckCircle2 className="h-8 w-8" />
                      </span>
                      <div>
                        <h3 className="text-xl font-black tracking-tight">Sent to Impact Development Fund</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {isRequestingAssistance ? (
                            <>
                              They'll follow up within 1 business day to confirm your pre-approval and your {assistanceProgramLabel} application.
                            </>
                          ) : (
                            <>They'll follow up within 1 business day to confirm your pre-approval.</>
                          )}{" "}
                          Nothing else to fill out for now.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowIdfHandoff(false)}
                        className="rounded-full bg-[#12233f] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#193154]"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 p-5">
                      <div className="flex items-start gap-2.5 rounded-2xl bg-[#12233f]/5 p-3">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#12233f]" aria-hidden="true" />
                        <p className="text-xs leading-5 text-[#12233f]">
                          Most applicants spend 15–20 minutes here. Because your Backpack already covers this, it's
                          pre-filled below — expect about 2 minutes.
                        </p>
                      </div>

                      <div>
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">From your Backpack</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-2xl border bg-muted/30 px-3 py-2">
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Target home</p>
                            <p className="mt-0.5 text-sm font-black capitalize tracking-tight">{modeledHomeLabel}</p>
                          </div>
                          <div className="rounded-2xl border bg-muted/30 px-3 py-2">
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Annual income</p>
                            <p className="mt-0.5 text-sm font-black tracking-tight">{answers.income === "" ? "Not entered" : formatCurrency(answers.income)}</p>
                          </div>
                          <div className="rounded-2xl border bg-muted/30 px-3 py-2">
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Savings</p>
                            <p className="mt-0.5 text-sm font-black tracking-tight">{answers.savings === "" ? "Not entered" : formatCurrency(answers.savings)}</p>
                          </div>
                          <div className="rounded-2xl border bg-muted/30 px-3 py-2">
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Credit</p>
                            <p className="mt-0.5 text-sm font-black tracking-tight">{getCreditScoreOption(answers.creditScore).range}</p>
                          </div>
                          <div className="rounded-2xl border bg-muted/30 px-3 py-2 sm:col-span-2">
                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Requesting</p>
                            <p className="mt-0.5 text-sm font-black tracking-tight">{assistanceProgramLabel}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">Documents attached</p>
                        {verifiedDocuments.length ? (
                          <div className="mt-2 space-y-1.5">
                            {verifiedDocuments.map((doc) => (
                              <div key={doc.id} className="flex items-center gap-2 rounded-xl bg-muted/30 px-3 py-1.5">
                                <Check className="h-3.5 w-3.5 shrink-0 text-[#12233f]" aria-hidden="true" />
                                <p className="truncate text-xs font-bold">{IDF_DOCUMENT_LABELS[doc.category] ?? doc.category}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs italic text-muted-foreground">
                            None verified yet — IDF may ask you for these directly instead.
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIdfSubmitted(true)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#12233f] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#193154]"
                      >
                        <Send className="h-4 w-4" aria-hidden="true" />
                        Submit application to IDF
                      </button>
                      <p className="text-center text-[0.65rem] leading-5 text-muted-foreground">
                        Concept mockup of a warm handoff to a real lender partner — no application is actually sent.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowIdfHandoff(false)}
                  className="absolute right-3 top-2.5 rounded-full bg-white/15 p-1.5 text-white transition hover:bg-white/25"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
