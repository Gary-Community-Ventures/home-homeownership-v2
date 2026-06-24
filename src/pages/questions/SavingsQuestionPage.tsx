import { Input } from "@/components/ui/input";

export function SavingsQuestionPage({ currentQuestion, answerValue, updateAnswer }: any) {
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
    </div>
  );
}
