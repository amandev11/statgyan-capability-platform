import { PageContainer, SkeletonBlock } from "@/components/quiza/primitives";
import { QuizCard } from "@/components/quiza/quiz-card";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get("category") ?? "All";
  const quizzes = useQuery(api.quiza.listQuizzes);
  const { isAuthenticated } = useAuth();

  const categories = useMemo(
    () => ["All", ...new Set((quizzes ?? []).map((q) => q.category))],
    [quizzes],
  );

  const filtered =
    active === "All"
      ? (quizzes ?? [])
      : (quizzes ?? []).filter((q) => q.category === active);

  const select = (category: string) => {
    setSearchParams(category === "All" ? {} : { category }, { replace: true });
  };

  return (
    <PageContainer width="wide">
      <div className="max-w-xl">
        <p className="eyebrow mb-2">Assessments</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Evidence for your competency profile.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          {isAuthenticated
            ? "Domain-tagged rounds feed the gap engine — every result updates your capability map and learning path."
            : "Sign in to keep score — or browse freely."}
        </p>
      </div>

      {/* Subject filter */}
      <div className="hide-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => select(category)}
            aria-pressed={active === category}
            className={cn(
              "h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium transition-all duration-200",
              active === category
                ? "border-[var(--qz-accent)]/40 bg-[var(--qz-accent)]/[0.12] text-[var(--qz-text)]"
                : "hairline bg-white/[0.02] text-muted-qz hover:bg-white/[0.05] hover:text-secondary",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      {quizzes === undefined ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonBlock key={i} className="h-44" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 rounded-2xl border hairline-faint border-dashed px-6 py-16 text-center">
          <Compass className="mx-auto size-6 text-muted-qz" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-medium text-secondary">Nothing in this shelf yet.</p>
          <p className="mt-1 text-xs text-muted-qz">Try another subject.</p>
        </div>
      ) : (
        <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((quiz, i) => (
            <motion.div
              key={quiz._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
            >
              <QuizCard quiz={quiz} className="h-full" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageContainer>
  );
}
