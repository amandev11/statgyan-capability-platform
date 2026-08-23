import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Flag, RotateCcw, Route, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

/**
 * The golden demo path — ordered so a judge experiences the full
 * ASSESS → ANALYSE → RECOMMEND → LEARN → GENERATE → TEST → UPDATE loop,
 * plus organisational insight, in roughly three minutes.
 */
const STEPS: { label: string; to: string; note: string }[] = [
  { label: "1 · Competency baseline", to: "/onboarding", note: "Set role & domains — or skip ahead" },
  { label: "2 · Capability map & gaps", to: "/competency", note: "AI gap report with reasoning" },
  { label: "3 · Take an assessment", to: "/assess", note: "Domain-tagged statistical rounds" },
  { label: "4 · Results → competency update", to: "/dashboard", note: "Score feeds your profile" },
  { label: "5 · Personalised learning path", to: "/learning", note: "Every module explains its why" },
  { label: "6 · iGOT Karmayogi", to: "/igot", note: "Adapter layer — demo mode, honestly labelled" },
  { label: "7 · Upload learning material", to: "/materials", note: "Document intelligence pipeline" },
  { label: "8 · Generate MCQs", to: "/generate", note: "Grounded, source-traced questions" },
  { label: "9 · Organisational insights", to: "/admin", note: "Department × competency heatmap" },
];

const STORAGE_KEY = "statgyan-demo-progress-v1";

function loadVisited(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function JudgeMode() {
  const [open, setOpen] = useState(false);
  const [stored, setStored] = useState<string[]>(loadVisited);
  const navigate = useNavigate();
  const location = useLocation();

  // Which golden-path stage does the current route belong to?
  const currentStage = STEPS.find((s) =>
    s.to === "/onboarding"
      ? location.pathname === "/onboarding"
      : location.pathname.startsWith(s.to),
  );

  // Visited = persisted stages + wherever the judge currently is.
  const visited = useMemo(() => {
    const set = new Set(stored);
    if (currentStage) set.add(currentStage.to);
    return [...set];
  }, [stored, currentStage]);

  // Persist newly visited stages.
  useEffect(() => {
    if (!currentStage) return;
    const prev = loadVisited();
    if (prev.includes(currentStage.to)) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, currentStage.to]));
    } catch {
      /* storage unavailable — progress simply won't persist */
    }
  }, [currentStage]);

  const doneCount = STEPS.filter((s) => visited.includes(s.to)).length;
  const pct = Math.round((doneCount / STEPS.length) * 100);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="btn-specular fixed bottom-[5.75rem] right-4 z-50 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold md:bottom-6 md:right-6"
      >
        <Route className="size-3.5" />
        Demo guide
        {!open && doneCount > 0 && (
          <span className="num rounded-full bg-white/[0.14] px-1.5 py-px text-[10px] tabular-nums">
            {doneCount}/{STEPS.length}
          </span>
        )}
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

            {/* Progress */}
            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-qz">
                <span>
                  {doneCount === 0
                    ? "Full journey in ≈3 minutes"
                    : doneCount === STEPS.length
                      ? "Complete loop demonstrated ✓"
                      : `${doneCount} of ${STEPS.length} stages visited`}
                </span>
                {doneCount > 0 && (
                  <button
                    onClick={() => {
                      setStored([]);
                      try {
                        localStorage.removeItem(STORAGE_KEY);
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="inline-flex items-center gap-1 transition-colors hover:text-secondary"
                  >
                    <RotateCcw className="size-3" /> Reset
                  </button>
                )}
              </div>
              <div
                className="h-0.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Demo journey progress"
              >
                <div
                  className="h-full rounded-full bg-[var(--qz-accent)] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <ol className="space-y-0.5">
              {STEPS.map((step) => {
                const isDone = visited.includes(step.to);
                return (
                  <li key={step.to}>
                    <button
                      onClick={() => go(step.to)}
                      className={cn(
                        "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left",
                        "transition-colors duration-150 hover:bg-white/[0.05]",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-4 shrink-0 place-items-center rounded-full border transition-colors duration-200",
                          isDone
                            ? "border-transparent bg-[var(--qz-accent)] text-[#07090c]"
                            : "border-white/[0.16]",
                        )}
                      >
                        {isDone && <Check className="size-2.5" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-[13px] font-medium",
                            isDone && "text-secondary",
                          )}
                        >
                          {step.label}
                        </span>
                        <span className="block truncate text-[11px] text-muted-qz">{step.note}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <p className="mt-3 border-t hairline-faint pt-2.5 text-[10.5px] leading-relaxed text-muted-qz">
              Assess → analyse → recommend → learn → generate → test → update — every stage is
              live on real data. iGOT and organisational figures are clearly labelled demos.
            </p>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
