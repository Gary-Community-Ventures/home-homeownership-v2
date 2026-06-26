export function AssistanceQuestionPage({
  answerValue,
  answers,
  result,
  showAssistanceProgramPicker,
  assistanceSelectionMode,
  eligibility,
  setAssistanceSelectionMode,
  setShowAssistanceProgramPicker,
  setAnswers,
  updateEligibility,
  toggleAffordableProgram,
  AssistancePathChoice,
  DownPaymentAssistanceList,
}: any) {
  if (!showAssistanceProgramPicker) {
    return (
      <div className="space-y-4">
        <AssistancePathChoice
          selectedPath={assistanceSelectionMode === "choose" ? null : assistanceSelectionMode}
          onChoosePath={(path: "dpa" | "affordable") => {
            setAssistanceSelectionMode(path);
            if (path === "dpa") setAnswers((current: any) => ({ ...current, affordablePrograms: [] }));
            if (path === "affordable") setAnswers((current: any) => ({ ...current, assistanceProgram: "none" }));
          }}
          onChooseNone={() => {
            setAssistanceSelectionMode("none");
            setAnswers((current: any) => ({ ...current, assistanceProgram: "none", affordablePrograms: [] }));
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DownPaymentAssistanceList
        result={result}
        locations={answers.location}
        selectedProgramId={answers.affordablePrograms.length ? "" : String(answerValue)}
        selectedAffordableProgramIds={answers.affordablePrograms}
        eligibility={eligibility}
        mode={assistanceSelectionMode === "affordable" ? "affordable" : "dpa"}
        onEligibilityChange={updateEligibility}
        onSelect={(programId: string) => {
          setAnswers((current: any) => ({
            ...current,
            assistanceProgram: current.assistanceProgram === programId ? "none" : programId,
            affordablePrograms: [],
          }));
        }}
        onAffordableProgramToggle={toggleAffordableProgram}
        onChangePath={() => setShowAssistanceProgramPicker(false)}
      />
    </div>
  );
}
