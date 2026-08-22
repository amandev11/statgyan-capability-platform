import type {
  Competency,
  Course,
  DeptRow,
  LearnerCompetency,
  LearnerProfile,
  OrgMetrics,
  RoleProfile,
} from "./types";

// ---------------------------------------------------------------------------
// Competency framework — India's Official Statistical System
// ---------------------------------------------------------------------------

export const COMPETENCIES: Competency[] = [
  {
    id: "sf-desc",
    name: "Descriptive Statistics",
    domain: "Statistical Foundations",
    description:
      "Summarising and describing data using measures of central tendency, dispersion and distribution shape.",
    importance: 0.8,
    keywords: ["descriptive", "mean", "median", "variance", "distribution", "summary"],
  },
  {
    id: "sf-samp",
    name: "Sampling Theory & Estimation",
    domain: "Statistical Foundations",
    description:
      "Probability sampling theory, estimators, standard errors, design effects and confidence intervals.",
    importance: 0.9,
    keywords: ["sampling", "estimation", "stratified", "cluster", "standard error", "weighting"],
  },
  {
    id: "sf-inf",
    name: "Statistical Inference",
    domain: "Statistical Foundations",
    description:
      "Hypothesis testing, confidence intervals, p-values and drawing valid conclusions from sample data.",
    importance: 0.85,
    keywords: ["inference", "hypothesis", "significance", "p-value", "test"],
  },
  {
    id: "sm-design",
    name: "Survey Design",
    domain: "Survey Methodology",
    description:
      "Designing surveys end-to-end: objectives, target populations, sampling frames and error budgets.",
    importance: 0.9,
    keywords: ["survey design", "questionnaire", "frame", "coverage"],
  },
  {
    id: "sm-nonresp",
    name: "Non-Response Handling",
    domain: "Survey Methodology",
    description:
      "Preventing and adjusting for unit and item non-response, including follow-up protocols and reweighting.",
    importance: 0.85,
    keywords: ["non-response", "nonresponse", "follow-up", "callback", "bias"],
  },
  {
    id: "sm-field",
    name: "Field Operations",
    domain: "Survey Methodology",
    description:
      "Managing enumeration logistics, field staff supervision and CAPI-based data collection.",
    importance: 0.7,
    keywords: ["field", "enumeration", "enumerator", "capi", "supervision"],
  },
  {
    id: "dm-clean",
    name: "Data Cleaning",
    domain: "Data Management",
    description:
      "Systematically identifying and correcting errors, outliers and inconsistencies in raw survey data.",
    importance: 0.8,
    keywords: ["cleaning", "outliers", "consistency", "editing"],
  },
  {
    id: "dm-valid",
    name: "Data Validation",
    domain: "Data Management",
    description:
      "Building validation rules, range/consistency checks and automated quality gates before analysis.",
    importance: 0.9,
    keywords: ["validation", "checks", "rules", "quality gates"],
  },
  {
    id: "dm-quality",
    name: "Data Quality Assurance",
    domain: "Data Management",
    description:
      "Frameworks for accuracy, timeliness, completeness and coherence across the statistical production chain.",
    importance: 0.95,
    keywords: ["quality assurance", "accuracy", "timeliness", "completeness", "gsvm", "framework"],
  },
  {
    id: "de-python",
    name: "Python for Statistical Analysis",
    domain: "Digital & Emerging Skills",
    description:
      "Using Python (pandas, numpy) to automate cleaning, validation and statistical workflows.",
    importance: 0.75,
    keywords: ["python", "pandas", "numpy", "script", "automation"],
  },
  {
    id: "da-viz",
    name: "Data Visualization",
    domain: "Data Analysis",
    description:
      "Designing clear, honest visualisations and dashboards that support interpretation and dissemination.",
    importance: 0.7,
    keywords: ["visualization", "charts", "dashboard", "graphics"],
  },
  {
    id: "os-standards",
    name: "Statistical Standards & Ethics",
    domain: "Official Statistics",
    description:
      "UN Fundamental Principles, national standards, disclosure control and statistical ethics.",
    importance: 0.8,
    keywords: ["standards", "ethics", "disclosure", "principles", "confidentiality"],
  },
];

export const COMPETENCY_MAP: Record<string, Competency> = Object.fromEntries(
  COMPETENCIES.map((c) => [c.id, c]),
);

export function proficiencyLevel(score: number): string {
  if (score >= 90) return "Expert";
  if (score >= 75) return "Advanced";
  if (score >= 60) return "Proficient";
  if (score >= 40) return "Developing";
  return "Beginner";
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

const t = (...ids: [string, number][]) => Object.fromEntries(ids);
const r = (...ids: [string, number][]) => Object.fromEntries(ids);

export const ROLES: RoleProfile[] = [
  {
    id: "stat-investigator",
    title: "Statistical Investigator",
    domain: "Survey & Data Operations",
    description:
      "Plans and executes field surveys, supervises enumeration and ensures first-mile data quality.",
    responsibilities: [
      "Survey planning and sampling frame preparation",
      "Field enumeration supervision and CAPI monitoring",
      "First-level data validation and query resolution",
    ],
    targets: t(
      ["sf-desc", 78], ["sf-samp", 82], ["sf-inf", 72], ["sm-design", 80],
      ["sm-nonresp", 84], ["sm-field", 86], ["dm-clean", 76], ["dm-valid", 82],
      ["dm-quality", 85], ["de-python", 68], ["da-viz", 66], ["os-standards", 74],
    ),
    relevance: r(
      ["sf-desc", 0.7], ["sf-samp", 0.95], ["sf-inf", 0.7], ["sm-design", 0.95],
      ["sm-nonresp", 1], ["sm-field", 1], ["dm-clean", 0.85], ["dm-valid", 0.95],
      ["dm-quality", 1], ["de-python", 0.8], ["da-viz", 0.65], ["os-standards", 0.75],
    ),
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    domain: "Data Processing Division",
    description:
      "Processes, analyses and visualises official statistics; automates recurring analytical workflows.",
    responsibilities: [
      "Exploratory and descriptive analysis of survey microdata",
      "Dashboard and report production",
      "Scripted validation and cleaning pipelines",
    ],
    targets: t(
      ["sf-desc", 85], ["sf-samp", 78], ["sf-inf", 82], ["sm-design", 66],
      ["sm-nonresp", 70], ["sm-field", 55], ["dm-clean", 84], ["dm-valid", 84],
      ["dm-quality", 78], ["de-python", 88], ["da-viz", 86], ["os-standards", 70],
    ),
    relevance: r(
      ["sf-desc", 0.95], ["sf-samp", 0.85], ["sf-inf", 0.95], ["sm-design", 0.6],
      ["sm-nonresp", 0.7], ["sm-field", 0.4], ["dm-clean", 0.9], ["dm-valid", 0.9],
      ["dm-quality", 0.8], ["de-python", 1], ["da-viz", 1], ["os-standards", 0.7],
    ),
  },
  {
    id: "survey-officer",
    title: "Survey Officer",
    domain: "Field Operations Wing",
    description:
      "Leads large-scale survey operations, manages enumerator teams and field logistics.",
    responsibilities: [
      "Survey operation planning and manpower allocation",
      "Enumerator training and supervision",
      "Field-level non-response reduction",
    ],
    targets: t(
      ["sf-desc", 70], ["sf-samp", 76], ["sf-inf", 62], ["sm-design", 84],
      ["sm-nonresp", 86], ["sm-field", 92], ["dm-clean", 68], ["dm-valid", 74],
      ["dm-quality", 80], ["de-python", 56], ["da-viz", 60], ["os-standards", 72],
    ),
    relevance: r(
      ["sf-desc", 0.6], ["sf-samp", 0.85], ["sf-inf", 0.5], ["sm-design", 1],
      ["sm-nonresp", 1], ["sm-field", 1], ["dm-clean", 0.6], ["dm-valid", 0.7],
      ["dm-quality", 0.9], ["de-python", 0.5], ["da-viz", 0.55], ["os-standards", 0.75],
    ),
  },
  {
    id: "dq-specialist",
    title: "Data Quality Specialist",
    domain: "Quality Assurance Division",
    description:
      "Owns quality frameworks, validation rulebooks and quality audits across the production chain.",
    responsibilities: [
      "Designing validation rules and quality gates",
      "Running GSAM-aligned quality audits",
      "Reporting quality indicators to management",
    ],
    targets: t(
      ["sf-desc", 78], ["sf-samp", 80], ["sf-inf", 74], ["sm-design", 74],
      ["sm-nonresp", 82], ["sm-field", 66], ["dm-clean", 88], ["dm-valid", 92],
      ["dm-quality", 94], ["de-python", 78], ["da-viz", 70], ["os-standards", 80],
    ),
    relevance: r(
      ["sf-desc", 0.75], ["sf-samp", 0.85], ["sf-inf", 0.7], ["sm-design", 0.7],
      ["sm-nonresp", 0.9], ["sm-field", 0.5], ["dm-clean", 1], ["dm-valid", 1],
      ["dm-quality", 1], ["de-python", 0.85], ["da-viz", 0.7], ["os-standards", 0.85],
    ),
  },
];

export const ALL_ROLES = [
  { id: "stat-investigator", title: "Statistical Investigator" },
  { id: "data-analyst", title: "Data Analyst" },
  { id: "survey-officer", title: "Survey Officer" },
  { id: "dq-specialist", title: "Data Quality Specialist" },
];

export const ROLE_MAP: Record<string, RoleProfile> = Object.fromEntries(
  ROLES.map((role) => [role.id, role]),
);

// ---------------------------------------------------------------------------
// Seed learner — Ananya Sharma, Statistical Investigator
// ---------------------------------------------------------------------------

export const SEED_PROFILE: LearnerProfile = {
  name: "Ananya Sharma",
  role: "stat-investigator",
  department: "Survey & Data Operations",
  experienceYears: 6,
  streakDays: 12,
  capabilityScore: 64,
  completedCourses: [
    "Fundamentals of Official Statistics",
    "Field Operations & CAPI Essentials",
  ],
};

export const SEED_COMPETENCIES: LearnerCompetency[] = [
  {
    competencyId: "sf-desc", score: 74, target: 78, confidence: 91,
    evidence: ["Assessment: Statistical Foundations Diagnostic (Mar)", "Course: Fundamentals of Official Statistics"],
    history: [{ label: "Nov", score: 62 }, { label: "Jan", score: 67 }, { label: "Mar", score: 71 }, { label: "May", score: 74 }],
  },
  {
    competencyId: "sf-samp", score: 64, target: 82, confidence: 84,
    evidence: ["Assessment: Sampling Methods Check (Feb)", "Field application: NSS 80th round frame review"],
    history: [{ label: "Nov", score: 58 }, { label: "Jan", score: 60 }, { label: "Mar", score: 63 }, { label: "May", score: 64 }],
  },
  {
    competencyId: "sf-inf", score: 55, target: 72, confidence: 72,
    evidence: ["Assessment: Inference Concepts Quiz (Apr)"],
    history: [{ label: "Nov", score: 50 }, { label: "Jan", score: 52 }, { label: "Mar", score: 54 }, { label: "May", score: 55 }],
  },
  {
    competencyId: "sm-design", score: 72, target: 80, confidence: 88,
    evidence: ["Supervisor review: survey plan drafting", "Assessment: Survey Design Diagnostic"],
    history: [{ label: "Nov", score: 66 }, { label: "Jan", score: 69 }, { label: "Mar", score: 70 }, { label: "May", score: 72 }],
  },
  {
    competencyId: "sm-nonresp", score: 58, target: 84, confidence: 69,
    evidence: ["Field reports: urban migrant callback rates below norm"],
    history: [{ label: "Nov", score: 54 }, { label: "Jan", score: 55 }, { label: "Mar", score: 57 }, { label: "May", score: 58 }],
  },
  {
    competencyId: "sm-field", score: 81, target: 86, confidence: 93,
    evidence: ["Course: Field Operations & CAPI Essentials", "Supervised 3 district enumeration drives"],
    history: [{ label: "Nov", score: 74 }, { label: "Jan", score: 77 }, { label: "Mar", score: 79 }, { label: "May", score: 81 }],
  },
  {
    competencyId: "dm-clean", score: 62, target: 76, confidence: 77,
    evidence: ["Query resolution logs from PLFS processing cycle"],
    history: [{ label: "Nov", score: 55 }, { label: "Jan", score: 58 }, { label: "Mar", score: 60 }, { label: "May", score: 62 }],
  },
  {
    competencyId: "dm-valid", score: 48, target: 82, confidence: 81,
    evidence: ["Assessment: Validation Rules Pre-check (Apr)", "Manual checklists only — no automation in use"],
    history: [{ label: "Nov", score: 44 }, { label: "Jan", score: 45 }, { label: "Mar", score: 47 }, { label: "May", score: 48 }],
  },
  {
    competencyId: "dm-quality", score: 46, target: 85, confidence: 74,
    evidence: ["GSAM awareness session attendance", "No formal QA certification on record"],
    history: [{ label: "Nov", score: 42 }, { label: "Jan", score: 44 }, { label: "Mar", score: 45 }, { label: "May", score: 46 }],
  },
  {
    competencyId: "de-python", score: 42, target: 68, confidence: 83,
    evidence: ["Self-assessment + short practical task (Apr)"],
    history: [{ label: "Nov", score: 35 }, { label: "Jan", score: 38 }, { label: "Mar", score: 40 }, { label: "May", score: 42 }],
  },
  {
    competencyId: "da-viz", score: 58, target: 66, confidence: 70,
    evidence: ["Divisional dashboard contribution (Q1)"],
    history: [{ label: "Nov", score: 52 }, { label: "Jan", score: 54 }, { label: "Mar", score: 56 }, { label: "May", score: 58 }],
  },
  {
    competencyId: "os-standards", score: 66, target: 74, confidence: 86,
    evidence: ["Course: Fundamentals of Official Statistics"],
    history: [{ label: "Nov", score: 60 }, { label: "Jan", score: 62 }, { label: "Mar", score: 64 }, { label: "May", score: 66 }],
  },
];

// ---------------------------------------------------------------------------
// iGOT Karmayogi — DEMO catalogue (adapter-ready, not a live API)
// ---------------------------------------------------------------------------

export const COURSES: Course[] = [
  {
    id: "igot-fos",
    title: "Fundamentals of Official Statistics",
    provider: "NSO · e-Learning",
    source: "iGOT Karmayogi (demo catalogue)",
    durationMin: 180,
    level: "Foundation",
    competencies: [
      { competencyId: "os-standards", coverage: 0.9 },
      { competencyId: "sf-desc", coverage: 0.5 },
    ],
    summary:
      "Foundational tour of India's statistical system: legal framework, core standards, dissemination principles and ethics.",
    url: "#igot-deep-link-demo",
  },
  {
    id: "igot-sampling",
    title: "Survey Sampling Techniques",
    provider: "SARD · NSO",
    source: "iGOT Karmayogi (demo catalogue)",
    durationMin: 240,
    level: "Intermediate",
    competencies: [
      { competencyId: "sf-samp", coverage: 0.95 },
      { competencyId: "sf-inf", coverage: 0.6 },
      { competencyId: "sm-design", coverage: 0.55 },
    ],
    summary:
      "Stratified, multi-stage and systematic sampling with weighting, design effects and standard-error estimation.",
    url: "#igot-deep-link-demo",
  },
  {
    id: "igot-dq",
    title: "Data Quality Management",
    provider: "Quality Assurance Division",
    source: "iGOT Karmayogi (demo catalogue)",
    durationMin: 150,
    level: "Intermediate",
    competencies: [
      { competencyId: "dm-quality", coverage: 0.95 },
      { competencyId: "dm-valid", coverage: 0.85 },
      { competencyId: "dm-clean", coverage: 0.7 },
    ],
    summary:
      "End-to-end quality management: accuracy, completeness, timeliness and coherence with practical audit checklists.",
    url: "#igot-deep-link-demo",
  },
  {
    id: "igot-validation",
    title: "Advanced Data Validation",
    provider: "Data Processing Division",
    source: "iGOT Karmayogi (demo catalogue)",
    durationMin: 120,
    level: "Advanced",
    competencies: [
      { competencyId: "dm-valid", coverage: 0.95 },
      { competencyId: "dm-clean", coverage: 0.8 },
      { competencyId: "de-python", coverage: 0.45 },
    ],
    summary:
      "Designing rule-based validation systems, tolerance checks and automated quality gates for large survey datasets.",
    url: "#igot-deep-link-demo",
  },
  {
    id: "igot-python",
    title: "Python for Data Professionals",
    provider: "iGOT Digital Academy",
    source: "iGOT Karmayogi (demo catalogue)",
    durationMin: 300,
    level: "Foundation",
    competencies: [
      { competencyId: "de-python", coverage: 0.95 },
      { competencyId: "dm-clean", coverage: 0.5 },
      { competencyId: "da-viz", coverage: 0.4 },
    ],
    summary:
      "Hands-on Python with pandas/numpy for government datasets: ingestion, cleaning, summarisation and simple charts.",
    url: "#igot-deep-link-demo",
  },
  {
    id: "igot-viz",
    title: "Data Visualization for Official Reports",
    provider: "CSO Publications",
    source: "iGOT Karmayogi (demo catalogue)",
    durationMin: 90,
    level: "Foundation",
    competencies: [
      { competencyId: "da-viz", coverage: 0.9 },
      { competencyId: "os-standards", coverage: 0.35 },
    ],
    summary:
      "Principles of clear, honest statistical graphics for publications, press notes and dashboards.",
    url: "#igot-deep-link-demo",
  },
  {
    id: "igot-genai",
    title: "Generative AI for Government",
    provider: "NeGD",
    source: "iGOT Karmayogi (demo catalogue)",
    durationMin: 120,
    level: "Intermediate",
    competencies: [
      { competencyId: "de-python", coverage: 0.3 },
      { competencyId: "os-standards", coverage: 0.3 },
    ],
    summary:
      "Responsible use of generative AI in public administration: capabilities, risks, prompt practice and governance.",
    url: "#igot-deep-link-demo",
  },
  {
    id: "igot-nonresp",
    title: "Reducing Non-Response in Household Surveys",
    provider: "FO·SDRU",
    source: "STATGYAN Library (demo)",
    durationMin: 105,
    level: "Advanced",
    competencies: [
      { competencyId: "sm-nonresp", coverage: 0.95 },
      { competencyId: "sm-field", coverage: 0.6 },
      { competencyId: "sf-samp", coverage: 0.45 },
    ],
    summary:
      "Diagnosing non-response bias, targeted follow-up protocols, responsive design and post-survey adjustment.",
    url: "#igot-deep-link-demo",
  },
  {
    id: "igot-disclosure",
    title: "Statistical Disclosure Control",
    provider: "CSO · SDRD",
    source: "iGOT Karmayogi (demo catalogue)",
    durationMin: 100,
    level: "Advanced",
    competencies: [
      { competencyId: "os-standards", coverage: 0.85 },
      { competencyId: "sf-samp", coverage: 0.3 },
    ],
    summary:
      "Protecting respondent confidentiality in published tables and microdata: thresholds, perturbation and access regimes.",
    url: "#igot-deep-link-demo",
  },
  {
    id: "igot-inference",
    title: "Applied Statistical Inference",
    provider: "STATGYAN Library (demo)",
    source: "STATGYAN Library (demo)",
    durationMin: 135,
    level: "Intermediate",
    competencies: [
      { competencyId: "sf-inf", coverage: 0.95 },
      { competencyId: "sf-desc", coverage: 0.5 },
    ],
    summary:
      "From estimation to hypothesis testing: confidence intervals, significance, common misreadings of p-values.",
    url: "#igot-deep-link-demo",
  },
];

// ---------------------------------------------------------------------------
// Organization seed — Capability Command Center
// ---------------------------------------------------------------------------

export const ORG_METRICS: OrgMetrics = {
  totalLearners: 1284,
  avgCompetency: 61,
  criticalGapPct: 18,
  trainingCompletion: 47,
  improvementRate: 6,
};

export const METRIC_KEYS = [
  "Python",
  "Sampling",
  "Data Quality",
  "AI / ML",
  "Survey Design",
  "Official Stats",
];

export const DEPARTMENTS: DeptRow[] = [
  {
    department: "Survey & Data Operations",
    headcount: 342,
    avgCompetency: 58,
    completionRate: 41,
    improvement30d: 5,
    scores: { Python: 38, Sampling: 62, "Data Quality": 46, "AI / ML": 31, "Survey Design": 71, "Official Stats": 64 },
    topGaps: [
      { area: "AI / ML", severity: 92, affected: 298 },
      { area: "Python", severity: 87, affected: 305 },
      { area: "Data Quality", severity: 81, affected: 262 },
    ],
    recommendedTraining: "Data Quality Management + Python for Data Professionals",
    projectedImprovement: 14,
  },
  {
    department: "Data Processing Division",
    headcount: 216,
    avgCompetency: 67,
    completionRate: 55,
    improvement30d: 8,
    scores: { Python: 74, Sampling: 58, "Data Quality": 68, "AI / ML": 52, "Survey Design": 60, "Official Stats": 66 },
    topGaps: [
      { area: "Sampling", severity: 74, affected: 168 },
      { area: "Survey Design", severity: 66, affected: 140 },
    ],
    recommendedTraining: "Survey Sampling Techniques",
    projectedImprovement: 11,
  },
  {
    department: "Field Operations Wing",
    headcount: 486,
    avgCompetency: 54,
    completionRate: 36,
    improvement30d: 4,
    scores: { Python: 24, Sampling: 55, "Data Quality": 42, "AI / ML": 22, "Survey Design": 68, "Official Stats": 57 },
    topGaps: [
      { area: "Python", severity: 95, affected: 470 },
      { area: "AI / ML", severity: 94, affected: 461 },
      { area: "Data Quality", severity: 83, affected: 402 },
    ],
    recommendedTraining: "Python for Data Professionals + Data Quality Management",
    projectedImprovement: 16,
  },
  {
    department: "Research & Standards Division",
    headcount: 138,
    avgCompetency: 73,
    completionRate: 62,
    improvement30d: 7,
    scores: { Python: 66, Sampling: 78, "Data Quality": 71, "AI / ML": 58, "Survey Design": 76, "Official Stats": 84 },
    topGaps: [
      { area: "AI / ML", severity: 58, affected: 96 },
      { area: "Python", severity: 51, affected: 88 },
    ],
    recommendedTraining: "Generative AI for Government",
    projectedImprovement: 8,
  },
  {
    department: "IT & Systems Unit",
    headcount: 102,
    avgCompetency: 69,
    completionRate: 58,
    improvement30d: 6,
    scores: { Python: 82, Sampling: 42, "Data Quality": 60, "AI / ML": 71, "Survey Design": 38, "Official Stats": 52 },
    topGaps: [
      { area: "Survey Design", severity: 88, affected: 97 },
      { area: "Sampling", severity: 84, affected: 99 },
      { area: "Official Stats", severity: 70, affected: 76 },
    ],
    recommendedTraining: "Survey Sampling Techniques + Fundamentals of Official Statistics",
    projectedImprovement: 13,
  },
];
