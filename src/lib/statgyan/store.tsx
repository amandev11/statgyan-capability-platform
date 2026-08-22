import { ai, ORG_PRIORITY } from "./ai";
import {
  COMPETENCY_MAP,
  ROLE_MAP,
  SEED_COMPETENCIES,
  SEED_PROFILE,
} from "./data";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AIInsight,
  AssessmentAttempt,
  CourseMatch,
  LearningMaterial,
  LearnerCompetency,
  LearnerProfile,
  LearningModule,
  Quiz,
  SkillGap,
} from "./types";

const STORAGE_KEY = "statgyan-ai-state-v1";

interface StatgyanState {
  profile: LearnerProfile;
  competencies: LearnerCompetency[];
  materials: LearningMaterial[];
  quizzes: Quiz[];
  attempts: AssessmentAttempt[];
  insights: AIInsight[];
}

interface Store extends StatgyanState {
  skillGaps: SkillGap[];
  courseMatches: CourseMatch[];
  learningPath: LearningModule[];
  roleTitle: string;
  addMaterial: (m: LearningMaterial) => void;
  updateMaterial: (id: string, patch: Partial<LearningMaterial>) => void;
  saveQuiz: (q: Quiz) => void;
  recordAttempt: (a: AssessmentAttempt) => void;
  pushInsight: (i: Omit<AIInsight, "id" | "createdAt">) => void;
  resetDemoState: () => void;
}

const StatgyanContext = createContext<Store | null>(null);

function loadInitial(): StatgyanState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StatgyanState;
      if (parsed?.profile && parsed?.competencies) return parsed;
    }
  } catch {
    // fall through to seed
  }
  return seedState();
}

function seedState(): StatgyanState {
  const gaps = ai.detectSkillGaps(
    SEED_COMPETENCIES,
    ROLE_MAP[SEED_PROFILE.role],
    {},
  );
  const topGap = gaps.find((g) => g.gap > 15);
  return {
    profile: SEED_PROFILE,
    competencies: SEED_COMPETENCIES,
    materials: [],
    quizzes: [],
    attempts: [],
    insights: [
      {
        id: "ins-1",
        kind: "priority-alert",
        title: "Priority Alert",
        body: `${COMPETENCY_MAP[topGap?.competencyId ?? "dm-quality"]?.name ?? "Data Quality"} is currently among your largest role-critical competency gaps. A diagnostic assessment will sharpen the estimate.`,
        createdAt: Date.now() - 86400000,
        relatedCompetencyId: topGap?.competencyId,
      },
      {
        id: "ins-2",
        kind: "recommendation",
        title: "Recommendation",
        body: `Completing "Survey Sampling Techniques" could address approximately 70% of your identified sampling-related gaps.`,
        createdAt: Date.now() - 2 * 86400000,
      },
    ],
  };
}

export function StatgyanProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StatgyanState>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full / unavailable — demo continues in-memory
    }
  }, [state]);

  const role = ROLE_MAP[state.profile.role] ?? ROLE_MAP["stat-investigator"];

  const skillGaps = useMemo(
    () =>
      ai.detectSkillGaps(state.competencies, role, ORG_PRIORITY),
    [state.competencies, role],
  );

  const courseMatches = useMemo(
    () => ai.recommendCourses(skillGaps),
    [skillGaps],
  );

  const learningPath = useMemo(
    () => ai.generateLearningPath(skillGaps, courseMatches),
    [skillGaps, courseMatches],
  );

  const addMaterial = useCallback((m: LearningMaterial) => {
    setState((s) => ({ ...s, materials: [m, ...s.materials] }));
  }, []);

  const updateMaterial = useCallback(
    (id: string, patch: Partial<LearningMaterial>) => {
      setState((s) => ({
        ...s,
        materials: s.materials.map((m) =>
          m.id === id ? { ...m, ...patch } : m,
        ),
      }));
    },
    [],
  );

  const saveQuiz = useCallback((q: Quiz) => {
    setState((s) => ({ ...s, quizzes: [q, ...s.quizzes] }));
  }, []);

  const recordAttempt = useCallback((a: AssessmentAttempt) => {
    setState((s) => {
      // Apply evidence: shift tested competencies toward their targets
      const competencies = s.competencies.map((lc) => {
        const delta = a.competencyDeltas[lc.competencyId];
        if (!delta) return lc;
        const score = Math.max(0, Math.min(100, lc.score + delta));
        return {
          ...lc,
          score,
          confidence: Math.min(98, lc.confidence + 3),
          evidence: [
            `${new Date(a.completedAt).toLocaleDateString()} — ${a.quizTitle}: ${
              delta > 0 ? "+" : ""
            }${delta} pts`,
            ...lc.evidence.slice(0, 3),
          ],
          history: [
            ...lc.history.slice(-5),
            { label: "Now", score },
          ],
        };
      });
      const avg = Math.round(
        competencies.reduce((sum, lc) => sum + lc.score, 0) /
          Math.max(competencies.length, 1),
      );
      const diagnosisInsight: AIInsight = {
        id: `ins-${Date.now()}`,
        kind: "insight",
        title: "AI Insight",
        body: `Your overall capability moved ${avg >= s.profile.capabilityScore ? "up" : "down"} after "${a.quizTitle}" — the assessment became new evidence about your competency.`,
        createdAt: a.completedAt,
      };
      return {
        ...s,
        competencies,
        profile: { ...s.profile, capabilityScore: avg },
        attempts: [a, ...s.attempts],
        insights: [diagnosisInsight, ...s.insights].slice(0, 12),
      };
    });
  }, []);

  const pushInsight = useCallback(
    (i: Omit<AIInsight, "id" | "createdAt">) => {
      setState((s) => ({
        ...s,
        insights: [
          { ...i, id: `ins-${Date.now()}`, createdAt: Date.now() },
          ...s.insights,
        ].slice(0, 12),
      }));
    },
    [],
  );

  const resetDemoState = useCallback(() => {
    setState(seedState());
  }, []);

  const value: Store = {
    ...state,
    skillGaps,
    courseMatches,
    learningPath,
    roleTitle: role.title,
    addMaterial,
    updateMaterial,
    saveQuiz,
    recordAttempt,
    pushInsight,
    resetDemoState,
  };

  return (
    <StatgyanContext.Provider value={value}>
      {children}
    </StatgyanContext.Provider>
  );
}


export function useStatgyan(): Store {
  const ctx = useContext(StatgyanContext);
  if (!ctx) throw new Error("useStatgyan must be used inside StatgyanProvider");
  return ctx;
}
