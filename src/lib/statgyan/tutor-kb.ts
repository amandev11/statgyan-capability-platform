// Knowledge base powering Ask StatGPT (demo provider — grounded, explainable)

export interface TutorEntry {
  topic: string;
  keywords: string[];
  body: string;
  followUps: string[];
}

export const TUTOR_KB: TutorEntry[] = [
  {
    topic: "Sampling design",
    keywords: ["sampling", "stratified", "stratification", "cluster", "sample size", "frame"],
    body: `A sampling design is the plan that decides which units you observe so estimates generalise to the whole population. Stratification splits the population into internally homogeneous groups and samples each independently — because variation is absorbed by design rather than chance, estimates become more precise at the same cost. Cluster designs cut field cost but inflate variance, captured by the design effect. Always start from a complete, current frame: units missing from it can never be selected.`,
    followUps: ["When should I prefer stratification over clustering?", "How do I compute effective sample size?", "What makes a sampling frame good?"],
  },
  {
    topic: "Non-response",
    keywords: ["non-response", "nonresponse", "callback", "follow-up", "response rate"],
    body: `Non-response becomes dangerous when it is differential — that is, when the people who don't answer differ systematically from those who do (e.g., urban migrant households). First prevent: targeted follow-up protocols, varied callback hours, local-language enumerators, community liaison. Then adjust: post-stratification or inverse-propensity weighting corrects residual imbalance under a missing-at-random assumption within adjustment classes. Simply raising overall sample size does not reduce bias.`,
    followUps: ["What is response propensity weighting?", "Unit vs item non-response?", "How do I detect non-response bias early?"],
  },
  {
    topic: "Weighting & design effects",
    keywords: ["weight", "weighting", "design effect", "deff", "effective sample"],
    body: `Survey weights restore representativeness when selection probabilities are unequal: each respondent stands in for roughly 1/π of population units. The price of complex designs is summarised by the design effect (deff) — the ratio of your estimator's variance to what simple random sampling would give. Effective sample size = n ÷ deff. Ignoring weights when probabilities correlate with the study variable biases national estimates toward over-represented strata.`,
    followUps: ["Show me how deff affects a 1,000-household survey", "Why can't I just use unweighted averages?", "What raises deff most — clustering or weighting?"],
  },
  {
    topic: "Data validation",
    keywords: ["validation", "consistency check", "range check", "rulebook", "quality gate"],
    body: `A validation rulebook classifies checks into domain rules (a value inside a plausible range), consistency rules (logical relations between fields — e.g., marital status vs years married) and structural rules (codes exist in master lists). Violations must be quarantined for evidence-based correction; silent imputation or quiet publication destroys credibility. Automated gates enforce thresholds before release, with humans adjudicating flagged records.`,
    followUps: ["Design a rulebook for a household expenditure survey", "What happens when a quality gate fails near a deadline?", "Which checks should be automated first?"],
  },
  {
    topic: "Data quality frameworks",
    keywords: ["quality", "accuracy", "timeliness", "completeness", "coherence", "gsam", "nqaf"],
    body: `Official statistics quality is multidimensional: relevance, accuracy and reliability, timeliness and punctuality, coherence and comparability, accessibility and interpretability. Frameworks like the UN NQAF turn these dimensions into institutionalised practices — quality audits, indicators, and documentation at each stage of the production chain. Cost efficiency supports quality but is not itself an output dimension.`,
    followUps: ["What are practical quality indicators for field surveys?", "How does GSAM apply to my division?", "How do I balance timeliness against accuracy?"],
  },
  {
    topic: "Python & automation",
    keywords: ["python", "pandas", "numpy", "automation", "script", "vectoris"],
    body: `Python turns tacit, error-prone spreadsheet routines into version-controlled, repeatable pipelines. With pandas you express cleaning as data transformations: boolean masking converts invalid values to explicit NaN, groupby produces consistent aggregates, and vectorised operations run in optimised C-level code over millions of rows. The payoff for statistical divisions is auditability: every monthly run applies identical logic, reviewable through version control.`,
    followUps: ["Write my first validation script structure", "Vectorised ops vs loops — why faster?", "How do I migrate one spreadsheet process to pandas?"],
  },
  {
    topic: "Statistical inference",
    keywords: ["inference", "confidence interval", "p-value", "hypothesis", "significance"],
    body: `Inference moves from sample to population. A 95% confidence interval means: if we repeated the survey many times, about 95% of intervals built this way would contain the true value — not that 95% of households fall inside this one. A p-value of 0.03 means data this extreme would arise about 3% of the time if the null were true; it is not the probability the null is true, nor a guarantee of replication.`,
    followUps: ["Correctly interpret p = 0.07 for my DG", "Why is my confidence interval so wide?", "What is statistical vs practical significance?"],
  },
  {
    topic: "Disclosure control & ethics",
    keywords: ["disclosure", "confidentiality", "ethics", "principles", "small cell", "microdata"],
    body: `The UN Fundamental Principles oblige statistical offices to compile statistics impartially while strictly protecting respondent confidentiality. Disclosure control operationalises this: minimum cell-size thresholds, suppression patterns, perturbation and controlled microdata access regimes stop re-identification from published tables. Ethics also covers avoiding leading questions, transparent methodology notes, and never letting release timing serve political convenience.`,
    followUps: ["Apply disclosure control to occupation × income tables", "What does impartiality mean for release calendars?", "Can I publish raw microdata?"],
  },
  {
    topic: "Data visualization",
    keywords: ["visualization", "chart", "graph", "dashboard", "axis"],
    body: `Good statistical graphics encode magnitude honestly: bars need zero baselines, time trends belong on line charts, and colour should aid decoding rather than decorate. Truncated axes on bar charts exaggerate small differences; dual axes invite misreading. For official publications, pair every chart with clear titles, source lines and metadata so users interpret figures as intended.`,
    followUps: ["Pick the right chart for district comparisons", "Is a truncated y-axis ever acceptable?", "Design principles for a public dashboard"],
  },
];
