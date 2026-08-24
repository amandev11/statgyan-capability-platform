// Shared types for the StatGyan intelligence layer.

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface CompetencyState {
  id: string;
  score: number; // 0–100
  target: number;
}

export interface RoleTemplate {
  id: string;
  title: string;
  blurb: string;
  baseline: Record<string, number>;
  focus: string[];
}

export interface GapItem {
  id: string;
  name: string;
  current: number;
  target: number;
  gap: number;
  severity: "Critical" | "High" | "Moderate" | "Minor" | "On track";
  priorityScore: number;
  roleRelevance: number;
  reasoning: string;
}

export interface LearningModule {
  order: number;
  title: string;
  domainId: string;
  domainName: string;
  minutes: number;
  level: string;
  provider: string;
  why: string;
  expectedGain: number;
  projectedAfter: number;
  courseId?: string;
}

export interface DocAnalysis {
  title: string;
  wordCount: number;
  simulatedExtraction: boolean;
  topics: string[];
  concepts: string[];
  objectives: string[];
  domains: string[];
  /** Evidence-based mapping confidence per domain (term-hit share, 0–1). */
  domainConfidences: { name: string; confidence: number }[];
  questionOpportunities: number;
  difficulty: Difficulty;
}

/** Shape used by the engine — mirrors the Convex materials row plus raw text. */
export interface MaterialRecordInput {
  title: string;
  fileName: string;
  fileType: string;
  wordCount: number;
  simulatedExtraction: boolean;
  topics: string[];
  concepts: string[];
  objectives: string[];
  domains: string[];
  questionOpportunities: number;
  text?: string;
}

export interface AssessmentConfig {
  count: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed" | "Adaptive";
  bloom: "Recall" | "Understanding" | "Application" | "Analysis" | "Mixed";
  domains: string[];
  passingScore: number;
  randomized: boolean;
}

export type Bloom = "Recall" | "Understanding" | "Application" | "Analysis";

export interface GeneratedQuestion {
  /** Stable deterministic identity — hash of stem + source. Never an array index. */
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceRef: string;
  domain: string;
  difficulty: string;
  bloom: Bloom;
  /** Where the question came from — material templates vs curated scenario bank. */
  generationType:
    | "material-cloze"
    | "material-definition"
    | "material-procedure"
    | "material-rule"
    | "material-causal"
    | "material-comparison"
    | "material-application"
    | "material-analysis"
    | "material-example"
    | "material-numerical"
    | "scenario"
    /** AI-generated candidates (provider recorded in BlueprintReport.ai). */
    | "ai-definition"
    | "ai-conceptual"
    | "ai-cloze"
    | "ai-comparison"
    | "ai-procedure"
    | "ai-cause-effect"
    | "ai-scenario"
    | "ai-application"
    | "ai-analysis"
    | "ai-numerical"
    | "ai-interpretation";
  /** Exact supporting sentence, when derived from uploaded material. */
  sourceSnippet?: string;
  /** Segment identifier within the source document (page/section/slide key). */
  sourceSegmentId?: string;
}

/** One cell of the blueprint matrix — the atomic unit the selector must fill. */
export interface QuestionSlot {
  slotId: string;
  domain: string;
  difficulty: Difficulty;
  bloom: Bloom;
}

/** Evidence about the learner used by Adaptive blueprints (never fabricated).
 *  averageGap = mean positive gap across the learner's competency profile. */
export interface LearnerContext {
  averageGap?: number;
}

/** Session context so repeated generations rotate instead of repeating. */
export interface GenerationOptions {
  /** Increments on every press of "Generate" — changes the seed even for identical blueprints. */
  generationNumber: number;
  /** Candidate IDs used in this session; avoided while alternatives exist. */
  excludeIds?: string[];
  /** Live competency evidence, enabling evidence-driven Adaptive difficulty. */
  learnerContext?: LearnerContext;
}

/** Transparent blueprint validation — what was requested vs what was actually delivered. */
export interface BlueprintReport {
  requestedCount: number;
  deliveredCount: number;
  /** Share of delivered slots that honour their matrix contract exactly (0–100). */
  adherencePct: number;
  domainDistribution: { label: string; count: number }[];
  difficultyDistribution: { label: string; count: number }[];
  bloomDistribution: { label: string; count: number }[];
  questionTypes: { label: string; count: number }[];
  sources: { materialDerived: number; scenarioFallback: number };
  /** Size of the full candidate pool the selection drew from. */
  candidatePoolSize: number;
  /** Distinct source segments contributing to the delivered set. */
  sourceSegmentsUsed: number;
  /** Honest notes about any blueprint dimension that could not be fully honoured. */
  notes: string[];
  /** Present only when the AI pipeline contributed to this generation. */
  ai?: {
    /** Provider/model string, e.g. "openrouter/free". */
    provider: string;
    /** Questions delivered from AI candidates. */
    generated: number;
    /** Slots the deterministic engine had to fill after AI shortfalls/rejections. */
    fallbackFilled: number;
    /** Mean grounding score from stage-2 validation (0–1); undefined if unvalidated. */
    avgGrounding?: number;
  };
}
