import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { DOMAIN_CATALOG, QUIZZES } from "./content";

// ---------------------------------------------------------------------------
// Seeding — idempotent; resets when the taxonomy changes.
// ---------------------------------------------------------------------------

export const ensureSeeded = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("quizzes").first();
    if (existing) {
      // Taxonomy guard: old Quiza catalogue used categories like "Science".
      const isNew = QUIZZES.some((q) => q.slug === existing.slug);
      if (isNew) return;
      // Purge legacy catalogue + dependent attempts, then reseed.
      for (const q of await ctx.db.query("quizzes").collect()) {
        for (const question of await ctx.db
          .query("questions")
          .withIndex("by_quiz", (x) => x.eq("quizId", q._id))
          .collect()) {
          await ctx.db.delete(question._id);
        }
        await ctx.db.delete(q._id);
      }
      for (const a of await ctx.db.query("attempts").collect()) {
        await ctx.db.delete(a._id);
      }
    }
    for (const quiz of QUIZZES) {
      const { questions, ...meta } = quiz;
      const quizId = await ctx.db.insert("quizzes", meta);
      for (let i = 0; i < questions.length; i++) {
        await ctx.db.insert("questions", {
          quizId,
          order: i,
          ...questions[i],
        });
      }
    }
  },
});

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

export const listDomains = query({
  handler: async () => DOMAIN_CATALOG,
});

export const listQuizzes = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const quizzes = await ctx.db.query("quizzes").collect();
    const questions = await ctx.db.query("questions").collect();
    const allAttempts = await ctx.db.query("attempts").collect();
    const qCounts = new Map<string, number>();
    for (const q of questions) {
      qCounts.set(q.quizId, (qCounts.get(q.quizId) ?? 0) + 1);
    }
    const counts = new Map<string, number>();
    const mineBest = new Map<string, number>();
    for (const a of allAttempts) {
      if (!a.quizId) continue;
      counts.set(a.quizId, (counts.get(a.quizId) ?? 0) + 1);
      if (userId && a.userId === userId) {
        mineBest.set(a.quizId, Math.max(mineBest.get(a.quizId) ?? -1, a.scorePct));
      }
    }
    return quizzes
      .map((q) => ({
        ...q,
        questionCount: qCounts.get(q._id) ?? 0,
        attemptCount: counts.get(q._id) ?? 0,
        myBest: mineBest.get(q._id),
      }))
      .sort(
        (a, b) =>
          a.category.localeCompare(b.category) || a.title.localeCompare(b.title),
      );
  },
});

export const getQuizBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!quiz) return null;
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
      .collect();
    questions.sort((a, b) => a.order - b.order);
    return { quiz, questions };
  },
});

export const getAttempt = query({
  args: { id: v.id("attempts") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    const attempt = await ctx.db.get(id);
    if (!attempt || attempt.userId !== userId) return null; // owner-only

    // Seeded catalogue attempt
    if (attempt.quizId) {
      const questions = await ctx.db
        .query("questions")
        .withIndex("by_quiz", (q) => q.eq("quizId", attempt.quizId!))
        .collect();
      questions.sort((a, b) => a.order - b.order);
      return {
        attempt,
        questions: questions.map((q) => ({
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          domain: q.domain ?? "",
          difficulty: "Medium",
          sourceRef: q.sourceRef ?? "",
        })),
      };
    }

    // AI-generated assessment attempt
    if (attempt.assessmentId) {
      const assessment = await ctx.db.get(attempt.assessmentId);
      if (!assessment) return null;
      return { attempt, questions: assessment.questions };
    }

    return null;
  },
});

// ---------------------------------------------------------------------------
// Attempts & stats
// ---------------------------------------------------------------------------

function grade(questions: { correctIndex: number }[], answers: number[]) {
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].correctIndex) correct++;
  }
  const total = Math.max(questions.length, 1);
  return { correct, total, scorePct: Math.round((correct / total) * 100) };
}

export const submitAttempt = mutation({
  handler: async (
    ctx,
    {
      quizSlug,
      answers,
      durationMs,
    }: { quizSlug: string; answers: number[]; durationMs: number },
  ) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);

    // AI-generated assessment (slug format: "set-<id>")
    if (quizSlug.startsWith("set-")) {
      const assessmentId = ctx.db.normalizeId("assessments", quizSlug.slice(4));
      if (!assessmentId) throw new Error("Assessment not found");
      const assessment = await ctx.db.get(assessmentId);
      if (!assessment) throw new Error("Assessment not found");
      const { correct, total, scorePct } = grade(assessment.questions, answers);
      const attemptId = await ctx.db.insert("attempts", {
        userId,
        userName: user?.name ?? undefined,
        assessmentId,
        quizSlug,
        quizTitle: assessment.title,
        category: assessment.sourceLabel,
        answers,
        total,
        correctCount: correct,
        scorePct,
        durationMs,
        completedAt: Date.now(),
      });
      return attemptId;
    }

    // Catalogue quiz
    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_slug", (q) => q.eq("slug", quizSlug))
      .unique();
    if (!quiz) throw new Error("Quiz not found");
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
      .collect();
    questions.sort((a, b) => a.order - b.order);
    const { correct, total, scorePct } = grade(questions, answers);
    const attemptId = await ctx.db.insert("attempts", {
      userId,
      userName: user?.name ?? undefined,
      quizId: quiz._id,
      quizSlug: quiz.slug,
      quizTitle: quiz.title,
      category: quiz.category,
      answers,
      total,
      correctCount: correct,
      scorePct,
      durationMs,
      completedAt: Date.now(),
    });
    return attemptId;
  },
});

export const myAttempts = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const myStats = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (attempts.length === 0) {
      return { taken: 0, avgAccuracy: 0, bestScore: 0, minutes: 0, categories: 0 };
    }
    const avgAccuracy = Math.round(
      attempts.reduce((s, a) => s + a.scorePct, 0) / attempts.length,
    );
    const bestScore = Math.max(...attempts.map((a) => a.scorePct));
    const minutes = Math.round(
      attempts.reduce((s, a) => s + a.durationMs, 0) / 60000,
    );
    const categories = new Set(attempts.map((a) => a.category)).size;
    return { taken: attempts.length, avgAccuracy, bestScore, minutes, categories };
  },
});

export const leaderboard = query({
  handler: async (ctx) => {
    const attempts = await ctx.db.query("attempts").collect();
    type Row = {
      userId: string;
      name: string;
      taken: number;
      bestScore: number;
      avgAccuracy: number;
    };
    const byUser = new Map<string, Row>();
    for (const a of attempts) {
      const row = byUser.get(a.userId);
      if (!row) {
        byUser.set(a.userId, {
          userId: a.userId,
          name: a.userName ?? "Anonymous learner",
          taken: 1,
          bestScore: a.scorePct,
          avgAccuracy: a.scorePct,
        });
      } else {
        row.taken += 1;
        row.bestScore = Math.max(row.bestScore, a.scorePct);
        row.avgAccuracy = Math.round(
          (row.avgAccuracy * (row.taken - 1) + a.scorePct) / row.taken,
        );
      }
    }
    return [...byUser.values()]
      .filter((r) => r.taken >= 1)
      .sort((a, b) => b.avgAccuracy - a.avgAccuracy || b.bestScore - a.bestScore)
      .slice(0, 25);
  },
});

// ---------------------------------------------------------------------------
// Learner profile & competency state
// ---------------------------------------------------------------------------

export const upsertProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    roleTitle: v.optional(v.string()),
    department: v.optional(v.string()),
    experience: v.optional(v.string()),
    primaryDomain: v.optional(v.string()),
    secondaryDomains: v.array(v.string()),
    responsibilities: v.optional(v.string()),
    goals: v.optional(v.string()),
    competencies: v.array(
      v.object({ id: v.string(), score: v.number(), target: v.number() }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const payload = { ...args, onboarded: true };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return ctx.db.insert("profiles", { userId, ...payload });
  },
});

export const myProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return (
      (await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique()) ?? null
    );
  },
});

/**
 * Server-authoritative competency impact.
 *
 * Loads the attempt's own questions (catalogue or AI-generated), computes
 * per-domain accuracy from the stored answers, derives explainable deltas and
 * applies them to the learner's profile exactly once — guarded by the
 * `impactApplied` flag so revisiting a result can never inflate scores.
 */
export const applyCompetencyImpact = mutation({
  args: { attemptId: v.id("attempts") },
  handler: async (ctx, { attemptId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const attempt = await ctx.db.get(attemptId);
    if (!attempt || attempt.userId !== userId) return null;
    if (attempt.impactApplied) return { applied: false as const, deltas: [] };

    // Resolve this attempt's questions with their domain tags.
    let questions: { correctIndex: number; domain?: string; order?: number }[] = [];
    if (attempt.quizId) {
      questions = await ctx.db
        .query("questions")
        .withIndex("by_quiz", (q) => q.eq("quizId", attempt.quizId!))
        .collect();
      questions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } else if (attempt.assessmentId) {
      const assessment = await ctx.db.get(attempt.assessmentId);
      questions = assessment?.questions ?? [];
    }

    // Per-domain evidence → transparent delta formula (same one shown in UI):
    // delta = clamp(correct*3 − wrong*1, −6…+8); all-wrong domains get −min(5, wrong).
    const byDomain = new Map<string, { correct: number; wrong: number }>();
    questions.forEach((q, i) => {
      const dom = q.domain || attempt.category;
      const rec = byDomain.get(dom) ?? { correct: 0, wrong: 0 };
      if (attempt.answers[i] === q.correctIndex) rec.correct += 1;
      else rec.wrong += 1;
      byDomain.set(dom, rec);
    });
    const deltas = [...byDomain.entries()].map(([id, r]) => ({
      id,
      delta:
        r.correct > 0
          ? Math.min(8, Math.max(-6, r.correct * 3 - r.wrong * 1))
          : -Math.min(5, r.wrong),
      correct: r.correct,
      asked: r.correct + r.wrong,
    }));

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (profile) {
      const comps = [...profile.competencies];
      for (const d of deltas) {
        const idx = comps.findIndex((c) => c.id === d.id);
        if (idx >= 0) {
          comps[idx] = {
            ...comps[idx],
            score: Math.max(0, Math.min(100, comps[idx].score + d.delta)),
          };
        }
      }
      await ctx.db.patch(profile._id, { competencies: comps });
    }
    await ctx.db.patch(attemptId, { impactApplied: true });
    return { applied: true as const, deltas };
  },
});

/** Overall readiness: mean of competency scores weighted toward gaps below target. */
export const readiness = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile || profile.competencies.length === 0) return null;
    const scores = profile.competencies.map((c) => c.score);
    return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  },
});

// ---------------------------------------------------------------------------
// Materials & generated assessments
// ---------------------------------------------------------------------------

export const saveMaterial = mutation({
  args: {
    title: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    wordCount: v.number(),
    simulatedExtraction: v.boolean(),
    topics: v.array(v.string()),
    concepts: v.array(v.string()),
    objectives: v.array(v.string()),
    domains: v.array(v.string()),
    questionOpportunities: v.number(),
    pages: v.optional(v.number()),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return ctx.db.insert("materials", { userId, ...args, createdAt: Date.now() });
  },
});

/** Mark/unmark a learning-path step (by domainId) as completed for this learner. */
export const toggleModuleComplete = mutation({
  args: { domainId: v.string(), completed: v.boolean() },
  handler: async (ctx, { domainId, completed }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return false;
    const set = new Set(profile.completedModules ?? []);
    if (completed) set.add(domainId);
    else set.delete(domainId);
    await ctx.db.patch(profile._id, { completedModules: [...set] });
    return true;
  },
});

export const myMaterials = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("materials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(25);
  },
});

export const getMaterial = query({
  args: { id: v.id("materials") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    const material = await ctx.db.get(id);
    if (!material || material.userId !== userId) return null; // owner-only
    return material;
  },
});

export const saveAssessment = mutation({
  args: {
    title: v.string(),
    materialId: v.optional(v.id("materials")),
    sourceLabel: v.string(),
    difficulty: v.string(),
    qualityScore: v.number(),
    questions: v.array(
      v.object({
        text: v.string(),
        options: v.array(v.string()),
        correctIndex: v.number(),
        explanation: v.string(),
        sourceRef: v.string(),
        domain: v.string(),
        difficulty: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return ctx.db.insert("assessments", { userId, ...args, createdAt: Date.now() });
  },
});

export const getAssessment = query({
  args: { id: v.id("assessments") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    const a = await ctx.db.get(id);
    if (!a || a.userId !== userId) return null; // owner-only
    return {
      title: a.title,
      description: `AI-generated assessment from: ${a.sourceLabel}`,
      category: a.sourceLabel,
      difficulty: a.difficulty as "Easy" | "Medium" | "Hard",
      estMinutes: Math.max(3, a.questions.length),
      questions: a.questions,
    };
  },
});

export const myAssessments = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("assessments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(25);
  },
});
