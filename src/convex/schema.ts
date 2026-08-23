import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // ---- StatGyan domain ----
    quizzes: defineTable({
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      category: v.string(),
      domain: v.optional(v.string()), // competency domain this quiz trains/assesses
      difficulty: v.union(
        v.literal("Easy"),
        v.literal("Medium"),
        v.literal("Hard"),
      ),
      estMinutes: v.number(),
    })
      .index("by_slug", ["slug"])
      .index("by_category", ["category"]),

    questions: defineTable({
      quizId: v.id("quizzes"),
      order: v.number(),
      text: v.string(),
      options: v.array(v.string()),
      correctIndex: v.number(),
      explanation: v.string(),
      domain: v.optional(v.string()),
      sourceRef: v.optional(v.string()),
    }).index("by_quiz", ["quizId"]),

    attempts: defineTable({
      userId: v.id("users"),
      userName: v.optional(v.string()),
      quizId: v.optional(v.id("quizzes")),
      assessmentId: v.optional(v.id("assessments")),
      quizSlug: v.string(),
      quizTitle: v.string(),
      category: v.string(),
      answers: v.array(v.number()),
      total: v.number(),
      correctCount: v.number(),
      scorePct: v.number(),
      durationMs: v.number(),
      completedAt: v.number(),
      impactApplied: v.optional(v.boolean()), // competency deltas applied exactly once
    })
      .index("by_user", ["userId"])
      .index("by_quiz", ["quizId"])
      .index("by_score", ["scorePct"]),

    // ---- StatGyan learner profile & competency state ----
    profiles: defineTable({
      userId: v.id("users"),
      fullName: v.optional(v.string()),
      roleTitle: v.optional(v.string()),
      department: v.optional(v.string()),
      experience: v.optional(v.string()),
      primaryDomain: v.optional(v.string()),
      secondaryDomains: v.array(v.string()),
      responsibilities: v.optional(v.string()),
      goals: v.optional(v.string()),
      onboarded: v.boolean(),
      completedModules: v.optional(v.array(v.string())), // domainIds of finished learning-path steps
      competencies: v.array(
        v.object({ id: v.string(), score: v.number(), target: v.number() }),
      ),
    }).index("by_user", ["userId"]),

    materials: defineTable({
      userId: v.id("users"),
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
      pages: v.optional(v.number()), // real page count when the parser provides one
      text: v.optional(v.string()), // persisted extraction (capped) — powers grounded MCQ generation
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    assessments: defineTable({
      userId: v.id("users"),
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
      createdAt: v.number(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
