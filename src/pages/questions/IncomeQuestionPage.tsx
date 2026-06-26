import { Input } from "@/components/ui/input";

const incomeFrequencyOptions = [
  { value: "weekly", label: "Weekly", multiplier: 52 },
  { value: "biweekly", label: "Every 2 weeks", multiplier: 26 },
  { value: "monthly", label: "Monthly", multiplier: 12 },
  { value: "annual", label: "Annual", multiplier: 1 },
];

export function IncomeQuestionPage({ currentQuestion, answerValue, answers, householdSizeOptions, setAnswers, updateAnswer, updateHouseholdSize }: any) {
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

      <div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Household size</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Include everyone who will live in the home; larger households add everyday cost pressure to the score.</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {householdSizeOptions.map((size: number) => {
            const isSelected = answers.householdSize === size;

            return (
              <button
                key={size}
                type="button"
                onClick={() => updateHouseholdSize(size)}
                className={`rounded-2xl border px-3 py-2 text-sm font-black transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? "border-primary bg-primary/10 text-primary shadow-glow" : "bg-white/80 text-foreground"}`}
                aria-pressed={isSelected}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
