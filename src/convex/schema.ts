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

    // ---- Quiza domain ----
    quizzes: defineTable({
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      category: v.string(),
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
    }).index("by_quiz", ["quizId"]),

    attempts: defineTable({
      userId: v.id("users"),
      userName: v.optional(v.string()),
      quizId: v.id("quizzes"),
      quizSlug: v.string(),
      quizTitle: v.string(),
      category: v.string(),
      answers: v.array(v.number()),
      total: v.number(),
      correctCount: v.number(),
      scorePct: v.number(),
      durationMs: v.number(),
      completedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_quiz", ["quizId"])
      .index("by_score", ["scorePct"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
