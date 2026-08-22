import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Flag, Route, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const STEPS: { label: string; to: string; note: string }[] = [
  { label: "1 · Competency profile", to: "/competency", note: "Capability map & gap report" },
  { label: "2 · Take an assessment", to: "/assess", note: "Domain-tagged statistical quizzes" },
  { label: "3 · Results → competency update", to: "/dashboard", note: "AI impact analysis after scoring" },
  { label: "4 · Personalised learning path", to: "/learning", note: "Explainable recommendations" },
  { label: "5 · iGOT Karmayogi", to: "/igot", note: "Integration adapter (demo mode)" },
  { label: "6 · Upload learning material", to: "/materials", note: "Document intelligence pipeline" },
  { label: "7 · Generate MCQs", to: "/generate", note: "Grounded, source-traced questions" },
  { label: "8 · AI assistant", to: "/assistant", note: "Task-focused coaching" },
  { label: "9 · Admin analytics", to: "/admin", note: "Organisational heatmap" },
];

export function JudgeMode() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="btn-specular fixed bottom-[5.75rem] right-4 z-50 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold md:bottom-6 md:right-6"
      >
        <Route className="size-3.5" />
        Demo guide
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Guided demo tour"
            className="glass-bar fixed bottom-[9rem] right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-4 md:bottom-20 md:right-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Flag className="size-4 text-[var(--qz-accent)]" />
                The StatGyan loop
              </p>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-qz hover:bg-white/[0.06] hover:text-secondary"
                aria-label="Close demo guide"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-secondary">
              Assess → analyse gaps → recommend → learn → generate assessment → test
              → update competency. Follow the loop in order:
            </p>
            <ol className="space-y-1">
              {STEPS.map((step) => (
                <li key={step.to}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate(step.to);
                    }}
                    className={cn(
                      "group flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left",
                      "transition-colors duration-150 hover:bg-white/[0.05]",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium">{step.label}</span>
                      <span className="block truncate text-[11px] text-muted-qz">{step.note}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
