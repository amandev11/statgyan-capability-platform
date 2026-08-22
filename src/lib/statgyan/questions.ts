import type { Question } from "./types";

// ---------------------------------------------------------------------------
// Grounded question bank. Every question carries a competency tag, difficulty,
// Bloom level and a source reference so generated quizzes stay explainable.
// ---------------------------------------------------------------------------

export const QUESTION_BANK: Question[] = [
  // ---- Sampling Theory & Estimation ----
  {
    id: "q-samp-1",
    competencyId: "sf-samp",
    topic: "Stratified Sampling",
    type: "Scenario-based",
    difficulty: "Hard",
    bloom: "Apply",
    text: "A household survey draws an independent simple random sample within each stratum of a state. What is the primary benefit of stratification when strata are internally homogeneous?",
    options: [
      "It eliminates all non-sampling errors",
      "It typically reduces the variance of estimates for the same overall sample size",
      "It removes the need for sampling weights",
      "It guarantees every household has equal selection probability",
    ],
    correctIndex: 1,
    explanation:
      "When strata are internally homogeneous (low within-stratum variance), between-stratum variation is captured by design rather than by sampling noise, lowering the variance of the estimator at a fixed sample size.",
    sourceRef: "Uploaded Material — Ch. 3: Stratification Strategy",
    objective:
      "Explain how stratification improves the precision of survey estimates.",
  },
  {
    id: "q-samp-2",
    competencyId: "sf-samp",
    topic: "Design Effect",
    type: "MCQ",
    difficulty: "Medium",
    bloom: "Understand",
    text: "The design effect (deff) of a complex sample is 1.8. Compared with a simple random sample of the same size, effective sample size is:",
    options: [
      "1.8 times larger",
      "Roughly n / 1.8",
      "Unaffected by deff",
      "1.8% smaller",
    ],
    correctIndex: 1,
    explanation:
      "Effective sample size = actual sample size ÷ design effect. A deff of 1.8 means clustering/weighting costs about 44% of the precision of simple random sampling.",
    sourceRef: "Uploaded Material — Ch. 5: Design Effects & Weighting",
    objective: "Compute effective sample size from the design effect.",
  },
  {
    id: "q-samp-3",
    competencyId: "sf-samp",
    topic: "Sampling Frames",
    type: "True/False",
    difficulty: "Easy",
    bloom: "Understand",
    text: "A sampling frame that omits some units of the target population introduces coverage bias that no amount of within-frame randomisation can remove.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "Units outside the frame have zero selection probability; randomisation within the frame cannot recover them. This is a coverage error, distinct from sampling error.",
    sourceRef: "Uploaded Material — Ch. 2: Frames & Coverage",
    objective: "Distinguish coverage error from sampling error.",
  },
  {
    id: "q-samp-4",
    competencyId: "sf-samp",
    topic: "Two-stage Sampling",
    type: "Numerical",
    difficulty: "Medium",
    bloom: "Apply",
    text: "In a two-stage design, 40 villages are selected (first stage) and 20 households per village (second stage). What is the total number of households sampled?",
    options: ["60", "200", "800", "8000"],
    correctIndex: 2,
    explanation: "Total = first-stage units × second-stage units = 40 × 20 = 800 households.",
    sourceRef: "Uploaded Material — Ch. 4: Multi-stage Designs",
    objective: "Calculate total sample size in multi-stage designs.",
  },
  {
    id: "q-samp-5",
    competencyId: "sf-inf",
    topic: "Confidence Intervals",
    type: "Conceptual",
    difficulty: "Medium",
    bloom: "Understand",
    text: "A 95% confidence interval for mean monthly household expenditure is ₹18,000–₹22,000. The correct interpretation is:",
    options: [
      "95% of households spend between ₹18k and ₹22k",
      "If the survey were repeated many times, about 95% of intervals constructed this way would contain the true mean",
      "There is a 95% probability the true mean is exactly ₹20,000",
      "The estimate will be within ₹2,000 of the true value with certainty",
    ],
    correctIndex: 1,
    explanation:
      "A confidence interval quantifies the long-run reliability of the estimation procedure, not the distribution of individual households nor a probability statement about one fixed parameter.",
    sourceRef: "Uploaded Material — Ch. 6: Estimation & Interval Inference",
    objective: "Interpret confidence intervals correctly.",
  },
  {
    id: "q-samp-6",
    competencyId: "sf-samp",
    topic: "Weighting",
    type: "Case-based",
    difficulty: "Hard",
    bloom: "Analyze",
    text: "An analyst computes a national average directly from pooled respondent data, ignoring unequal selection probabilities across urban/rural strata. Urban areas are over-represented in the sample. The most likely consequence is:",
    options: [
      "No effect if the sample size is large",
      "A biased national average reflecting urban characteristics more than the population",
      "Larger standard errors only, without bias",
      "Automatic compensation through central limit theorem",
    ],
    correctIndex: 1,
    explanation:
      "Ignoring unequal probabilities when they correlate with the study variable produces systematic bias; large samples do not fix design-induced bias. Survey weights exist precisely to restore population representativeness.",
    sourceRef: "Uploaded Material — Ch. 5: Weighted vs Unweighted Estimates",
    objective: "Recognise bias from ignoring survey weights.",
  },

  // ---- Non-response ----
  {
    id: "q-nr-1",
    competencyId: "sm-nonresp",
    topic: "Non-response Bias",
    type: "Scenario-based",
    difficulty: "Hard",
    bloom: "Evaluate",
    text: "A household survey has substantial non-response concentrated among urban migrant populations. Which intervention is most likely to reduce non-response bias?",
    options: [
      "Increase the uniform sample size",
      "Apply post-stratification only",
      "Introduce targeted follow-up protocols for under-represented migrant localities",
      "Remove non-responding households from the frame",
    ],
    correctIndex: 2,
    explanation:
      "Targeted follow-up addresses systematic non-response at its source by recovering hard-to-reach groups; uniform expansion does not change who responds, deletion worsens coverage, and post-stratification alone cannot fix severe differential missingness.",
    sourceRef: "Uploaded Material — Ch. 7: Managing Non-Response",
    objective:
      "Select appropriate interventions for differential non-response.",
  },
  {
    id: "q-nr-2",
    competencyId: "sm-nonresp",
    topic: "Response Propensity",
    type: "MCQ",
    difficulty: "Expert",
    bloom: "Analyze",
    text: "Response propensity weighting adjusts for non-response by:",
    options: [
      "Weighting respondents inversely to their estimated probability of responding",
      "Weighting respondents proportionally to their income",
      "Excluding low-propensity respondents entirely",
      "Doubling weights in high-response strata",
    ],
    correctIndex: 0,
    explanation:
      "Propensity models estimate P(response | auxiliaries); weighting by the inverse restores representativeness under a missing-at-random assumption within propensity classes.",
    sourceRef: "Uploaded Material — Ch. 7.3: Propensity Adjustment",
    objective: "Explain inverse propensity weighting for non-response.",
  },
  {
    id: "q-nr-3",
    competencyId: "sm-nonresp",
    topic: "Unit vs Item Non-response",
    type: "MCQ",
    difficulty: "Easy",
    bloom: "Remember",
    text: "A household completes the survey but skips the monthly-income block. This is best classified as:",
    options: ["Unit non-response", "Item non-response", "Coverage error", "Processing error"],
    correctIndex: 1,
    explanation:
      "Unit non-response means the whole questionnaire is missing; partial completion with specific questions unanswered is item non-response, usually handled by imputation or partial adjustment.",
    sourceRef: "Uploaded Material — Ch. 7.1: Types of Non-response",
    objective: "Classify types of survey non-response.",
  },

  // ---- Survey Design ----
  {
    id: "q-sd-1",
    competencyId: "sm-design",
    topic: "Questionnaire Design",
    type: "Scenario-based",
    difficulty: "Medium",
    bloom: "Apply",
    text: "Pilot testing shows enumerators frequently rephrase an ambiguous income question, producing inconsistent answers. The best corrective action is:",
    options: [
      "Train enumerators to memorise one standard phrasing",
      "Rewrite the question using concrete reference periods and categories, then re-pilot",
      "Drop the income module from the survey",
      "Allow each enumerator's phrasing since context differs",
    ],
    correctIndex: 1,
    explanation:
      "Ambiguity is an instrument defect. Standardised, concrete wording (reference period, response categories) reduces interviewer-driven measurement error far more reliably than memorisation drills.",
    sourceRef: "Uploaded Material — Ch. 8: Questionnaire Development",
    objective: "Diagnose and fix questionnaire defects found in pilots.",
  },
  {
    id: "q-sd-2",
    competencyId: "sm-design",
    topic: "Error Budgets",
    type: "Assertion/Reason",
    difficulty: "Hard",
    bloom: "Evaluate",
    text: "Assertion (A): Total survey error frameworks consider sampling and non-sampling errors together.\nReason (R): Reducing sampling error by enlarging the sample can be counterproductive if non-sampling error grows faster.",
    options: [
      "Both A and R are true, and R explains A",
      "Both A and R are true, but R does not explain A",
      "A is true but R is false",
      "A is false but R is true",
    ],
    correctIndex: 0,
    explanation:
      "Total survey error treats accuracy holistically. Very large field forces can raise interviewer variability and processing errors, so the optimal design balances both error sources — R correctly justifies A.",
    sourceRef: "Uploaded Material — Ch. 1: Total Survey Error",
    objective: "Apply the total survey error perspective.",
  },
  {
    id: "q-sd-3",
    competencyId: "sm-design",
    topic: "Sampling Frame Quality",
    type: "MCQ",
    difficulty: "Medium",
    bloom: "Understand",
    text: "Which property is LEAST important when evaluating a sampling frame?",
    options: [
      "Completeness (all target units present)",
      "Absence of duplicates",
      "Currency (up-to-date unit list)",
      "Alphabetical ordering of unit names",
    ],
    correctIndex: 3,
    explanation:
      "Ordering by name has no bearing on frame quality. Completeness, uniqueness and currency directly determine coverage and selection integrity.",
    sourceRef: "Uploaded Material — Ch. 2: Frames & Coverage",
    objective: "Identify key sampling frame quality criteria.",
  },
  {
    id: "q-sd-4",
    competencyId: "sm-field",
    topic: "CAPI Supervision",
    type: "Scenario-based",
    difficulty: "Medium",
    bloom: "Apply",
    text: "During a CAPI-based enumeration drive, dashboard monitoring shows one enumerator completing interviews in half the median duration with implausible answers. First action:",
    options: [
      "Silently discard that enumerator's records",
      "Trigger targeted back-check/re-interview of a sample of their cases",
      "Extend deadlines for the entire district",
      "Switch the whole survey to paper mode",
    ],
    correctIndex: 1,
    explanation:
      "Quality dashboards flag anomalies; verification via independent back-checks confirms or clears fabrication before any data action. Wholesale discarding or mode changes are disproportionate and damage evidence quality.",
    sourceRef: "Uploaded Material — Ch. 9: Field Monitoring & Back-checks",
    objective: "Respond appropriately to suspected data fabrication.",
  },

  // ---- Data Validation & Quality ----
  {
    id: "q-dv-1",
    competencyId: "dm-valid",
    topic: "Validation Rules",
    type: "Numerical",
    difficulty: "Easy",
    bloom: "Apply",
    text: "A validation rule flags any record where age < 0 or age > 120. A record arrives with age = 134. What should happen?",
    options: [
      "Auto-correct age to the national average",
      "Flag as a range violation for follow-up or correction before release",
      "Publish it since one record cannot matter",
      "Delete the household from the dataset",
    ],
    correctIndex: 1,
    explanation:
      "Validation gates quarantine suspect values for resolution — correction must be evidence-based (callback, register match), never silent imputation to averages or quiet publication.",
    sourceRef: "Uploaded Material — Ch. 10: Validation Rulebooks",
    objective: "Describe handling of out-of-range values.",
  },
  {
    id: "q-dv-2",
    competencyId: "dm-valid",
    topic: "Consistency Checks",
    type: "MCQ",
    difficulty: "Medium",
    bloom: "Understand",
    text: "Which pair is an example of a cross-variable consistency check?",
    options: [
      "Monthly income must be a positive integer",
      "Marital status = 'Never married' conflicts with 'Years in current marriage' > 0",
      "State code must exist in the master list",
      "Interview date must not precede survey launch",
    ],
    correctIndex: 1,
    explanation:
      "Cross-variable checks test logical relationships BETWEEN fields within a record; the others are single-field (domain/range) or metadata checks.",
    sourceRef: "Uploaded Material — Ch. 10.2: Rule Taxonomy",
    objective: "Distinguish rule classes in a validation rulebook.",
  },
  {
    id: "q-dv-3",
    competencyId: "dm-quality",
    topic: "Quality Dimensions",
    type: "MCQ",
    difficulty: "Medium",
    bloom: "Remember",
    text: "Which is NOT one of the standard dimensions of statistical quality?",
    options: ["Relevance", "Accuracy", "Timeliness", "Cost minimisation"],
    correctIndex: 3,
    explanation:
      "Standard quality frameworks (e.g., UN NQAF) cover relevance, accuracy, reliability, timeliness, punctuality, coherence, comparability, accessibility — cost efficiency matters but is not itself a quality dimension of outputs.",
    sourceRef: "Uploaded Material — Ch. 11: Quality Frameworks",
    objective: "Recall dimensions of official statistics quality.",
  },
  {
    id: "q-dv-4",
    competencyId: "dm-quality",
    topic: "Quality Gates",
    type: "Scenario-based",
    difficulty: "Hard",
    bloom: "Evaluate",
    text: "A state dataset fails the completeness gate (88% vs required 95%) two days before a publication deadline. The professionally sound choice is:",
    options: [
      "Waive the gate silently and publish on time",
      "Document the shortfall, notify stakeholders, and either delay or publish with explicit caveats per protocol",
      "Impute the missing 12% with last cycle's values",
      "Reduce the completeness threshold retroactively",
    ],
    correctIndex: 1,
    explanation:
      "Gates protect credibility. Protocol-driven transparency — documented exceptions, stakeholder notification, caveated or delayed release — preserves trust; silent waivers or retroactive thresholds destroy it.",
    sourceRef: "Uploaded Material — Ch. 12: Quality Governance in Practice",
    objective: "Apply governance principles to quality-gate failures.",
  },
  {
    id: "q-dv-5",
    competencyId: "dm-clean",
    topic: "Outlier Treatment",
    type: "Conceptual",
    difficulty: "Medium",
    bloom: "Understand",
    text: "Before treating a value as an outlier, the analyst should first establish:",
    options: [
      "That it is extreme relative to the distribution AND whether it reflects a genuine value or an error",
      "That it looks unusual on a chart",
      "That it belongs to a small district",
      "That removing it makes results significant",
    ],
    correctIndex: 0,
    explanation:
      "Outlier treatment requires both statistical extremeness and a judgement about provenance. Genuine extreme values carry real information — deleting them biases estimates; only verified errors should be corrected or flagged.",
    sourceRef: "Uploaded Material — Ch. 13: Editing & Outliers",
    objective: "Justify outlier decisions with evidence.",
  },
  {
    id: "q-dv-6",
    competencyId: "dm-valid",
    topic: "Automation",
    type: "True/False",
    difficulty: "Easy",
    bloom: "Understand",
    text: "Automated validation eliminates the need for human review of flagged records.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "Automation scales detection and enforces consistency, but flagged records need human adjudication — the goal is human-in-the-loop review at much higher throughput, not zero review.",
    sourceRef: "Uploaded Material — Ch. 14: Human-in-the-loop QA",
    objective: "Position automation within the QA workflow.",
  },

  // ---- Python ----
  {
    id: "q-py-1",
    competencyId: "de-python",
    topic: "pandas Basics",
    type: "MCQ",
    difficulty: "Easy",
    bloom: "Remember",
    text: "In pandas, which operation replaces invalid negative expenditures with NaN for later handling?",
    options: [
      "df['exp'][df['exp'] < 0] = np.nan",
      "df.drop(columns=['exp'])",
      "df.groupby('exp').mean()",
      "np.percentile(df['exp'], 50)",
    ],
    correctIndex: 0,
    explanation:
      "Boolean masking assigns NaN to violating rows, converting silent bad values into explicit missing values that downstream logic can detect and treat consistently.",
    sourceRef: "Uploaded Material — Lab 2: Cleaning with pandas",
    objective: "Write basic pandas cleaning operations.",
  },
  {
    id: "q-py-2",
    competencyId: "de-python",
    topic: "Reproducibility",
    type: "Scenario-based",
    difficulty: "Medium",
    bloom: "Apply",
    text: "Your division repeats a monthly cleaning script manually in spreadsheets. Errors recur inconsistently. The highest-leverage improvement is:",
    options: [
      "More careful manual double-entry",
      "Convert the steps into a version-controlled Python script with automated checks",
      "Add more spreadsheet tabs",
      "Hire additional data entry staff",
    ],
    correctIndex: 1,
    explanation:
      "Scripting converts tacit manual knowledge into repeatable, auditable logic; every subsequent run applies identical rules, eliminating transcription drift and enabling review via version control.",
    sourceRef: "Uploaded Material — Lab 1: Why Automate?",
    objective: "Make the case for scripted reproducible workflows.",
  },
  {
    id: "q-py-3",
    competencyId: "de-python",
    topic: "Vectorisation",
    type: "MCQ",
    difficulty: "Medium",
    bloom: "Understand",
    text: "Why is vectorised pandas preferred over row-wise loops for a million-row dataset?",
    options: [
      "Loops are forbidden in Python",
      "Vectorised operations execute in optimised C-level code and scale far better",
      "Vectors use less memory by law of large numbers",
      "Loops cannot implement conditional logic",
    ],
    correctIndex: 1,
    explanation:
      "pandas/numpy push iteration into compiled routines operating on whole arrays, giving order-of-magnitude speedups and cleaner intent-expressing code over row-at-a-time Python loops.",
    sourceRef: "Uploaded Material — Lab 3: Vectorised Computation",
    objective: "Explain the performance rationale for vectorisation.",
  },

  // ---- Visualization ----
  {
    id: "q-viz-1",
    competencyId: "da-viz",
    topic: "Honest Charts",
    type: "MCQ",
    difficulty: "Easy",
    bloom: "Understand",
    text: "A bar chart of unemployment rates starts its y-axis at 30% instead of 0. The main risk is:",
    options: [
      "Slower rendering",
      "Visually exaggerating small differences between states",
      "Violating file-size standards",
      "Nothing — truncation is always best practice",
    ],
    correctIndex: 1,
    explanation:
      "Bar length encodes magnitude against a common baseline; truncating the axis breaks that encoding and manufactures visual differences that do not exist in the data.",
    sourceRef: "Uploaded Material — Ch. 15: Graphical Integrity",
    objective: "Identify misleading graphical practices.",
  },
  {
    id: "q-viz-2",
    competencyId: "da-viz",
    topic: "Chart Selection",
    type: "Conceptual",
    difficulty: "Medium",
    bloom: "Understand",
    text: "To show how a state's monthly inflation rate evolved over 24 months relative to the national line, the most suitable chart is:",
    options: [
      "Pie chart per month",
      "Line chart with two series sharing a time axis",
      "Stacked bar of totals",
      "Word cloud",
    ],
    correctIndex: 1,
    explanation:
      "Time series call for position-along-a-scale encodings; overlapping lines make level and trend comparison direct, which pies and stacked bars obscure.",
    sourceRef: "Uploaded Material — Ch. 15.2: Choosing Encodings",
    objective: "Match chart types to analytical questions.",
  },

  // ---- Standards & Ethics ----
  {
    id: "q-os-1",
    competencyId: "os-standards",
    topic: "Fundamental Principles",
    type: "MCQ",
    difficulty: "Medium",
    bloom: "Remember",
    text: "The UN Fundamental Principles of Official Statistics oblige national statistical offices to:",
    options: [
      "Compile statistics to serve whichever ministry funds them",
      "Compile and disseminate official statistics on an impartial basis, strictly respecting respondent confidentiality",
      "Release microdata freely to all applicants",
      "Avoid international comparability standards",
    ],
    correctIndex: 1,
    explanation:
      "Impartiality, scientific independence and strict confidentiality are core UN FPOS obligations — statistics serve the public, not particular sponsors, and respondent data may not be misused.",
    sourceRef: "Uploaded Material — Ch. 16: Legal & Ethical Foundations",
    objective: "Recall obligations under the UN Fundamental Principles.",
  },
  {
    id: "q-os-2",
    competencyId: "os-standards",
    topic: "Disclosure Control",
    type: "Scenario-based",
    difficulty: "Hard",
    bloom: "Evaluate",
    text: "A published district table cross-tabulates occupation × income band and includes cells with only 1–2 respondents. The appropriate disclosure-control response is:",
    options: [
      "Publish as-is; small cells are informative",
      "Apply suppression, perturbation or minimum-cell-size rules before release",
      "Rename districts to codes",
      "Increase the decimal precision of averages",
    ],
    correctIndex: 1,
    explanation:
      "Small cells enable re-identification and attribute disclosure. Threshold rules, suppression patterns or controlled perturbation are standard mitigations applied BEFORE release.",
    sourceRef: "Uploaded Material — Ch. 17: Disclosure Control Methods",
    objective: "Choose disclosure-control measures for risky tables.",
  },
  {
    id: "q-os-3",
    competencyId: "os-standards",
    topic: "Metadata",
    type: "True/False",
    difficulty: "Easy",
    bloom: "Understand",
    text: "Documenting concepts, definitions and collection methods alongside released data improves coherence and appropriate reuse.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "Metadata is what allows users to interpret figures correctly, compare across cycles and avoid misuse — it is a core quality dimension (interpretability), not optional documentation.",
    sourceRef: "Uploaded Material — Ch. 18: Metadata & Interpretability",
    objective: "Value metadata as part of statistical products.",
  },

  // ---- Inference extras ----
  {
    id: "q-inf-1",
    competencyId: "sf-inf",
    topic: "p-values",
    type: "MCQ",
    difficulty: "Medium",
    bloom: "Understand",
    text: "A hypothesis test yields p = 0.03. This means:",
    options: [
      "The null hypothesis has a 3% probability of being true",
      "Data this extreme would occur about 3% of the time if the null hypothesis were true",
      "The effect size is large",
      "The result is 97% certain to replicate",
    ],
    correctIndex: 1,
    explanation:
      "A p-value is P(data at least this extreme | H₀ true), not P(H₀ | data). It says nothing directly about effect size or replication probability.",
    sourceRef: "STATGYAN Library — Inference Refresher",
    objective: "Interpret p-values without common fallacies.",
  },
  {
    id: "q-inf-2",
    competencyId: "sf-desc",
    topic: "Central Tendency",
    type: "Numerical",
    difficulty: "Easy",
    bloom: "Apply",
    text: "Household sizes in a cluster are 2, 3, 3, 5 and 12. Which measure of central tendency best represents the typical household here?",
    options: ["Mean (5.0)", "Median (3)", "Maximum (12)", "Range (10)"],
    correctIndex: 1,
    explanation:
      "With a strong right-skew from the outlier 12, the mean is pulled upward; the median (3) robustly represents the typical household.",
    sourceRef: "STATGYAN Library — Descriptive Essentials",
    objective: "Choose skew-resistant summary measures.",
  },
  {
    id: "q-inf-3",
    competencyId: "sf-desc",
    topic: "Dispersion",
    type: "MCQ",
    difficulty: "Medium",
    bloom: "Understand",
    text: "Two districts report identical mean monthly incomes. District A's standard deviation is twice B's. This implies:",
    options: [
      "District A is richer overall",
      "Incomes in A are more dispersed around the same mean",
      "B's sample was larger",
      "A's mean is less reliable by definition",
    ],
    correctIndex: 1,
    explanation:
      "Standard deviation summarises spread around the mean; identical means with different dispersion describe very different distributions and different policy realities.",
    sourceRef: "STATGYAN Library — Descriptive Essentials",
    objective: "Interpret dispersion alongside central tendency.",
  },

  // ---- AI / Emerging ----
  {
    id: "q-ai-1",
    competencyId: "de-python",
    topic: "AI in Official Statistics",
    type: "Conceptual",
    difficulty: "Medium",
    bloom: "Understand",
    text: "In an official-statistics pipeline, AI-assisted classification (e.g., coding occupations from text) should always include:",
    options: [
      "Fully autonomous deployment without audit trails",
      "Human review of sampled predictions plus documented accuracy monitoring",
      "Random guessing fallbacks",
      "Removal of original text responses",
    ],
    correctIndex: 1,
    explanation:
      "Machine-assisted coding in official statistics follows human-in-the-loop governance: monitored agreement rates, sampled human verification and full auditability preserve the credibility of official outputs.",
    sourceRef: "Uploaded Material — Ch. 19: Emerging Technologies",
    objective: "Apply responsible-AI safeguards to statistical ML.",
  },
];

// ---------------------------------------------------------------------------
// Sample learning materials (demo upload payloads)
// ---------------------------------------------------------------------------

export const SAMPLE_DOCUMENTS: { name: string; label: string; text: string }[] =
  [
    {
      name: "Survey_Sampling_Field_Guide.pdf",
      label: "Field Guide — Survey Sampling & Non-Response",
      text: `CHAPTER 3 — STRATIFICATION STRATEGY
Stratified sampling divides the population into internally homogeneous strata before selection. When strata are homogeneous, stratification reduces estimator variance at fixed sample size.

CHAPTER 5 — DESIGN EFFECTS & WEIGHTING
Complex designs incur precision losses measured by the design effect (deff). Effective sample size equals actual sample size divided by deff. Unequal probabilities require survey weights; ignoring them biases national estimates toward over-represented strata such as urban areas.

CHAPTER 7 — MANAGING NON-RESPONSE
Unit non-response occurs when no questionnaire is completed; item non-response affects specific questions. Differential non-response concentrated in groups such as urban migrants creates non-response bias. Targeted follow-up protocols — repeated callbacks at varied hours, local-language enumerators, community liaison — address the source of bias, while post-stratification and inverse-propensity weighting adjust residual imbalance.`,
    },
    {
      name: "Data_Validation_Rulebook.pdf",
      label: "Rulebook — Data Validation & Quality Gates",
      text: `CHAPTER 10 — VALIDATION RULEBOOKS
Validation rules classify into domain checks (values within ranges), consistency checks (logical relationships between fields) and structural checks (codes exist in master lists). Violations are quarantined for evidence-based correction, never silently imputed.

CHAPTER 12 — QUALITY GOVERNANCE IN PRACTICE
Quality gates enforce thresholds before release. Gate failures must be documented, escalated to stakeholders, and resolved by protocol: delay, caveat, or exception approval. Retroactive threshold changes undermine credibility.

CHAPTER 14 — HUMAN-IN-THE-LOOP QA
Automated checks scale detection; humans adjudicate flagged records. Scripted pipelines (Python/pandas) make monthly processing reproducible and auditable.`,
    },
  ];
