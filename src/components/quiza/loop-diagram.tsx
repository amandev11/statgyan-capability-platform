import { prefersReducedMotion } from "@/components/quiza/primitives";
import { motion } from "framer-motion";

const STAGES = [
  { label: "Assess", note: "domain-tagged assessment" },
  { label: "Competency map", note: "8 statistical dimensions" },
  { label: "Gap detection", note: "explainable priority scoring" },
  { label: "Personalized path", note: "sequenced by leverage" },
  { label: "Learn", note: "iGOT-mapped modules" },
  { label: "AI assessment", note: "generated from material" },
  { label: "Improvement", note: "profile updated, loop repeats" },
];

/**
 * Vertical system diagram with a restrained travelling light along the rail.
 * Communicates the product's core innovation without decoration.
 */
export function LoopDiagram() {
  const reduced = prefersReducedMotion();
  return (
    <div className="relative mx-auto w-full max-w-md" role="img" aria-label="StatGyan loop: assess, map competencies, detect gaps, personalize path, learn, generate AI assessment, improve">
      {/* rail */}
      <span aria-hidden className="absolute bottom-5 left-[11px] top-5 w-px bg-gradient-to-b from-[var(--qz-accent)]/40 via-white/[0.08] to-emerald-300/30" />
      {/* travelling pulse */}
      {!reduced && (
        <motion.span
          aria-hidden
          className="absolute left-[8px] size-[7px] rounded-full bg-[var(--qz-accent)] shadow-[0_0_12px_2px_rgba(108,140,255,0.55)]"
          animate={{ top: ["6%", "94%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: [0.22, 1, 0.36, 1], times: [0, 0.12, 0.88, 1] }}
        />
      )}

      <ol className="space-y-3">
        {STAGES.map((stage, i) => (
          <motion.li
            key={stage.label}
            initial={reduced ? false : { opacity: 0, x: 14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center gap-4 pl-0"
          >
            {/* node dot */}
            <span
              aria-hidden
              className={`z-10 grid size-[23px] shrink-0 place-items-center rounded-full border ${
                i === 0 || i === STAGES.length - 1
                  ? "border-[var(--qz-accent)]/50 bg-[var(--qz-accent)]/[0.14]"
                  : "border-white/[0.12] bg-[var(--qz-surface-2)]"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  i === 0 || i === STAGES.length - 1 ? "bg-[var(--qz-accent)]" : "bg-white/40"
                }`}
              />
            </span>
            <span className="edge-glow flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border hairline bg-[var(--qz-surface-1)] px-4 py-2.5">
              <span className="text-[13px] font-medium text-[var(--qz-text)]">{stage.label}</span>
              <span className="truncate text-[10px] tracking-wide text-muted-qz">{stage.note}</span>
            </span>
          </motion.li>
        ))}
      </ol>

      {/* loop-back hint */}
      <p className="mt-4 pl-9 text-[10px] tracking-[0.14em] text-muted-qz uppercase">
        ↺ improvement feeds the next assessment
      </p>
    </div>
  );
}
