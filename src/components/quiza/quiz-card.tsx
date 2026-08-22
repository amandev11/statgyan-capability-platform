import { DifficultyBadge } from "@/components/quiza/primitives";
import { cn } from "@/lib/utils";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";

export interface QuizCardData {
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estMinutes: number;
  questionCount?: number;
  attemptCount?: number;
  myBest?: number;
}

export function QuizCard({ quiz, className }: { quiz: QuizCardData; className?: string }) {
  return (
    <Link
      to={`/quiz/${quiz.slug}`}
      data-cursor="hover"
      className={cn(
        "group edge-glow edge-glow-hover relative flex flex-col rounded-xl border hairline bg-[var(--qz-surface-1)] p-5",
        "transition-[transform,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-[var(--qz-surface-2)]",
        "focus-visible:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">{quiz.category}</span>
        <ArrowUpRight className="size-4 text-muted-qz transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--qz-accent)]" />
      </div>

      <h3 className="mt-3 text-[15px] font-semibold leading-snug tracking-tight text-[var(--qz-text)]">
        {quiz.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-secondary">
        {quiz.description}
      </p>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <DifficultyBadge difficulty={quiz.difficulty} />
        <span className="num text-xs text-muted-qz">
          {quiz.questionCount ?? "—"} Q · ~{quiz.estMinutes} min
        </span>
        {typeof quiz.myBest === "number" && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-emerald-300/90">
            <CheckCircle2 className="size-3" />
            Best {quiz.myBest}%
          </span>
        )}
      </div>
    </Link>
  );
}
