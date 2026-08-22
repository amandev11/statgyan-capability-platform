// Static seed content for StatGyan — statistical competence catalogue.
// Authored once, inserted into Convex on first boot (or after taxonomy reset).

export interface SeedQuestion {
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  domain?: string;
  sourceRef?: string;
}

export interface SeedQuiz {
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estMinutes: number;
  domain?: string;
  questions: SeedQuestion[];
}

/** Competency domains for India's Official Statistical System. */
export const DOMAIN_CATALOG: {
  id: string;
  name: string;
  tagline: string;
}[] = [
  { id: "survey-methodology", name: "Survey Methodology", tagline: "Designing instruments and field operations" },
  { id: "sampling-estimation", name: "Sampling & Estimation", tagline: "Selecting units and quantifying precision" },
  { id: "data-quality", name: "Data Quality", tagline: "Validation, editing and assurance" },
  { id: "statistical-analysis", name: "Statistical Analysis", tagline: "From description to inference" },
  { id: "data-visualization", name: "Data Visualization", tagline: "Charts that carry evidence" },
  { id: "statistical-computing", name: "Statistical Computing", tagline: "Python, SQL and reproducible workflows" },
  { id: "official-statistics", name: "Official Statistics & Standards", tagline: "NSS, SDG indicators and dissemination" },
  { id: "governance-ethics", name: "Data Governance & Ethics", tagline: "Confidentiality, consent and stewardship" },
];

const D = {
  survey: "Survey Methodology",
  sampling: "Sampling & Estimation",
  quality: "Data Quality",
  analysis: "Statistical Analysis",
  viz: "Data Visualization",
  computing: "Statistical Computing",
  official: "Official Statistics & Standards",
  governance: "Data Governance & Ethics",
};

export const QUIZZES: SeedQuiz[] = [
  {
    slug: "survey-design-fundamentals",
    title: "Survey Design Fundamentals",
    description:
      "Questionnaire construction, modes of collection and non-response control — the craft of measuring well.",
    category: D.survey,
    domain: D.survey,
    difficulty: "Medium",
    estMinutes: 6,
    questions: [
      {
        text: "A household survey shows substantial non-response concentrated among urban migrants. Which intervention most directly reduces non-response bias?",
        options: [
          "Increase the overall sample size uniformly",
          "Apply post-stratification weights only",
          "Introduce targeted follow-up protocols for migrant settlements",
          "Drop non-responding households from the frame",
        ],
        correctIndex: 2,
        explanation:
          "Targeted follow-up converts systematic non-respondents into respondents, attacking the bias at its source; weighting alone only compensates statistically.",
        domain: D.survey,
        sourceRef: "Non-response reduction protocols",
      },
      {
        text: "Why does question order matter in a structured questionnaire?",
        options: [
          "It doesn't — respondents answer each item independently",
          "Earlier questions can prime interpretation of later ones",
          "Longer questionnaires are always more accurate",
          "Order only matters in telephone surveys",
        ],
        correctIndex: 1,
        explanation:
          "Context effects mean an earlier item can anchor how a later one is understood; designers randomise or carefully sequence sensitive items.",
        domain: D.survey,
      },
      {
        text: "Which pretesting method exposes comprehension problems before fieldwork?",
        options: [
          "Cognitive interviewing with a small sample",
          "Increasing the number of supervisors",
          "Extending the reference period",
          "Adding more response categories",
        ],
        correctIndex: 0,
        explanation:
          "Cognitive interviews ask respondents to think aloud, revealing misread terms and ambiguous wording that pilot counts alone would miss.",
        domain: D.survey,
      },
      {
        text: "In a household consumption survey, what is the main risk of a 12-month recall period for food items?",
        options: [
          "Recall decay producing understated, smoothed estimates",
          "Overstated expenditure due to double counting",
          "Telescoping is impossible over long periods",
          "No risk; longer recall is always better",
        ],
        correctIndex: 0,
        explanation:
          "Respondents cannot reliably remember routine purchases over a year; estimates drift toward 'usual' patterns, biasing means downward.",
        domain: D.survey,
      },
      {
        text: "The primary purpose of a field operations manual is to…",
        options: [
          "Replace interviewer training entirely",
          "Standardise procedures so measurements are comparable across enumerators",
          "Serve as a legal contract with respondents",
          "Document software settings only",
        ],
        correctIndex: 1,
        explanation:
          "Standardisation is the point: when every enumerator follows identical procedures, variation reflects the population, not the enumerator.",
        domain: D.survey,
      },
      {
        text: "Which mode change is most likely to introduce mode effects into a time series?",
        options: [
          "Switching from face-to-face to telephone without a bridging study",
          "Printing new cover pages",
          "Hiring additional enumerators under the same protocol",
          "Reprinting the same questionnaire",
        ],
        correctIndex: 0,
        explanation:
          "Different modes produce different answers for identical questions; a bridging study quantifies the discontinuity before the switch.",
        domain: D.survey,
      },
    ],
  },
  {
    slug: "sampling-and-estimation",
    title: "Sampling & Estimation Essentials",
    description:
      "Frames, strata, weights and standard errors — how samples earn the right to speak for populations.",
    category: D.sampling,
    domain: D.sampling,
    difficulty: "Medium",
    estMinutes: 6,
    questions: [
      {
        text: "Stratified sampling improves precision primarily because…",
        options: [
          "It always reduces the sample size needed to zero variance",
          "Between-strata variability is removed from the sampling error",
          "It eliminates the need for weights",
          "Clusters become internally heterogeneous",
        ],
        correctIndex: 1,
        explanation:
          "By sampling within homogeneous strata, variation between strata no longer contributes to the standard error — the design effect falls below 1.",
        domain: D.sampling,
        sourceRef: "Stratification and design effects",
      },
      {
        text: "A sample of 400 yields a mean of 54 with a standard error of 2. The approximate 95% confidence interval is…",
        options: ["50 to 58", "52 to 56", "48 to 60", "53 to 55"],
        correctIndex: 0,
        explanation:
          "Approximately mean ± 1.96·SE ≈ 54 ± 3.9, i.e. roughly 50–58.",
        domain: D.sampling,
      },
      {
        text: "What is the defining property of simple random sampling?",
        options: [
          "Every population unit has an equal chance of selection",
          "Every third unit is chosen systematically",
          "Units are grouped by geography first",
          "Respondents volunteer themselves",
        ],
        correctIndex: 0,
        explanation:
          "Equal probability per unit is the SRS definition; systematic and volunteer designs do not guarantee it.",
        domain: D.sampling,
      },
      {
        text: "Cluster sampling generally produces less precise estimates than SRS of the same size because…",
        options: [
          "Units within clusters tend to be similar (intra-cluster correlation)",
          "Clusters are always too small",
          "Weighting is impossible with clusters",
          "Response rates fall to zero",
        ],
        correctIndex: 0,
        explanation:
          "Positive intra-cluster correlation means clustered samples carry less information per respondent, inflating the design effect.",
        domain: D.sampling,
      },
      {
        text: "Survey weights correct primarily for…",
        options: [
          "Unequal selection probabilities and differential non-response",
          "Rounding errors in the questionnaire",
          "Seasonal price movements",
          "Software rounding differences",
        ],
        correctIndex: 0,
        explanation:
          "Weights restore each respondent's representation of the population, compensating for unequal probabilities and calibrated non-response.",
        domain: D.sampling,
      },
      {
        text: "Doubling a sample size changes the margin of error approximately by a factor of…",
        options: ["4", "2", "0.71 (√½)", "0.25"],
        correctIndex: 2,
        explanation:
          "Margins shrink with the square root of n: doubling n multiplies precision gain by √(1/2) ≈ 0.71.",
        domain: D.sampling,
      },
    ],
  },
  {
    slug: "data-quality-assurance",
    title: "Data Quality Assurance in Practice",
    description:
      "Editing, validation rules, quality gates and the metadata habits that make datasets trustworthy.",
    category: D.quality,
    domain: D.quality,
    difficulty: "Easy",
    estMinutes: 5,
    questions: [
      {
        text: "Which check best catches an implausible record during data entry?",
        options: [
          "Range and consistency validation at capture time",
          "Post-publication peer review",
          "Deleting all outliers automatically",
          "Increasing the printing quality of forms",
        ],
        correctIndex: 0,
        explanation:
          "Real-time range/consistency edits stop impossible values at source, when the enumerator can still re-query the respondent.",
        domain: D.quality,
      },
      {
        text: "'Item non-response' refers to…",
        options: [
          "A whole questionnaire never returned",
          "Some questions unanswered within a returned questionnaire",
          "Items lost in physical storage",
          "Duplicate records in the file",
        ],
        correctIndex: 1,
        explanation:
          "Unit non-response is the missing questionnaire; item non-response is missing fields within it — they need different treatments.",
        domain: D.quality,
      },
      {
        text: "Why should outlier treatment be documented rather than applied silently?",
        options: [
          "To satisfy printers",
          "Because treatment choices materially affect estimates and must be auditable",
          "Outliers never matter statistically",
          "Documentation replaces analysis",
        ],
        correctIndex: 1,
        explanation:
          "Winsorising vs retaining an extreme value can move a published estimate; transparency preserves reproducibility and trust.",
        domain: D.quality,
      },
      {
        text: "Metadata describing how a statistic was produced is essential because…",
        options: [
          "It makes files larger and safer",
          "Users cannot correctly interpret data without definitions, coverage and methods",
          "Computers require metadata to open CSVs",
          "It substitutes for quality assurance",
        ],
        correctIndex: 1,
        explanation:
          "Definitions, reference periods and collection methods determine what comparisons are legitimate — metadata carries that context.",
        domain: D.quality,
      },
      {
        text: "A duplicate record set is best detected using…",
        options: [
          "Key-based matching plus similarity checks on near-duplicates",
          "Visual inspection of printed tables",
          "Sorting alphabetically only",
          "Recollecting all data",
        ],
        correctIndex: 0,
        explanation:
          "Exact keys catch perfect duplicates; fuzzy matching catches re-entered records with small variations.",
        domain: D.quality,
      },
      {
        text: "Total survey error frameworks remind us that…",
        options: [
          "Sampling error is the only error worth managing",
          "Coverage, measurement, non-response and processing errors also shape accuracy",
          "Errors cancel out if the sample is large",
          "Quality cannot be assessed at all",
        ],
        correctIndex: 1,
        explanation:
          "A huge sample still misleads if the frame misses people, questions measure badly, or processing corrupts values.",
        domain: D.quality,
      },
    ],
  },
  {
    slug: "statistical-analysis-foundations",
    title: "Statistical Analysis Foundations",
    description:
      "Description, inference and the reasoning that connects a table to a defensible conclusion.",
    category: D.analysis,
    domain: D.analysis,
    difficulty: "Medium",
    estMinutes: 6,
    questions: [
      {
        text: "The median is preferred over the mean when a distribution is…",
        options: [
          "Perfectly symmetric",
          "Strongly right-skewed, such as income",
          "Bimodal by definition",
          "Constant everywhere",
        ],
        correctIndex: 1,
        explanation:
          "The median resists the pull of extreme values; for skewed distributions like income it represents the typical unit better.",
        domain: D.analysis,
      },
      {
        text: "A p-value of 0.03 in a hypothesis test means…",
        options: [
          "There is a 3% chance the null hypothesis is true",
          "Data this extreme would occur ~3% of the time if the null were true",
          "The effect size is 3%",
          "The result is 97% certain to replicate",
        ],
        correctIndex: 1,
        explanation:
          "The p-value is P(data ≥ observed | null true) — a statement about the data under the null, not about the null's truth.",
        domain: D.analysis,
      },
      {
        text: "Correlation between two variables alone establishes…",
        options: [
          "Causation from X to Y",
          "Association, with direction unknown",
          "Nothing at any sample size",
          "That a confounder exists",
        ],
        correctIndex: 1,
        explanation:
          "Correlation quantifies co-movement; causal claims need design or assumptions that rule out confounding and reverse causality.",
        domain: D.analysis,
      },
      {
        text: "With survey data, why should analysis incorporate the design (weights, strata, clusters)?",
        options: [
          "It makes results look smoother",
          "Ignoring design typically understates standard errors and biases point estimates",
          "Software refuses to run otherwise",
          "It removes the need for confidence intervals",
        ],
        correctIndex: 1,
        explanation:
          "Naïve i.i.d. assumptions on complex-sample data produce too-narrow intervals; design-based analysis restores valid uncertainty.",
        domain: D.analysis,
      },
      {
        text: "Seasonal adjustment of a monthly series exists to…",
        options: [
          "Remove regular seasonal patterns so underlying movement is visible",
          "Eliminate irregular shocks like strikes",
          "Convert nominal series to real terms",
          "Make annual totals match monthly sums",
        ],
        correctIndex: 0,
        explanation:
          "Adjustment strips predictable seasonal components; irregular events and trend remain for interpretation.",
        domain: D.analysis,
      },
      {
        text: "An estimate with a wide confidence interval is best described as…",
        options: [
          "Precise but biased",
          "Imprecise — the data are consistent with a broad range of values",
          "Certainly wrong",
          "Free of non-sampling error",
        ],
        correctIndex: 1,
        explanation:
          "Interval width expresses precision; it says nothing about bias, which lives outside the sampling-error framework.",
        domain: D.analysis,
      },
    ],
  },
  {
    slug: "visualising-statistical-data",
    title: "Visualising Statistical Data",
    description:
      "Encodings, scales and chart choice — presenting numbers so decisions get easier, not harder.",
    category: D.viz,
    domain: D.viz,
    difficulty: "Easy",
    estMinutes: 5,
    questions: [
      {
        text: "Truncating the y-axis of a bar chart is discouraged mainly because…",
        options: [
          "Bars encode value through length, so truncation exaggerates differences visually",
          "It makes charts smaller",
          "Line charts forbid it",
          "Printers clip the axis",
        ],
        correctIndex: 0,
        explanation:
          "Length is the encoding channel for bars; a truncated baseline breaks the proportionality readers rely on.",
        domain: D.viz,
      },
      {
        text: "For showing the composition of a single total across many categories (say 12), the clearest choice is usually…",
        options: [
          "A pie chart with 12 slices",
          "A sorted horizontal bar chart",
          "A radar chart",
          "A word cloud",
        ],
        correctIndex: 1,
        explanation:
          "Humans judge lengths far better than angles; sorted bars keep twelve categories readable and comparable.",
        domain: D.viz,
      },
      {
        text: "A dual-axis chart of unrelated indices can mislead because…",
        options: [
          "Axis scaling choices manufacture visual correlations",
          "Two lines are always confusing",
          "Colours carry no meaning",
          "Legends hide information",
        ],
        correctIndex: 0,
        explanation:
          "Arbitrary axis ranges let almost any two series 'move together'; independent scales invite spurious stories.",
        domain: D.viz,
      },
      {
        text: "Perceptually uniform colour scales (e.g. viridis) matter in choropleth maps because…",
        options: [
          "Equal data steps appear as equal perceptual steps",
          "They print faster",
          "They use fewer colours overall",
          "They avoid all cultural associations",
        ],
        correctIndex: 0,
        explanation:
          "Uniform ramps prevent banding illusions, so map readers read rates rather than artefacts of the palette.",
        domain: D.viz,
      },
      {
        text: "When labelling a chart for publication, the reference period should be…",
        options: [
          "Omitted to save space",
          "Stated clearly, since the same series label can describe different periods",
          "Left to the reader's assumption",
          "Mentioned only in footnotes of other documents",
        ],
        correctIndex: 1,
        explanation:
          "Without the reference period a number is uninterpretable; explicit dating prevents misuse out of context.",
        domain: D.viz,
      },
      {
        text: "Small-multiple displays help compare many subgroups because…",
        options: [
          "Each panel shares identical axes, enabling honest visual comparison",
          "They remove the need for numbers",
          "Smaller charts render quicker",
          "Trends become causal",
        ],
        correctIndex: 0,
        explanation:
          "Common scales across repeated panels turn a wall of series into scannable, comparable evidence.",
        domain: D.viz,
      },
    ],
  },
  {
    slug: "python-sql-for-statistics",
    title: "Python & SQL for Statistical Work",
    description:
      "Practical computing: joins, group-bys, vectorised checks and reproducible scripts for official data.",
    category: D.computing,
    domain: D.computing,
    difficulty: "Medium",
    estMinutes: 6,
    questions: [
      {
        text: "In pandas, df.groupby('state')['income'].mean() computes…",
        options: [
          "Mean income per state",
          "Overall income mean ignoring state",
          "Income count per state",
          "A merged table of states",
        ],
        correctIndex: 0,
        explanation:
          "Group-by splits rows by state, aggregates income with the mean, and returns one value per group.",
        domain: D.computing,
      },
      {
        text: "A LEFT JOIN keeps…",
        options: [
          "All rows from the left table with matches from the right (NULL where absent)",
          "Only matched rows from both tables",
          "All rows from both tables stacked",
          "Only unmatched rows",
        ],
        correctIndex: 0,
        explanation:
          "LEFT JOIN preserves every left row, filling unmatched right columns with NULLs — essential for preserving frames.",
        domain: D.computing,
      },
      {
        text: "Vectorised operations are preferred over Python loops on large arrays because…",
        options: [
          "They push work into optimised C-level routines over contiguous memory",
          "Loops are forbidden by the language",
          "Vectors store less data",
          "It avoids writing functions",
        ],
        correctIndex: 0,
        explanation:
          "NumPy/pandas vectorisation executes compiled loops once instead of interpreting thousands of Python-level iterations.",
        domain: D.computing,
      },
      {
        text: "The main benefit of a scripted (vs manual spreadsheet) validation pipeline is…",
        options: [
          "Reproducibility: the same checks rerun identically on updated data",
          "Scripts are shorter than spreadsheets",
          "Manual methods have no audit trail at all",
          "It avoids documentation",
        ],
        correctIndex: 0,
        explanation:
          "Code becomes executable documentation — every edit, range check and join reruns deterministically on the next round.",
        domain: D.computing,
      },
      {
        text: "In SQL, WHERE differs from HAVING because…",
        options: [
          "WHERE filters rows before aggregation; HAVING filters groups after",
          "They are interchangeable aliases",
          "HAVING applies only to text columns",
          "WHERE runs after GROUP BY",
        ],
        correctIndex: 0,
        explanation:
          "Filter order matters: WHERE discards rows pre-aggregation; HAVING conditions apply to aggregated group results.",
        domain: D.computing,
      },
      {
        text: "Handling missing values with dropna() without inspection risks…",
        options: [
          "Silently biasing results if missingness is not completely random",
          "Losing column names",
          "Converting strings to floats",
          "Nothing; it is always safe",
        ],
        correctIndex: 0,
        explanation:
          "If missingness correlates with the outcome, listwise deletion skews estimates — diagnose the mechanism first.",
        domain: D.computing,
      },
    ],
  },
  {
    slug: "official-statistics-nss",
    title: "Official Statistics & the National System",
    description:
      "Standards, classifications, dissemination principles and the institutional architecture of Indian official statistics.",
    category: D.official,
    domain: D.official,
    difficulty: "Hard",
    estMinutes: 6,
    questions: [
      {
        text: "The UN Fundamental Principles of Official Statistics oblige national systems to…",
        options: [
          "Compile statistics impartially and release them according to scientific standards",
          "Publish only favourable indicators",
          "Keep all microdata permanently secret with no exceptions",
          "Delegate methodology to data subjects",
        ],
        correctIndex: 0,
        explanation:
          "Impartiality, scientific rigour, confidentiality and equal access define the principles adopted by the UN Statistical Commission.",
        domain: D.official,
        sourceRef: "UN Fundamental Principles",
      },
      {
        text: "Why do statistical agencies adopt standard classifications such as NIC/NSSO industry codes?",
        options: [
          "Comparability across datasets, time and international benchmarks",
          "Shorter questionnaires are cheaper to print",
          "Classification codes replace estimation",
          "They eliminate sampling error",
        ],
        correctIndex: 0,
        explanation:
          "Common classifications make outputs linkable and comparable — the backbone of coherent statistics.",
        domain: D.official,
      },
      {
        text: "A 'revisions policy' for a headline index exists to…",
        options: [
          "Balance timeliness against accuracy transparently as better data arrive",
          "Hide initial mistakes from users",
          "Allow arbitrary political adjustment",
          "Avoid publishing advance estimates",
        ],
        correctIndex: 0,
        explanation:
          "Advance estimates trade precision for timeliness; a published revision schedule keeps that trade-off accountable.",
        domain: D.official,
      },
      {
        text: "Dissemination under an open-data approach means…",
        options: [
          "Machine-readable releases with clear licences and documentation",
          "PDF-only press notes",
          "Data shared only on written request",
          "Aggregates published without metadata",
        ],
        correctIndex: 0,
        explanation:
          "Openness implies usable formats, licensing clarity and metadata — not merely public availability.",
        domain: D.official,
      },
      {
        text: "MoSPI's role within India's statistical system is best characterised as…",
        options: [
          "Nodal ministry setting standards and coordinating the system's statistical activities",
          "Sole collector of all administrative data",
          "A regulator of private polling companies",
          "An archive with no standard-setting duties",
        ],
        correctIndex: 0,
        explanation:
          "MoSPI (through NSO/CSO) sets standards, coordinates central statistics and compiles national accounts and key surveys.",
        domain: D.official,
      },
      {
        text: "SDG indicator monitoring requires national statistical systems to…",
        options: [
          "Align concepts and disaggregation with internationally agreed metadata",
          "Report only indicators already collected",
          "Substitute administrative data for all surveys",
          "Estimate indicators without documentation",
        ],
        correctIndex: 0,
        explanation:
          "Global monitoring depends on agreed metadata and disaggregation standards being implemented nationally.",
        domain: D.official,
      },
    ],
  },
  {
    slug: "governance-and-ethics",
    title: "Data Governance & Statistical Ethics",
    description:
      "Confidentiality, disclosure control, informed consent and the stewardship duties of a statistical office.",
    category: D.governance,
    domain: D.governance,
    difficulty: "Easy",
    estMinutes: 5,
    questions: [
      {
        text: "Statistical confidentiality fundamentally protects…",
        options: [
          "The identity and attributes of individual respondents from use for non-statistical purposes",
          "Government departments' internal drafts",
          "Published aggregate tables",
          "Enumerator identities",
        ],
        correctIndex: 0,
        explanation:
          "Responses may be used only for statistics — never for enforcement, taxation or identification of the provider.",
        domain: D.governance,
      },
      {
        text: "A published table shows a cell based on a single respondent. The standard safeguard is…",
        options: [
          "Primary suppression (or threshold rules) of the cell",
          "Publishing it with a footnote",
          "Rounding the percentage only",
          "Removing the entire table from the release",
        ],
        correctIndex: 0,
        explanation:
          "Small cells risk re-identification; suppression thresholds (or perturbation) protect contributors.",
        domain: D.governance,
      },
      {
        text: "'Informed consent' in survey participation requires that respondents…",
        options: [
          "Know the purpose, voluntariness and uses of the information they provide",
          "Sign a legal waiver of all rights",
          "Are notified after data are published",
          "Consent only once for all future surveys",
        ],
        correctIndex: 0,
        explanation:
          "Consent must be informed and specific: purpose, voluntary nature and consequences explained before collection.",
        domain: D.governance,
      },
      {
        text: "Sharing identified microdata with an external marketing firm would violate…",
        options: [
          "The exclusively-statistical-use principle of official statistics",
          "Open-data licensing",
          "Revision policies",
          "Nothing, if aggregated afterwards",
        ],
        correctIndex: 0,
        explanation:
          "Statistical authority rests on the promise that responses serve statistics only; commercial reuse of identified data breaks it.",
        domain: D.governance,
      },
      {
        text: "Differential privacy-style protection techniques exist to…",
        options: [
          "Bound the influence any single contributor can have on released outputs",
          "Compress databases efficiently",
          "Speed up query execution",
          "Improve estimate accuracy",
        ],
        correctIndex: 0,
        explanation:
          "Formal privacy adds calibrated noise so no individual's presence meaningfully changes published results.",
        domain: D.governance,
      },
      {
        text: "Good data stewardship within a division includes…",
        options: [
          "Access controls, retention schedules and documented lineage for datasets",
          "Emailing files informally for speed",
          "Keeping methods undocumented to preserve secrecy",
          "Unlimited access for all staff",
        ],
        correctIndex: 0,
        explanation:
          "Governance means controlled access, defined retention and traceable lineage — accountability by design.",
        domain: D.governance,
      },
    ],
  },
  // ---- General aptitude (not mapped to a competency domain) ----
  {
    slug: "mixed-bag-vol-1",
    title: "Mixed Bag Vol. 1",
    description:
      "Six deceptively varied questions spanning science, culture and the everyday — a balanced warm-up.",
    category: "General Aptitude",
    difficulty: "Medium",
    estMinutes: 5,
    questions: [
      {
        text: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correctIndex: 2,
        explanation: "Au comes from aurum, Latin for gold; Ag is silver (argentum).",
      },
      {
        text: "How many keys does a standard full-size piano have?",
        options: ["76", "84", "88", "96"],
        correctIndex: 2,
        explanation: "Since the late 1800s pianos have standardised on 88 keys — 52 white and 36 black.",
      },
      {
        text: "Which planet has the most confirmed moons in our solar system?",
        options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
        correctIndex: 1,
        explanation: "Saturn pulled ahead with 140+ confirmed moons after 2023 discoveries, overtaking Jupiter's 95.",
      },
      {
        text: "The Great Barrier Reef lies off the coast of which country?",
        options: ["Brazil", "Indonesia", "Australia", "Philippines"],
        correctIndex: 2,
        explanation: "Australia's north-east coast hosts the reef — the largest living structure on Earth.",
      },
      {
        text: "Who wrote the dystopian novel Nineteen Eighty-Four?",
        options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"],
        correctIndex: 1,
        explanation: "Eric Arthur Blair wrote as George Orwell; Huxley wrote Brave New World.",
      },
      {
        text: "In human anatomy, what is the body's largest organ?",
        options: ["Liver", "Brain", "Skin", "Lungs"],
        correctIndex: 2,
        explanation: "Skin averages around 2 m² in adults — largest by area and weight.",
      },
    ],
  },
  {
    slug: "quickfire-general-knowledge",
    title: "Quickfire General Knowledge",
    description:
      "Fast facts, zero fluff — a perfect first round or a warm-up before something heavier.",
    category: "General Aptitude",
    difficulty: "Easy",
    estMinutes: 4,
    questions: [
      {
        text: "What colour do you get by mixing blue and yellow paint?",
        options: ["Green", "Purple", "Orange", "Brown"],
        correctIndex: 0,
        explanation: "Blue and yellow pigments absorb complementary wavelengths, leaving green dominant.",
      },
      {
        text: "How many minutes are in a full day?",
        options: ["1,200", "1,440", "1,800", "2,400"],
        correctIndex: 1,
        explanation: "24 hours × 60 minutes = 1,440.",
      },
      {
        text: "Which is the tallest animal in the world?",
        options: ["Elephant", "Giraffe", "Ostrich", "Moose"],
        correctIndex: 1,
        explanation: "Adult giraffes reach 5–6 metres thanks to a half-metre neck and long forelegs.",
      },
      {
        text: "What does 'www' stand for in a website address?",
        options: ["Wide World Web", "World Wide Web", "Web Wide Wire", "Wireless World Web"],
        correctIndex: 1,
        explanation: "Tim Berners-Lee named his 1989 hypertext system the World Wide Web at CERN.",
      },
      {
        text: "Which fruit carries its seeds on the outside?",
        options: ["Kiwi", "Strawberry", "Plum", "Cherry"],
        correctIndex: 1,
        explanation: "Those 'seeds' are tiny achenes — dry fruits themselves — perched on the exterior.",
      },
      {
        text: "How many sides does a hexagon have?",
        options: ["Five", "Six", "Seven", "Eight"],
        correctIndex: 1,
        explanation: "Hexa- is Greek for six; hexagons tile perfectly, which honeycombs exploit.",
      },
    ],
  },
];
