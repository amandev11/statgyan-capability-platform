import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface Stage {
  id: number;
  label: string;
  route: string;
  narration: string;
}

const STAGES: Stage[] = [
  {
    id: 1,
    label: "Overview",
    route: "/dashboard",
    narration: "Start at capability, not course completions. This isn't an LMS — it quantifies what people can actually do.",
  },
  {
    id: 2,
    label: "Competency Profile",
    route: "/dashboard/competencies",
    narration: "Each competency carries a score, target and AI confidence — with the evidence behind it.",
  },
  {
    id: 3,
    label: "Skill-Gap Detection",
    route: "/dashboard/gaps",
    narration: "The Priority Score ranks gaps by impact — role relevance × importance × confidence, not raw scores.",
  },
  {
    id: 4,
    label: "Upload Material",
    route: "/dashboard/materials?sample=1",
    narration: "Give the AI a training PDF. It extracts topics, maps competencies and builds an assessment blueprint.",
  },
  {
    id: 5,
    label: "AI Quiz Generation",
    route: "/dashboard/quiz-lab?autogen=1",
    narration: "One click generates grounded MCQs with explanations and source references from the uploaded material.",
  },
  {
    id: 6,
    label: "Adaptive Assessment",
    route: "/dashboard/assessments",
    narration: "The learner takes the assessment. Difficulty adapts; confidence ratings separate knowledge gaps from confidence gaps.",
  },
  {
    id: 7,
    label: "iGOT Recommendations",
    route: "/dashboard/igot",
    narration: "Detected gaps map to relevant iGOT Karmayogi courses with explainable match scores.",
  },
  {
    id: 8,
    label: "Command Center",
    route: "/dashboard/admin",
    narration: "At organisational level, leaders see where capability investment matters most — and simulate training impact.",
  },
];

export function DemoMode({ onExit }: { onExit: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();
  const stage = STAGES[stepIndex];

  useEffect(() => {
    navigate(stage.route);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 260 }}
        className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl sm:inset-x-6"
      >
        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-indigo-600 p-2 text-white shadow-md shadow-indigo-600/30">
              <Clapperboard className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">
                  AI Capability Demo — Stage {stage.id}/8
                </p>
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  {stage.label}
                </span>
              </div>
              <p className="mt-1 text-sm leading-snug text-muted-foreground">
                {stage.narration}
              </p>
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-900/10">
                <motion.div
                  className="h-full rounded-full bg-indigo-500"
                  animate={{ width: `${((stepIndex + 1) / STAGES.length) * 100}%` }}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={onExit}
              aria-label="Exit demo mode"
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1" role="tablist" aria-label="Demo stages">
              {STAGES.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === stepIndex}
                  aria-label={s.label}
                  onClick={() => setStepIndex(i)}
                  className={cn(
                    "h-1.5 w-5 rounded-full transition-colors",
                    i === stepIndex
                      ? "bg-indigo-600"
                      : i < stepIndex
                        ? "bg-indigo-300"
                        : "bg-slate-900/15",
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={stepIndex === 0}
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft className="size-4" /> Back
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  stepIndex === STAGES.length - 1
                    ? onExit()
                    : setStepIndex((i) => i + 1)
                }
              >
                {stepIndex === STAGES.length - 1 ? "Finish" : "Next stage"}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
