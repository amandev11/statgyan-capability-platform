import {
  COMPETENCIES,
  COMPETENCY_MAP,
  COURSES,
  DEPARTMENTS,
  ROLE_MAP,
} from "./data";
import { QUESTION_BANK } from "./questions";
import { TUTOR_KB } from "./tutor-kb";
import type {
  AssessmentAttempt,
  CourseMatch,
  Difficulty,
  LearnerCompetency,
  LearningMaterial,
  LearningModule,
  MaterialAnalysis,
  OrgMetrics,
  Question,
  Quiz,
  QuizConfig,
  RoleProfile,
  SkillGap,
} from "./types";

// ---------------------------------------------------------------------------
// AIService — modular abstraction.
//
// The platform is architected so each method can later be backed by a real
// LLM / ML endpoint without touching the UI. The current provider is a
// deterministic, explainable "demo intelligence" that runs fully client-side:
// it derives every output from the competency framework and the learner's own
// evidence rather than pretending to call an external API.
// ---------------------------------------------------------------------------

export interface AIService {
  detectSkillGaps(
    comps: LearnerCompetency[],
    role: RoleProfile,
    orgPriority: Record<string, number>,
  ): SkillGap[];
  recommendCourses(gaps: SkillGap[]): CourseMatch[];
  generateLearningPath(
    gaps: SkillGap[],
    matches: CourseMatch[],
  ): LearningModule[];
  analyzeDocument(name: string, text: string): MaterialAnalysis;
  generateQuiz(
    config: QuizConfig,
    material?: LearningMaterial | null,
  ): Quiz;
  pickNextQuestion(remaining: Question[], correctStreak: number): Question;
  diagnoseAttempt(attempt: Omit<AssessmentAttempt, "diagnosis">, gapsBefore: number): string;
  tutorRespond(mode: string, question: string): { content: string; suggestions: string[] };
  executiveBrief(metrics: OrgMetrics, focusDept?: string): {
    overview: string;
    interventions: { dept: string; action: string; impact: string }[];
  };
  simulateTraining(
    courseTitle: string,
    employees: number,
    metricKey: string,
    currentAvg: number,
  ): {
    projected: number;
    gapReductionPct: number;
    months: number;
    narrative: string;
  };
}

// Organizational priority per competency (from national capability plans)
export const ORG_PRIORITY: Record<string, number> = {
  "dm-quality": 0.95,
  "dm-valid": 0.9,
  "de-python": 0.85,
  "sm-nonresp": 0.85,
  "sf-samp": 0.8,
  "sf-inf": 0.7,
  "sm-design": 0.75,
  "dm-clean": 0.7,
  "sf-desc": 0.6,
  "sm-field": 0.65,
  "da-viz": 0.6,
  "os-standards": 0.7,
};

function priorityLabel(score: number): SkillGap["priority"] {
  if (score >= 78) return "CRITICAL";
  if (score >= 62) return "HIGH";
  if (score >= 45) return "MEDIUM";
  return "LOW";
}

const DEMO_AI: AIService = {
  detectSkillGaps(comps, role, orgPriority) {
    return comps
      .map((lc) => {
        const comp = COMPETENCY_MAP[lc.competencyId];
        const gap = lc.target - lc.score;
        const relevance = role.relevance[lc.competencyId] ?? 0.5;
        const importance = comp?.importance ?? 0.5;
        const orgPri = orgPriority[lc.competencyId] ?? 0.5;
        const raw =
          0.4 * Math.min(Math.max(gap, 0), 50) * 2 +
          0.25 * relevance * 100 +
          0.15 * importance * 100 +
          0.1 * (1 - lc.confidence / 100) * 100 +
          0.1 * orgPri * 100;
        const priorityScore = Math.round(raw);
        const parts: string[] = [];
        if (gap > 20)
          parts.push(
            `your proficiency of ${lc.score}% sits well below the ${role.title} target of ${lc.target}%`,
          );
        else if (gap > 0)
          parts.push(
            `you are ${gap} points under the role target (${lc.score}% vs ${lc.target}%)`,
          );
        if (relevance >= 0.9)
          parts.push("it is directly central to your day-to-day responsibilities");
        if (importance >= 0.85 || orgPri >= 0.85)
          parts.push("the organization has flagged this area as a national capability priority");
        if (lc.confidence < 75)
          parts.push("assessment evidence is limited, so a diagnostic would sharpen this estimate");
        const reasoning = parts.length
          ? `Why ${comp?.name ?? lc.competencyId} matters now: ${parts.join("; ")}. Improving it should materially strengthen your work on ${
              comp ? comp.description.toLowerCase().replace(/\.$/, "") : "this area"
            }.`
          : `${comp?.name ?? lc.competencyId}: you are at or above your role target. Maintain with periodic refreshers.`;
        return {
          competencyId: lc.competencyId,
          current: lc.score,
          target: lc.target,
          gap,
          priority: priorityLabel(priorityScore),
          priorityScore,
          roleRelevance: relevance,
          importance,
          confidence: lc.confidence,
          orgPriority: orgPri,
          reasoning,
        } satisfies SkillGap;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  },

  recommendCourses(gaps) {
    const significant = gaps.filter((g) => g.gap > 5);
    return COURSES.map((course) => {
      const covered = new Set(
        course.competencies.map((c) => c.competencyId),
      );
      const matchedGaps = significant.filter((g) => covered.has(g.competencyId));
      if (matchedGaps.length === 0) return null;
      // Semantic-ish matching: coverage-weighted gap mass addressed by course
      let skillCoverage = 0;
      for (const g of matchedGaps) {
        const cov =
          course.competencies.find((c) => c.competencyId === g.competencyId)
            ?.coverage ?? 0.5;
        skillCoverage += cov * Math.min(g.gap, 40);
      }
      const totalGapMass = significant.reduce(
        (s, g) => s + Math.min(g.gap, 40),
        0,
      );
      const avgLevel = matchedGaps.reduce(
        (s, g) => s + g.current,
        0,
      ) / matchedGaps.length;
      // Difficulty fit: foundation courses fit low scores, advanced fit higher
      const levelFit =
        course.level === "Foundation"
          ? avgLevel < 60 ? 1 : 0.7
          : course.level === "Intermediate"
            ? avgLevel >= 50 && avgLevel <= 80 ? 1 : 0.75
            : avgLevel >= 55 ? 1 : 0.65;
      const durationFit = course.durationMin <= 180 ? 0.95 : 0.8;
      const matchScore = Math.min(
        99,
        Math.round(
          (skillCoverage / totalGapMass) * 70 * 2 +
            levelFit * 18 * durationFit +
            6,
        ),
      );
      const estimatedImprovement = Math.min(
        30,
        Math.round(skillCoverage * 0.45),
      );
      return {
        course,
        matchScore,
        gapsCovered: matchedGaps.length,
        totalGaps: significant.length,
        skillCoverage: Math.round((skillCoverage / totalGapMass) * 100),
        difficultyFit: Math.round(levelFit * 100),
        estimatedImprovement,
        why: `Addresses ${matchedGaps.length} of your ${significant.length} identified competency gaps${
          matchedGaps.some((g) => g.priority === "CRITICAL")
            ? ", including at least one critical-priority gap"
            : ""
        }. Targeted at ${matchedGaps
          .map((g) => COMPETENCY_MAP[g.competencyId]?.name)
          .filter(Boolean)
          .slice(0, 3)
          .join(", ")}.`,
      } satisfies CourseMatch;
    })
      .filter((m): m is CourseMatch => m !== null)
      .sort((a, b) => b.matchScore - a.matchScore);
  },

  generateLearningPath(gaps, matches) {
    const topGaps = gaps.filter((g) => g.gap > 8).slice(0, 5);
    const usedCourses = new Set<string>();
    return topGaps.map((gap, i) => {
      const comp = COMPETENCY_MAP[gap.competencyId];
      const best = matches.find((m) =>
        m.course.competencies.some(
          (c) =>
            c.competencyId === gap.competencyId &&
            c.coverage >= 0.55 &&
            !usedCourses.has(m.course.id),
        ),
      );
      if (best) usedCourses.add(best.course.id);
      return {
        id: `lp-${i + 1}`,
        order: i + 1,
        title: best?.course.title ?? `${comp.name} Intensive`,
        minutes: best?.course.durationMin ?? 90,
        priority: gap.priority,
        competencyId: gap.competencyId,
        why: `Your ${comp.name} score (${gap.current}) is ${gap.gap} points below the ${ROLE_MAP[
          "stat-investigator"
        ].title} target (${gap.target}). ${
          best
            ? `"${best.course.title}" maps to this competency with ${best.matchScore}% match strength.`
            : "A focused module closes this specific gap."
        }`,
        gapSolved: `${comp.name}: ${gap.current}% → ~${Math.min(
          gap.target,
          gap.current + 18,
        )}%`,
        expectedImprovement: best?.estimatedImprovement ?? 12,
        courseId: best?.course.id,
      } satisfies LearningModule;
    });
  },

  analyzeDocument(name: string, text: string): MaterialAnalysis {
    const lower = text.toLowerCase();
    const words = text.split(/\s+/).filter(Boolean).length;
    // Topic detection against framework keywords — transparent & auditable
    const scored = COMPETENCIES.map((c) => ({
      c,
      hits: c.keywords.filter((k) => lower.includes(k)).length,
    })).sort((a, b) => b.hits - a.hits);
    const detected = scored.filter((s) => s.hits > 0).slice(0, 5);
    const mapped =
      detected.length > 0
        ? detected.map((s) => ({
            competencyId: s.c.id,
            relevance: Math.min(0.98, 0.55 + s.hits * 0.12),
          }))
        : [{ competencyId: COMPETENCIES[0].id, relevance: 0.6 }];
    const topics = detected.map((s) => s.c.name);
    // Concept extraction: capitalized phrases & chapter headings
    const headings = Array.from(text.matchAll(/^CHAPTER[^\n]*|^[A-Z][A-Z \-&]{8,}$/gm)).map(
      (m) => m[0].trim(),
    );
    const concepts = Array.from(
      new Set(
        (
          lower.includes("design effect") ? ["Design effect", "Effective sample size"] : []
        )
          .concat(lower.includes("non-response") || lower.includes("nonresponse") ? ["Unit non-response", "Item non-response", "Response propensity"] : [])
          .concat(lower.includes("stratif") ? ["Strata homogeneity"] : [])
          .concat(lower.includes("weight") ? ["Survey weighting"] : [])
          .concat(lower.includes("validation") ? ["Domain checks", "Consistency checks", "Quality gates"] : [])
          .concat(lower.includes("pandas") || lower.includes("python") ? ["Scripted reproducibility"] : [])
          .concat(lower.includes("disclosure") ? ["Minimum cell size", "Re-identification risk"] : [])
          .concat(headings.slice(0, 4)),
      ),
    ).slice(0, 8);
    const primary = mapped[0].competencyId;
    const primaryComp = COMPETENCY_MAP[primary];
    const summary =
      `The document "${name}" (~${words} words) concentrates on ${topics
        .slice(0, 3)
        .join(", ")
        .toLowerCase()}. It reads as operational guidance for official statistics work, mapping most strongly onto ${primaryComp.name} in the ${primaryComp.domain} domain.`;
    const learningObjectives = [
      `Explain the core principles of ${topics[0]?.toLowerCase() ?? primaryComp.name.toLowerCase()} presented in the material`,
      topics[1]
        ? `Apply the documented techniques for ${topics[1].toLowerCase()} in field or processing settings`
        : `Relate the material to current divisional workflows`,
      `Identify common errors the material warns against and their remedies`,
    ];
    const flashcards = concepts.slice(0, 5).map((concept, i) => ({
      front: concept,
      back:
        [
          "Defined in this material as a core concept; test yourself on when and why it applies.",
          "Key term from the uploaded material — recall its practical implication for survey operations.",
          "From the document: connect this concept to a quality or precision outcome.",
          "Check you can give a one-sentence field example of this idea.",
          "Summarise how the material treats this concept differently from naive practice.",
        ][i % 5],
    }));
    const practiceQuestions = [
      `Give one workplace example where ignoring the guidance in "${name}" caused (or could cause) a measurable data-quality problem.`,
      `Which step of our current workflow does the material's recommendation change first?`,
      `Explain ${concepts[0] ?? primaryComp.name} to a new enumerator in two sentences.`,
    ];
    const pathway = mapped.slice(0, 3).map((m, i) => ({
      title: `${COMPETENCY_MAP[m.competencyId].name} — guided review ${i + 1}`,
      minutes: 25 + i * 10,
    }));
    const estimatedDifficulty: Difficulty =
      words > 400 ? "Medium" : "Easy";
    return {
      wordCount: words,
      summary,
      topics,
      concepts,
      mappedCompetencies: mapped,
      learningObjectives,
      flashcards,
      practiceQuestions,
      pathway,
      estimatedDifficulty,
    };
  },

  generateQuiz(config, material) {
    const pool = QUESTION_BANK.filter((q) => {
      if (config.topic !== "all" && q.competencyId !== config.topic && !config.types.includes(q.type))
        return false;
      if (config.topic !== "all" && q.competencyId !== config.topic) return false;
      if (!config.types.includes(q.type)) {
        // Scenario/case questions count towards MCQ-style selection loosely
        const flexible: Question["type"][] = ["MCQ", "Conceptual", "Scenario-based"];
        if (!(q.type === "True/False" ? false : flexible.includes(q.type) && (config.types.includes("MCQ") || config.types.includes("Conceptual"))))
          return false;
      }
      if (config.bloom !== "Mixed" && q.bloom !== config.bloom) return false;
      return true;
    });
    let candidates = [...pool];
    if (material?.analysis) {
      const mappedIds = new Set(material.analysis.mappedCompetencies.map((m) => m.competencyId));
      const groundedFirst = candidates.sort((a, b) => {
        const ga = mappedIds.has(a.competencyId) ? 1 : 0;
        const gb = mappedIds.has(b.competencyId) ? 1 : 0;
        return gb - ga;
      });
      candidates = groundedFirst.map((q) => ({
        ...q,
        sourceRef: mappedIds.has(q.competencyId)
          ? `Uploaded Material — ${material.name}`
          : q.sourceRef,
      }));
    }
    if (candidates.length === 0) candidates = [...QUESTION_BANK];
    // Difficulty preference ordering
    if (config.difficulty !== "Adaptive") {
      candidates.sort((a, b) =>
        a.difficulty === config.difficulty ? -1 : b.difficulty === config.difficulty ? 1 : 0,
      );
    }
    const picked: Question[] = [];
    const seenTopics = new Set<string>();
    for (const q of candidates) {
      if (picked.length >= config.numQuestions) break;
      // spread across topics first pass
      if (!seenTopics.has(q.topic) || picked.length >= candidates.length - 1) {
        picked.push(q);
        seenTopics.add(q.topic);
      }
    }
    for (const q of candidates) {
      if (picked.length >= config.numQuestions) break;
      if (!picked.includes(q)) picked.push(q);
    }
    const topicName =
      config.topic === "all"
        ? "Mixed Competencies"
        : COMPETENCY_MAP[config.topic]?.name ?? "Mixed";
    return {
      id: `quiz-${Date.now()}`,
      title: material
        ? `AI Assessment — ${material.name.replace(/\.[a-z]+$/i, "")}`
        : `Diagnostic Assessment — ${topicName}`,
      config: { ...config },
      questions: picked.slice(0, config.numQuestions),
      createdAt: Date.now(),
    };
  },

  // Adaptive engine: escalate difficulty after streaks of correct answers,
  // ease off after misses — mimicking a CAT-style assessment.
  pickNextQuestion(remaining, correctStreak) {
    if (remaining.length === 0) throw new Error("no questions left");
    const order: Difficulty[] =
      correctStreak >= 2
        ? ["Hard", "Expert", "Medium", "Easy"]
        : correctStreak === 1
          ? ["Medium", "Hard", "Easy", "Expert"]
          : ["Easy", "Medium", "Hard", "Expert"];
    for (const d of order) {
      const found = remaining.find((q) => q.difficulty === d);
      if (found) return found;
    }
    return remaining[0];
  },

  diagnoseAttempt(attempt, _gapsBefore) {
    const { score, knowledgeGaps, confidenceGaps, carelessErrors, competencyDeltas } =
      attempt;
    const weakest = Object.entries(competencyDeltas).sort(
      ([, a], [, b]) => a - b,
    )[0];
    const weakestName = weakest
      ? COMPETENCY_MAP[weakest[0]]?.name ?? weakest[0]
      : "mixed topics";
    let pattern: string;
    if (confidenceGaps > carelessErrors + knowledgeGaps && confidenceGaps > 0) {
      pattern = `The dominant signal is a confidence gap: you answered correctly on several items while reporting low confidence. You likely know more than the raw score suggests — targeted practice will convert latent knowledge into reliable capability.`;
    } else if (carelessErrors > 0 && knowledgeGaps <= 1) {
      pattern = `Most losses were careless errors on items you rated confidently — pace and checking habits, not understanding, are the constraint.`;
    } else if (knowledgeGaps > 0) {
      pattern = `The AI flags ${knowledgeGaps} genuine knowledge gap${knowledgeGaps > 1 ? "s" : ""}, including recurring misconception risk around ${weakestName.toLowerCase()}.`;
    } else {
      pattern = `Performance was consistent with your reported confidence across topics — a clean, well-calibrated run.`;
    }
    return `You scored ${score}%. Strongest signals came from your highest-scoring competencies. ${pattern}`;
  },

  tutorRespond(mode, question) {
    const q = question.toLowerCase();
    const entry =
      TUTOR_KB.find((e) => e.keywords.some((k) => q.includes(k))) ?? null;
    const topic = entry?.topic ?? "your question";
    const base = entry
      ? entry.body
      : `I don't have a dedicated module indexed for that yet, but here's how I'd reason about it: connect it to the competency it touches, identify the decision it changes in your workflow, then check it against the guidance in your uploaded materials. Try asking about sampling, non-response, weighting, design effects, validation, data quality, Python automation, visualization, disclosure control or statistical ethics.`;
    const modes: Record<string, string> = {
      explain: base,
      teach: `Let's build this up step by step.\n\n1) Start with the intuition behind ${topic.toLowerCase()}.\n${base}\n\nYour turn: try restating the key principle in one sentence before moving on.`,
      quiz: `Quick check on ${topic.toLowerCase()}:\n\n• Q1. In one sentence, what problem does this solve?\n• Q2. What goes wrong in practice when it's ignored?\n• Q3. Name one safeguard the standard approach requires.\n\nAnswer them and I'll assess each against the source material.`,
      example: `Here's a worked example grounded in Indian field conditions:\n\n${base}\n\nConcrete case: during a household expenditure round, apply exactly this reasoning to decide whether the urban stratum needs targeted callbacks or post-survey adjustment.`,
      challenge: `Challenge task 🎯\n\nTake the scenario you're least sure about in ${topic.toLowerCase()} and argue BOTH sides: what happens if we intervene, and what happens if we don't? Defend your final recommendation with one piece of evidence from your materials. I'll critique it when you're done.`,
      summarize: `Summary — ${topic}:\n\n${base
        .split(". ")
        .slice(0, 3)
        .map((s) => `• ${s.trim()}.`)
        .join("\n")}\n\nFull detail lives in your uploaded material and linked iGOT courses.`,
    };
    const content =
      modes[mode] ??
      base;
    const suggestions = entry
      ? entry.followUps
      : ["What should I learn next?", "Explain sampling design effects", "How do I reduce non-response bias?"];
    return { content, suggestions };
  },

  executiveBrief(_metrics, focusDept) {
    const depts = DEPARTMENTS;
    const weakestAreas = Object.fromEntries(
      ["Python", "Data Quality", "AI / ML"].map((k) => [
        k,
        Math.round(
          depts.reduce((s, d) => s + d.scores[k], 0) / depts.length,
        ),
      ]),
    );
    const strongestArea = Object.entries(
      depts.reduce<Record<string, number>>((acc, d) => {
        for (const [k, v] of Object.entries(d.scores))
          acc[k] = (acc[k] ?? 0) + v;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k)[0];
    const priorityDepts = [...depts]
      .sort((a, b) => a.avgCompetency - b.avgCompetency)
      .slice(0, 3);
    const overview = `**Capability Overview** — The workforce currently shows strongest proficiency in ${strongestArea}, while ${Object.entries(
      weakestAreas,
    )
      .sort((a, b) => a[1] - b[1])
      .map(([k, v]) => `${k} (${v}%)`)
      .join(", ")} represent the largest systemic capability gaps. ${
      priorityDepts.length
    } divisions require priority intervention${
      focusDept ? `, with ${focusDept} selected for detailed review` : ""
    }. The recommended first intervention is targeted Data Quality training for Survey & Data Operations, projected to lift organisational average competency by ~5 points within one quarter. This brief is an AI-generated estimate based on seeded demonstration data.`;
    const interventions = priorityDepts.map((d) => ({
      dept: d.department,
      action: d.recommendedTraining,
      impact: `Projected +${d.projectedImprovement} pts avg competency · ${d.headcount} learners affected · est. ${d.headcount * 3} hrs training investment`,
    }));
    return { overview, interventions };
  },

  simulateTraining(courseTitle, employees, metricKey, currentAvg) {
    // Simple adoption model: reach × effectiveness × decay, clearly labelled estimate
    const effectiveness =
      metricKey === "Python"
        ? 0.22
        : metricKey === "Data Quality"
          ? 0.26
          : metricKey === "AI / ML"
            ? 0.2
            : 0.24;
    const headroom = 100 - currentAvg;
    const projectedRaw =
      currentAvg + Math.min(headroom * 0.6, effectiveness * 100 * 0.9);
    const projected = Math.round(projectedRaw);
    const gapReductionPct = Math.round(
      ((projected - currentAvg) / Math.max(headroom, 1)) * 100,
    );
    const months = employees > 300 ? 6 : 4;
    return {
      projected,
      gapReductionPct,
      months,
      narrative: `Training ${employees.toLocaleString()} employees via "${courseTitle}" targets the ${metricKey} capability. Model assumptions: ${Math.round(
        effectiveness * 100,
      )}% average proficiency uplift per completing learner, completion-adjusted for rollout over ${months} months. This is an AI simulation, not a guarantee.`,
    };
  },
};

export const ai: AIService = DEMO_AI;

// Deterministic shuffle helper (seeded) for stable demos
export function seededShuffle<T>(arr: T[], seed = 42): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
