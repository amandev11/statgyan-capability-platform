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

export interface GeneratedQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceRef: string;
  domain: string;
  difficulty: string;
}
