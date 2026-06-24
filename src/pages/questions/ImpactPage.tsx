import { ExternalLink } from "lucide-react";

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
}: {
  currentQuestion: any;
  answerValue: any;
  answers: any;
  result: any;
  resources: any[];
  formatCurrency: (value: number) => string;
  explainImpact: (question: any, answers: any, result: any) => string;
  getAssistanceProgram: (programId: string) => any;
  getCreditScoreOption: (score: number) => { range: string };
  getLocationsLabel: (locations: string[]) => string;
  CreditScoreExplanation: React.ComponentType<any>;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-primary/15 bg-primary/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{currentQuestion.eyebrow}</p>
        <p className="mt-2 text-lg font-black text-foreground">
          {currentQuestion.key === "income"
            ? `${formatCurrency(Number(answerValue) / 12)}/mo, ${answers.householdSize} person household`
            : currentQuestion.key === "bedrooms"
              ? `${Number(answerValue)} bedroom${Number(answerValue) === 1 ? "" : "s"} in ${result.modeledLocation}`
              : currentQuestion.key === "savings"
                ? formatCurrency(Number(answerValue) || 0)
              : currentQuestion.key === "assistanceProgram"
                ? result.selectedAffordablePrograms[0]?.name ?? getAssistanceProgram(String(answerValue)).title
                : currentQuestion.key === "creditScore"
                  ? getCreditScoreOption(Number(answerValue)).range
                  : getLocationsLabel(answers.location)}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{explainImpact(currentQuestion, answers, result)}</p>
      </div>

      {currentQuestion.key === "creditScore" ? <CreditScoreExplanation answers={answers} result={result} /> : null}

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
    </div>
  );
}
