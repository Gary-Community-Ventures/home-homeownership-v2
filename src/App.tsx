import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronsUpDown, ExternalLink, RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Answers = {
  location: string[];
  income: number | "";
  householdSize: number;
  bedrooms: number;
  creditScore: number;
  assistanceProgram: string;
  affordablePrograms: string[];
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
  url: string;
};

type EligibilityValue = "yes" | "no" | "unsure";

type EligibilityAnswers = {
  firstTimeBuyer: EligibilityValue;
  firstGenerationBuyer: EligibilityValue;
  disabilityEligible: EligibilityValue;
  veteranEligible: EligibilityValue;
  localRequirement: EligibilityValue;
};

type AssistanceSelectionMode = "choose" | "dpa" | "affordable" | "none";

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

type Contact = {
  id: string;
  name: string;
  company: string;
  phone?: string;
  email?: string;
  nmls?: string;
  award?: string;
  languages?: string;
  website?: string;
  specialties?: string[];
  countiesServed: string[];
  notes?: string;
};

type HomeownershipProgram = {
  id: string;
  name: string;
  organization: string;
  modelType: string;
  serviceArea: string;
  incomeLimit: string;
  requirements: string;
  benefits: string[];
  drawbacks: string[];
  website: string;
  contact: string;
  verified: "Verified" | "Partial";
  scoreImpact: number;
};

const STORAGE_KEY = "home-buying-prototype-answers";
const ELIGIBILITY_STORAGE_KEY = "home-buying-prototype-eligibility";
const SELECTED_LENDER_STORAGE_KEY = "home-buying-prototype-selected-lender";
const SELECTED_REALTOR_STORAGE_KEY = "home-buying-prototype-selected-realtor";
const MODELED_LOCATION_STORAGE_KEY = "home-buying-prototype-modeled-location";

const affordableHomeownershipPrograms: HomeownershipProgram[] = [
  {
    id: "eclt",
    name: "Elevation Community Land Trust (ECLT)",
    organization: "Elevation CLT",
    modelType: "Community Land Trust",
    serviceArea: "Statewide, including Denver Metro and Larimer communities",
    incomeLimit: "Generally 80% AMI; no published minimum income; housing payment usually capped around 33% of gross monthly income, with possible waiver to 35% for 700+ FICO.",
    requirements: "Income and asset eligibility, online orientation, approved lender, 99-year renewable land lease, shared appreciation on sale.",
    benefits: ["Below-market home prices", "Permanent affordability", "Builds equity through ownership", "Conventional mortgage eligible"],
    drawbacks: ["You lease the land", "Limited resale appreciation", "Resale restrictions", "Limited inventory"],
    website: "https://elevationclt.org/qualify-apply/",
    contact: "info@elevationclt.org | 720-822-0052",
    verified: "Verified",
    scoreImpact: 10,
  },
  {
    id: "cclt",
    name: "Colorado Community Land Trust (CCLT)",
    organization: "Habitat for Humanity of Metro Denver",
    modelType: "Community Land Trust",
    serviceArea: "Denver Metro, including Lowry, Speer, Cole, and Swansea",
    incomeLimit: "80% AMI; affordable mortgage payments set not to exceed about 30% of family gross monthly income.",
    requirements: "Income verification, homebuyer education, mortgage pre-qualification, and Habitat-approved lenders.",
    benefits: ["Habitat support", "Permanently affordable neighborhoods", "Equity-building opportunity", "Established portfolio"],
    drawbacks: ["Specific Denver neighborhoods", "Land lease model", "Restricted appreciation", "Limited inventory"],
    website: "https://habitatmetrodenver.org/home-programs/cclt/",
    contact: "stewardship@habitatmetrodenver.org | 720-496-2703",
    verified: "Verified",
    scoreImpact: 10,
  },
  {
    id: "thistle",
    name: "Thistle Community Land Trust",
    organization: "Thistle Community Housing",
    modelType: "Community Land Trust",
    serviceArea: "Boulder County",
    incomeLimit: "80% AMI; minimum income not published.",
    requirements: "Boulder County common application, income and asset verification, CHFA certificate or mortgage pre-qualification, and CLT supplement.",
    benefits: ["Serves high-cost Boulder County", "99-year renewable land lease", "Historically very low sale prices", "Includes Mapleton Mobile Home Park option"],
    drawbacks: ["Boulder County only", "Very limited inventory", "Applications only when homes are available", "Resale price restrictions"],
    website: "https://www.thistlecommunityhousing.org/community-land-trust",
    contact: "info@thistlecommunities.org | 303-443-0007",
    verified: "Verified",
    scoreImpact: 10,
  },
  {
    id: "habitat-metro-denver",
    name: "Habitat for Humanity Metro Denver",
    organization: "Habitat for Humanity",
    modelType: "Affordable Homeownership / Sweat Equity",
    serviceArea: "Denver Metro",
    incomeLimit: "Below 80% AMI; affordable mortgage payments are generally set near 30% of family gross monthly income.",
    requirements: "Income verification, homebuyer education, sweat equity, and ability to afford an affordable mortgage.",
    benefits: ["Very affordable mortgage payments", "Community through sweat equity", "Full homeownership model", "Long-running metro Denver program"],
    drawbacks: ["Significant time commitment", "Limited inventory", "Competitive application", "Must be both eligible and mortgage-ready"],
    website: "https://habitatmetrodenver.org/home-programs/homeownership/",
    contact: "homeownership@habitatmetrodenver.org",
    verified: "Verified",
    scoreImpact: 11,
  },
  {
    id: "chaffee-housing-trust",
    name: "Chaffee Housing Trust",
    organization: "Chaffee Housing Trust",
    modelType: "Community Land Trust",
    serviceArea: "Chaffee County / Buena Vista area",
    incomeLimit: "Varies; minimum income not published.",
    requirements: "Income eligibility and CLT homeownership terms.",
    benefits: ["Rural mountain community focus", "Affordable ownership and rental portfolio", "Sustainable housing focus"],
    drawbacks: ["Very limited geography", "Small inventory", "Land lease restrictions"],
    website: "https://chaffeehousing.org",
    contact: "info@chaffeehousing.org | 719-239-1199",
    verified: "Partial",
    scoreImpact: 7,
  },
  {
    id: "goose-creek-clt",
    name: "Goose Creek Community Land Trust",
    organization: "Goose Creek CLT",
    modelType: "Community Land Trust",
    serviceArea: "Boulder",
    incomeLimit: "Multiple income levels; Maintain the Middle may have a minimum near 60% AMI, but current official details need verification.",
    requirements: "Income eligibility and environmentally sustainable housing focus.",
    benefits: ["Sustainability focus", "Serves diverse income levels", "Boulder location"],
    drawbacks: ["Newer organization", "Limited public information", "Small scale"],
    website: "https://goosecreekclt.org",
    contact: "david@goosecreekclt.org | 303-545-6255",
    verified: "Partial",
    scoreImpact: 7,
  },
  {
    id: "crhdc-contractor-build",
    name: "CRHDC Contractor Build Homes",
    organization: "CRHDC",
    modelType: "Affordable New Construction",
    serviceArea: "San Luis Valley only",
    incomeLimit: "60% to 120% AMI.",
    requirements: "Income eligibility, mortgage qualification, and working with CRHDC on loans, contracting, and build scheduling.",
    benefits: ["New construction", "CRHDC support with build process", "Customization options", "Multiple floor plans"],
    drawbacks: ["San Luis Valley only", "Development-area dependent", "Inventory depends on build feasibility"],
    website: "https://crhdc.org/services/housing-development/",
    contact: "CRHDC | 303-428-1448",
    verified: "Verified",
    scoreImpact: 8,
  },
];

const initialEligibilityAnswers: EligibilityAnswers = {
  firstTimeBuyer: "unsure",
  firstGenerationBuyer: "unsure",
  disabilityEligible: "unsure",
  veteranEligible: "unsure",
  localRequirement: "unsure",
};

const eligibilityQuestions: { key: keyof EligibilityAnswers; label: string; description: string }[] = [
  { key: "firstTimeBuyer", label: "First-time buyer", description: "You have not owned a home recently, usually within the last 3 years." },
  { key: "firstGenerationBuyer", label: "First-generation buyer", description: "Your parents/guardians have not owned a home, depending on program rules." },
  { key: "disabilityEligible", label: "Disability eligibility", description: "You or a qualifying household member has disability documentation." },
  { key: "veteranEligible", label: "Veteran eligibility", description: "You may qualify for veteran-specific exceptions or programs." },
  { key: "localRequirement", label: "Local area/workforce fit", description: "You live, work, or are buying in a required city, county, or community." },
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

const assistanceProgramLinks: Record<string, string> = {
  none: "https://www.consumerfinance.gov/owning-a-home/",
  "chfa-firststep-plus": "https://www.chfainfo.com/homeownership/down-payment-assistance",
  "chfa-smartstep-plus": "https://www.chfainfo.com/homeownership/down-payment-assistance",
  "chfa-firstgeneration": "https://www.chfainfo.com/homeownership/homebuyer-programs/firstgeneration",
  "chfa-homeaccess": "https://www.chfainfo.com/homeownership/homebuyer-programs/homeaccess",
  "chac-immediate": "https://www.chaconline.org/",
  "chac-deferral": "https://www.chaconline.org/",
  "chac-disability": "https://www.chaconline.org/",
  "metro-dpa": "https://www.metrodpa.org/",
  "aurora-prop-123": "https://www.auroragov.org/residents/housing_and_community_services/homeownership_assistance",
  "pikes-peak-dpa": "https://www.elpasoco.com/economic-development/community-development/homebuyer-assistance/",
  "boulder-county-bcdpap": "https://www.longmontcolorado.gov/departments/departments-a-d/community-and-neighborhood-resources/housing/homeownership-programs/down-payment-assistance",
  "boulder-h2o": "https://bouldercolorado.gov/services/homeownership-programs",
  "boulder-middle-income": "https://bouldercolorado.gov/services/homeownership-programs",
  "boulder-solution-grant": "https://bouldercolorado.gov/services/homeownership-programs",
  "colorado-roots": "https://www.impactdf.org/colorado-roots-dpa-fund/",
  "broomfield-chac": "https://broomfield.org/384/Housing-Programs",
  "dearfield-fund": "https://dearfieldfund.com/",
  "eagle-eclf-shared": "https://eaglecounty.us/departments___services/housing/eagle_county_loan_fund.php",
  "eagle-eclf-amortized": "https://eaglecounty.us/departments___services/housing/eagle_county_loan_fund.php",
  "eagle-ecdoh": "https://eaglecounty.us/departments___services/housing/homebuyer_assistance.php",
  "eagle-ranch-erhc": "https://eagleranchhousing.com/",
  "chfa-sectioneight-plus": "https://www.chfainfo.com/homeownership/homebuyer-programs/sectioneight-homeownership-plus",
  "good-neighbor-next-door": "https://www.hud.gov/program_offices/housing/sfh/reo/goodn/gnndabot",
  "colorado-hfa1-plus": "https://www.chfainfo.com/homeownership/down-payment-assistance",
  "chenoa-fund-fha": "https://chenoafund.org/",
  "chfa-vlip": "https://www.chfainfo.com/homeownership/down-payment-assistance",
  "douglas-dchp": "https://douglascountyhousingpartnership.org/",
  "noco-equity-share": "https://nocohousingnow.org/down-payment-assistance/",
  "estes-valley": "https://www.estes.org/housing",
  "greeley-ghope": "https://greeleygov.com/services/housing/g-hope",
  "summit-srlf": "https://www.summithousing.us/programs/revolving-loan-fund/",
  "eagle-ehop": "https://eaglecounty.us/departments___services/housing/employee_home_ownership_program.php",
  "yampa-valley": "https://yampavalleyha.org/",
};

const lenders: Contact[] = [
  { id: "cindy-sotelo", name: "Cindy Sotelo", company: "American Financing Corporation", phone: "303.557.4239", email: "cindy.sotelo@americanfinancing.net", nmls: "1231199", award: "Bronze Lender", languages: "Spanish", countiesServed: ["Adams", "Arapahoe", "Denver", "El Paso", "Pueblo", "Weld"], notes: "Serves Black and African American households and Hispanic and Latino households." },
  { id: "eric-freiboth", name: "Eric Freiboth", company: "American Financing Corporation", phone: "720.903.7165", email: "eric.freiboth@americanfinancing.net", nmls: "1854661", award: "Bronze Lender", countiesServed: ["Adams", "Arapahoe", "Cheyenne", "Denver", "Elbert", "Morgan", "Otero", "Teller", "Weld"], notes: "Serves API/NHPI, Hispanic and Latino, and rural households." },
  { id: "jason-roe", name: "Jason Roe", company: "American Financing Corporation", phone: "720.924.8083", email: "jason.roe@americanfinancing.net", nmls: "1875424", award: "Silver Lender", countiesServed: ["Adams", "Arapahoe", "Broomfield", "Denver", "Douglas", "Fremont", "Garfield", "Lincoln", "Pueblo", "Weld"], notes: "Serves Black and African American, API/NHPI, and rural households." },
  { id: "brynn-warner", name: "Brynn Warner", company: "CMG Mortgage, Inc.", phone: "720.726.1273", email: "bwarner@cmghomeloans.com", nmls: "1474253", award: "Bronze Lender", countiesServed: ["Adams", "Arapahoe", "Denver", "Douglas", "Jefferson", "Larimer", "Weld"], notes: "LAG member; serves Black and African American households and Hispanic and Latino households." },
  { id: "daniel-lopez", name: "Daniel Lopez", company: "CMG Mortgage, Inc.", phone: "720.262.6233", email: "daniellopez@cmghomeloans.com", nmls: "1876824", award: "Silver Lender", countiesServed: ["Adams", "Arapahoe", "Denver", "Weld"], notes: "Serves Hispanic and Latino households." },
  { id: "brett-baird", name: "Brett Baird", company: "CrossCountry Mortgage, LLC", phone: "303.548.7334", email: "brett.baird@ccm.com", nmls: "297737", award: "Silver Lender", languages: "Spanish", countiesServed: ["Adams", "Arapahoe", "Denver", "El Paso", "Weld"], notes: "Serves Hispanic and Latino households." },
  { id: "hilda-gonzalez", name: "Hilda Gonzalez", company: "CrossCountry Mortgage, LLC", phone: "970.837.5792", email: "hilda.gonzalez@ccm.com", nmls: "840809", languages: "Spanish", countiesServed: ["Adams", "Arapahoe", "Denver", "Weld"], notes: "Serves Hispanic and Latino households." },
  { id: "shelby-wardlaw", name: "Shelby Wardlaw", company: "CrossCountry Mortgage, LLC", phone: "970.673.6881", email: "shelby.wardlaw@ccm.com", nmls: "1458807", award: "Silver Lender", languages: "Spanish", countiesServed: ["Adams", "Arapahoe", "Denver", "Jefferson", "Larimer", "Morgan", "Phillips", "Weld"], notes: "Serves Hispanic and Latino and rural households." },
  { id: "christina-schwarz", name: "Christina Schwarz", company: "Encompass Lending Group, L.P.", phone: "303.435.6273", email: "cschwarz@encompasslending.com", nmls: "211884", award: "Gold Lender", countiesServed: ["Adams", "Arapahoe", "Boulder", "Denver", "Douglas", "El Paso", "Elbert", "Jefferson", "Larimer", "Mesa", "Morgan", "Otero", "Pueblo", "Teller", "Weld"], notes: "Serves several household groups across a broad Colorado footprint." },
  { id: "ryan-goodnight", name: "Ryan Goodnight", company: "Envoy Mortgage, LTD", phone: "720.735.2831", email: "ryan.goodnight@envoymortgage.com", nmls: "226604", award: "Gold Lender", countiesServed: ["Adams", "Arapahoe", "Boulder", "Denver", "Douglas", "El Paso", "Garfield", "Grand", "Jefferson", "Larimer", "Mesa", "Morgan", "Park", "Pueblo", "Teller", "Weld"], notes: "Serves Black and African American, API/NHPI, and rural households." },
  { id: "manny-dominguez", name: "Manny Dominguez", company: "Everett Financial Inc. dba Supreme Lending", phone: "720.485.8683", email: "Manny.Dominguez@supremelending.com", nmls: "1379957", award: "Bronze Lender", languages: "Spanish", countiesServed: ["Adams", "Arapahoe", "Denver", "Jefferson", "Washington", "Weld"], notes: "Serves Hispanic and Latino households." },
  { id: "steven-tilghman", name: "Steven Tilghman", company: "Everett Financial Inc. dba Supreme Lending", phone: "720.541.8246", email: "Steven.Tilghman@SupremeLending.com", nmls: "879733", award: "Silver Lender", countiesServed: ["Adams", "Arapahoe", "Denver", "Elbert", "Huerfano", "Jefferson"], notes: "LAG member; serves Black and African American and rural households." },
  { id: "ashley-hickmon", name: "Ashley Hickmon", company: "Fairway Independent Mortgage Corporation", phone: "303.669.8454", email: "ashley.hickmon@fairwaymc.com", nmls: "250615", award: "Silver Lender", languages: "Spanish", countiesServed: ["Adams", "Arapahoe", "Denver", "Douglas", "El Paso", "Elbert", "Jefferson", "Larimer", "Morgan", "Pueblo"], notes: "Serves Black and African American, Hispanic and Latino, and rural households." },
  { id: "blanca-henriquez", name: "Blanca Henriquez", company: "Guild Mortgage Company LLC", phone: "720.394.1607", email: "bhenriquez@guildmortgage.net", nmls: "1210828", award: "Bronze Lender", countiesServed: ["Adams", "Arapahoe", "Denver", "Douglas", "El Paso", "Jefferson", "Larimer", "Weld"], notes: "Serves Hispanic and Latino households." },
  { id: "david-hosterman", name: "David Hosterman", company: "Guild Mortgage Company LLC", phone: "720.260.9814", email: "dhosterman@guildmortgage.net", nmls: "220562", award: "Gold Lender", countiesServed: ["Adams", "Arapahoe", "Denver", "Douglas", "El Paso", "Jefferson", "Larimer", "Phillips", "Washington", "Weld", "Yuma"], notes: "Serves several household groups including individuals with disabilities." },
  { id: "eric-ruiz", name: "Eric Ruiz", company: "Guild Mortgage Company LLC", phone: "720.990.1984", email: "eric.ruiz@guildmortgage.net", nmls: "1526773", award: "Bronze Lender", languages: "Spanish", countiesServed: ["Adams", "Boulder", "Denver", "Garfield", "Larimer", "Logan", "Mesa", "Phillips", "Washington", "Weld"], notes: "Serves Hispanic and Latino, rural, and disability-eligible households." },
  { id: "michael-dozois", name: "Michael Dozois", company: "Loan Simple, Inc.", phone: "303.565.2606", email: "mdozois@loansimple.com", nmls: "273744", award: "Gold Lender", countiesServed: ["Adams", "Arapahoe", "Boulder", "Delta", "Denver", "Douglas", "El Paso", "Fremont", "Garfield", "Jefferson", "Morgan", "Otero", "Pueblo", "Weld"], notes: "LAG member; serves Black and African American, Hispanic and Latino, and rural households." },
  { id: "nathan-dozois", name: "Nathan Dozois", company: "Loan Simple, Inc.", email: "ndozois@loansimple.com", nmls: "6809", award: "Gold Lender", countiesServed: ["Adams", "Arapahoe", "Boulder", "Broomfield", "Denver", "Douglas", "El Paso", "Elbert", "Fremont", "Garfield", "Jefferson", "Larimer", "Mesa", "Pueblo", "Weld"], notes: "Broad statewide county coverage from the provided list." },
  { id: "jake-sullivan", name: "Jake Sullivan", company: "Lower, LLC dba Universal Lending Home Loans", phone: "720.394.7367", email: "jsullivan@powertpo.com", nmls: "2226233", award: "Gold Lender", countiesServed: ["Adams", "Arapahoe", "Boulder", "Denver", "Douglas", "El Paso", "Fremont", "Jefferson", "La Plata", "Larimer", "Morgan", "Park", "Pueblo", "Weld"], notes: "Serves several household groups across multiple counties." },
  { id: "kelly-morgan", name: "Kelly Morgan", company: "Lower, LLC dba Universal Lending Home Loans", phone: "303.506.5761", email: "kmorgan@powertpo.com", nmls: "1153630", award: "Gold Lender", countiesServed: ["Adams", "Arapahoe", "Delta", "Denver", "El Paso", "Jefferson", "Mesa", "Montrose", "Pueblo", "Weld"], notes: "LAG member; serves multiple household groups." },
  { id: "michael-miller", name: "Michael Miller", company: "Paramount Residential Mortgage Group Inc", phone: "303.957.8390", email: "Mike.Miller@PRMG.NET", nmls: "157535", award: "Gold Lender", countiesServed: ["Adams", "Arapahoe", "Denver", "Douglas", "El Paso", "Elbert", "Fremont", "Garfield", "Jefferson", "Larimer", "Mesa", "Pueblo", "Teller", "Weld"], notes: "Serves several household groups across a broad Colorado footprint." },
  { id: "nicholas-barta", name: "Nicholas J Barta", company: "Golden Empire Mortgage, Inc.", phone: "303.709.9625", email: "nbarta@securityff.com", nmls: "25540", award: "Gold Lender", countiesServed: ["Adams", "Arapahoe", "Denver", "El Paso", "Fremont", "Garfield", "Jefferson", "Larimer", "Logan", "Mesa", "Morgan", "Pueblo", "Weld"], notes: "Serves several household groups including individuals with disabilities." },
];

const realtors: Contact[] = [
  { id: "jackie-aguilar", name: "Jackie Aguilar", company: "Invalesco", phone: "(720) 347-3071", email: "jackie@invalescore.com", languages: "English, Spanish", website: "https://www.invalescore.com/jackie-aguilar", specialties: ["DPA programs"], countiesServed: ["all"] },
  { id: "nicole-aguilar", name: "Nicole Aguilar", company: "Invalesco", phone: "(303) 335-9491", email: "nicole@purpleagent.co", languages: "English", website: "https://www.invalescore.com/nicole-aguilar", specialties: ["LGBTQ+", "Neurodiverse buyers", "DPA programs"], countiesServed: ["all"] },
  { id: "nadiya-alsayed", name: "Nadiya Alsayed", company: "Invalesco", phone: "(303) 748-6017", email: "nadiya@invalescore.com", languages: "English", website: "https://www.invalescore.com/nadiya-alsayed", specialties: ["DPA programs"], countiesServed: ["all"] },
  { id: "merima-brkic", name: "Merima Brkic", company: "Invalesco", phone: "(303) 304-3888", email: "merima@yourhausrealty.com", languages: "English", website: "https://www.invalescore.com/merima-brkic", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "beth-concha", name: "Beth Concha", company: "Invalesco", phone: "(303) 564-7763", email: "beth@bethsellsdenver.com", languages: "English", website: "https://www.invalescore.com/beth-concha", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "aaron-gailey", name: "Aaron Gailey", company: "Invalesco", phone: "(303) 518-4262", email: "aaron@invalescore.com", languages: "English", website: "https://www.invalescore.com/aaron-gailey", specialties: ["First-time buyers", "DPA programs"], countiesServed: ["all"] },
  { id: "nancy-gomez-miramontes", name: "Nancy Gomez-Miramontes", company: "Invalesco", phone: "(720) 335-0457", email: "nancy@invalescoRE.com", languages: "English, Spanish", website: "https://www.invalescore.com/nancy-gomez-miramontes", specialties: ["DPA programs"], countiesServed: ["all"] },
  { id: "crystalle-guss", name: "Crystalle Guss", company: "Invalesco", phone: "(720) 588-3068", email: "crystalle@invalescoRE.com", languages: "English", website: "https://www.invalescore.com/crystalle-guss", specialties: ["First-time buyers", "DPA programs"], countiesServed: ["all"] },
  { id: "kayla-haley", name: "Kayla Haley", company: "Invalesco", phone: "(602) 702-7199", email: "KaylaCollectiveLLC@gmail.com", languages: "English", website: "https://www.invalescore.com/kayla-haley", specialties: ["DPA programs"], countiesServed: ["all"] },
  { id: "christie-held", name: "Christie Held", company: "Invalesco", email: "Christie@invalescore.com", languages: "English", website: "https://www.invalescore.com/christie-held", specialties: ["First-time buyers", "DPA programs"], countiesServed: ["all"] },
  { id: "ellie-johnson", name: "Ellie Johnson", company: "Invalesco", phone: "(720) 304-5551", email: "ellie@invalescore.com", languages: "English", website: "https://www.invalescore.com/ellie-johnson", specialties: ["First-time buyers", "DPA programs"], countiesServed: ["all"] },
  { id: "audra-richmond", name: "Audra Richmond", company: "Invalesco", phone: "(720) 427-8201", email: "audra@invalescoRE.com", languages: "English", website: "https://www.invalescore.com/audra-richmond", specialties: ["First-time buyers", "DPA programs"], countiesServed: ["all"] },
  { id: "angie-sudberry", name: "Angie Sudberry", company: "Invalesco", phone: "(720) 435-2183", email: "angie@invalescoRE.com", languages: "English", website: "https://www.invalescore.com/angie-sudberry", specialties: ["DPA programs"], countiesServed: ["all"] },
  { id: "vianney-yamada", name: "Vianney Yamada", company: "Invalesco", phone: "(720) 717-3547", email: "realtorvianney@gmail.com", languages: "English", website: "https://www.invalescore.com/vianney-yamada", specialties: ["First-time buyers", "DPA programs"], countiesServed: ["all"] },
  { id: "jo-untiedt", name: "Jo Untiedt", company: "Affordable Housing Consultants", phone: "(303) 437-0131", email: "jo@affordablehousingconsultants.org", languages: "English", website: "https://www.affordablehousingconsultants.org/contact-us.html", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "nastasha-vasquez", name: "Nastasha Vasquez", company: "Modern Lines Realty Group", phone: "(720) 557-2811", email: "modernlinesllc@gmail.com", languages: "English", website: "https://www.modernlinescolorado.com/", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "cleo-lewis", name: "Cleo Lewis", company: "Central Park Mortgage", phone: "(720) 552-1215", email: "home@centralparkmortgage.co", languages: "English", website: "https://www.centralparkmortgage.co/", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "victoria-holmes", name: "Victoria Holmes", company: "City Park Realty", phone: "(303) 377-1488", email: "voh111@msn.com", languages: "English", website: "https://cityparkrealty.com/", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "angela-hutton-hall", name: "Angela Hutton-Hall", company: "City Park Realty", phone: "(303) 377-1488", email: "a.hutton@cityparkrealty.com", languages: "English", website: "https://cityparkrealty.com/", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "muriel-williams-thompson", name: "Muriel Williams-Thompson", company: "Town and Country Realty of Denver", phone: "(303) 789-9494", email: "murieldwilliams@yahoo.com", languages: "English", website: "https://townandcountryrealtyofdenver.com/about-muriel-williams-thompson/", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "maya-whitney", name: "Maya Whitney", company: "HomeSmart Realty Group", phone: "(720) 628-5399", email: "ladyrealestate5280@gmail.com", languages: "English", website: "https://homesmart.com/real-estate-agent/hs0017/maya-whitney/ec8e56ab-3e53-45bb-b288-0ed7df1fef68", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "eriqueca-sanders", name: "Eriqueca Sanders", company: "303 Realty Group", phone: "(303) 495-2125", email: "eriqueca@303realty.net", languages: "English", website: "https://303realtygroup.com/", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "matt-stewart", name: "Matt Stewart", company: "Coldwell Banker Realty North Metro", phone: "(720) 587-5129", email: "matt.stewart@cbrealty.com", languages: "English", website: "https://mattstewarthomes.com/", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "janine-kempfer", name: "Janine Kempfer", company: "Prime Mortgage", phone: "(303) 587-7775", email: "Janine@primemortgage.biz", languages: "English", website: "https://calendly.com/prime-mortgage", specialties: ["Affordable housing", "Lender services", "DPA programs"], countiesServed: ["all"] },
  { id: "monica-askew", name: "Monica Askew", company: "Equity Colorado Real Estate", phone: "(720) 253-8983", email: "info@denverrealtormonica.com", languages: "English", website: "https://www.equitycoloradorealestate.com/agent/monica-askew", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "tanya-vidal", name: "Tanya Vidal", company: "Town and Country Realty of Denver", phone: "(720) 427-7619", email: "vidalt_@hotmail.com", languages: "English, Spanish", website: "https://tanyavidalre.com/about", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "anthony-rael", name: "Anthony Rael", company: "RE/MAX Alliance - Denver", phone: "(303) 520-3179", languages: "English", website: "https://anthonyrael.com/", specialties: ["First-time buyers", "Affordable housing", "VA loans", "DPA programs"], countiesServed: ["all"] },
  { id: "nathan-hart", name: "Nathan Hart", company: "HomeSmart Realty Group", phone: "(303) 564-4055", email: "RealtorNathan@yahoo.com", languages: "English", website: "https://www.nathansellsdenver.com/", specialties: ["First-time buyers", "Affordable housing", "DPA programs"], countiesServed: ["all"] },
  { id: "christine-gwinnup", name: "Christine Gwinnup", company: "Lpt Realty", phone: "(303) 709-4262", email: "helittleladyinc@gmail.com", languages: "English", website: "https://www.thelittleladysellshomes.com/", specialties: ["First-time buyers", "VA loans", "DPA programs"], countiesServed: ["Larimer", "Weld"] },
  { id: "heidi-stiteler", name: "Heidi Stiteler", company: "Coldwell Banker (Cherry Creek North)", phone: "(303) 222-0027", email: "contact@firsttimehomebuyersdenverco.com", languages: "English", website: "https://firsttimehomebuyersdenverco.com/", specialties: ["First-time buyers", "DPA programs"], countiesServed: ["all"] },
  { id: "susie-cortright", name: "Susie Cortright", company: "RE/MAX Properties of the Summit", phone: "(970) 389-8338", email: "susie@thecortrightgroup.com", languages: "English", website: "https://www.susiecortright.com/", specialties: ["Affordable housing", "DPA programs"], countiesServed: ["Summit"] },
];

const initialAnswers: Answers = {
  location: [],
  income: "",
  householdSize: 2,
  bedrooms: 3,
  creditScore: 720,
  assistanceProgram: "none",
  affordablePrograms: [],
};

const questions: Question[] = [
  {
    key: "location",
    eyebrow: "Colorado market",
    title: "Where are you considering buying?",
    description: "Start typing a Colorado neighborhood, city, or county.",
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
    min: 1,
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
    eyebrow: "Buying help",
    title: "Start with the type of buying help you want",
    description: "Compare a simple explanation of down payment assistance and affordable ownership before choosing a specific program.",
    type: "assistance",
  },
];

type StepRoute = {
  step: number;
  showIntro: boolean;
  showExplanation: boolean;
  showSummary: boolean;
  contactPicker: "lender" | "realtor" | null;
};

function getQuestionStepName(question: Question) {
  return question.key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function getStepName(step: number, showIntro: boolean, showExplanation: boolean, showSummary: boolean, contactPicker: "lender" | "realtor" | null) {
  if (showIntro) return "what-this-is";
  if (contactPicker) return `select-${contactPicker}`;
  if (showSummary) return "summary-next-steps";

  const boundedStep = Math.max(0, Math.min(questions.length - 1, step));
  const questionName = getQuestionStepName(questions[boundedStep]);
  return showExplanation && questions[boundedStep].key !== "location" ? `${questionName}-impact` : questionName;
}

function getRouteFromStepName(stepName: string | null): StepRoute {
  const normalizedStepName = stepName?.trim().toLowerCase() ?? "";

  if (!normalizedStepName || normalizedStepName === "what-this-is" || normalizedStepName === "intro") {
    return { step: 0, showIntro: true, showExplanation: false, showSummary: false, contactPicker: null };
  }

  if (normalizedStepName === "select-lender" || normalizedStepName === "lenders") {
    return { step: questions.length - 1, showIntro: false, showExplanation: true, showSummary: true, contactPicker: "lender" };
  }

  if (normalizedStepName === "select-realtor" || normalizedStepName === "realtors") {
    return { step: questions.length - 1, showIntro: false, showExplanation: true, showSummary: true, contactPicker: "realtor" };
  }

  if (normalizedStepName === "ways-to-make-buying-work" || normalizedStepName === "buying-alternatives") {
    return { step: questions.length - 1, showIntro: false, showExplanation: true, showSummary: true, contactPicker: null };
  }

  if (normalizedStepName === "summary-next-steps" || normalizedStepName === "summary") {
    return { step: questions.length - 1, showIntro: false, showExplanation: true, showSummary: true, contactPicker: null };
  }

  if (normalizedStepName === "down-payment-assistance") {
    return { step: questions.length - 1, showIntro: false, showExplanation: false, showSummary: false, contactPicker: null };
  }

  const isImpactStep = normalizedStepName.endsWith("-impact");
  const questionName = isImpactStep ? normalizedStepName.slice(0, -"-impact".length) : normalizedStepName;
  const questionIndex = questions.findIndex((question) => getQuestionStepName(question) === questionName);

  if (questionIndex === -1) return { step: 0, showIntro: true, showExplanation: false, showSummary: false, contactPicker: null };

  if (isImpactStep && questions[questionIndex].key === "location") {
    return { step: Math.min(questions.length - 1, questionIndex + 1), showIntro: false, showExplanation: false, showSummary: false, contactPicker: null };
  }

  return { step: questionIndex, showIntro: false, showExplanation: isImpactStep, showSummary: false, contactPicker: null };
}

function getRouteFromUrl() {
  return getRouteFromStepName(new URLSearchParams(window.location.search).get("step"));
}

const baseColoradoLocations = [
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
  { name: "Lincoln County", multiplier: 0.68 },
  { name: "Mesa County", multiplier: 0.76 },
  { name: "Pitkin County", multiplier: 2.45 },
  { name: "Pueblo County", multiplier: 0.66 },
  { name: "Routt County", multiplier: 1.42 },
  { name: "Summit County", multiplier: 1.72 },
  { name: "Weld County", multiplier: 0.82 },
  { name: "Arvada, Jefferson County", multiplier: 1.08 },
  { name: "Aspen, Pitkin County", multiplier: 2.45 },
  { name: "Aurora, Arapahoe County", multiplier: 1.04 },
  { name: "Avon, Eagle County", multiplier: 1.72 },
  { name: "Basalt, Eagle County", multiplier: 1.46 },
  { name: "Berthoud, Larimer County", multiplier: 1.02 },
  { name: "Boulder, Boulder County", multiplier: 1.62 },
  { name: "Breckenridge, Summit County", multiplier: 1.72 },
  { name: "Broomfield, Broomfield County", multiplier: 1.28 },
  { name: "Buena Vista, Chaffee County", multiplier: 1.12 },
  { name: "Canon City, Fremont County", multiplier: 0.72 },
  { name: "Carbondale, Garfield County", multiplier: 1.26 },
  { name: "Castle Rock, Douglas County", multiplier: 1.22 },
  { name: "Centennial, Arapahoe County", multiplier: 1.14 },
  { name: "Colorado Springs, El Paso County", multiplier: 0.92 },
  { name: "Commerce City, Adams County", multiplier: 0.96 },
  { name: "Denver, Denver County", multiplier: 1.18 },
  { name: "Dillon, Summit County", multiplier: 1.5 },
  { name: "Durango, La Plata County", multiplier: 1.1 },
  { name: "Englewood, Arapahoe County", multiplier: 1.04 },
  { name: "Erie, Weld County", multiplier: 1.12 },
  { name: "Estes Park, Larimer County", multiplier: 1.18 },
  { name: "Evans, Weld County", multiplier: 0.78 },
  { name: "Federal Heights, Adams County", multiplier: 0.88 },
  { name: "Firestone, Weld County", multiplier: 0.96 },
  { name: "Fort Collins, Larimer County", multiplier: 1.02 },
  { name: "Fountain, El Paso County", multiplier: 0.82 },
  { name: "Frederick, Weld County", multiplier: 0.98 },
  { name: "Frisco, Summit County", multiplier: 1.6 },
  { name: "Fruita, Mesa County", multiplier: 0.72 },
  { name: "Glenwood Springs, Garfield County", multiplier: 1.22 },
  { name: "Golden, Jefferson County", multiplier: 1.22 },
  { name: "Grand Junction, Mesa County", multiplier: 0.76 },
  { name: "Greeley, Weld County", multiplier: 0.82 },
  { name: "Greenwood Village, Arapahoe County", multiplier: 1.42 },
  { name: "Johnstown, Weld County", multiplier: 0.94 },
  { name: "Lafayette, Boulder County", multiplier: 1.26 },
  { name: "Lakewood, Jefferson County", multiplier: 1.12 },
  { name: "Littleton, Arapahoe County", multiplier: 1.12 },
  { name: "Limon, Lincoln County", multiplier: 0.68 },
  { name: "Longmont, Boulder County", multiplier: 1.2 },
  { name: "Loveland, Larimer County", multiplier: 0.98 },
  { name: "Louisville, Boulder County", multiplier: 1.34 },
  { name: "Lyons, Boulder County", multiplier: 1.24 },
  { name: "Manitou Springs, El Paso County", multiplier: 1.0 },
  { name: "Montrose, Montrose County", multiplier: 0.84 },
  { name: "Morrison, Jefferson County", multiplier: 1.24 },
  { name: "Nederland, Boulder County", multiplier: 1.14 },
  { name: "Northglenn, Adams County", multiplier: 0.96 },
  { name: "Parker, Douglas County", multiplier: 1.2 },
  { name: "Pueblo, Pueblo County", multiplier: 0.66 },
  { name: "Rifle, Garfield County", multiplier: 0.86 },
  { name: "Salida, Chaffee County", multiplier: 1.1 },
  { name: "Silverthorne, Summit County", multiplier: 1.48 },
  { name: "Steamboat Springs, Routt County", multiplier: 1.42 },
  { name: "Superior, Boulder County", multiplier: 1.32 },
  { name: "Thornton, Adams County", multiplier: 0.98 },
  { name: "Timnath, Larimer County", multiplier: 1.12 },
  { name: "Vail, Eagle County", multiplier: 1.95 },
  { name: "Wheat Ridge, Jefferson County", multiplier: 1.1 },
  { name: "Westminster, Adams County", multiplier: 1.02 },
  { name: "Windsor, Weld County", multiplier: 0.98 },
];

const coloradoMunicipalityLocations = [
  { name: "Aguilar, Las Animas County", multiplier: 0.68 },
  { name: "Akron, Washington County", multiplier: 0.68 },
  { name: "Alamosa, Alamosa County", multiplier: 0.72 },
  { name: "Alma, Park County", multiplier: 0.9 },
  { name: "Antonito, Conejos County", multiplier: 0.68 },
  { name: "Arriba, Lincoln County", multiplier: 0.68 },
  { name: "Arvada, Jefferson County", multiplier: 1.18 },
  { name: "Aspen, Pitkin County", multiplier: 2.45 },
  { name: "Ault, Weld County", multiplier: 0.82 },
  { name: "Aurora, Arapahoe County", multiplier: 1.08 },
  { name: "Avon, Eagle County", multiplier: 1.95 },
  { name: "Basalt, Eagle County", multiplier: 1.95 },
  { name: "Bayfield, La Plata County", multiplier: 1.1 },
  { name: "Bennett, Adams County", multiplier: 1.0 },
  { name: "Berthoud, Larimer County", multiplier: 1.02 },
  { name: "Bethune, Kit Carson County", multiplier: 0.66 },
  { name: "Black Hawk, Gilpin County", multiplier: 1.08 },
  { name: "Blanca, Costilla County", multiplier: 0.66 },
  { name: "Blue River, Summit County", multiplier: 1.72 },
  { name: "Bonanza, Saguache County", multiplier: 0.7 },
  { name: "Boone, Pueblo County", multiplier: 0.66 },
  { name: "Boulder, Boulder County", multiplier: 1.62 },
  { name: "Bow Mar, Arapahoe County", multiplier: 1.08 },
  { name: "Branson, Las Animas County", multiplier: 0.68 },
  { name: "Breckenridge, Summit County", multiplier: 1.72 },
  { name: "Brighton, Adams County", multiplier: 1.0 },
  { name: "Brookside, Fremont County", multiplier: 0.72 },
  { name: "Broomfield, Broomfield County", multiplier: 1.28 },
  { name: "Brush, Morgan County", multiplier: 0.72 },
  { name: "Buena Vista, Chaffee County", multiplier: 1.12 },
  { name: "Burlington, Kit Carson County", multiplier: 0.66 },
  { name: "Calhan, El Paso County", multiplier: 0.92 },
  { name: "Campo, Baca County", multiplier: 0.62 },
  { name: "Cañon City, Fremont County", multiplier: 0.72 },
  { name: "Carbonate, Garfield County", multiplier: 1.0 },
  { name: "Carbondale, Garfield County", multiplier: 1.0 },
  { name: "Castle Pines, Douglas County", multiplier: 1.34 },
  { name: "Castle Rock, Douglas County", multiplier: 1.34 },
  { name: "Cedaredge, Delta County", multiplier: 0.72 },
  { name: "Centennial, Arapahoe County", multiplier: 1.08 },
  { name: "Center, Saguache County", multiplier: 0.7 },
  { name: "Central City, Gilpin County", multiplier: 1.08 },
  { name: "Cheraw, Otero County", multiplier: 0.64 },
  { name: "Cherry Hills Village, Arapahoe County", multiplier: 1.08 },
  { name: "Cheyenne Wells, Cheyenne County", multiplier: 0.62 },
  { name: "Coal Creek, Fremont County", multiplier: 0.72 },
  { name: "Cokedale, Las Animas County", multiplier: 0.68 },
  { name: "Collbran, Mesa County", multiplier: 0.76 },
  { name: "Colorado Springs, El Paso County", multiplier: 0.92 },
  { name: "Columbine Valley, Arapahoe County", multiplier: 1.08 },
  { name: "Commerce City, Adams County", multiplier: 1.0 },
  { name: "Cortez, Montezuma County", multiplier: 0.8 },
  { name: "Craig, Moffat County", multiplier: 0.7 },
  { name: "Crawford, Delta County", multiplier: 0.72 },
  { name: "Creede, Mineral County", multiplier: 0.84 },
  { name: "Crested Butte, Gunnison County", multiplier: 1.18 },
  { name: "Crestone, Saguache County", multiplier: 0.7 },
  { name: "Cripple Creek, Teller County", multiplier: 0.9 },
  { name: "Crook, Logan County", multiplier: 0.68 },
  { name: "Crowley, Crowley County", multiplier: 0.62 },
  { name: "Dacono, Weld County", multiplier: 0.82 },
  { name: "De Beque, Mesa County", multiplier: 0.76 },
  { name: "Deer Trail, Arapahoe County", multiplier: 1.08 },
  { name: "Del Norte, Rio Grande County", multiplier: 0.7 },
  { name: "Delta, Delta County", multiplier: 0.72 },
  { name: "Denver, Denver County", multiplier: 1.18 },
  { name: "Dillon, Summit County", multiplier: 1.72 },
  { name: "Dinosaur, Moffat County", multiplier: 0.7 },
  { name: "Dolores, Montezuma County", multiplier: 0.8 },
  { name: "Dove Creek, Dolores County", multiplier: 0.78 },
  { name: "Durango, La Plata County", multiplier: 1.1 },
  { name: "Eads, Kiowa County", multiplier: 0.62 },
  { name: "Eagle, Eagle County", multiplier: 1.95 },
  { name: "Eaton, Weld County", multiplier: 0.82 },
  { name: "Eckley, Yuma County", multiplier: 0.68 },
  { name: "Edgewater, Jefferson County", multiplier: 1.18 },
  { name: "Elizabeth, Elbert County", multiplier: 0.98 },
  { name: "Empire, Clear Creek County", multiplier: 1.08 },
  { name: "Englewood, Arapahoe County", multiplier: 1.08 },
  { name: "Erie, Weld County", multiplier: 0.82 },
  { name: "Estes Park, Larimer County", multiplier: 1.02 },
  { name: "Evans, Weld County", multiplier: 0.82 },
  { name: "Fairplay, Park County", multiplier: 0.9 },
  { name: "Federal Heights, Adams County", multiplier: 1.0 },
  { name: "Firestone, Weld County", multiplier: 0.82 },
  { name: "Flagler, Kit Carson County", multiplier: 0.66 },
  { name: "Fleming, Logan County", multiplier: 0.68 },
  { name: "Florence, Fremont County", multiplier: 0.72 },
  { name: "Fort Collins, Larimer County", multiplier: 1.02 },
  { name: "Fort Lupton, Weld County", multiplier: 0.82 },
  { name: "Fort Morgan, Morgan County", multiplier: 0.72 },
  { name: "Fountain, El Paso County", multiplier: 0.92 },
  { name: "Fowler, Otero County", multiplier: 0.64 },
  { name: "Foxfield, Arapahoe County", multiplier: 1.08 },
  { name: "Fraser, Grand County", multiplier: 1.16 },
  { name: "Frederick, Weld County", multiplier: 0.82 },
  { name: "Frisco, Summit County", multiplier: 1.72 },
  { name: "Fruita, Mesa County", multiplier: 0.76 },
  { name: "Garden City, Weld County", multiplier: 0.82 },
  { name: "Genoa, Lincoln County", multiplier: 0.68 },
  { name: "Georgetown, Clear Creek County", multiplier: 1.08 },
  { name: "Gilcrest, Weld County", multiplier: 0.82 },
  { name: "Glendale, Arapahoe County", multiplier: 1.08 },
  { name: "Glenwood Springs, Garfield County", multiplier: 1.0 },
  { name: "Golden, Jefferson County", multiplier: 1.18 },
  { name: "Granada, Prowers County", multiplier: 0.64 },
  { name: "Granby, Grand County", multiplier: 1.16 },
  { name: "Grand Junction, Mesa County", multiplier: 0.76 },
  { name: "Grand Lake, Grand County", multiplier: 1.16 },
  { name: "Greeley, Weld County", multiplier: 0.82 },
  { name: "Green Mountain Falls, El Paso County", multiplier: 0.92 },
  { name: "Greenwood Village, Arapahoe County", multiplier: 1.08 },
  { name: "Grover, Weld County", multiplier: 0.82 },
  { name: "Gunnison, Gunnison County", multiplier: 1.18 },
  { name: "Gypsum, Eagle County", multiplier: 1.95 },
  { name: "Hartman, Prowers County", multiplier: 0.64 },
  { name: "Haswell, Kiowa County", multiplier: 0.62 },
  { name: "Haxtun, Phillips County", multiplier: 0.68 },
  { name: "Hayden, Routt County", multiplier: 1.42 },
  { name: "Hillrose, Morgan County", multiplier: 0.72 },
  { name: "Holly, Prowers County", multiplier: 0.64 },
  { name: "Holyoke, Phillips County", multiplier: 0.68 },
  { name: "Hooper, Alamosa County", multiplier: 0.72 },
  { name: "Hot Sulphur Springs, Grand County", multiplier: 1.16 },
  { name: "Hotchkiss, Delta County", multiplier: 0.72 },
  { name: "Hudson, Weld County", multiplier: 0.82 },
  { name: "Hugo, Lincoln County", multiplier: 0.68 },
  { name: "Idaho Springs, Clear Creek County", multiplier: 1.08 },
  { name: "Ignacio, La Plata County", multiplier: 1.1 },
  { name: "Iliff, Logan County", multiplier: 0.68 },
  { name: "Jamestown, Boulder County", multiplier: 1.62 },
  { name: "Johnstown, Weld County", multiplier: 0.82 },
  { name: "Julesburg, Sedgwick County", multiplier: 0.66 },
  { name: "Keenesburg, Weld County", multiplier: 0.82 },
  { name: "Kersey, Weld County", multiplier: 0.82 },
  { name: "Keystone, Summit County", multiplier: 1.72 },
  { name: "Kim, Las Animas County", multiplier: 0.68 },
  { name: "Kiowa, Elbert County", multiplier: 0.98 },
  { name: "Kit Carson, Cheyenne County", multiplier: 0.62 },
  { name: "Kremmling, Grand County", multiplier: 1.16 },
  { name: "La Jara, Conejos County", multiplier: 0.68 },
  { name: "La Junta, Otero County", multiplier: 0.64 },
  { name: "La Veta, Huerfano County", multiplier: 0.66 },
  { name: "Lafayette, Boulder County", multiplier: 1.62 },
  { name: "Lake City, Hinsdale County", multiplier: 0.92 },
  { name: "Lakeside, Jefferson County", multiplier: 1.18 },
  { name: "Lakewood, Jefferson County", multiplier: 1.18 },
  { name: "Lamar, Prowers County", multiplier: 0.64 },
  { name: "Larkspur, Douglas County", multiplier: 1.34 },
  { name: "Las Animas, Bent County", multiplier: 0.62 },
  { name: "LaSalle, Weld County", multiplier: 0.82 },
  { name: "Leadville, Lake County", multiplier: 0.92 },
  { name: "Limon, Lincoln County", multiplier: 0.68 },
  { name: "Littleton, Arapahoe County", multiplier: 1.08 },
  { name: "Lochbuie, Weld County", multiplier: 0.82 },
  { name: "Log Lane Village, Morgan County", multiplier: 0.72 },
  { name: "Lone Tree, Douglas County", multiplier: 1.34 },
  { name: "Longmont, Boulder County", multiplier: 1.62 },
  { name: "Louisville, Boulder County", multiplier: 1.62 },
  { name: "Loveland, Larimer County", multiplier: 1.02 },
  { name: "Lyons, Boulder County", multiplier: 1.62 },
  { name: "Manassa, Conejos County", multiplier: 0.68 },
  { name: "Mancos, Montezuma County", multiplier: 0.8 },
  { name: "Manitou Springs, El Paso County", multiplier: 0.92 },
  { name: "Manzanola, Otero County", multiplier: 0.64 },
  { name: "Marble, Gunnison County", multiplier: 1.18 },
  { name: "Mead, Weld County", multiplier: 0.82 },
  { name: "Meeker, Rio Blanco County", multiplier: 0.74 },
  { name: "Merino, Logan County", multiplier: 0.68 },
  { name: "Milliken, Weld County", multiplier: 0.82 },
  { name: "Minturn, Eagle County", multiplier: 1.95 },
  { name: "Moffat, Saguache County", multiplier: 0.7 },
  { name: "Monte Vista, Rio Grande County", multiplier: 0.7 },
  { name: "Montezuma, Summit County", multiplier: 1.72 },
  { name: "Montrose, Montrose County", multiplier: 0.84 },
  { name: "Monument, El Paso County", multiplier: 0.92 },
  { name: "Morrison, Jefferson County", multiplier: 1.18 },
  { name: "Mount Crested Butte, Gunnison County", multiplier: 1.18 },
  { name: "Mountain View, Jefferson County", multiplier: 1.18 },
  { name: "Mountain Village, San Miguel County", multiplier: 1.5 },
  { name: "Naturita, Montrose County", multiplier: 0.84 },
  { name: "Nederland, Boulder County", multiplier: 1.62 },
  { name: "New Castle, Garfield County", multiplier: 1.0 },
  { name: "Northglenn, Adams County", multiplier: 1.0 },
  { name: "Norwood, San Miguel County", multiplier: 1.5 },
  { name: "Nucla, Montrose County", multiplier: 0.84 },
  { name: "Nunn, Weld County", multiplier: 0.82 },
  { name: "Oak Creek, Routt County", multiplier: 1.42 },
  { name: "Olathe, Montrose County", multiplier: 0.84 },
  { name: "Olney Springs, Crowley County", multiplier: 0.62 },
  { name: "Ophir, San Miguel County", multiplier: 1.5 },
  { name: "Orchard City, Delta County", multiplier: 0.72 },
  { name: "Ordway, Crowley County", multiplier: 0.62 },
  { name: "Otis, Washington County", multiplier: 0.68 },
  { name: "Ouray, Ouray County", multiplier: 1.16 },
  { name: "Ovid, Sedgwick County", multiplier: 0.66 },
  { name: "Pagosa Springs, Archuleta County", multiplier: 0.92 },
  { name: "Palisade, Mesa County", multiplier: 0.76 },
  { name: "Palmer Lake, El Paso County", multiplier: 0.92 },
  { name: "Paoli, Phillips County", multiplier: 0.68 },
  { name: "Paonia, Delta County", multiplier: 0.72 },
  { name: "Parachute, Garfield County", multiplier: 1.0 },
  { name: "Parker, Douglas County", multiplier: 1.34 },
  { name: "Peetz, Logan County", multiplier: 0.68 },
  { name: "Pierce, Weld County", multiplier: 0.82 },
  { name: "Pitkin, Gunnison County", multiplier: 1.18 },
  { name: "Platteville, Weld County", multiplier: 0.82 },
  { name: "Poncha Springs, Chaffee County", multiplier: 1.12 },
  { name: "Pritchett, Baca County", multiplier: 0.62 },
  { name: "Pueblo, Pueblo County", multiplier: 0.66 },
  { name: "Ramah, El Paso County", multiplier: 0.92 },
  { name: "Rangely, Rio Blanco County", multiplier: 0.74 },
  { name: "Raymer, Weld County", multiplier: 0.82 },
  { name: "Red Cliff, Eagle County", multiplier: 1.95 },
  { name: "Rico, Dolores County", multiplier: 0.78 },
  { name: "Ridgway, Ouray County", multiplier: 1.16 },
  { name: "Rifle, Garfield County", multiplier: 1.0 },
  { name: "Rockvale, Fremont County", multiplier: 0.72 },
  { name: "Rocky Ford, Otero County", multiplier: 0.64 },
  { name: "Romeo, Conejos County", multiplier: 0.68 },
  { name: "Rye, Pueblo County", multiplier: 0.66 },
  { name: "Saguache, Saguache County", multiplier: 0.7 },
  { name: "Salida, Chaffee County", multiplier: 1.12 },
  { name: "San Luis, Costilla County", multiplier: 0.66 },
  { name: "Sanford, Conejos County", multiplier: 0.68 },
  { name: "Sawpit, San Miguel County", multiplier: 1.5 },
  { name: "Sedgwick, Sedgwick County", multiplier: 0.66 },
  { name: "Seibert, Kit Carson County", multiplier: 0.66 },
  { name: "Severance, Weld County", multiplier: 0.82 },
  { name: "Sheridan, Arapahoe County", multiplier: 1.08 },
  { name: "Sheridan Lake, Kiowa County", multiplier: 0.62 },
  { name: "Silt, Garfield County", multiplier: 1.0 },
  { name: "Silver Cliff, Custer County", multiplier: 0.82 },
  { name: "Silver Plume, Clear Creek County", multiplier: 1.08 },
  { name: "Silverthorne, Summit County", multiplier: 1.72 },
  { name: "Silverton, San Juan County", multiplier: 0.9 },
  { name: "Simla, Elbert County", multiplier: 0.98 },
  { name: "Snowmass Village, Pitkin County", multiplier: 2.45 },
  { name: "South Fork, Rio Grande County", multiplier: 0.7 },
  { name: "Springfield, Baca County", multiplier: 0.62 },
  { name: "Starkville, Las Animas County", multiplier: 0.68 },
  { name: "Steamboat Springs, Routt County", multiplier: 1.42 },
  { name: "Sterling, Logan County", multiplier: 0.68 },
  { name: "Stratton, Kit Carson County", multiplier: 0.66 },
  { name: "Sugar City, Crowley County", multiplier: 0.62 },
  { name: "Superior, Boulder County", multiplier: 1.62 },
  { name: "Swink, Otero County", multiplier: 0.64 },
  { name: "Telluride, San Miguel County", multiplier: 1.5 },
  { name: "Thornton, Adams County", multiplier: 1.0 },
  { name: "Timnath, Larimer County", multiplier: 1.02 },
  { name: "Trinidad, Las Animas County", multiplier: 0.68 },
  { name: "Two Buttes, Baca County", multiplier: 0.62 },
  { name: "Vail, Eagle County", multiplier: 1.95 },
  { name: "Victor, Teller County", multiplier: 0.9 },
  { name: "Vilas, Baca County", multiplier: 0.62 },
  { name: "Vona, Kit Carson County", multiplier: 0.66 },
  { name: "Walden, Jackson County", multiplier: 0.72 },
  { name: "Walsenburg, Huerfano County", multiplier: 0.66 },
  { name: "Walsh, Baca County", multiplier: 0.62 },
  { name: "Ward, Boulder County", multiplier: 1.62 },
  { name: "Wellington, Larimer County", multiplier: 1.02 },
  { name: "Westcliffe, Custer County", multiplier: 0.82 },
  { name: "Westminster, Adams County", multiplier: 1.0 },
  { name: "Wheat Ridge, Jefferson County", multiplier: 1.18 },
  { name: "Wiggins, Morgan County", multiplier: 0.72 },
  { name: "Wiley, Prowers County", multiplier: 0.64 },
  { name: "Williamsburg, Fremont County", multiplier: 0.72 },
  { name: "Windsor, Weld County", multiplier: 0.82 },
  { name: "Winter Park, Grand County", multiplier: 1.16 },
  { name: "Woodland Park, Teller County", multiplier: 0.9 },
  { name: "Wray, Yuma County", multiplier: 0.68 },
  { name: "Yampa, Routt County", multiplier: 1.42 },
  { name: "Yuma, Yuma County", multiplier: 0.68 },
];

const coloradoLocations = [...baseColoradoLocations, ...coloradoMunicipalityLocations].filter(
  (locationOption, index, locations) => locations.findIndex((otherLocation) => otherLocation.name === locationOption.name) === index,
);

const householdSizeOptions = [1, 2, 3, 4, 5, 6, 7, 8];
const bedroomOptions = [1, 2, 3, 4, 5, 6];
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

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);
}

function getLocationMultiplier(location: string) {
  return coloradoLocations.find((locationOption) => locationOption.name === location)?.multiplier ?? 1.18;
}

function normalizeLocations(value: unknown) {
  const values = Array.isArray(value) ? value : typeof value === "string" && value ? [value] : [];

  return values.filter((location): location is string => coloradoLocations.some((locationOption) => locationOption.name === location));
}

function getCheapestLocation(locations: string[]) {
  return [...normalizeLocations(locations)].sort((first, second) => getLocationMultiplier(first) - getLocationMultiplier(second))[0] ?? "";
}

function getLocationsLabel(locations: string[]) {
  const selectedLocations = normalizeLocations(locations);

  if (!selectedLocations.length) return "No location selected";
  if (selectedLocations.length === 1) return selectedLocations[0];
  return selectedLocations.join("; ");
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

function getCountyNames(locations: string[]) {
  return Array.from(new Set(normalizeLocations(locations).map(getCountyName).filter(Boolean)));
}

function getContactById(contacts: Contact[], contactId: string | null) {
  return contacts.find((contact) => contact.id === contactId) ?? null;
}

function contactMatchesCounty(contact: Contact, countyNames: string[]) {
  if (contact.countiesServed.includes("all")) return true;
  if (!countyNames.length) return true;
  return contact.countiesServed.some((county) => countyNames.includes(county));
}

function sortContactsForLocations(contacts: Contact[], locations: string[]) {
  const countyNames = getCountyNames(locations);

  return [...contacts].sort((first, second) => {
    const firstMatches = contactMatchesCounty(first, countyNames);
    const secondMatches = contactMatchesCounty(second, countyNames);

    if (firstMatches !== secondMatches) return firstMatches ? -1 : 1;
    return first.name.localeCompare(second.name);
  });
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

function programMatchesAnyCounty(program: AssistanceProgram, countyNames: string[]) {
  const counties = getProgramCounties(program.id);

  if (program.id === "none" || counties === "statewide" || !countyNames.length) return true;
  return countyNames.some((countyName) => counties.includes(countyName));
}

function getHomeownershipProgramCounties(programId: string) {
  const metroDenverCounties = ["Adams", "Arapahoe", "Boulder", "Broomfield", "Denver", "Douglas", "Jefferson"];
  const countyMap: Record<string, string[] | "statewide"> = {
    eclt: "statewide",
    cclt: metroDenverCounties,
    "habitat-metro-denver": metroDenverCounties,
    thistle: ["Boulder"],
    "chaffee-housing-trust": ["Chaffee"],
    "goose-creek-clt": ["Boulder"],
    "crhdc-contractor-build": ["Alamosa", "Conejos", "Costilla", "Mineral", "Rio Grande", "Saguache"],
  };

  return countyMap[programId] ?? "statewide";
}

function homeownershipProgramMatchesAnyCounty(program: HomeownershipProgram, countyNames: string[]) {
  const counties = getHomeownershipProgramCounties(program.id);

  if (counties === "statewide" || !countyNames.length) return true;
  return countyNames.some((countyName) => counties.includes(countyName));
}

function estimateAssistanceAmount(program: AssistanceProgram, homePrice: number) {
  const grossAssistance = program.assistanceFixed ?? homePrice * program.assistanceRate;
  return program.assistanceCap ? Math.min(grossAssistance, program.assistanceCap) : grossAssistance;
}

function getRepaymentProfile(program: AssistanceProgram) {
  const terms = `${program.title} ${program.assistance} ${program.bestFor} ${program.description} ${getProgramRequirements(program).join(" ")}`.toLowerCase();

  if (program.id === "none") {
    return { label: "Repayable", score: 0, tone: "repayable" };
  }

  if (terms.includes("grant") || terms.includes("forgivable") || terms.includes("discount")) {
    return { label: "Non-repayable", score: 100, tone: "best" };
  }

  return { label: "Repayable", score: 20, tone: "repayable" };
}

function getAssistanceFit(program: AssistanceProgram, estimatedPrice: number, targetDownPayment: number) {
  const estimatedAssistance = Math.min(targetDownPayment, estimateAssistanceAmount(program, estimatedPrice));
  const estimatedCashNeeded = Math.max(0, targetDownPayment - estimatedAssistance);
  const coverageRate = targetDownPayment ? estimatedAssistance / targetDownPayment : 0;
  const repaymentProfile = getRepaymentProfile(program);
  const coverageScore = Math.min(100, coverageRate * 100);
  const cashScore = Math.max(0, 100 - (estimatedCashNeeded / Math.max(targetDownPayment, 1)) * 100);
  const score = repaymentProfile.score * 0.6 + coverageScore * 0.25 + cashScore * 0.15;

  return {
    estimatedAssistance,
    estimatedCashNeeded,
    coverageRate,
    repaymentProfile,
    score,
  };
}

function getProgramRequirements(program: AssistanceProgram) {
  const requirementsByProgram: Record<string, string[]> = {
    none: ["No program eligibility requirements; plan to bring your own down payment and closing funds."],
    "chfa-firststep-plus": ["First-time buyer required.", "Minimum 620 credit score.", "$1,000 minimum borrower contribution; gifts may be allowed.", "Must pair with an eligible CHFA first mortgage."],
    "chfa-smartstep-plus": ["Minimum 620 credit score.", "$1,000 minimum borrower contribution; gifts may be allowed.", "$174,440 statewide income limit.", "Must pair with an eligible CHFA first mortgage."],
    "chfa-firstgeneration": ["First-time buyer required.", "At least one borrower must meet first-generation eligibility.", "Minimum 620 credit score.", "$1,000 minimum borrower contribution."],
    "chfa-homeaccess": ["Borrower has a permanent disability or is custodial parent/guardian of a child with a disability.", "Minimum 620 credit score.", "$500 minimum borrower contribution.", "Must pair with an eligible CHFA first mortgage."],
    "chac-immediate": ["First-time buyer required.", "Own funds required for minimum contribution.", "About 110% AMI income limit.", "Must work with a first mortgage lender that can pair with CHAC."],
    "chac-deferral": ["First-time buyer required.", "80% AMI income limit.", "Own funds required for contribution.", "Homebuyer counseling and reserve requirements apply."],
    "chac-disability": ["First-time buyer required.", "Disability documentation required.", "$750 minimum borrower contribution.", "Gift funds are not allowed for the minimum contribution."],
    "metro-dpa": ["Approved Denver-metro county or service area required.", "Minimum 620 credit score.", "$216,000 income limit.", "Must use an approved MetroDPA lender."],
    "aurora-prop-123": ["Home must be in the City of Aurora.", "Income limit around 120% AMI.", "Silent second is repayable on sale, refinance, or payoff.", "Not limited to first-time buyers."],
    "pikes-peak-dpa": ["Purchase must be in El Paso County.", "Minimum 640 credit score.", "Forgiveness schedule applies: 50% over first 5 years, remaining at 30 years.", "Not limited to first-time buyers."],
    "boulder-county-bcdpap": ["First-time buyer required.", "Boulder County purchase outside City of Boulder.", "80% AMI income limit.", "Own funds, coaching, and CHFA education required."],
    "boulder-h2o": ["First-time buyer required.", "City of Boulder purchase.", "Income up to 120% AMI.", "One household member must work 30+ hours per week."],
    "boulder-middle-income": ["First-time buyer required.", "City of Boulder purchase.", "Income up to about 150% AMI.", "Deed restriction, waitlist, and limited availability may apply."],
    "boulder-solution-grant": ["Must buy a select permanently affordable or Thistle CLT home in Boulder city limits.", "Need-based grant; funds are limited.", "Property restrictions apply."],
    "colorado-roots": ["First-time buyer required.", "Selected Colorado community required.", "120% AMI income limit.", "Minimum contribution is greater of $1,000 or 1% of purchase price."],
    "broomfield-chac": ["City of Broomfield purchase.", "First-time buyer required.", "80% AMI income limit.", "Own funds required; first-generation buyers prioritized."],
    "dearfield-fund": ["Black first-time buyer self-identification eligibility.", "Six-county Denver metro service area.", "140% AMI income limit.", "Shared-appreciation repayment applies."],
    "eagle-eclf-shared": ["Eagle County primary residence required.", "Maximum eligible purchase price is $850,000.", "Shared appreciation is due at repayment."],
    "eagle-eclf-amortized": ["Eagle County purchase required.", "FHA first mortgage only.", "Borrower must contribute at least 50% of the assistance amount.", "Monthly payments apply on the amortized second."],
    "eagle-ecdoh": ["Eagle County purchase required.", "80% AMI income limit.", "Pre-application meeting required.", "30-year term at 2.5% simple interest; possible 60-month deferment."],
    "eagle-ranch-erhc": ["Eagle Ranch subdivision purchase required.", "Deferred or equity-share terms require program confirmation.", "Narrow geography and program-specific availability apply."],
    "chfa-sectioneight-plus": ["Section 8 homeownership voucher required.", "First-time buyer required unless a veteran exception applies.", "$500/$750 borrower contribution depending on program path.", "620 or program minimum credit score."],
    "good-neighbor-next-door": ["Must be an eligible law enforcement officer, teacher, firefighter, or EMT.", "Must buy an eligible HUD home in a revitalization area.", "HUD occupancy and resale rules apply."],
    "colorado-hfa1-plus": ["$174,440 statewide income limit.", "$1,000 borrower contribution.", "Must pair with an eligible CHFA first mortgage.", "Not limited to first-time buyers."],
    "chenoa-fund-fha": ["FHA loan required.", "Minimum 600 credit score.", "$0 minimum borrower contribution.", "Repayable or forgivable second-mortgage terms vary."],
    "chfa-vlip": ["Freddie Mac conventional loan required.", "Very-low-income eligibility required.", "620 or Freddie Mac minimum credit score.", "$1,000 borrower contribution."],
    "douglas-dchp": ["Douglas County buyer required.", "First-time buyer required.", "80% AMI income limit.", "1% minimum contribution; resident/worker preference may apply."],
    "noco-equity-share": ["Larimer or Weld County purchase required.", "Borrower cannot own other property.", "120% AMI income limit.", "5% own-funds contribution required."],
    "estes-valley": ["Park R3 School District workforce connection required.", "First-time buyer required.", "81% to 150% AMI income range.", "$3,000 own-funds contribution required."],
    "greeley-ghope": ["Must be employee of a participating Greeley-based employer.", "Home must be in eligible Greeley program boundaries.", "Single-family homes only.", "No income limit and not first-time-only."],
    "summit-srlf": ["Summit County workforce connection required.", "Minimum 620 credit score.", "50% to 160% AMI income range.", "2% own-funds contribution required."],
    "eagle-ehop": ["Eligible Eagle County Government employee required.", "No FHA financing.", "Shared appreciation may apply after 24 months.", "No income limit."],
    "yampa-valley": ["Routt County workforce/local work requirement.", "150% AMI income limit.", "Minimum contribution is greater of $1,000 or 1% of purchase price.", "Not limited to first-time buyers."],
  };

  return requirementsByProgram[program.id] ?? [program.description];
}

function programMatchesEligibility(program: AssistanceProgram, eligibility: EligibilityAnswers) {
  const requirements = getProgramRequirements(program).join(" ").toLowerCase();

  if (eligibility.firstTimeBuyer === "no" && requirements.includes("first-time buyer required")) return false;
  if (eligibility.firstGenerationBuyer === "no" && requirements.includes("first-generation")) return false;
  if (eligibility.disabilityEligible === "no" && (requirements.includes("disability") || requirements.includes("disabled"))) return false;
  if (eligibility.veteranEligible === "no" && requirements.includes("veteran")) return false;
  if (eligibility.localRequirement === "no" && (requirements.includes("workforce") || requirements.includes("local") || requirements.includes("employee") || requirements.includes("service area") || requirements.includes("city of") || requirements.includes("county purchase") || requirements.includes("county buyer"))) return false;

  return true;
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

function calculateScore(answers: Answers, answeredKeys: QuestionKey[], modeledLocationPreference?: string | null) {
  const selectedLocations = normalizeLocations(answers.location);
  const modeledLocation = modeledLocationPreference && selectedLocations.includes(modeledLocationPreference) ? modeledLocationPreference : getCheapestLocation(answers.location);
  const locationMultiplier = getLocationMultiplier(modeledLocation);
  const housingEstimate = estimateHousingForBedrooms(answers.bedrooms, modeledLocation);
  const estimatedSquareFeet = housingEstimate.estimatedSquareFeet;
  const estimatedPrice = housingEstimate.estimatedPrice;
  const annualHousingCost = estimatedPrice * 0.081;
  const income = Number(answers.income) || 0;
  const householdSize = Math.max(1, Math.min(8, Math.round(answers.householdSize || 1)));
  const housingRatio = annualHousingCost / Math.max(income, 1);
  const householdSizeAdjustment = Math.max(0, householdSize - 2) * 0.015;
  const affordabilityRatio = housingRatio + householdSizeAdjustment;
  const incomeScore = Math.max(0, Math.min(100, 100 - (affordabilityRatio - 0.23) * 230));
  const locationScore = Math.max(0, Math.min(100, 112 - locationMultiplier * 40));
  const bedroomScore = Math.max(0, Math.min(100, 106 - answers.bedrooms * 9));
  const creditScore = Math.max(0, Math.min(100, (answers.creditScore - 560) / 2.9));
  const assistanceProgram = getAssistanceProgram(answers.assistanceProgram);
  const targetDownPayment = estimatedPrice * 0.035;
  const assistanceAmount = Math.min(targetDownPayment, estimateAssistanceAmount(assistanceProgram, estimatedPrice));
  const assistanceScore = Math.max(0, Math.min(100, 48 + (assistanceAmount / Math.max(targetDownPayment, 1)) * 42));
  const selectedAffordableProgramId = answers.affordablePrograms[0];
  const selectedAffordablePrograms = selectedAffordableProgramId ? affordableHomeownershipPrograms.filter((program) => program.id === selectedAffordableProgramId) : [];
  const buyingStrategyBoost = Math.min(28, selectedAffordablePrograms.reduce((sum, program) => sum + program.scoreImpact, 0));

  const weights: Record<QuestionKey, number> = {
    location: 0.2,
    income: 0.37,
    householdSize: 0,
    bedrooms: 0.18,
    creditScore: 0.17,
    assistanceProgram: 0.08,
    affordablePrograms: 0,
  };

  const partialScores: Record<QuestionKey, number> = {
    location: locationScore,
    income: incomeScore,
    householdSize: 50,
    bedrooms: bedroomScore,
    creditScore,
    assistanceProgram: assistanceScore,
    affordablePrograms: 50,
  };

  const activeWeight = answeredKeys.reduce((sum, key) => sum + weights[key], 0);
  const weightedScore = answeredKeys.reduce((sum, key) => sum + partialScores[key] * weights[key], 0) / Math.max(activeWeight, 1);
  const score = Math.round(Math.max(0, Math.min(100, (weightedScore || 50) + buyingStrategyBoost)));
  const recommendation = score >= 58 ? "Leaning buy" : score <= 42 ? "Leaning rent" : "Too close to call";

  return {
    score,
    recommendation,
    modeledLocation,
    estimatedPrice,
    estimatedSquareFeet,
    monthlyPayment: housingEstimate.monthlyMortgage,
    monthlyRent: housingEstimate.monthlyRent,
    housingRatio,
    affordabilityRatio,
    householdSizeAdjustment,
    targetDownPayment,
    assistanceAmount,
    cashNeededAfterAssistance: Math.max(0, targetDownPayment - assistanceAmount),
    selectedAffordablePrograms,
    buyingStrategyBoost,
    partialScores,
  };
}

function explainImpact(question: Question, answers: Answers, result: ReturnType<typeof calculateScore>) {
  if (question.key === "location") {
    const selectedLocations = normalizeLocations(answers.location);
    const modeledLocation = result.modeledLocation;
    const multiplier = getLocationMultiplier(modeledLocation);
    const locationPhrase = selectedLocations.length > 1 ? `${modeledLocation}, the selected estimate location` : modeledLocation || "Colorado";

    return multiplier > 1.25
      ? `${locationPhrase} is modeled as a ${getMarketLabel(multiplier)}, so renting gets stronger unless income can support the higher purchase price.`
      : `${locationPhrase} is modeled as a ${getMarketLabel(multiplier)}, which makes the buying case easier than in the most expensive counties.`;
  }

  if (question.key === "income") {
    const householdPhrase = answers.householdSize > 2 ? ` The ${answers.householdSize}-person household adds everyday cost pressure to the affordability score.` : "";

    if (result.affordabilityRatio > 0.36) return `At this income, the estimated housing cost is high relative to earnings, so renting is safer.${householdPhrase}`;
    if (result.affordabilityRatio < 0.27) return `This income appears to support the estimated payment comfortably, which moves the result toward buying.${householdPhrase}`;
    return `The payment may be manageable, but the budget is not wide enough yet to make buying an obvious choice.${householdPhrase}`;
  }

  if (question.key === "bedrooms") {
    if (answers.bedrooms <= 0) return "An empty lot removes the modeled house size, so this prototype treats the purchase price as much lower than a finished home.";
    return answers.bedrooms > 4
      ? "A higher bedroom count implies a larger home, raising the estimated price and pushing the result toward renting."
      : "This bedroom count keeps the target home more contained, which helps the buying case.";
  }

  if (question.key === "assistanceProgram") {
    const selectedAffordableProgram = result.selectedAffordablePrograms[0];
    if (selectedAffordableProgram) return `${selectedAffordableProgram.name} may reduce the purchase-price hurdle through an affordable ownership model, but inventory, income limits, and resale rules need verification.`;

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
    const modeledLocation = result.modeledLocation || "Colorado";
    const locationQuery = encodeURIComponent(`${modeledLocation} homes for sale and rent`);

    return [
      {
        title: `${modeledLocation} market check`,
        description: `Compare recent sale prices and rents in ${modeledLocation} before deciding whether this modeled ${getMarketLabel(getLocationMultiplier(modeledLocation))} matches your search area.`,
        url: `https://www.zillow.com/homes/${locationQuery}_rb/`,
      },
      {
        title: "Local housing programs",
        description: "Look for county or city first-time buyer assistance, down-payment grants, and income-restricted ownership options.",
        url: "https://www.hud.gov/states/colorado/homeownership/buyingprgms",
      },
    ];
  }

  if (question.key === "income") {
    return [
      {
        title: "Payment-to-income target",
        description: `This prototype estimates housing costs at ${Math.round(result.housingRatio * 100)}% of income, then scores affordability at ${Math.round(result.affordabilityRatio * 100)}% after household size; many buyers use 28% - 36% as a planning range.`,
        url: "https://www.consumerfinance.gov/owning-a-home/prepare/mortgage-affordability/",
      },
      {
        title: "Budget cushion",
        description: "Set aside room for utilities, maintenance, HOA dues, insurance changes, and emergency savings before stretching for a payment.",
        url: "https://www.consumerfinance.gov/owning-a-home/prepare/check-your-spending/",
      },
    ];
  }

  if (question.key === "bedrooms") {
    return [
      {
        title: "Rent vs. mortgage by size",
        description: `For this selection, estimated rent is ${answers.bedrooms === 0 ? "not applicable" : formatCurrency(result.monthlyRent)} and estimated mortgage cost is ${formatCurrency(result.monthlyPayment)}.`,
        url: "https://www.nerdwallet.com/mortgages/rent-vs-buy-calculator",
      },
      {
        title: "Right-size your search",
        description: "Try one bedroom fewer or a flexible office/guest room setup to see how much the target home size changes affordability.",
        url: "https://www.consumerfinance.gov/owning-a-home/prepare/decide-how-much-to-spend/",
      },
    ];
  }

  if (question.key === "assistanceProgram") {
    const program = getAssistanceProgram(answers.assistanceProgram);

    return [
      {
        title: `${program.title} fit check`,
        description: `This selection estimates ${formatCurrency(result.assistanceAmount)} in help toward a ${formatCurrency(result.targetDownPayment)} down payment for the modeled home size.`,
        url: assistanceProgramLinks[program.id] ?? "https://www.hud.gov/states/colorado/homeownership/buyingprgms",
      },
      {
        title: "Verify eligibility",
        description: "Confirm service area, income limits, first-time buyer rules, credit score requirements, and whether the program can stack with your mortgage before relying on it.",
        url: assistanceProgramLinks[program.id] ?? "https://www.chfainfo.com/homeownership/down-payment-assistance",
      },
    ];
  }

  return [
    {
      title: "Credit score next steps",
      description: "Review credit reports for errors, reduce revolving balances, and avoid opening new debt before applying for a mortgage.",
      url: "https://www.annualcreditreport.com/",
    },
    {
      title: "Rate shopping",
      description: "Compare pre-approval estimates from multiple lenders because even a small rate difference can change the buy-vs-rent result.",
      url: "https://www.consumerfinance.gov/owning-a-home/explore-rates/",
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

function WhatThisIsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 to-white/85 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Quick planning tool</p>
        <h3 className="mt-2 text-xl font-black tracking-tight">A first-pass rent-vs-buy guide for Colorado homeownership</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This prototype helps you explore whether renting or buying may make more sense based on location, income, home size, credit, and down payment assistance.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
        {[
          { title: "Answer a few prompts", description: "Share rough planning inputs instead of exact financial documents." },
          { title: "Watch the result move", description: "Each answer updates the rent-to-buy indicator and explains why." },
          { title: "Find next steps", description: "Review assistance programs and resources to verify with professionals." },
        ].map((item, index) => (
          <div key={item.title} className="contents">
            <div className="rounded-3xl border bg-white/75 p-4">
              <p className="font-black tracking-tight">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
            {index < 2 ? (
              <div className="flex justify-center text-primary" aria-hidden="true">
                <ArrowRight className="h-6 w-6 rotate-90 sm:rotate-0" />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <p className="rounded-3xl bg-muted/70 p-4 text-sm leading-6 text-muted-foreground">
        Treat the numbers as educational estimates, not loan approval, legal advice, or a replacement for a lender, realtor, housing counselor, or tax professional.
      </p>
    </div>
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
    <div className="space-y-4 rounded-3xl bg-gradient-to-br from-primary/10 to-white/85 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Filter programs</p>
        <h3 className="mt-1 text-xl font-black tracking-tight">Only show programs that fit your answers</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Answer “no” to hide programs with that requirement. Leave “unsure” selected when you want to keep those programs visible until you can verify the rule.
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

function AssistancePathChoice({
  selectedPath,
  onChoosePath,
  onChooseNone,
}: {
  selectedPath: "dpa" | "affordable" | "none" | null;
  onChoosePath: (path: Extract<AssistanceSelectionMode, "dpa" | "affordable">) => void;
  onChooseNone: () => void;
}) {
  const paths = [
    {
      id: "dpa" as const,
      eyebrow: "Down payment assistance",
      title: "Help with the cash you need to close",
      description: "Grants, forgivable loans, or second mortgages can cover part of your down payment and sometimes closing costs while you buy a regular market-rate home.",
      visualSteps: ["Pick a regular home", "Program adds cash", "Bring less upfront"],
      visualLeft: "Down payment",
      visualRight: "Your cash",
      pros: ["Can lower upfront cash needed", "Often works with many homes and lenders", "Some options do not need to be repaid"],
      cons: ["May add a second loan or repayment rules", "Eligibility and lender requirements vary", "Usually does not lower the home price itself"],
      bestWhen: "you are close on monthly payment but need help covering the upfront down payment or closing cash.",
      action: "Choose down payment help",
    },
    {
      id: "affordable" as const,
      eyebrow: "Affordable ownership",
      title: "A lower-priced home with program rules",
      description: "Community land trusts, deed-restricted homes, and similar programs can reduce the purchase price or monthly cost in exchange for income limits and resale rules.",
      visualSteps: ["Find program inventory", "Buy at a lower price", "Follow resale rules"],
      visualLeft: "Market price",
      visualRight: "Program price",
      pros: ["Can make the purchase price meaningfully lower", "May reduce the monthly payment hurdle", "Often designed for long-term community affordability"],
      cons: ["Inventory can be limited", "Income, location, or household rules may apply", "Resale price and equity growth may be restricted"],
      bestWhen: "the market-rate price is the biggest barrier and you are comfortable with program inventory and resale rules.",
      action: "Choose affordable ownership",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {paths.map((path) => {
          const isSelected = selectedPath === path.id;

          return (
            <div
              key={path.id}
              role="button"
              tabIndex={0}
              onClick={() => onChoosePath(path.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onChoosePath(path.id);
                }
              }}
              className={`flex cursor-pointer flex-col rounded-3xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? "border-primary bg-primary/10 shadow-glow" : "bg-white/75"}`}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{path.eyebrow}</p>
                  <h3 className="mt-1 text-lg font-black tracking-tight">{path.title}</h3>
                </div>
                <span className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
              </div>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">{path.description}</p>
              <div className="mt-3 grid gap-1">
                {path.visualSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[0.65rem] font-black text-secondary-foreground">{index + 1}</span>
                    {step}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-3xl bg-white/80 p-3">
                {path.id === "dpa" ? (
                  <div className="rounded-2xl bg-white/75 p-3">
                    <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
                      <span>Total down payment</span>
                      <span>100%</span>
                    </div>
                    <div className="mt-3 overflow-hidden rounded-2xl border bg-muted shadow-inner">
                      <div className="flex h-16 text-center text-xs font-black leading-none">
                        <div className="flex w-[70%] flex-col items-center justify-center bg-primary px-2 text-primary-foreground">
                          <span>DPA part</span>
                          <span className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] opacity-85">program help</span>
                        </div>
                        <div className="flex w-[30%] flex-col items-center justify-center bg-secondary px-2 text-secondary-foreground">
                          <span>You part</span>
                          <span className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] opacity-85">your cash</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs font-semibold text-muted-foreground sm:grid-cols-2">
                      <div className="rounded-xl bg-primary/10 p-2">
                        <span className="font-black text-primary">DPA part:</span> grant or second loan covers some of the down payment.
                      </div>
                      <div className="rounded-xl bg-secondary/70 p-2 text-secondary-foreground">
                        <span className="font-black">You part:</span> the remaining cash you bring to closing.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/75 p-3">
                    <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
                      <span>Market home price</span>
                      <span>100%</span>
                    </div>
                    <div className="mt-3 overflow-hidden rounded-2xl border bg-muted shadow-inner">
                      <div className="flex h-16 text-center text-xs font-black leading-none">
                        <div className="flex w-[35%] flex-col items-center justify-center bg-primary px-2 text-primary-foreground">
                          <span>Program part</span>
                          <span className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] opacity-85">price reduction</span>
                        </div>
                        <div className="flex w-[65%] flex-col items-center justify-center bg-secondary px-2 text-secondary-foreground">
                          <span>You part</span>
                          <span className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] opacity-85">program price</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs font-semibold text-muted-foreground sm:grid-cols-2">
                      <div className="rounded-xl bg-primary/10 p-2">
                        <span className="font-black text-primary">Program part:</span> the discount, land trust, or restriction that lowers the price.
                      </div>
                      <div className="rounded-xl bg-secondary/70 p-2 text-secondary-foreground">
                        <span className="font-black">You part:</span> the lower program price you qualify to buy.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 grid gap-3">
                <div className="rounded-2xl bg-primary/10 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Pros</p>
                  <ul className="mt-2 space-y-1 text-sm leading-5 text-muted-foreground">
                    {path.pros.map((pro) => <li key={pro}>• {pro}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl bg-muted/70 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Cons</p>
                  <ul className="mt-2 space-y-1 text-sm leading-5 text-muted-foreground">
                    {path.cons.map((con) => <li key={con}>• {con}</li>)}
                  </ul>
                </div>
              </div>
              <div className="mt-3 rounded-2xl bg-primary/10 p-3 text-sm leading-5 text-muted-foreground">
                <span className="font-bold text-primary">Best when:</span> {path.bestWhen}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onChooseNone}
          className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedPath === "none" ? "border-primary bg-primary/10 shadow-glow" : "bg-white/75"}`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">No assistance</p>
                <h3 className="mt-1 text-lg font-black tracking-tight">Keep the plan simple</h3>
              </div>
              <span className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${selectedPath === "none" ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Use your own savings and skip eligibility paperwork, income limits, resale limits, or second-loan terms.</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[0.65rem] font-black text-secondary-foreground">1</span>
              Bring your own funds and avoid program rules.
            </div>
            <div className="mt-4 rounded-3xl bg-white/80 p-3">
              <div className="rounded-2xl bg-white/75 p-3">
                <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
                  <span>Total cash to close</span>
                  <span>100%</span>
                </div>
                <div className="mt-3 overflow-hidden rounded-2xl border bg-muted shadow-inner">
                  <div className="flex h-16 text-center text-xs font-black leading-none">
                    <div className="flex w-full flex-col items-center justify-center bg-secondary px-2 text-secondary-foreground">
                      <span>You part</span>
                      <span className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] opacity-85">your savings</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-secondary/70 p-2 text-xs font-semibold text-secondary-foreground">
                  <span className="font-black">You part:</span> your savings cover the down payment and closing costs without program help.
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-primary/10 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Pros</p>
                <ul className="mt-2 space-y-1 text-sm leading-5 text-muted-foreground">
                  <li>• No program application or waiting list</li>
                  <li>• No resale restrictions or extra program rules</li>
                  <li>• Simpler lender and offer process</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-muted/70 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Cons</p>
                <ul className="mt-2 space-y-1 text-sm leading-5 text-muted-foreground">
                  <li>• Requires more cash upfront</li>
                  <li>• May take longer to save enough</li>
                  <li>• Does not reduce the purchase price</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-primary/10 p-3 text-sm leading-5 text-muted-foreground">
              <span className="font-bold text-primary">Best when:</span> you have enough cash saved or want to compare the home without assistance first.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function DownPaymentAssistanceList({
  result,
  locations,
  selectedProgramId,
  selectedAffordableProgramIds,
  eligibility,
  mode,
  onEligibilityChange,
  onSelect,
  onAffordableProgramToggle,
  onChangePath,
}: {
  result: ReturnType<typeof calculateScore>;
  locations: string[];
  selectedProgramId: string;
  selectedAffordableProgramIds: string[];
  eligibility: EligibilityAnswers;
  mode: Extract<AssistanceSelectionMode, "dpa" | "affordable">;
  onEligibilityChange: (key: keyof EligibilityAnswers, value: EligibilityValue) => void;
  onSelect: (programId: string) => void;
  onAffordableProgramToggle: (programId: string) => void;
  onChangePath: () => void;
}) {
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const targetDownPayment = result.estimatedPrice * 0.035;
  const countyNames = getCountyNames(locations);
  const selectableAssistancePrograms = downPaymentAssistancePrograms.filter((program) => program.id !== "none");
  const locationFilteredPrograms = selectableAssistancePrograms.filter((program) => programMatchesAnyCounty(program, countyNames));
  const filteredPrograms = locationFilteredPrograms
    .filter((program) => programMatchesEligibility(program, eligibility))
    .sort((first, second) => getAssistanceFit(second, result.estimatedPrice, targetDownPayment).score - getAssistanceFit(first, result.estimatedPrice, targetDownPayment).score);
  const topPrograms = filteredPrograms.slice(0, 3);
  const remainingPrograms = filteredPrograms.slice(3);
  const displayedPrograms = [
    ...topPrograms,
    ...(showAllPrograms ? remainingPrograms : []),
  ];
  const bestProgramId = filteredPrograms[0]?.id;
  const countyLabel = countyNames.length ? countyNames.join(", ") : "";
  const hiddenProgramCount = remainingPrograms.length;

  return (
    <div className="space-y-4">
      {mode === "affordable" ? (
        <AffordableHomeownershipProgramList locations={locations} selectedProgramIds={selectedAffordableProgramIds} onToggleProgram={onAffordableProgramToggle} />
      ) : (
      <>
      <EligibilityQuestionnaire eligibility={eligibility} onChange={onEligibilityChange} />
      <div className="space-y-4 rounded-3xl bg-gradient-to-br from-white/85 to-primary/10 p-4">
        <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Down payment help</p>
        <h3 className="mt-1 text-xl font-black tracking-tight">Choose an assistance option</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {countyLabel ? `Showing ${filteredPrograms.length} of ${locationFilteredPrograms.length} statewide or local programs for ${countyLabel} ${countyNames.length === 1 ? "County" : "Counties"} after your filters.` : `Showing ${filteredPrograms.length} of ${locationFilteredPrograms.length} programs after your filters; choose one or more locations to narrow local programs by county.`} Verify final eligibility with the program or lender.
        </p>
      </div>

      <div className="grid gap-3">
        {displayedPrograms.length ? displayedPrograms.map((program) => {
          const isSelected = selectedProgramId === program.id;
          const isBestProgram = bestProgramId === program.id;
          const { estimatedAssistance, estimatedCashNeeded, coverageRate, repaymentProfile } = getAssistanceFit(program, result.estimatedPrice, targetDownPayment);
          const requirements = getProgramRequirements(program);
          const repaymentClassName = repaymentProfile.tone === "best"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground";

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
              {requirements.length ? (
                <div className="mt-3 rounded-2xl bg-secondary/60 p-3 text-xs leading-5 text-secondary-foreground">
                  <p className="font-black uppercase tracking-[0.16em]">Requirements to verify</p>
                  <ul className="mt-1 space-y-1">
                    {requirements.map((requirement) => (
                      <li key={requirement}>• {requirement}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-2xl bg-white/80 p-2.5">
                  <p className="text-muted-foreground">3.5% down</p>
                  <p className="mt-1 font-bold">{formatCurrency(targetDownPayment)}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-2.5">
                  <p className="text-muted-foreground">Assistance</p>
                  <p className="mt-1 font-bold">{formatCurrency(estimatedAssistance)}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-2.5">
                  <p className="text-muted-foreground">Covers</p>
                  <p className="mt-1 font-bold">{formatPercent(coverageRate)}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-2.5">
                  <p className="text-muted-foreground">Cash needed</p>
                  <p className="mt-1 font-bold">{formatCurrency(estimatedCashNeeded)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {isBestProgram ? <span className="rounded-full bg-primary px-3 py-1 font-black uppercase tracking-[0.14em] text-primary-foreground">Best option</span> : null}
                <span className={`rounded-full px-3 py-1 font-black ${repaymentClassName}`}>{repaymentProfile.label}</span>
                {isBestProgram ? <span className="font-semibold text-primary">Best fit favors non-repayable help before the largest dollar amount.</span> : null}
              </div>
            </button>
          );
        }) : (
          <div className="rounded-3xl border bg-white/75 p-4 text-sm leading-6 text-muted-foreground">
            No programs match those filters. Change a “no” answer to “unsure” if you want to keep programs visible while you verify a requirement.
          </div>
        )}
      </div>
      {hiddenProgramCount ? (
        <button
          type="button"
          onClick={() => setShowAllPrograms((current) => !current)}
          className="w-full rounded-full border bg-white/75 px-4 py-3 text-sm font-black text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showAllPrograms ? "Show fewer options" : `Show ${hiddenProgramCount} more option${hiddenProgramCount === 1 ? "" : "s"}`}
        </button>
      ) : null}
      </div>
      </>
      )}
      <div className="pt-2 text-center">
        <p className="text-sm font-semibold text-muted-foreground">Don&apos;t like any of these options?</p>
        <button
          type="button"
          onClick={onChangePath}
          className="mt-3 rounded-full border bg-white/75 px-4 py-2 text-xs font-black text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Change assistance path
        </button>
      </div>
    </div>
  );
}

function AffordableHomeownershipProgramList({ locations, selectedProgramIds, onToggleProgram }: { locations: string[]; selectedProgramIds: string[]; onToggleProgram: (programId: string) => void }) {
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const countyNames = getCountyNames(locations);
  const locationFilteredPrograms = affordableHomeownershipPrograms.filter((program) => homeownershipProgramMatchesAnyCounty(program, countyNames));
  const filteredPrograms = locationFilteredPrograms;
  const topPrograms = filteredPrograms.slice(0, 3);
  const remainingPrograms = filteredPrograms.slice(3);
  const displayedPrograms = [
    ...topPrograms,
    ...(showAllPrograms ? remainingPrograms : []),
  ];
  const countyLabel = countyNames.length ? countyNames.join(", ") : "";
  const hiddenProgramCount = remainingPrograms.length;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-white/85 to-primary/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Affordable ownership programs</p>
        <h3 className="mt-1 text-xl font-black tracking-tight">Choose an affordable housing option</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {countyLabel ? `Showing ${filteredPrograms.length} of ${affordableHomeownershipPrograms.length} programs for ${countyLabel} ${countyNames.length === 1 ? "County" : "Counties"}.` : `Showing all ${filteredPrograms.length} programs; choose one or more locations to narrow programs by county.`} The top 3 options are shown first. Select one program to investigate instead of a traditional down payment assistance path. Choosing one clears any down payment assistance choice.
        </p>
      </div>

      <div className="space-y-3">
        {displayedPrograms.length ? displayedPrograms.map((program) => {
          const isSelected = selectedProgramIds[0] === program.id;

          return (
            <div
              key={program.id}
              role="button"
              tabIndex={0}
              onClick={() => onToggleProgram(program.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onToggleProgram(program.id);
                }
              }}
              className={`rounded-3xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? "border-primary bg-primary/10 shadow-glow" : "bg-white/75"}`}
              aria-pressed={isSelected}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black tracking-tight">{program.name}</p>
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{program.organization} • {program.modelType}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`h-4 w-4 rounded-full border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-white/80 p-3 text-sm leading-6 text-muted-foreground">
                <p><span className="font-bold text-foreground">Key requirements: </span>{program.requirements}</p>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-primary/10 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Benefits</p>
                  <ul className="mt-2 space-y-1 text-sm leading-5 text-muted-foreground">
                    {program.benefits.map((benefit) => <li key={benefit}>• {benefit}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl bg-muted/70 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Tradeoffs</p>
                  <ul className="mt-2 space-y-1 text-sm leading-5 text-muted-foreground">
                    {program.drawbacks.map((drawback) => <li key={drawback}>• {drawback}</li>)}
                  </ul>
                </div>
              </div>
              <a href={program.website} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()} className="mt-3 inline-flex items-center text-sm font-bold text-primary underline-offset-4 hover:underline">
                Website
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </div>
          );
        }) : (
          <div className="rounded-3xl border bg-white/75 p-4 text-sm leading-6 text-muted-foreground">
            No affordable ownership programs match that location. Choose a different location to see more options.
          </div>
        )}
      </div>
      {hiddenProgramCount ? (
        <button
          type="button"
          onClick={() => setShowAllPrograms((current) => !current)}
          className="w-full rounded-full border bg-white/75 px-4 py-3 text-sm font-black text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showAllPrograms ? "Show fewer options" : `Show ${hiddenProgramCount} more option${hiddenProgramCount === 1 ? "" : "s"}`}
        </button>
      ) : null}
    </div>
  );
}

function CreditScoreExplanation({ answers }: { answers: Answers; result: ReturnType<typeof calculateScore> }) {
  const currentBand = getCreditScoreOption(answers.creditScore);
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

      <div className="rounded-3xl bg-white/75 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Next useful milestone</p>
        <p className="mt-2 text-sm font-semibold leading-6">{milestone}</p>
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

function ContactCard({ contact, selected, compact = false, onSelect }: { contact: Contact; selected?: boolean; compact?: boolean; onSelect?: (contactId: string) => void }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black tracking-tight">{contact.name}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{contact.company}</p>
        </div>
        {selected !== undefined ? <span className={`h-4 w-4 rounded-full border-2 ${selected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} /> : null}
      </div>

      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        {contact.phone ? <p className="rounded-2xl bg-white/80 p-2.5"><span className="text-muted-foreground">Phone </span><span className="font-bold">{contact.phone}</span></p> : null}
        {contact.email ? <p className="rounded-2xl bg-white/80 p-2.5 break-words"><span className="text-muted-foreground">Email </span><span className="font-bold">{contact.email}</span></p> : null}
        {contact.nmls ? <p className="rounded-2xl bg-white/80 p-2.5"><span className="text-muted-foreground">NMLS </span><span className="font-bold">{contact.nmls}</span></p> : null}
        {contact.award ? <p className="rounded-2xl bg-white/80 p-2.5"><span className="text-muted-foreground">Award </span><span className="font-bold">{contact.award}</span></p> : null}
      </div>

      {!compact ? (
        <>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Serves: {contact.countiesServed.includes("all") ? "All listed Colorado counties" : contact.countiesServed.join(", ")}</p>
          {contact.languages ? <p className="mt-1 text-sm leading-6 text-muted-foreground">Languages: {contact.languages}</p> : null}
          {contact.specialties?.length ? <p className="mt-1 text-sm leading-6 text-muted-foreground">Specialties: {contact.specialties.join(", ")}</p> : null}
          {contact.notes ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{contact.notes}</p> : null}
          {contact.website ? (
            <a href={contact.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center text-sm font-bold text-primary underline-offset-4 hover:underline">
              Website
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          ) : null}
        </>
      ) : null}
    </>
  );

  if (!onSelect) {
    return <div className="rounded-3xl border bg-white/75 p-4">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(contact.id)}
      className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-primary bg-primary/10 shadow-glow" : "bg-white/75"}`}
    >
      {content}
    </button>
  );
}

function ContactPickerPage({ type, contacts, selectedContactId, locations, onSelect }: { type: "lender" | "realtor"; contacts: Contact[]; selectedContactId: string | null; locations: string[]; onSelect: (contactId: string) => void }) {
  const sortedContacts = sortContactsForLocations(contacts, locations);
  const countyNames = getCountyNames(locations);
  const matchingCount = sortedContacts.filter((contact) => contactMatchesCounty(contact, countyNames)).length;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-primary/15 bg-primary/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Select a {type}</p>
        <h3 className="mt-1 text-xl font-black tracking-tight">Choose who you want to follow up with</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {countyNames.length ? `Showing ${matchingCount} ${type}s with coverage in ${countyNames.join(", ")} first.` : `Choose a location to prioritize ${type}s by county.`} Selecting one returns you to the summary.
        </p>
      </div>

      <div className="grid gap-3">
        {sortedContacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} selected={selectedContactId === contact.id} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function SummaryNextSteps({ answers, result, selectedLender, selectedRealtor, onFindLender, onFindRealtor }: { answers: Answers; result: ReturnType<typeof calculateScore>; selectedLender: Contact | null; selectedRealtor: Contact | null; onFindLender: () => void; onFindRealtor: () => void }) {
  const program = getAssistanceProgram(answers.assistanceProgram);
  const selectedAffordableProgram = result.selectedAffordablePrograms[0];
  const programUrl = assistanceProgramLinks[program.id];
  const bedroomsLabel = answers.bedrooms === 0 ? "empty lot" : `${answers.bedrooms} bedroom${answers.bedrooms === 1 ? "" : "s"}`;
  const selectedLocations = normalizeLocations(answers.location);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-primary/15 bg-primary/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Your result</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-3xl font-black tracking-tight">{result.recommendation}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Based on your modeled choices, this plan is {result.recommendation.toLowerCase()}.
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-primary">
            {formatCurrency(result.monthlyPayment)} estimated monthly payment
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border bg-white/75 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Location</p>
          <p className="mt-2 font-black tracking-tight">{getLocationsLabel(answers.location)}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {selectedLocations.length > 1 ? `Home cost modeled with the selected estimate location: ${result.modeledLocation}.` : `Modeled as a ${getMarketLabel(getLocationMultiplier(result.modeledLocation))}.`}
          </p>
        </div>
        <div className="rounded-3xl border bg-white/75 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Income</p>
          <p className="mt-2 font-black tracking-tight">{answers.income === "" ? "Not entered" : formatCurrency(answers.income)}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {answers.householdSize} person household; score uses a {Math.round(result.affordabilityRatio * 100)}% household-adjusted affordability ratio.
          </p>
        </div>
        <div className="rounded-3xl border bg-white/75 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Home target</p>
          <p className="mt-2 font-black capitalize tracking-tight">{bedroomsLabel}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Estimated price: {formatCurrency(result.estimatedPrice)}.</p>
        </div>
        <div className="rounded-3xl border bg-white/75 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Credit</p>
          <p className="mt-2 font-black tracking-tight">{getCreditScoreOption(answers.creditScore).range}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{getCreditScoreMilestone(answers.creditScore)}.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-white/85 to-primary/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{selectedAffordableProgram ? "Affordable ownership choice" : "Down payment choice"}</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xl font-black tracking-tight">{selectedAffordableProgram ? selectedAffordableProgram.name : program.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {selectedAffordableProgram ? `${selectedAffordableProgram.modelType} serving ${selectedAffordableProgram.serviceArea}. Verify inventory, income limits, and lender requirements before relying on this path.` : `This estimates ${formatCurrency(result.assistanceAmount)} in assistance, leaving ${formatCurrency(result.cashNeededAfterAssistance)} before closing costs.`}
            </p>
          </div>
          {selectedAffordableProgram || programUrl ? (
            <a href={selectedAffordableProgram?.website ?? programUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/80">
              Program details
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border bg-white/75 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Next steps</p>
        <h3 className="mt-1 text-xl font-black tracking-tight">Find a lender and a realtor</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
          <li>• Talk with a mortgage lender or housing counselor to confirm loan options, rates, cash-to-close, and assistance eligibility.</li>
          <li>• Ask whether the lender is approved for your selected down payment assistance program before relying on the estimate.</li>
          <li>• Find a realtor who knows your target area and can compare homes, HOA costs, inspection needs, and resale tradeoffs.</li>
        </ul>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button type="button" onClick={onFindLender} className="h-auto justify-between rounded-2xl px-4 py-3 text-left">
            <span>{selectedLender ? "Change lender" : "Find a lender"}</span>
            <ArrowRight className="ml-3 h-4 w-4" />
          </Button>
          <Button type="button" onClick={onFindRealtor} className="h-auto justify-between rounded-2xl px-4 py-3 text-left">
            <span>{selectedRealtor ? "Change realtor" : "Find a realtor"}</span>
            <ArrowRight className="ml-3 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-3 rounded-3xl border border-primary/15 bg-gradient-to-br from-white/85 to-primary/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Selected lender</p>
            {selectedLender ? <button type="button" onClick={onFindLender} className="text-xs font-bold text-primary underline-offset-4 hover:underline">Change</button> : null}
          </div>
          {selectedLender ? <ContactCard contact={selectedLender} compact /> : <p className="text-sm leading-6 text-muted-foreground">No lender selected yet.</p>}
        </div>
        <div className="space-y-3 rounded-3xl border border-primary/15 bg-gradient-to-br from-white/85 to-primary/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Selected realtor</p>
            {selectedRealtor ? <button type="button" onClick={onFindRealtor} className="text-xs font-bold text-primary underline-offset-4 hover:underline">Change</button> : null}
          </div>
          {selectedRealtor ? <ContactCard contact={selectedRealtor} compact /> : <p className="text-sm leading-6 text-muted-foreground">No realtor selected yet.</p>}
        </div>
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
    if (parsed.income === 95000) delete parsed.income;
    const location = normalizeLocations(parsed.location);

    return {
      ...initialAnswers,
      ...parsed,
      location,
      householdSize: Math.max(1, Math.min(8, Math.round(parsed.householdSize ?? initialAnswers.householdSize))),
      bedrooms: Math.max(1, parsed.bedrooms ?? parsed.rooms ?? initialAnswers.bedrooms),
      affordablePrograms: Array.isArray(parsed.affordablePrograms) ? parsed.affordablePrograms.slice(0, 1) : [],
    };
  });
  const initialRoute = getRouteFromUrl();
  const [step, setStep] = useState(initialRoute.step);
  const [showIntro, setShowIntro] = useState(initialRoute.showIntro);
  const [showExplanation, setShowExplanation] = useState(initialRoute.showExplanation);
  const [showSummary, setShowSummary] = useState(initialRoute.showSummary);
  const [contactPicker, setContactPicker] = useState<"lender" | "realtor" | null>(initialRoute.contactPicker);
  const [assistanceSelectionMode, setAssistanceSelectionMode] = useState<AssistanceSelectionMode>(() => {
    if (answers.affordablePrograms.length) return "affordable";
    if (answers.assistanceProgram !== "none") return "dpa";
    return "choose";
  });
  const [showAssistanceProgramPicker, setShowAssistanceProgramPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);
  const [eligibility, setEligibility] = useState<EligibilityAnswers>(() => {
    const saved = window.localStorage.getItem(ELIGIBILITY_STORAGE_KEY);
    if (!saved) return initialEligibilityAnswers;

    return { ...initialEligibilityAnswers, ...(JSON.parse(saved) as Partial<EligibilityAnswers>) };
  });
  const [selectedLenderId, setSelectedLenderId] = useState(() => window.localStorage.getItem(SELECTED_LENDER_STORAGE_KEY));
  const [selectedRealtorId, setSelectedRealtorId] = useState(() => window.localStorage.getItem(SELECTED_REALTOR_STORAGE_KEY));
  const [modeledLocationOverride, setModeledLocationOverride] = useState(() => window.localStorage.getItem(MODELED_LOCATION_STORAGE_KEY));

  const answeredKeys = useMemo(() => (showIntro ? [] : questions.slice(0, showSummary ? questions.length : step + 1).map((question) => question.key)), [step, showIntro, showSummary]);
  const currentQuestion = questions[step];
  const result = useMemo(() => calculateScore(answers, answeredKeys, modeledLocationOverride), [answers, answeredKeys, modeledLocationOverride]);
  const answerValue = answers[currentQuestion.key];
  const isLastPage = showSummary;
  const totalPages = questions.length * 2 + 1;
  const pageIndex = showIntro ? 1 : showSummary ? totalPages : step === 0 ? 2 : step * 2 + (showExplanation ? 2 : 1);
  const resources = getQuestionResources(currentQuestion, answers, result);
  const walkingDirection = result.score < 50 ? "rent" : "buy";
  const selectedLender = getContactById(lenders, selectedLenderId);
  const selectedRealtor = getContactById(realtors, selectedRealtorId);
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
  }, [locationSearch]);
  const selectedLocations = normalizeLocations(answers.location);
  const isAssistanceChoicePage = currentQuestion.key === "assistanceProgram" && !showExplanation && !showAssistanceProgramPicker;
  const assistancePathSelected = assistanceSelectionMode !== "choose";
  const nextButtonLabel = showIntro
    ? "Get started"
    : showSummary
      ? "Complete"
      : showExplanation
        ? (step === questions.length - 1 ? "See summary" : "Next question")
        : isAssistanceChoicePage
          ? (assistanceSelectionMode === "none" ? "See impact" : "Choose specific program")
          : currentQuestion.key === "location"
            ? "Next question"
            : "See impact";

  useEffect(() => {
    if (!isLocationOpen || !filteredLocations.length) {
      setActiveLocationIndex(0);
      return;
    }

    setActiveLocationIndex((current) => Math.min(current, filteredLocations.length - 1));
  }, [filteredLocations.length, isLocationOpen]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    window.localStorage.setItem(ELIGIBILITY_STORAGE_KEY, JSON.stringify(eligibility));
  }, [eligibility]);

  useEffect(() => {
    if (modeledLocationOverride && selectedLocations.includes(modeledLocationOverride)) {
      window.localStorage.setItem(MODELED_LOCATION_STORAGE_KEY, modeledLocationOverride);
      return;
    }

    window.localStorage.removeItem(MODELED_LOCATION_STORAGE_KEY);
    if (modeledLocationOverride) setModeledLocationOverride(null);
  }, [modeledLocationOverride, selectedLocations]);

  useEffect(() => {
    if (selectedLenderId) window.localStorage.setItem(SELECTED_LENDER_STORAGE_KEY, selectedLenderId);
    else window.localStorage.removeItem(SELECTED_LENDER_STORAGE_KEY);
  }, [selectedLenderId]);

  useEffect(() => {
    if (selectedRealtorId) window.localStorage.setItem(SELECTED_REALTOR_STORAGE_KEY, selectedRealtorId);
    else window.localStorage.removeItem(SELECTED_REALTOR_STORAGE_KEY);
  }, [selectedRealtorId]);

  useEffect(() => {
    const stepName = getStepName(step, showIntro, showExplanation, showSummary, contactPicker);
    const url = new URL(window.location.href);
    url.searchParams.set("step", stepName);

    if (url.href !== window.location.href) {
      window.history.replaceState(null, "", url);
    }
  }, [step, showIntro, showExplanation, showSummary, contactPicker]);

  useEffect(() => {
    function handlePopState() {
      const route = getRouteFromUrl();
      setStep(route.step);
      setShowIntro(route.showIntro);
      setShowExplanation(route.showExplanation);
      setShowSummary(route.showSummary);
      setContactPicker(route.contactPicker);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function updateAnswer(value: string | number | string[]) {
    setAnswers((current) => ({ ...current, [currentQuestion.key]: value }));
  }

  function updateHouseholdSize(value: number) {
    setAnswers((current) => ({ ...current, householdSize: Math.max(1, Math.min(8, Math.round(value))) }));
  }

  function toggleAffordableProgram(programId: string) {
    setAnswers((current) => {
      const selectedPrograms = Array.isArray(current.affordablePrograms) ? current.affordablePrograms : [];
      const isSelected = selectedPrograms[0] === programId;

      return {
        ...current,
        assistanceProgram: "none",
        affordablePrograms: isSelected ? [] : [programId],
      };
    });
  }

  function updateEligibility(key: keyof EligibilityAnswers, value: EligibilityValue) {
    setEligibility((current) => ({ ...current, [key]: value }));
  }

  function selectLocation(location: string) {
    setAnswers((current) => {
      const selectedLocations = normalizeLocations(current.location);
      const locationAlreadySelected = selectedLocations.includes(location);

      return {
        ...current,
        location: locationAlreadySelected ? selectedLocations.filter((selectedLocation) => selectedLocation !== location) : [...selectedLocations, location],
      };
    });
    if (modeledLocationOverride === location) setModeledLocationOverride(null);
    setLocationSearch("");
    setIsLocationOpen(false);
    setActiveLocationIndex(0);
  }

  function handleLocationKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsLocationOpen(true);
      setActiveLocationIndex((current) => (filteredLocations.length ? (current + 1) % filteredLocations.length : 0));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsLocationOpen(true);
      setActiveLocationIndex((current) => (filteredLocations.length ? (current - 1 + filteredLocations.length) % filteredLocations.length : 0));
    }

    if (event.key === "Enter" && isLocationOpen && filteredLocations[activeLocationIndex]) {
      event.preventDefault();
      selectLocation(filteredLocations[activeLocationIndex].name);
    }

    if (event.key === "Escape") {
      setIsLocationOpen(false);
    }
  }

  function reset() {
    setAnswers(initialAnswers);
    setEligibility(initialEligibilityAnswers);
    setLocationSearch("");
    setIsLocationOpen(false);
    setStep(0);
    setShowIntro(true);
    setShowExplanation(false);
    setShowSummary(false);
    setContactPicker(null);
    setAssistanceSelectionMode("choose");
    setShowAssistanceProgramPicker(false);
    setSelectedLenderId(null);
    setSelectedRealtorId(null);
    setModeledLocationOverride(null);
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(ELIGIBILITY_STORAGE_KEY);
    window.localStorage.removeItem(SELECTED_LENDER_STORAGE_KEY);
    window.localStorage.removeItem(SELECTED_REALTOR_STORAGE_KEY);
    window.localStorage.removeItem(MODELED_LOCATION_STORAGE_KEY);
  }

  function openContactPicker(type: "lender" | "realtor") {
    setShowIntro(false);
    setShowSummary(true);
    setShowExplanation(true);
    setStep(questions.length - 1);
    setContactPicker(type);
  }

  function selectContact(contactId: string) {
    if (contactPicker === "lender") setSelectedLenderId(contactId);
    if (contactPicker === "realtor") setSelectedRealtorId(contactId);
    setContactPicker(null);
    setShowSummary(true);
  }

  function goBack() {
    if (showIntro) return;

    if (contactPicker) {
      setContactPicker(null);
      setShowSummary(true);
      return;
    }

    if (showSummary) {
      setShowSummary(false);
      setStep(questions.length - 1);
      setShowExplanation(true);
      return;
    }

    if (showExplanation) {
      setShowExplanation(false);
      return;
    }

    if (currentQuestion.key === "assistanceProgram" && showAssistanceProgramPicker) {
      setShowAssistanceProgramPicker(false);
      return;
    }

    if (step === 0) {
      setShowIntro(true);
      return;
    }

    setStep((current) => Math.max(0, current - 1));
    setShowExplanation(step > 1);
  }

  function goNext() {
    if (showIntro) {
      setShowIntro(false);
      return;
    }

    if (contactPicker) return;

    if (showSummary) return;

    if (!showExplanation) {
      if (currentQuestion.key === "assistanceProgram") {
        if (!showAssistanceProgramPicker) {
          if (assistanceSelectionMode === "choose") return;
          if (assistanceSelectionMode === "none") {
            setShowExplanation(true);
            return;
          }

          setShowAssistanceProgramPicker(true);
          return;
        }

        setShowExplanation(true);
        return;
      }

      if (currentQuestion.key === "location") {
        setStep((current) => Math.min(questions.length - 1, current + 1));
        setShowExplanation(false);
        return;
      }

      setShowExplanation(true);
      return;
    }

    if (step === questions.length - 1) {
      setShowSummary(true);
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
                {showIntro ? "Welcome" : contactPicker ? `Select ${contactPicker}` : showSummary ? "Summary" : currentQuestion.eyebrow}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                {pageIndex} / {totalPages}
              </span>
            </div>
            {!showIntro ? (
              <>
                <CardTitle className="text-2xl leading-tight sm:text-3xl">
                  {contactPicker ? `Choose a ${contactPicker}` : showSummary ? "Summary and next steps" : showExplanation ? "How that answer changed your result" : showAssistanceProgramPicker ? "Choose a specific program" : currentQuestion.title}
                </CardTitle>
                <CardDescription className="text-sm leading-6">
                  {contactPicker ? "Select one contact to save it to your summary." : showSummary ? "Review your choices, then connect with a lender and realtor to verify the plan." : showExplanation ? "Review the impact of your last answer and a few resources to help you investigate further." : showAssistanceProgramPicker ? "Now pick the program you want to model for this path." : currentQuestion.description}
                </CardDescription>
              </>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-5 p-5 pt-0">
            {showIntro ? (
              <WhatThisIsPage />
            ) : contactPicker ? (
              <ContactPickerPage type={contactPicker} contacts={contactPicker === "lender" ? lenders : realtors} selectedContactId={contactPicker === "lender" ? selectedLenderId : selectedRealtorId} locations={selectedLocations} onSelect={selectContact} />
            ) : showSummary ? (
              <SummaryNextSteps answers={answers} result={result} selectedLender={selectedLender} selectedRealtor={selectedRealtor} onFindLender={() => openContactPicker("lender")} onFindRealtor={() => openContactPicker("realtor")} />
            ) : showExplanation ? (
              <div className="space-y-4">
                <div className="rounded-3xl border border-primary/15 bg-primary/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{currentQuestion.eyebrow}</p>
                  <p className="mt-2 text-lg font-black text-foreground">
                    {currentQuestion.key === "income"
                      ? `${formatCurrency(Number(answerValue))}, ${answers.householdSize} person household`
                      : currentQuestion.key === "bedrooms"
                        ? `${Number(answerValue)} bedroom${Number(answerValue) === 1 ? "" : "s"} in ${result.modeledLocation}`
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
            ) : currentQuestion.type === "location" ? (
              <div className="space-y-3">
                <div
                  className="relative space-y-2"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setIsLocationOpen(false);
                    }
                  }}
                >
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Colorado location</span>
                  <div className="relative">
                    <Input
                      role="combobox"
                      aria-expanded={isLocationOpen}
                      aria-activedescendant={isLocationOpen && filteredLocations[activeLocationIndex] ? `location-option-${activeLocationIndex}` : undefined}
                      value={locationSearch}
                      onChange={(event) => {
                        setLocationSearch(event.target.value);
                        setIsLocationOpen(true);
                        setActiveLocationIndex(0);
                      }}
                      onKeyDown={handleLocationKeyDown}
                      placeholder="Search and add places, e.g. Highland or Boulder"
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
                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-md border bg-white p-1 shadow-xl" role="listbox">
                      {filteredLocations.length ? (
                        filteredLocations.map((locationOption, index) => {
                          const isSelected = selectedLocations.includes(locationOption.name);
                          const isActive = index === activeLocationIndex;

                          return (
                            <button
                              key={locationOption.name}
                              id={`location-option-${index}`}
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              onMouseDown={(event) => event.preventDefault()}
                              onMouseEnter={() => setActiveLocationIndex(index)}
                              onClick={() => selectLocation(locationOption.name)}
                              className={`flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? "bg-muted" : ""}`}
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
                {selectedLocations.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedLocations.map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() => selectLocation(location)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          "bg-white/80 text-muted-foreground"
                        }`}
                      >
                        {location} ×
                      </button>
                    ))}
                  </div>
                ) : null}
                <p className="text-sm leading-6 text-muted-foreground">
                  Choose one or more Colorado neighborhoods, cities, or counties; neighborhood and city options include county names for context.
                </p>
              </div>
            ) : (
                  <div className="space-y-4">
                {currentQuestion.key === "income" ? (
                  <>
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
                        value={answerValue}
                        onChange={(event) => updateAnswer(event.target.value === "" ? "" : Number(event.target.value))}
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
                        {householdSizeOptions.map((size) => {
                          const isSelected = answers.householdSize === size;

                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => updateHouseholdSize(size)}
                              className={`rounded-2xl border px-3 py-2 text-sm font-black transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                isSelected ? "border-primary bg-primary/10 text-primary shadow-glow" : "bg-white/80 text-foreground"
                              }`}
                              aria-pressed={isSelected}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : currentQuestion.key === "bedrooms" ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {bedroomOptions.map((bedrooms) => {
                        const estimate = estimateHousingForBedrooms(bedrooms, result.modeledLocation);
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
                    {selectedLocations.length > 1 ? (
                      <div className="rounded-3xl border border-amber-300/70 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                        <div className="flex gap-3">
                          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                          <div className="space-y-3">
                            <p>
                              For the house-cost estimate, click a place below to model the bedroom cards above with that market: <span className="font-bold">{result.modeledLocation}</span>. Down payment assistance includes programs for any selected county.
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {[...selectedLocations]
                                .sort((first, second) => getLocationMultiplier(first) - getLocationMultiplier(second))
                                .map((location) => {
                                  const estimate = estimateHousingForBedrooms(Number(answerValue), location);
                                  const isModeled = location === result.modeledLocation;

                                  return (
                                    <button
                                      key={location}
                                      type="button"
                                      onClick={() => setModeledLocationOverride(location)}
                                      className={`rounded-2xl border bg-white/80 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isModeled ? "border-amber-400" : "border-amber-200"}`}
                                      aria-label={`Model bedroom costs with ${location}`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="font-black tracking-tight text-foreground">{location}</p>
                                        {isModeled ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.14em] text-amber-700">Modeled</span> : null}
                                      </div>
                                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                        <div>
                                          <p>Estimated price</p>
                                          <p className="mt-1 font-bold text-foreground">{formatCurrency(estimate.estimatedPrice)}</p>
                                        </div>
                                        <div>
                                          <p>Mortgage</p>
                                          <p className="mt-1 font-bold text-foreground">{formatCurrency(estimate.monthlyMortgage)}/mo</p>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : currentQuestion.key === "assistanceProgram" ? (
                  !showAssistanceProgramPicker ? (
                    <AssistancePathChoice
                      selectedPath={assistanceSelectionMode === "choose" ? null : assistanceSelectionMode}
                      onChoosePath={(path) => {
                        setAssistanceSelectionMode(path);
                        if (path === "dpa") setAnswers((current) => ({ ...current, affordablePrograms: [] }));
                        if (path === "affordable") setAnswers((current) => ({ ...current, assistanceProgram: "none" }));
                      }}
                      onChooseNone={() => {
                        setAssistanceSelectionMode("none");
                        setAnswers((current) => ({ ...current, assistanceProgram: "none", affordablePrograms: [] }));
                      }}
                    />
                  ) : (
                    <DownPaymentAssistanceList
                      result={result}
                      locations={answers.location}
                      selectedProgramId={answers.affordablePrograms.length ? "" : String(answerValue)}
                      selectedAffordableProgramIds={answers.affordablePrograms}
                      eligibility={eligibility}
                      mode={assistanceSelectionMode === "affordable" ? "affordable" : "dpa"}
                      onEligibilityChange={updateEligibility}
                      onSelect={(programId) => {
                        updateAnswer(programId);
                        setAnswers((current) => ({ ...current, affordablePrograms: [] }));
                      }}
                      onAffordableProgramToggle={toggleAffordableProgram}
                      onChangePath={() => setShowAssistanceProgramPicker(false)}
                    />
                  )
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
              <Button variant="secondary" disabled={showIntro} onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={isLastPage || (isAssistanceChoicePage && !assistancePathSelected)}>
                {nextButtonLabel}
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
