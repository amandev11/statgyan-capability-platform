// STATGYAN AI — core data model

export type ProficiencyLevel =
  | "Beginner"
  | "Developing"
  | "Proficient"
  | "Advanced"
  | "Expert";

export type Domain =
  | "Statistical Foundations"
  | "Survey Methodology"
  | "Data Management"
  | "Data Analysis"
  | "Digital & Emerging Skills"
  | "Official Statistics";

export interface Competency {
  id: string;
  name: string;
  domain: Domain;
  description: string;
  /** Organizational importance weight, 0–1 */
  importance: number;
  keywords: string[];
}

export interface LearnerCompetency {
  competencyId: string;
  /** Current proficiency 0–100 */
  score: number;
  /** Role target 0–100 */
  target: number;
  /** AI confidence in the score estimate 0–100 */
  confidence: number;
  evidence: string[];
  history: { label: string; score: number }[];
}

export interface RoleProfile {
  id: string;
  title: string;
  domain: string;
  description: string;
  responsibilities: string[];
  /** Default targets per competency id */
  targets: Record<string, number>;
  /** Role relevance per competency id, 0–1 */
  relevance: Record<string, number>;
}

export interface LearnerProfile {
  name: string;
  role: RoleProfile["id"];
  department: string;
  experienceYears: number;
  streakDays: number;
  capabilityScore: number;
  completedCourses: string[];
}

export type GapPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface SkillGap {
  competencyId: string;
  current: number;
  target: number;
  gap: number; // negative = below target
  priority: GapPriority;
  /** Composite priority score 0–100 */
  priorityScore: number;
  roleRelevance: number;
  importance: number;
  confidence: number;
  orgPriority: number;
  reasoning: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  source: "iGOT Karmayogi (demo catalogue)" | "STATGYAN Library (demo)";
  durationMin: number;
  level: "Foundation" | "Intermediate" | "Advanced";
  competencies: { competencyId: string; coverage: number }[];
  summary: string;
  url: string;
}

export interface CourseMatch {
  course: Course;
  matchScore: number;
  gapsCovered: number;
  totalGaps: number;
  skillCoverage: number;
  difficultyFit: number;
  estimatedImprovement: number;
  why: string;
}

export interface LearningModule {
  id: string;
  order: number;
  title: string;
  minutes: number;
  priority: GapPriority;
  competencyId: string;
  why: string;
  gapSolved: string;
  expectedImprovement: number;
  courseId?: string;
}

export type QuestionType =
  | "MCQ"
  | "True/False"
  | "Scenario-based"
  | "Assertion/Reason"
  | "Case-based"
  | "Numerical"
  | "Conceptual";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Expert";

export type BloomLevel =
  | "Remember"
  | "Understand"
  | "Apply"
  | "Analyze"
  | "Evaluate";

export interface Question {
  id: string;
  competencyId: string;
  topic: string;
  type: QuestionType;
  difficulty: Difficulty;
  bloom: BloomLevel;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceRef: string;
  objective: string;
}

export type ConfidenceRating = "not-sure" | "somewhat" | "very";

export interface AnswerRecord {
  questionId: string;
  selectedIndex: number | null;
  correct: boolean;
  confidence: ConfidenceRating;
  timeMs: number;
  bookmarked: boolean;
}

export interface QuizConfig {
  numQuestions: number;
  difficulty: Difficulty | "Adaptive";
  topic: string; // competency id or "all"
  types: QuestionType[];
  bloom: BloomLevel | "Mixed";
  sourceMaterialId?: string;
}

export interface Quiz {
  id: string;
  title: string;
  config: QuizConfig;
  questions: Question[];
  createdAt: number;
}

export interface AssessmentAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  completedAt: number;
  score: number; // percent
  correctCount: number;
  totalQuestions: number;
  confidenceAccuracy: number;
  knowledgeGaps: number;
  confidenceGaps: number;
  carelessErrors: number;
  competencyDeltas: Record<string, number>; // competencyId -> points gained
  diagnosis: string;
  misconception?: string;
}

export type MaterialStatus =
  | "uploaded"
  | "analyzing"
  | "analyzed"
  | "error";

export interface LearningMaterial {
  id: string;
  name: string;
  sizeKb: number;
  mime: string;
  uploadedAt: number;
  status: MaterialStatus;
  textPreview: string;
  analysis?: MaterialAnalysis;
}

export interface MaterialAnalysis {
  wordCount: number;
  summary: string;
  topics: string[];
  concepts: string[];
  mappedCompetencies: { competencyId: string; relevance: number }[];
  learningObjectives: string[];
  flashcards: { front: string; back: string }[];
  practiceQuestions: string[];
  pathway: { title: string; minutes: number }[];
  estimatedDifficulty: Difficulty;
}

export type InsightKind =
  | "insight"
  | "priority-alert"
  | "recommendation";

export interface AIInsight {
  id: string;
  kind: InsightKind;
  title: string;
  body: string;
  createdAt: number;
  relatedCompetencyId?: string;
}

// ---------- Organization-level ----------

export interface DeptRow {
  department: string;
  headcount: number;
  avgCompetency: number;
  completionRate: number;
  improvement30d: number;
  scores: Record<string, number>; // metric key -> avg proficiency
  topGaps: { area: string; severity: number; affected: number }[];
  recommendedTraining: string;
  projectedImprovement: number;
}

export interface OrgMetrics {
  totalLearners: number;
  avgCompetency: number;
  criticalGapPct: number;
  trainingCompletion: number;
  improvementRate: number;
}
