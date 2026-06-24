export function CreditScoreQuestionPage({ answerValue, creditScoreOptions, updateAnswer }: any) {
  return (
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
  );
}
