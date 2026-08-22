import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { CATEGORIES, QUIZZES } from "./content";

// ---------------------------------------------------------------------------
// Seeding — idempotent; inserts catalogue once on first call.
// ---------------------------------------------------------------------------

export const ensureSeeded = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("quizzes").first();
    if (existing) return;
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

export const listCategories = query({
  handler: async () => CATEGORIES,
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
    const attempt = await ctx.db.get(id);
    if (!attempt) return null;
    // Include the full question set so the results page can render review.
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", attempt.quizId))
      .collect();
    questions.sort((a, b) => a.order - b.order);
    return { attempt, questions };
  },
});

// ---------------------------------------------------------------------------
// Attempts & stats
// ---------------------------------------------------------------------------

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
    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctIndex) correct++;
    }
    const total = questions.length;
    const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0;
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
      return { taken: 0, avgAccuracy: 0, bestScore: 0, minutes: 0 };
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
