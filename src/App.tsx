import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronsUpDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Answers = {
  location: string;
  income: number;
  bedrooms: number;
  creditScore: number;
  assistanceProgram: string;
};

type QuestionKey = keyof Answers;

type Question = {
  key: QuestionKey;
  eyebrow: string;
  title: string;
  description: string;
  type: "location" | "currency" | "number" | "assistance";
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
};

type Resource = {
  title: string;
  description: string;
};

type EligibilityValue = "yes" | "no" | "unsure";

type EligibilityAnswers = {
  firstTimeBuyer: EligibilityValue;
  firstGenerationBuyer: EligibilityValue;
  disabilityEligible: EligibilityValue;
  veteranEligible: EligibilityValue;
  localRequirement: EligibilityValue;
  ownFundsContribution: EligibilityValue;
  buyerEducation: EligibilityValue;
};

type AssistanceProgram = {
  id: string;
  title: string;
  assistance: string;
  assistanceRate: number;
  assistanceCap?: number;
  assistanceFixed?: number;
  bestFor: string;
  description: string;
};

const STORAGE_KEY = "home-buying-prototype-answers";
const ELIGIBILITY_STORAGE_KEY = "home-buying-prototype-eligibility";

const initialEligibilityAnswers: EligibilityAnswers = {
  firstTimeBuyer: "unsure",
  firstGenerationBuyer: "unsure",
  disabilityEligible: "unsure",
  veteranEligible: "unsure",
  localRequirement: "unsure",
  ownFundsContribution: "unsure",
  buyerEducation: "unsure",
};

const eligibilityQuestions: { key: keyof EligibilityAnswers; label: string; description: string }[] = [
  { key: "firstTimeBuyer", label: "First-time buyer", description: "You have not owned a home recently, usually within the last 3 years." },
  { key: "firstGenerationBuyer", label: "First-generation buyer", description: "Your parents/guardians have not owned a home, depending on program rules." },
  { key: "disabilityEligible", label: "Disability eligibility", description: "You or a qualifying household member has disability documentation." },
  { key: "veteranEligible", label: "Veteran eligibility", description: "You may qualify for veteran-specific exceptions or programs." },
  { key: "localRequirement", label: "Local area/workforce fit", description: "You live, work, or are buying in a required city, county, or community." },
  { key: "ownFundsContribution", label: "Required own funds", description: "You can bring the program’s minimum borrower contribution from allowed sources." },
  { key: "buyerEducation", label: "Buyer education", description: "You can complete required counseling or homebuyer education before closing." },
];

const downPaymentAssistancePrograms: AssistanceProgram[] = [
  {
    id: "none",
    title: "No assistance",
    assistance: "$0",
    assistanceRate: 0,
    bestFor: "I plan to bring my own down payment",
    description: "Continue without a grant or second mortgage and compare the home estimate using your own savings.",
  },
  {
    id: "chfa-firststep-plus",
    title: "CHFA FirstStep Plus",
    assistance: "Up to 3% - 4%",
    assistanceRate: 0.04,
    assistanceCap: 25000,
    bestFor: "Statewide first-time buyers",
    description: "CHFA first mortgage plus optional 0% DPA second. First-time buyer required, 620 minimum credit score, $1,000 minimum contribution, gifts allowed.",
  },
  {
    id: "chfa-smartstep-plus",
    title: "CHFA SmartStep Plus",
    assistance: "Up to 4% second or 3% grant",
    assistanceRate: 0.04,
    assistanceCap: 25000,
    bestFor: "Statewide buyers, not first-time only",
    description: "CHFA first mortgage paired with a DPA second or grant. 620 minimum credit score, $1,000 minimum contribution, gifts allowed, $174,440 statewide income limit.",
  },
  {
    id: "chfa-firstgeneration",
    title: "CHFA FirstGeneration",
    assistance: "$25,000",
    assistanceRate: 0,
    assistanceFixed: 25000,
    bestFor: "Statewide first-generation buyers",
    description: "CHFA first mortgage plus $25K DPA second. Requires first-time and first-generation eligibility for at least one borrower, 620 minimum credit, and $1,000 contribution.",
  },
  {
    id: "chfa-homeaccess",
    title: "CHFA HomeAccess",
    assistance: "$25,000",
    assistanceRate: 0,
    assistanceFixed: 25000,
    bestFor: "Statewide buyers with disability eligibility",
    description: "CHFA grant or second mortgage for borrowers with a permanent disability or custodial parents of a child with a disability. 620 credit score and $500 contribution.",
  },
  {
    id: "chac-immediate",
    title: "CHAC Statewide DPA — Immediate Payback",
    assistance: "Up to 6%, max $12K",
    assistanceRate: 0.06,
    assistanceCap: 12000,
    bestFor: "Statewide first-time buyers",
    description: "CHAC second mortgage that pairs with any first mortgage lender. First-time buyer required, own funds required for minimum contribution, about 110% AMI limit.",
  },
  {
    id: "chac-deferral",
    title: "CHAC Statewide DPA — 5-year deferral",
    assistance: "Up to 6%, max $12K",
    assistanceRate: 0.06,
    assistanceCap: 12000,
    bestFor: "Statewide buyers at 80% AMI",
    description: "CHAC deferred second mortgage. First-time buyer required, own funds required for contribution, counseling and reserves required.",
  },
  {
    id: "chac-disability",
    title: "CHAC Disability Program",
    assistance: "$10,000",
    assistanceRate: 0,
    assistanceFixed: 10000,
    bestFor: "Statewide buyers with disability documentation",
    description: "CHAC second mortgage with a lower $750 minimum contribution. First-time buyer required and gift funds are not allowed for the minimum contribution.",
  },
  {
    id: "metro-dpa",
    title: "MetroDPA",
    assistance: "Up to 6%",
    assistanceRate: 0.06,
    bestFor: "Denver metro and approved counties",
    description: "Second mortgage through approved MetroDPA lenders. Not limited to first-time buyers, 620+ credit score, $216,000 income limit, approved metro-area counties only.",
  },
  {
    id: "aurora-prop-123",
    title: "Aurora DPA (Prop 123)",
    assistance: "4% - 10%",
    assistanceRate: 0.1,
    bestFor: "City of Aurora buyers",
    description: "0% silent second mortgage for Aurora purchases. Not first-time-only, income limit around 120% AMI, repayable on sale, refinance, or payoff.",
  },
  {
    id: "pikes-peak-dpa",
    title: "El Paso County Pikes Peak DPA",
    assistance: "Up to 5%",
    assistanceRate: 0.05,
    bestFor: "El Paso County buyers",
    description: "Forgivable second mortgage at 0% interest. Not first-time-only, 640+ credit score, 50% forgiven over first 5 years and remaining balance at 30 years.",
  },
  {
    id: "boulder-county-bcdpap",
    title: "Boulder County DPA (BCDPAP)",
    assistance: "Up to 10%, max $40K",
    assistanceRate: 0.1,
    assistanceCap: 40000,
    bestFor: "Boulder County outside City of Boulder",
    description: "Second mortgage administered by Longmont. First-time buyer required, 80% AMI limit, own funds required, coaching and CHFA education required.",
  },
  {
    id: "boulder-h2o",
    title: "City of Boulder H2O",
    assistance: "Up to $100K",
    assistanceRate: 0,
    assistanceFixed: 100000,
    bestFor: "City of Boulder first-time buyers",
    description: "Shared appreciation second loan for market-rate homes. First-time buyer required, up to 120% AMI, one household member must work 30+ hours per week.",
  },
  {
    id: "boulder-middle-income",
    title: "City of Boulder Middle Income DPA Pilot",
    assistance: "Up to $200K or 30%",
    assistanceRate: 0.3,
    assistanceCap: 200000,
    bestFor: "Middle-income City of Boulder buyers",
    description: "Deed-restricted zero-interest second mortgage pilot. First-time buyer required, up to about 150% AMI, waitlist and limited availability.",
  },
  {
    id: "boulder-solution-grant",
    title: "Solution Grant Program",
    assistance: "Need-based grant",
    assistanceRate: 0.035,
    bestFor: "Select permanently affordable Boulder homes",
    description: "Grant for buyers of select permanently affordable or Thistle CLT homes in Boulder city limits. Funds are limited and property restrictions apply.",
  },
  {
    id: "colorado-roots",
    title: "Colorado Roots DPA Fund",
    assistance: "Up to 10%, max $50K",
    assistanceRate: 0.1,
    assistanceCap: 50000,
    bestFor: "Selected Colorado communities",
    description: "Impact Development Fund DPA loan. First-time buyer required, 120% AMI limit, minimum contribution is greater of $1,000 or 1% of purchase price.",
  },
  {
    id: "broomfield-chac",
    title: "Broomfield/CHAC DPA",
    assistance: "Up to 10%",
    assistanceRate: 0.1,
    bestFor: "City of Broomfield first-time buyers",
    description: "0% deferred loan administered by CHAC. Prioritizes first-generation buyers, 80% AMI limit, own funds required for minimum contribution.",
  },
  {
    id: "firstbank-idf",
    title: "FirstBank DPA Program",
    assistance: "Up to 20%, max $30K",
    assistanceRate: 0.2,
    assistanceCap: 30000,
    bestFor: "Statewide buyers using FirstBank",
    description: "Impact Development Fund / FirstBank second mortgage. First-time buyer required, 80% AMI limit, 4% interest, 15-year term with monthly payments.",
  },
  {
    id: "dearfield-fund",
    title: "Dearfield Fund for Black Wealth",
    assistance: "Up to 15%, max $50K",
    assistanceRate: 0.15,
    assistanceCap: 50000,
    bestFor: "Black first-time buyers in Denver metro",
    description: "Impact Development Fund shared-appreciation DPA loan. First-time buyer required, self-identification eligibility, 140% AMI limit, six-county Denver metro area.",
  },
  {
    id: "eagle-eclf-shared",
    title: "Eagle County Loan Fund Shared Equity",
    assistance: "Up to 5%",
    assistanceRate: 0.05,
    bestFor: "Eagle County buyers",
    description: "Shared equity second mortgage for Eagle County primary residences. Maximum eligible purchase price $850,000 and repayment includes shared appreciation.",
  },
  {
    id: "eagle-eclf-amortized",
    title: "Eagle County Loan Fund Amortized",
    assistance: "Up to 5%, max $42.5K",
    assistanceRate: 0.05,
    assistanceCap: 42500,
    bestFor: "Eagle County FHA buyers",
    description: "2.5% simple-interest amortized second mortgage with monthly payments. FHA first mortgage only and borrower must contribute at least 50% of loan amount.",
  },
  {
    id: "eagle-ecdoh",
    title: "Eagle County Division of Housing DPA",
    assistance: "Up to 4.5%, max $40K",
    assistanceRate: 0.045,
    assistanceCap: 40000,
    bestFor: "Eagle County buyers at 80% AMI",
    description: "Amortized second mortgage with possible 60-month deferment. 30-year term at 2.5% simple interest and pre-application meeting required.",
  },
  {
    id: "eagle-ranch-erhc",
    title: "Eagle Ranch Housing Corporation DPA",
    assistance: "Program-specific",
    assistanceRate: 0.05,
    bestFor: "Eagle Ranch subdivision buyers",
    description: "Fixed-interest deferred or equity-share product for Eagle Ranch purchases. Narrow geography and specific assistance terms require program confirmation.",
  },
  {
    id: "chfa-sectioneight-plus",
    title: "CHFA SectionEight Homeownership Plus",
    assistance: "Up to 4% second or 3% grant",
    assistanceRate: 0.04,
    assistanceCap: 25000,
    bestFor: "Statewide buyers using Section 8 homeownership voucher",
    description: "CHFA DPA grant or second mortgage. First-time buyer required with veteran exceptions, lower $500/$750 contribution, 620 or program minimum credit score.",
  },
  {
    id: "good-neighbor-next-door",
    title: "Good Neighbor Next Door",
    assistance: "50% discount",
    assistanceRate: 0.5,
    bestFor: "Eligible public servants buying HUD homes",
    description: "HUD purchase-price discount for law enforcement officers, teachers, firefighters, and EMTs buying eligible HUD homes in revitalization areas.",
  },
  {
    id: "colorado-hfa1-plus",
    title: "Colorado HFA1 Plus",
    assistance: "Up to 4%, max $25K",
    assistanceRate: 0.04,
    assistanceCap: 25000,
    bestFor: "Statewide buyers, broad loan types",
    description: "CHFA zero-percent silent second with no monthly payments. Not limited to first-time buyers, $174,440 statewide income limit, $1,000 contribution.",
  },
  {
    id: "chenoa-fund-fha",
    title: "Chenoa Fund DPA for FHA Loans",
    assistance: "3.5% or 5%",
    assistanceRate: 0.05,
    bestFor: "Statewide FHA buyers",
    description: "CBC Mortgage Agency second mortgage with repayable or forgivable options. Not first-time-only, 600 minimum credit score, $0 minimum contribution.",
  },
  {
    id: "chfa-vlip",
    title: "CHFA Preferred Very Low Income (VLIP)",
    assistance: "Up to 4%, max $25K",
    assistanceRate: 0.04,
    assistanceCap: 25000,
    bestFor: "Statewide very-low-income conventional buyers",
    description: "CHFA zero-percent silent second for Freddie Mac conventional loans. Not first-time-only, 620 or Freddie Mac minimum credit score, $1,000 contribution.",
  },
  {
    id: "douglas-dchp",
    title: "Douglas County Housing Partnership DPA",
    assistance: "Confirm with DCHP",
    assistanceRate: 0.035,
    bestFor: "Douglas County first-time buyers",
    description: "Low-interest second mortgage for Douglas County buyers, with preference for residents or workers. 80% AMI limit and 1% minimum contribution.",
  },
  {
    id: "noco-equity-share",
    title: "NoCo Foundation DPA — Equity Share",
    assistance: "Up to 15%, max $97.5K",
    assistanceRate: 0.15,
    assistanceCap: 97500,
    bestFor: "Larimer and Weld County buyers",
    description: "Silent shared-equity second mortgage. Not first-time-only but borrower cannot own other property, 120% AMI limit, 5% own-funds contribution required.",
  },
  {
    id: "estes-valley",
    title: "Estes Valley Workforce Housing Assistance",
    assistance: "Up to 3.5%, max $15K",
    assistanceRate: 0.035,
    assistanceCap: 15000,
    bestFor: "Park R3 School District workforce buyers",
    description: "Low-interest amortizing second mortgage. First-time buyer required, 81% to 150% AMI, $3,000 own-funds contribution, local employment required.",
  },
  {
    id: "greeley-ghope",
    title: "G-HOPE — Greeley Home Ownership Program",
    assistance: "$2.5K - $8K",
    assistanceRate: 0,
    assistanceFixed: 8000,
    bestFor: "Employees in Greeley program boundaries",
    description: "0% forgivable loan for employees of participating Greeley-based employers. Not first-time-only, no income limits, single-family homes only.",
  },
  {
    id: "summit-srlf",
    title: "Summit Revolving Loan Fund DPA",
    assistance: "Up to $40K",
    assistanceRate: 0,
    assistanceFixed: 40000,
    bestFor: "Summit County workforce buyers",
    description: "2% amortizing second mortgage. 620 credit score, 50% to 160% AMI, 2% own-funds contribution, local employment required.",
  },
  {
    id: "eagle-ehop",
    title: "Eagle County Employee Home Ownership Program",
    assistance: "$50,000",
    assistanceRate: 0,
    assistanceFixed: 50000,
    bestFor: "Eagle County Government employees",
    description: "Shared-equity DPA with no monthly payments for eligible Eagle County employees. No income limit, no FHA, and shared appreciation may apply after 24 months.",
  },
  {
    id: "yampa-valley",
    title: "Yampa Valley Housing Authority DPA",
    assistance: "10%, max $20K",
    assistanceRate: 0.1,
    assistanceCap: 20000,
    bestFor: "Routt County workforce buyers",
    description: "Deferred loan originated by IDF. Not first-time-only, 150% AMI limit, minimum contribution greater of $1,000 or 1%, local work requirement.",
  },
];

const initialAnswers: Answers = {
  location: "",
  income: 95000,
  bedrooms: 3,
  creditScore: 720,
  assistanceProgram: "none",
};

const questions: Question[] = [
  {
    key: "location",
    eyebrow: "Colorado market",
    title: "Where are you considering buying?",
    description: "Start typing a Colorado neighborhood, city, county, community, or district.",
    type: "location",
  },
  {
    key: "income",
    eyebrow: "Monthly budget",
    title: "What is your annual household income?",
    description: "Income is the strongest early signal because it determines how much payment you can safely carry.",
    type: "currency",
    min: 30000,
    max: 300000,
    step: 5000,
  },
  {
    key: "bedrooms",
    eyebrow: "Target home",
    title: "How many bedrooms do you need?",
    description: "Compare monthly rent against the estimated mortgage for each home size, then choose the bedroom count that fits your household.",
    type: "number",
    min: 0,
    max: 8,
    step: 1,
    suffix: "bedrooms",
  },
  {
    key: "creditScore",
    eyebrow: "Financing",
    title: "What is your credit score?",
    description: "Credit score affects the interest rate, which can move the monthly payment by hundreds of dollars.",
    type: "number",
    min: 560,
    max: 850,
    step: 5,
  },
  {
    key: "assistanceProgram",
    eyebrow: "Down payment help",
    title: "Which assistance program would you like to explore?",
    description: "Choose a down payment assistance option to see how it changes the estimated cash needed for your target home.",
    type: "assistance",
  },
];

type StepRoute = {
  step: number;
  showExplanation: boolean;
};

function getQuestionStepName(question: Question) {
  return question.key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function getStepName(step: number, showExplanation: boolean) {
  const boundedStep = Math.max(0, Math.min(questions.length - 1, step));
  const questionName = getQuestionStepName(questions[boundedStep]);
  return showExplanation ? `${questionName}-impact` : questionName;
}

function getRouteFromStepName(stepName: string | null): StepRoute {
  if (stepName === "down-payment-assistance") {
    return { step: questions.length - 1, showExplanation: false };
  }

  const normalizedStepName = stepName?.trim().toLowerCase() ?? "";
  const isImpactStep = normalizedStepName.endsWith("-impact");
  const questionName = isImpactStep ? normalizedStepName.slice(0, -"-impact".length) : normalizedStepName;
  const questionIndex = questions.findIndex((question) => getQuestionStepName(question) === questionName);

  if (questionIndex === -1) return { step: 0, showExplanation: false };

  return { step: questionIndex, showExplanation: isImpactStep };
}

function getRouteFromUrl() {
  return getRouteFromStepName(new URLSearchParams(window.location.search).get("step"));
}

const coloradoLocations = [
  { name: "Applewood, Jefferson County", multiplier: 1.16 },
  { name: "Arvada Center, Jefferson County", multiplier: 1.08 },
  { name: "Aspen Core, Pitkin County", multiplier: 2.45 },
  { name: "Athmar Park, Denver County", multiplier: 1.02 },
  { name: "Auraria, Denver County", multiplier: 1.12 },
  { name: "Aurora Highlands, Arapahoe County", multiplier: 1.02 },
  { name: "Baker, Denver County", multiplier: 1.15 },
  { name: "Bear Creek, Jefferson County", multiplier: 1.1 },
  { name: "Belcaro, Denver County", multiplier: 1.42 },
  { name: "Berkeley, Denver County", multiplier: 1.22 },
  { name: "Black Forest, El Paso County", multiplier: 1.0 },
  { name: "Bonnie Brae, Denver County", multiplier: 1.36 },
  { name: "Boulder Junction, Boulder County", multiplier: 1.58 },
  { name: "Briargate, El Paso County", multiplier: 0.96 },
  { name: "Broadmoor, El Paso County", multiplier: 1.12 },
  { name: "Broomfield Heights, Broomfield County", multiplier: 1.22 },
  { name: "Capitol Hill, Denver County", multiplier: 1.1 },
  { name: "Central Business District, Denver County", multiplier: 1.18 },
  { name: "Central Park, Denver County", multiplier: 1.2 },
  { name: "Cherry Creek, Denver County", multiplier: 1.55 },
  { name: "Cherry Hills Village, Arapahoe County", multiplier: 1.82 },
  { name: "City Park, Denver County", multiplier: 1.16 },
  { name: "City Park West, Denver County", multiplier: 1.14 },
  { name: "Civic Center, Denver County", multiplier: 1.12 },
  { name: "Congress Park, Denver County", multiplier: 1.24 },
  { name: "Cory-Merrill, Denver County", multiplier: 1.3 },
  { name: "Crestmoor, Denver County", multiplier: 1.34 },
  { name: "DTC, Arapahoe County", multiplier: 1.2 },
  { name: "Downtown Boulder, Boulder County", multiplier: 1.68 },
  { name: "Downtown Colorado Springs, El Paso County", multiplier: 0.94 },
  { name: "Downtown Denver, Denver County", multiplier: 1.18 },
  { name: "Downtown Fort Collins, Larimer County", multiplier: 1.06 },
  { name: "Downtown Golden, Jefferson County", multiplier: 1.22 },
  { name: "Downtown Grand Junction, Mesa County", multiplier: 0.76 },
  { name: "Downtown Littleton, Arapahoe County", multiplier: 1.12 },
  { name: "East Colfax, Denver County", multiplier: 0.98 },
  { name: "Edgewater, Jefferson County", multiplier: 1.14 },
  { name: "Englewood CityCenter, Arapahoe County", multiplier: 1.04 },
  { name: "Five Points, Denver County", multiplier: 1.14 },
  { name: "Fort Logan, Denver County", multiplier: 0.98 },
  { name: "Founders Village, Douglas County", multiplier: 1.16 },
  { name: "Frasier Meadows, Boulder County", multiplier: 1.48 },
  { name: "Gateway-Green Valley Ranch, Denver County", multiplier: 0.96 },
  { name: "Genesee, Jefferson County", multiplier: 1.28 },
  { name: "Glendale, Arapahoe County", multiplier: 1.04 },
  { name: "Globeville, Denver County", multiplier: 1.0 },
  { name: "Green Mountain, Jefferson County", multiplier: 1.12 },
  { name: "Green Valley Ranch, Denver County", multiplier: 0.96 },
  { name: "Gunbarrel, Boulder County", multiplier: 1.34 },
  { name: "Hale, Denver County", multiplier: 1.16 },
  { name: "Harvey Park, Denver County", multiplier: 1.0 },
  { name: "Heather Gardens, Arapahoe County", multiplier: 0.98 },
  { name: "Highland, Denver County", multiplier: 1.22 },
  { name: "Hilltop, Denver County", multiplier: 1.38 },
  { name: "Interlocken, Broomfield County", multiplier: 1.24 },
  { name: "Jefferson Park, Denver County", multiplier: 1.16 },
  { name: "Ken Caryl, Jefferson County", multiplier: 1.14 },
  { name: "Lafayette Old Town, Boulder County", multiplier: 1.26 },
  { name: "Lodo, Denver County", multiplier: 1.2 },
  { name: "Lone Tree, Douglas County", multiplier: 1.28 },
  { name: "Lowry, Denver County", multiplier: 1.18 },
  { name: "Mar Lee, Denver County", multiplier: 0.96 },
  { name: "Mayfair, Denver County", multiplier: 1.14 },
  { name: "Meadow Hills, Arapahoe County", multiplier: 1.04 },
  { name: "Montbello, Denver County", multiplier: 0.94 },
  { name: "Montclair, Denver County", multiplier: 1.12 },
  { name: "North Boulder, Boulder County", multiplier: 1.62 },
  { name: "North Capitol Hill, Denver County", multiplier: 1.1 },
  { name: "Northfield, Denver County", multiplier: 1.18 },
  { name: "Observatory Park, Denver County", multiplier: 1.32 },
  { name: "Old Colorado City, El Paso County", multiplier: 0.94 },
  { name: "Olde Town Arvada, Jefferson County", multiplier: 1.12 },
  { name: "Park Hill, Denver County", multiplier: 1.18 },
  { name: "Parker Mainstreet, Douglas County", multiplier: 1.2 },
  { name: "Pearl Street, Boulder County", multiplier: 1.66 },
  { name: "Platt Park, Denver County", multiplier: 1.26 },
  { name: "Pueblo Mesa Junction, Pueblo County", multiplier: 0.66 },
  { name: "Rino, Denver County", multiplier: 1.18 },
  { name: "River North Art District, Denver County", multiplier: 1.18 },
  { name: "Ruby Hill, Denver County", multiplier: 1.0 },
  { name: "Sloan's Lake, Denver County", multiplier: 1.24 },
  { name: "South Broadway, Arapahoe County", multiplier: 1.08 },
  { name: "South Boulder, Boulder County", multiplier: 1.58 },
  { name: "Southmoor Park, Denver County", multiplier: 1.14 },
  { name: "Speer, Denver County", multiplier: 1.12 },
  { name: "Stapleton, Denver County", multiplier: 1.2 },
  { name: "Steamboat Springs, Routt County", multiplier: 1.42 },
  { name: "Sunnyside, Denver County", multiplier: 1.16 },
  { name: "Table Mesa, Boulder County", multiplier: 1.56 },
  { name: "Tech Center, Arapahoe County", multiplier: 1.2 },
  { name: "University, Denver County", multiplier: 1.18 },
  { name: "University Hill, Boulder County", multiplier: 1.6 },
  { name: "Uptown, Denver County", multiplier: 1.12 },
  { name: "Wash Park, Denver County", multiplier: 1.34 },
  { name: "Washington Park West, Denver County", multiplier: 1.26 },
  { name: "Wellshire, Denver County", multiplier: 1.22 },
  { name: "West Colfax, Denver County", multiplier: 1.04 },
  { name: "West Highland, Denver County", multiplier: 1.24 },
  { name: "Westminster Promenade, Adams County", multiplier: 1.02 },
  { name: "Whittier, Denver County", multiplier: 1.1 },
  { name: "Adams County", multiplier: 1.0 },
  { name: "Arapahoe County", multiplier: 1.08 },
  { name: "Boulder County", multiplier: 1.62 },
  { name: "Broomfield County", multiplier: 1.28 },
  { name: "Denver County", multiplier: 1.18 },
  { name: "Douglas County", multiplier: 1.34 },
  { name: "Eagle County", multiplier: 1.95 },
  { name: "El Paso County", multiplier: 0.92 },
  { name: "Garfield County", multiplier: 1.0 },
  { name: "Jefferson County", multiplier: 1.18 },
  { name: "La Plata County", multiplier: 1.1 },
  { name: "Larimer County", multiplier: 1.02 },
  { name: "Mesa County", multiplier: 0.76 },
  { name: "Pitkin County", multiplier: 2.45 },
  { name: "Pueblo County", multiplier: 0.66 },
  { name: "Routt County", multiplier: 1.42 },
  { name: "Summit County", multiplier: 1.72 },
  { name: "Weld County", multiplier: 0.82 },
  { name: "Arvada, Jefferson County", multiplier: 1.08 },
  { name: "Aspen, Pitkin County", multiplier: 2.45 },
  { name: "Aurora, Arapahoe County", multiplier: 1.04 },
  { name: "Boulder, Boulder County", multiplier: 1.62 },
  { name: "Breckenridge, Summit County", multiplier: 1.72 },
  { name: "Broomfield, Broomfield County", multiplier: 1.28 },
  { name: "Castle Rock, Douglas County", multiplier: 1.22 },
  { name: "Colorado Springs, El Paso County", multiplier: 0.92 },
  { name: "Denver, Denver County", multiplier: 1.18 },
  { name: "Durango, La Plata County", multiplier: 1.1 },
  { name: "Englewood, Arapahoe County", multiplier: 1.04 },
  { name: "Fort Collins, Larimer County", multiplier: 1.02 },
  { name: "Golden, Jefferson County", multiplier: 1.22 },
  { name: "Grand Junction, Mesa County", multiplier: 0.76 },
  { name: "Greeley, Weld County", multiplier: 0.82 },
  { name: "Lakewood, Jefferson County", multiplier: 1.12 },
  { name: "Littleton, Arapahoe County", multiplier: 1.12 },
  { name: "Longmont, Boulder County", multiplier: 1.2 },
  { name: "Loveland, Larimer County", multiplier: 0.98 },
  { name: "Parker, Douglas County", multiplier: 1.2 },
  { name: "Pueblo, Pueblo County", multiplier: 0.66 },
  { name: "Steamboat Springs, Routt County", multiplier: 1.42 },
  { name: "Vail, Eagle County", multiplier: 1.95 },
  { name: "Westminster, Adams County", multiplier: 1.02 },
];

const bedroomOptions = [0, 1, 2, 3, 4, 5, 6];
const creditScoreOptions = [
  { label: "Needs work", range: "560 - 639", min: 560, max: 639, value: 620 },
  { label: "Fair", range: "640 - 699", min: 640, max: 699, value: 670 },
  { label: "Good", range: "700 - 739", min: 700, max: 739, value: 720 },
  { label: "Very good", range: "740 - 799", min: 740, max: 799, value: 770 },
  { label: "Excellent", range: "800 - 850", min: 800, max: 850, value: 825 },
];

function getCreditScoreOption(score: number) {
  return creditScoreOptions.find((option) => score >= option.min && score <= option.max) ?? creditScoreOptions[0];
}

function getCreditScoreMilestone(score: number) {
  if (score < 620) return "620+ to reach many assistance-program minimums";
  if (score < 660) return "660+ to move out of the highest-risk pricing band";
  if (score < 700) return "700+ to strengthen conventional loan options";
  if (score < 740) return "740+ where many lenders reserve stronger rate pricing";
  if (score < 800) return "800+ for the strongest modeled credit tier";
  return "Maintain this tier by keeping balances low and payments on time";
}
const baseMonthlyRentByBedrooms: Record<number, number> = {
  1: 1450,
  2: 1800,
  3: 2350,
  4: 2950,
  5: 3500,
  6: 4100,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getLocationMultiplier(location: string) {
  return coloradoLocations.find((locationOption) => locationOption.name === location)?.multiplier ?? 1.18;
}

function getMarketLabel(multiplier: number) {
  if (multiplier >= 1.6) return "premium urban market";
  if (multiplier >= 1.15) return "higher-cost local market";
  if (multiplier >= 0.8) return "mid-priced local market";
  return "lower-cost local market";
}

function getAssistanceProgram(programId: string) {
  return downPaymentAssistancePrograms.find((program) => program.id === programId) ?? downPaymentAssistancePrograms[0];
}

function getCountyName(location: string) {
  const match = location.match(/([A-Za-z ]+) County/);
  return match?.[1].trim() ?? "";
}

function getProgramCounties(programId: string) {
  const countyMap: Record<string, string[] | "statewide"> = {
    none: "statewide",
    "chfa-firststep-plus": "statewide",
    "chfa-smartstep-plus": "statewide",
    "chfa-firstgeneration": "statewide",
    "chfa-homeaccess": "statewide",
    "chac-immediate": "statewide",
    "chac-deferral": "statewide",
    "chac-disability": "statewide",
    "firstbank-idf": "statewide",
    "chfa-sectioneight-plus": "statewide",
    "good-neighbor-next-door": "statewide",
    "colorado-hfa1-plus": "statewide",
    "chenoa-fund-fha": "statewide",
    "chfa-vlip": "statewide",
    "colorado-roots": "statewide",
    "metro-dpa": ["Adams", "Arapahoe", "Boulder", "Broomfield", "Denver", "Douglas", "Elbert", "Jefferson", "Larimer"],
    "aurora-prop-123": ["Adams", "Arapahoe", "Douglas"],
    "pikes-peak-dpa": ["El Paso"],
    "boulder-county-bcdpap": ["Boulder"],
    "boulder-h2o": ["Boulder"],
    "boulder-middle-income": ["Boulder"],
    "boulder-solution-grant": ["Boulder"],
    "broomfield-chac": ["Broomfield"],
    "dearfield-fund": ["Adams", "Arapahoe", "Boulder", "Broomfield", "Denver", "Douglas", "Jefferson"],
    "eagle-eclf-shared": ["Eagle"],
    "eagle-eclf-amortized": ["Eagle"],
    "eagle-ecdoh": ["Eagle"],
    "eagle-ranch-erhc": ["Eagle"],
    "douglas-dchp": ["Douglas"],
    "noco-equity-share": ["Larimer", "Weld"],
    "estes-valley": ["Larimer"],
    "greeley-ghope": ["Weld"],
    "summit-srlf": ["Summit"],
    "eagle-ehop": ["Eagle"],
    "yampa-valley": ["Routt"],
  };

  return countyMap[programId] ?? "statewide";
}

function programMatchesCounty(program: AssistanceProgram, countyName: string) {
  const counties = getProgramCounties(program.id);

  if (program.id === "none" || counties === "statewide" || !countyName) return true;
  return counties.includes(countyName);
}

function estimateAssistanceAmount(program: AssistanceProgram, homePrice: number) {
  const grossAssistance = program.assistanceFixed ?? homePrice * program.assistanceRate;
  return program.assistanceCap ? Math.min(grossAssistance, program.assistanceCap) : grossAssistance;
}

function getProgramConditionNotes(program: AssistanceProgram, eligibility: EligibilityAnswers) {
  const text = `${program.bestFor} ${program.description}`.toLowerCase();
  const notes: string[] = [];

  if (text.includes("first-time") && eligibility.firstTimeBuyer !== "yes") notes.push(eligibility.firstTimeBuyer === "no" ? "May require first-time buyer status." : "Confirm first-time buyer status.");
  if (text.includes("first-generation") && eligibility.firstGenerationBuyer !== "yes") notes.push(eligibility.firstGenerationBuyer === "no" ? "May require first-generation eligibility." : "Confirm first-generation eligibility.");
  if (text.includes("disability") && eligibility.disabilityEligible !== "yes") notes.push(eligibility.disabilityEligible === "no" ? "May require disability eligibility." : "Confirm disability documentation.");
  if (text.includes("veteran") && eligibility.veteranEligible !== "yes") notes.push(eligibility.veteranEligible === "no" ? "Veteran exception may not apply." : "Confirm veteran eligibility if relevant.");
  if ((text.includes("city") || text.includes("county") || text.includes("work") || text.includes("local")) && eligibility.localRequirement !== "yes") notes.push(eligibility.localRequirement === "no" ? "May require a specific city, county, or workforce connection." : "Confirm local area or workforce rules.");
  if ((text.includes("own funds") || text.includes("minimum contribution") || text.includes("borrower must contribute")) && eligibility.ownFundsContribution !== "yes") notes.push(eligibility.ownFundsContribution === "no" ? "May require a borrower cash contribution." : "Confirm minimum contribution source.");
  if ((text.includes("counseling") || text.includes("education") || text.includes("coaching")) && eligibility.buyerEducation !== "yes") notes.push(eligibility.buyerEducation === "no" ? "May require buyer education or counseling." : "Confirm education/counseling timing.");

  return notes;
}

function estimateHousingForBedrooms(bedrooms: number, location: string) {
  const bedroomCount = Math.max(0, Math.min(8, Math.round(bedrooms || 0)));
  const locationMultiplier = getLocationMultiplier(location);
  const estimatedSquareFeet = bedroomCount <= 0 ? 0 : 850 + bedroomCount * 325;
  const estimatedPrice = Math.round(estimatedSquareFeet * 315 * locationMultiplier);
  const annualHousingCost = estimatedPrice * 0.081;
  const rentMultiplier = 0.74 + locationMultiplier * 0.26;
  const baseMonthlyRent = bedroomCount <= 0 ? 0 : baseMonthlyRentByBedrooms[Math.min(bedroomCount, 6)];

  return {
    bedroomCount,
    estimatedPrice,
    estimatedSquareFeet,
    monthlyMortgage: Math.round(annualHousingCost / 12),
    monthlyRent: Math.round(baseMonthlyRent * rentMultiplier),
  };
}

function calculateScore(answers: Answers, answeredKeys: QuestionKey[]) {
  const locationMultiplier = getLocationMultiplier(answers.location);
  const housingEstimate = estimateHousingForBedrooms(answers.bedrooms, answers.location);
  const estimatedSquareFeet = housingEstimate.estimatedSquareFeet;
  const estimatedPrice = housingEstimate.estimatedPrice;
  const annualHousingCost = estimatedPrice * 0.081;
  const housingRatio = annualHousingCost / Math.max(answers.income, 1);
  const incomeScore = Math.max(0, Math.min(100, 100 - (housingRatio - 0.23) * 230));
  const locationScore = Math.max(0, Math.min(100, 112 - locationMultiplier * 40));
  const bedroomScore = Math.max(0, Math.min(100, 106 - answers.bedrooms * 9));
  const creditScore = Math.max(0, Math.min(100, (answers.creditScore - 560) / 2.9));
  const assistanceProgram = getAssistanceProgram(answers.assistanceProgram);
  const targetDownPayment = estimatedPrice * 0.035;
  const assistanceAmount = Math.min(targetDownPayment, estimateAssistanceAmount(assistanceProgram, estimatedPrice));
  const assistanceScore = Math.max(0, Math.min(100, 48 + (assistanceAmount / Math.max(targetDownPayment, 1)) * 42));

  const weights: Record<QuestionKey, number> = {
    location: 0.2,
    income: 0.37,
    bedrooms: 0.18,
    creditScore: 0.17,
    assistanceProgram: 0.08,
  };

  const partialScores: Record<QuestionKey, number> = {
    location: locationScore,
    income: incomeScore,
    bedrooms: bedroomScore,
    creditScore,
    assistanceProgram: assistanceScore,
  };

  const activeWeight = answeredKeys.reduce((sum, key) => sum + weights[key], 0);
  const weightedScore = answeredKeys.reduce((sum, key) => sum + partialScores[key] * weights[key], 0) / Math.max(activeWeight, 1);
  const score = Math.round(Math.max(0, Math.min(100, weightedScore || 50)));
  const recommendation = score >= 58 ? "Leaning buy" : score <= 42 ? "Leaning rent" : "Too close to call";

  return {
    score,
    recommendation,
    estimatedPrice,
    estimatedSquareFeet,
    monthlyPayment: housingEstimate.monthlyMortgage,
    monthlyRent: housingEstimate.monthlyRent,
    housingRatio,
    targetDownPayment,
    assistanceAmount,
    cashNeededAfterAssistance: Math.max(0, targetDownPayment - assistanceAmount),
    partialScores,
  };
}

function explainImpact(question: Question, answers: Answers, result: ReturnType<typeof calculateScore>) {
  if (question.key === "location") {
    const multiplier = getLocationMultiplier(answers.location);
    return multiplier > 1.25
      ? `${answers.location} is modeled as a ${getMarketLabel(multiplier)}, so renting gets stronger unless income can support the higher purchase price.`
      : `${answers.location} is modeled as a ${getMarketLabel(multiplier)}, which makes the buying case easier than in the most expensive counties.`;
  }

  if (question.key === "income") {
    if (result.housingRatio > 0.36) return "At this income, the estimated housing cost is high relative to earnings, so renting is safer."
    if (result.housingRatio < 0.27) return "This income appears to support the estimated payment comfortably, which moves the result toward buying.";
    return "The payment may be manageable, but the budget is not wide enough yet to make buying an obvious choice.";
  }

  if (question.key === "bedrooms") {
    if (answers.bedrooms <= 0) return "An empty lot removes the modeled house size, so this prototype treats the purchase price as much lower than a finished home.";
    return answers.bedrooms > 4
      ? "A higher bedroom count implies a larger home, raising the estimated price and pushing the result toward renting."
      : "This bedroom count keeps the target home more contained, which helps the buying case.";
  }

  if (question.key === "assistanceProgram") {
    const program = getAssistanceProgram(answers.assistanceProgram);

    if (program.id === "none") return `No assistance leaves the estimated 3.5% down payment at ${formatCurrency(result.targetDownPayment)}, so the upfront cash hurdle stays higher.`;
    return `${program.title} could reduce the modeled upfront cash need by about ${formatCurrency(result.assistanceAmount)}, leaving ${formatCurrency(result.cashNeededAfterAssistance)} before closing costs.`;
  }

  if (answers.creditScore >= 740) return "A strong credit score should improve the rate estimate, making ownership more attractive.";
  if (answers.creditScore < 660) return "This credit score likely means a higher interest rate, so renting is favored until financing improves.";
  return "This credit score is workable, but improving it could materially strengthen the buying case.";
}

function getQuestionResources(question: Question, answers: Answers, result: ReturnType<typeof calculateScore>): Resource[] {
  if (question.key === "location") {
    return [
      {
        title: `${answers.location} market check`,
        description: `Compare recent sale prices and rents in ${answers.location} before deciding whether this modeled ${getMarketLabel(getLocationMultiplier(answers.location))} matches your search area.`,
      },
      {
        title: "Local housing programs",
        description: "Look for county or city first-time buyer assistance, down-payment grants, and income-restricted ownership options.",
      },
    ];
  }

  if (question.key === "income") {
    return [
      {
        title: "Payment-to-income target",
        description: `This prototype estimates housing costs at ${Math.round(result.housingRatio * 100)}% of income; many buyers use 28% - 36% as a planning range.`,
      },
      {
        title: "Budget cushion",
        description: "Set aside room for utilities, maintenance, HOA dues, insurance changes, and emergency savings before stretching for a payment.",
      },
    ];
  }

  if (question.key === "bedrooms") {
    return [
      {
        title: "Rent vs. mortgage by size",
        description: `For this selection, estimated rent is ${answers.bedrooms === 0 ? "not applicable" : formatCurrency(result.monthlyRent)} and estimated mortgage cost is ${formatCurrency(result.monthlyPayment)}.`,
      },
      {
        title: "Right-size your search",
        description: "Try one bedroom fewer or a flexible office/guest room setup to see how much the target home size changes affordability.",
      },
    ];
  }

  if (question.key === "assistanceProgram") {
    const program = getAssistanceProgram(answers.assistanceProgram);

    return [
      {
        title: `${program.title} fit check`,
        description: `This selection estimates ${formatCurrency(result.assistanceAmount)} in help toward a ${formatCurrency(result.targetDownPayment)} down payment for the modeled home size.`,
      },
      {
        title: "Verify eligibility",
        description: "Confirm service area, income limits, first-time buyer rules, credit score requirements, and whether the program can stack with your mortgage before relying on it.",
      },
    ];
  }

  return [
    {
      title: "Credit score next steps",
      description: "Review credit reports for errors, reduce revolving balances, and avoid opening new debt before applying for a mortgage.",
    },
    {
      title: "Rate shopping",
      description: "Compare pre-approval estimates from multiple lenders because even a small rate difference can change the buy-vs-rent result.",
    },
  ];
}

function HouseSizeSvg({ bedrooms, squareFeet, compact = false }: { bedrooms: number; squareFeet: number; compact?: boolean }) {
  const bedroomCount = Math.max(0, Math.min(8, Math.round(bedrooms || 0)));
  const isEmptyLot = bedroomCount === 0;
  const houseWidth = 132 + bedroomCount * 18;
  const houseHeight = 64 + bedroomCount * 4;
  const houseX = (360 - houseWidth) / 2;
  const houseY = 128 - houseHeight;
  const roofPeakY = houseY - 42;
  const windowCount = Math.min(bedroomCount, 6);
  const windowSpacing = houseWidth / (windowCount + 1);

  return (
    <div className={`rounded-3xl border bg-gradient-to-b from-primary/10 to-white/80 ${compact ? "p-2" : "p-4"}`}>
      {!compact ? (
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold uppercase tracking-[0.2em] text-muted-foreground">House size</span>
          <span className="font-bold text-primary">{isEmptyLot ? "Empty lot" : `~${squareFeet.toLocaleString()} sq ft`}</span>
        </div>
      ) : null}
      <svg viewBox="0 0 360 180" role="img" aria-label={isEmptyLot ? "Empty lot with no house" : `Estimated house size for ${bedroomCount} bedrooms`} className={`${compact ? "h-20" : "h-44"} w-full overflow-visible`}>
        <path d="M28 146 C88 128 134 158 190 140 S290 132 332 148" fill="none" stroke="hsl(var(--primary) / 0.25)" strokeWidth="12" strokeLinecap="round" />
        {isEmptyLot ? (
          <>
            <rect x="74" y="78" width="212" height="68" rx="14" fill="hsl(var(--accent) / 0.45)" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="10 8" />
            <path d="M104 126 C138 108 164 132 196 112 S244 102 260 124" fill="none" stroke="hsl(var(--primary) / 0.45)" strokeWidth="5" strokeLinecap="round" />
            <text x="180" y="113" textAnchor="middle" className="fill-primary text-lg font-black">Empty lot</text>
          </>
        ) : (
          <>
            <rect x={houseX} y={houseY} width={houseWidth} height={houseHeight} rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="4" />
            <path d={`M${houseX - 12} ${houseY + 8} L180 ${roofPeakY} L${houseX + houseWidth + 12} ${houseY + 8} Z`} fill="hsl(var(--secondary))" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinejoin="round" />
            <rect x={180 - houseWidth * 0.08} y={houseY + houseHeight - 42} width={houseWidth * 0.16} height="42" rx="6" fill="hsl(var(--primary) / 0.22)" stroke="hsl(var(--primary))" strokeWidth="3" />
            {Array.from({ length: windowCount }).map((_, index) => {
              const x = houseX + windowSpacing * (index + 1) - 12;
              return <rect key={index} x={x} y={houseY + 22} width="24" height="22" rx="5" fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth="3" />;
            })}
          </>
        )}
      </svg>
    </div>
  );
}

function WalkingPersonSvg({ direction }: { direction: "rent" | "buy" }) {
  const facingBuy = direction === "buy";

  return (
    <svg
      viewBox="0 0 64 72"
      aria-hidden="true"
      className={`h-6 w-6 overflow-visible ${facingBuy ? "" : "-scale-x-100"}`}
    >
      <path d="M14 64 C26 58 40 58 52 64" fill="none" stroke="hsl(var(--foreground) / 0.18)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="36" cy="13" r="8" fill="hsl(var(--secondary))" stroke="hsl(var(--foreground))" strokeWidth="3" />
      <path d="M34 23 L31 41" fill="none" stroke="hsl(var(--foreground))" strokeWidth="6" strokeLinecap="round" />
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-18 32 30; 20 32 30; -18 32 30" dur="0.7s" repeatCount="indefinite" />
        <path d="M32 28 L18 39" fill="none" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="18 32 30; -20 32 30; 18 32 30" dur="0.7s" repeatCount="indefinite" />
        <path d="M32 28 L48 35" fill="none" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="20 31 41; -18 31 41; 20 31 41" dur="0.7s" repeatCount="indefinite" />
        <path d="M31 41 L19 58" fill="none" stroke="hsl(var(--foreground))" strokeWidth="6" strokeLinecap="round" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-18 31 41; 20 31 41; -18 31 41" dur="0.7s" repeatCount="indefinite" />
        <path d="M31 41 L48 56" fill="none" stroke="hsl(var(--foreground))" strokeWidth="6" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function RentVsBuyGraph({ result }: { result: ReturnType<typeof calculateScore> }) {
  const fiveYearRent = result.monthlyRent * 60;
  const downPaymentAndClosing = result.estimatedPrice * 0.055;
  const fiveYearBuyingCost = downPaymentAndClosing + result.monthlyPayment * 60 - result.estimatedPrice * 0.06;
  const maxCost = Math.max(fiveYearRent, fiveYearBuyingCost, 1);
  const rentWidth = `${Math.max(6, (fiveYearRent / maxCost) * 100)}%`;
  const buyWidth = `${Math.max(6, (fiveYearBuyingCost / maxCost) * 100)}%`;

  return (
    <div className="space-y-4">
      <EligibilityQuestionnaire eligibility={eligibility} onChange={onEligibilityChange} />

      <div className="space-y-4 rounded-3xl border border-primary/15 bg-gradient-to-br from-white/85 to-primary/10 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Five-year cost estimate</p>
        <h3 className="mt-1 text-xl font-black tracking-tight">Rent vs. buy comparison</h3>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm font-bold">
            <span>Rent</span>
            <span>{result.monthlyRent ? formatCurrency(fiveYearRent) : "N/A"}</span>
          </div>
          <div className="h-4 rounded-full bg-muted">
            <div className="h-full rounded-full bg-accent-foreground" style={{ width: rentWidth }} />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm font-bold">
            <span>Buy after estimated equity</span>
            <span>{formatCurrency(fiveYearBuyingCost)}</span>
          </div>
          <div className="h-4 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: buyWidth }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EligibilityQuestionnaire({ eligibility, onChange }: { eligibility: EligibilityAnswers; onChange: (key: keyof EligibilityAnswers, value: EligibilityValue) => void }) {
  return (
    <div className="space-y-4 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 to-white/85 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Eligibility check</p>
        <h3 className="mt-1 text-xl font-black tracking-tight">Other conditions programs may ask about</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          These answers do not guarantee eligibility, but they flag programs that may need extra verification before you rely on the assistance amount.
        </p>
      </div>

      <div className="grid gap-3">
        {eligibilityQuestions.map((question) => (
          <div key={question.key} className="rounded-3xl bg-white/75 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black tracking-tight">{question.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{question.description}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {(["yes", "no", "unsure"] as EligibilityValue[]).map((value) => {
                  const isSelected = eligibility[question.key] === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onChange(question.key, value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DownPaymentAssistanceList({
  result,
  location,
  selectedProgramId,
  eligibility,
  onEligibilityChange,
  onSelect,
}: {
  result: ReturnType<typeof calculateScore>;
  location: string;
  selectedProgramId: string;
  eligibility: EligibilityAnswers;
  onEligibilityChange: (key: keyof EligibilityAnswers, value: EligibilityValue) => void;
  onSelect: (programId: string) => void;
}) {
  const targetDownPayment = result.estimatedPrice * 0.035;
  const countyName = getCountyName(location);
  const filteredPrograms = downPaymentAssistancePrograms.filter((program) => programMatchesCounty(program, countyName));

  return (
    <div className="space-y-4 rounded-3xl border border-primary/15 bg-gradient-to-br from-white/85 to-primary/10 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Down payment help</p>
        <h3 className="mt-1 text-xl font-black tracking-tight">Choose an assistance option</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {countyName ? `Showing statewide programs and programs serving ${countyName} County.` : "Choose a location first to filter local programs by county."} Availability and eligibility vary, so verify details with the program or lender.
        </p>
      </div>

      <div className="grid gap-3">
        {filteredPrograms.map((program) => {
          const isSelected = selectedProgramId === program.id;
          const estimatedAssistance = Math.min(targetDownPayment, estimateAssistanceAmount(program, result.estimatedPrice));
          const estimatedCashNeeded = Math.max(0, targetDownPayment - estimatedAssistance);
          const conditionNotes = getProgramConditionNotes(program, eligibility);

          return (
            <button
              key={program.id}
              type="button"
              onClick={() => onSelect(program.id)}
              className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isSelected ? "border-primary bg-primary/10 shadow-glow" : "bg-white/75"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black tracking-tight">{program.title}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{program.bestFor}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground">{program.assistance}</span>
                  <span className={`h-4 w-4 rounded-full border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{program.description}</p>
              {conditionNotes.length ? (
                <div className="mt-3 rounded-2xl bg-secondary/60 p-3 text-xs leading-5 text-secondary-foreground">
                  <p className="font-black uppercase tracking-[0.16em]">Verify before counting on it</p>
                  <ul className="mt-1 space-y-1">
                    {conditionNotes.slice(0, 3).map((note) => (
                      <li key={note}>• {note}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-2xl bg-white/80 p-2.5">
                  <p className="text-muted-foreground">3.5% down</p>
                  <p className="mt-1 font-bold">{formatCurrency(targetDownPayment)}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-2.5">
                  <p className="text-muted-foreground">Assistance</p>
                  <p className="mt-1 font-bold">{formatCurrency(estimatedAssistance)}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-2.5">
                  <p className="text-muted-foreground">Cash needed</p>
                  <p className="mt-1 font-bold">{formatCurrency(estimatedCashNeeded)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function CreditScoreExplanation({ answers, result }: { answers: Answers; result: ReturnType<typeof calculateScore> }) {
  const currentBand = getCreditScoreOption(answers.creditScore);
  const creditContribution = Math.round(result.partialScores.creditScore);
  const milestone = getCreditScoreMilestone(answers.creditScore);
  const scorePosition = Math.max(0, Math.min(100, ((answers.creditScore - 560) / (850 - 560)) * 100));

  return (
    <div className="space-y-4 rounded-3xl border border-primary/15 bg-gradient-to-br from-white/85 to-primary/10 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Credit score explainer</p>
        <h3 className="mt-1 text-xl font-black tracking-tight">Why this score matters</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Lenders use credit score as one signal for mortgage eligibility and rate pricing. In this prototype, a higher score improves the buy side because it can lower borrowing costs and keep more down payment programs available.
        </p>
      </div>

      <div className="rounded-3xl bg-white/75 p-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold">
          <span>{currentBand.range}</span>
          <span className="text-primary">{currentBand.label}</span>
        </div>
        <div className="relative h-4 rounded-full bg-gradient-to-r from-accent via-secondary to-primary">
          <div className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-lg" style={{ left: `${scorePosition}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground">
          <span>560</span>
          <span>850</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-white/75 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Modeled strength</p>
          <p className="mt-2 text-2xl font-black">{creditContribution}/100</p>
        </div>
        <div className="rounded-3xl bg-white/75 p-4 sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Next useful milestone</p>
          <p className="mt-2 text-sm font-semibold leading-6">{milestone}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white/75 p-4">
        <p className="font-black tracking-tight">How to improve the modeled result</p>
        <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
          <li>• Keep every payment on time while preparing for pre-approval.</li>
          <li>• Pay down revolving balances before applying, especially cards near their limits.</li>
          <li>• Avoid opening new debt or financing large purchases until after closing.</li>
        </ul>
      </div>
    </div>
  );
}

function App() {
  const [answers, setAnswers] = useState<Answers>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialAnswers;

    const parsed = JSON.parse(saved) as Partial<Answers> & { country?: string; rooms?: number };
    delete parsed.country;
    const location = coloradoLocations.some((locationOption) => locationOption.name === parsed.location) ? parsed.location ?? initialAnswers.location : initialAnswers.location;

    return { ...initialAnswers, ...parsed, location, bedrooms: parsed.bedrooms ?? parsed.rooms ?? initialAnswers.bedrooms };
  });
  const initialRoute = getRouteFromUrl();
  const [step, setStep] = useState(initialRoute.step);
  const [showExplanation, setShowExplanation] = useState(initialRoute.showExplanation);
  const [locationSearch, setLocationSearch] = useState(answers.location);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityAnswers>(() => {
    const saved = window.localStorage.getItem(ELIGIBILITY_STORAGE_KEY);
    if (!saved) return initialEligibilityAnswers;

    return { ...initialEligibilityAnswers, ...(JSON.parse(saved) as Partial<EligibilityAnswers>) };
  });

  const answeredKeys = useMemo(() => questions.slice(0, step + 1).map((question) => question.key), [step]);
  const currentQuestion = questions[step];
  const result = useMemo(() => calculateScore(answers, answeredKeys), [answers, answeredKeys]);
  const answerValue = answers[currentQuestion.key];
  const isLastPage = step === questions.length - 1 && showExplanation;
  const pageIndex = step * 2 + (showExplanation ? 2 : 1);
  const totalPages = questions.length * 2;
  const resources = getQuestionResources(currentQuestion, answers, result);
  const walkingDirection = result.score < 50 ? "rent" : "buy";
  const filteredLocations = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    const matches = terms.length
      ? coloradoLocations.filter((locationOption) => terms.every((term) => locationOption.name.toLowerCase().includes(term)))
      : coloradoLocations;

    return matches
      .sort((first, second) => {
        const firstName = first.name.toLowerCase();
        const secondName = second.name.toLowerCase();
        const firstStartsWithQuery = query.length > 0 && firstName.startsWith(query);
        const secondStartsWithQuery = query.length > 0 && secondName.startsWith(query);

        if (firstStartsWithQuery !== secondStartsWithQuery) return firstStartsWithQuery ? -1 : 1;
        return first.name.localeCompare(second.name);
      })
      .slice(0, 8);
  }, [locationSearch]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    window.localStorage.setItem(ELIGIBILITY_STORAGE_KEY, JSON.stringify(eligibility));
  }, [eligibility]);

  useEffect(() => {
    const stepName = getStepName(step, showExplanation);
    const url = new URL(window.location.href);
    url.searchParams.set("step", stepName);

    if (url.href !== window.location.href) {
      window.history.replaceState(null, "", url);
    }
  }, [step, showExplanation]);

  useEffect(() => {
    function handlePopState() {
      const route = getRouteFromUrl();
      setStep(route.step);
      setShowExplanation(route.showExplanation);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function updateAnswer(value: string | number) {
    setAnswers((current) => ({ ...current, [currentQuestion.key]: value }));
  }

  function updateEligibility(key: keyof EligibilityAnswers, value: EligibilityValue) {
    setEligibility((current) => ({ ...current, [key]: value }));
  }

  function selectLocation(location: string) {
    setAnswers((current) => ({ ...current, location }));
    setLocationSearch(location);
    setIsLocationOpen(false);
  }

  function reset() {
    setAnswers(initialAnswers);
    setEligibility(initialEligibilityAnswers);
    setLocationSearch(initialAnswers.location);
    setIsLocationOpen(false);
    setStep(0);
    setShowExplanation(false);
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(ELIGIBILITY_STORAGE_KEY);
  }

  function goBack() {
    if (showExplanation) {
      setShowExplanation(false);
      return;
    }

    setStep((current) => Math.max(0, current - 1));
    setShowExplanation(step > 0);
  }

  function goNext() {
    if (!showExplanation) {
      setShowExplanation(true);
      return;
    }

    if (step < questions.length - 1) {
      setStep((current) => current + 1);
      setShowExplanation(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_34%),linear-gradient(135deg,_#fbf7ef_0%,_#f1eadc_46%,_#dbeeea_100%)] px-4 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl flex-col justify-center gap-4">
        <section>
          <Card className="border-primary/10 bg-white/75 shadow-glow backdrop-blur">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Should rent</span>
                  <span>Should buy</span>
                </div>
                <div className="relative h-8 rounded-full bg-gradient-to-r from-accent via-secondary to-primary shadow-inner">
                    <div
                      className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-visible rounded-full border-2 border-white bg-white shadow-lg"
                      style={{ left: `${result.score}%` }}
                    >
                      <WalkingPersonSvg direction={walkingDirection} />
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="border-white/70 bg-white/85 shadow-2xl backdrop-blur">
          <CardHeader className="gap-1.5 p-5 pb-4">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-secondary-foreground">
                {currentQuestion.eyebrow}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                {pageIndex} / {totalPages}
              </span>
            </div>
            <CardTitle className="text-2xl leading-tight sm:text-3xl">
              {showExplanation ? "How that answer changed your result" : currentQuestion.title}
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              {showExplanation ? "Review the impact of your last answer and a few resources to help you investigate further." : currentQuestion.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-5 pt-0">
            {showExplanation ? (
              <div className="space-y-4">
                <div className="rounded-3xl border border-primary/15 bg-primary/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{currentQuestion.eyebrow}</p>
                  <p className="mt-2 text-lg font-black text-foreground">
                    {currentQuestion.key === "income" ? formatCurrency(Number(answerValue)) : currentQuestion.key === "assistanceProgram" ? getAssistanceProgram(String(answerValue)).title : currentQuestion.key === "creditScore" ? getCreditScoreOption(Number(answerValue)).range : String(answerValue)}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{explainImpact(currentQuestion, answers, result)}</p>
                </div>

                {currentQuestion.key === "creditScore" ? <CreditScoreExplanation answers={answers} result={result} /> : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  {resources.map((resource) => (
                    <div key={resource.title} className="rounded-3xl border bg-white/75 p-4">
                      <p className="font-black tracking-tight">{resource.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{resource.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : currentQuestion.type === "location" ? (
              <div className="space-y-3">
                <div className="relative space-y-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Colorado location</span>
                  <div className="relative">
                    <Input
                      role="combobox"
                      aria-expanded={isLocationOpen}
                      value={locationSearch}
                      onFocus={() => setIsLocationOpen(true)}
                      onChange={(event) => {
                        setLocationSearch(event.target.value);
                        updateAnswer(event.target.value);
                        setIsLocationOpen(true);
                      }}
                      placeholder="Start typing, e.g. Highland, Denver County or Boulder"
                      className="h-12 bg-white pr-10 text-base"
                    />
                    <button
                      type="button"
                      aria-label="Toggle location suggestions"
                      onClick={() => setIsLocationOpen((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ChevronsUpDown className="h-4 w-4" />
                    </button>
                  </div>

                  {isLocationOpen ? (
                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-md border bg-white p-1 shadow-xl">
                      {filteredLocations.length ? (
                        filteredLocations.map((locationOption) => {
                          const isSelected = locationOption.name === answers.location;

                          return (
                            <button
                              key={locationOption.name}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => selectLocation(locationOption.name)}
                              className="flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <span>{locationOption.name}</span>
                              {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                            </button>
                          );
                        })
                      ) : (
                        <p className="px-3 py-2 text-sm text-muted-foreground">No Colorado locations found.</p>
                      )}
                    </div>
                  ) : null}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Choose a Colorado neighborhood, city, or county; neighborhood and city options include county names for context.
                </p>
              </div>
            ) : (
                  <div className="space-y-4">
                {currentQuestion.key === "income" ? (
                  <div className="relative">
                    {currentQuestion.type === "currency" ? (
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">$</span>
                    ) : null}
                    <Input
                      className={`${currentQuestion.type === "currency" ? "pl-8" : ""} text-center text-lg font-semibold`}
                      type="number"
                      min={currentQuestion.min}
                      max={currentQuestion.max}
                      step={currentQuestion.step}
                      value={Number(answerValue)}
                      onChange={(event) => updateAnswer(Number(event.target.value))}
                    />
                  </div>
                ) : currentQuestion.key === "bedrooms" ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {bedroomOptions.map((bedrooms) => {
                      const estimate = estimateHousingForBedrooms(bedrooms, answers.location);
                      const isSelected = Number(answerValue) === bedrooms;
                      const label = bedrooms === 0 ? "Empty lot" : `${bedrooms} bed${bedrooms === 1 ? "" : "s"}`;

                      return (
                        <button
                          key={bedrooms}
                          type="button"
                          onClick={() => updateAnswer(bedrooms)}
                          className={`rounded-3xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isSelected ? "border-primary bg-primary/10 shadow-glow" : "bg-white/75"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-black tracking-tight">{label}</p>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                {bedrooms === 0 ? "land only" : `~${estimate.estimatedSquareFeet.toLocaleString()} sq ft`}
                              </p>
                            </div>
                            <span className={`h-4 w-4 rounded-full border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                          </div>
                          <div className="mt-2">
                            <HouseSizeSvg bedrooms={bedrooms} squareFeet={estimate.estimatedSquareFeet} compact />
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-2xl bg-white/80 p-2.5">
                              <p className="text-muted-foreground">Rent</p>
                              <p className="mt-1 font-bold">{bedrooms === 0 ? "N/A" : formatCurrency(estimate.monthlyRent)}</p>
                            </div>
                            <div className="rounded-2xl bg-white/80 p-2.5">
                              <p className="text-muted-foreground">Mortgage</p>
                              <p className="mt-1 font-bold">{formatCurrency(estimate.monthlyMortgage)}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : currentQuestion.key === "assistanceProgram" ? (
                  <DownPaymentAssistanceList result={result} location={answers.location} selectedProgramId={String(answerValue)} eligibility={eligibility} onEligibilityChange={updateEligibility} onSelect={updateAnswer} />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {creditScoreOptions.map((option) => {
                      const numericAnswer = Number(answerValue);
                      const isSelected = numericAnswer >= option.min && numericAnswer <= option.max;

                      return (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => updateAnswer(option.value)}
                          className={`rounded-3xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isSelected ? "border-primary bg-primary/10 shadow-glow" : "bg-white/75"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-black tracking-tight">{option.label}</p>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                {option.range}
                              </p>
                            </div>
                            <span className={`h-4 w-4 rounded-full border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {Array.from({ length: totalPages }).map((_, index) => (
                <div key={index} className={`h-2 rounded-full ${index < pageIndex ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-3 p-5 pt-0">
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" disabled={step === 0 && !showExplanation} onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={isLastPage}>
                {showExplanation ? (isLastPage ? "Complete" : "Next question") : "See impact"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

export default App;
