import type React from "react";
import { AssistanceQuestionPage } from "@/pages/questions/AssistanceQuestionPage";
import { BedroomsQuestionPage } from "@/pages/questions/BedroomsQuestionPage";
import { CreditScoreQuestionPage } from "@/pages/questions/CreditScoreQuestionPage";
import { ImpactPage } from "@/pages/questions/ImpactPage";
import { IncomeQuestionPage } from "@/pages/questions/IncomeQuestionPage";
import { LocationQuestionPage } from "@/pages/questions/LocationQuestionPage";
import { SavingsQuestionPage } from "@/pages/questions/SavingsQuestionPage";

export function QuestionFlowPage(props: {
  showExplanation: boolean;
  currentQuestion: any;
  answerValue: any;
  answers: any;
  result: any;
  resources: any[];
  selectedLocations: string[];
  filteredLocations: { name: string; multiplier: number }[];
  activeLocationIndex: number;
  isLocationOpen: boolean;
  locationSearch: string;
  showAssistanceProgramPicker: boolean;
  assistanceSelectionMode: "choose" | "dpa" | "affordable" | "none";
  eligibility: any;
  householdSizeOptions: number[];
  bedroomOptions: number[];
  creditScoreOptions: { label: string; range: string; min: number; max: number; value: number }[];
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
  explainImpact: (question: any, answers: any, result: any) => string;
  getAssistanceProgram: (programId: string) => any;
  getCreditScoreOption: (score: number) => { range: string };
  estimateHousingForBedrooms: (bedrooms: number, location: string) => any;
  getLocationMultiplier: (location: string) => number;
  setLocationSearch: (value: string) => void;
  setIsLocationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveLocationIndex: React.Dispatch<React.SetStateAction<number>>;
  setModeledLocationOverride: any;
  setAssistanceSelectionMode: (mode: "choose" | "dpa" | "affordable" | "none") => void;
  setShowAssistanceProgramPicker: (value: boolean) => void;
  setAnswers: React.Dispatch<React.SetStateAction<any>>;
  updateAnswer: (value: string | number | string[]) => void;
  updateHouseholdSize: (value: number) => void;
  updateEligibility: any;
  selectLocation: (location: string, index?: number) => void;
  handleLocationKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  toggleAffordableProgram: (programId: string) => void;
  HouseSizeSvg: React.ComponentType<{ bedrooms: number; squareFeet: number; compact?: boolean }>;
  AssistancePathChoice: React.ComponentType<any>;
  DownPaymentAssistanceList: React.ComponentType<any>;
  CreditScoreExplanation: React.ComponentType<any>;
  getLocationsLabel: (locations: string[]) => string;
}) {
  if (props.showExplanation) {
    return <ImpactPage {...props} />;
  }

  switch (props.currentQuestion.key) {
    case "location":
      return <LocationQuestionPage {...props} />;
    case "income":
      return <IncomeQuestionPage {...props} />;
    case "savings":
      return <SavingsQuestionPage {...props} />;
    case "bedrooms":
      return <BedroomsQuestionPage {...props} />;
    case "assistanceProgram":
      return <AssistanceQuestionPage {...props} />;
    case "creditScore":
    default:
      return <CreditScoreQuestionPage {...props} />;
  }
}
