import { PageContainer, SkeletonBlock } from "@/components/quiza/primitives";
import { api } from "@/convex/_generated/api";
import { analyseGaps } from "@/lib/statgyan/engine";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  BookOpenCheck,
  BrainCircuit,
  HelpCircle,
  Lightbulb,
  Send,
  Route,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

/** Compact grounded knowledge base — production swaps in an LLM service. */
const KB: { keywords: string[]; body: string }[] = [
  {
    keywords: ["stratif", "sampling", "sample size", "cluster", "frame"],
    body: "Stratified sampling divides the frame into internally homogeneous groups and samples within each. Precision improves because between-strata variation no longer contributes to the standard error — the design effect can drop below 1. Choose strata correlated with the study variable (region, farm size, establishment type), keep each stratum's sample proportional unless a domain needs deliberate oversampling, and always carry the stratum variable through to estimation.",
  },
  {
    keywords: ["non-response", "nonresponse", "follow-up", "refusal"],
    body: "Non-response bias appears when respondents differ systematically from non-respondents. Attack it in order: prevention (field protocols, targeted follow-up for low-response strata), then statistical compensation (response propensity weighting or calibration). A response rate alone tells you nothing about bias — compare early vs late responders as a diagnostic.",
  },
  {
    keywords: ["weight", "weighting"],
    body: "Weights restore each respondent's population representation after unequal selection probabilities and differential non-response. Compute design weights first (inverse selection probability), then calibrate to known totals (population by region × sex × age). Always analyse weighted data with design-based variance estimation; treating weights as frequency weights understates uncertainty.",
  },
  {
    keywords: ["outlier", "validation", "edit", "quality check"],
    body: "Treat validation as gates at three stages: capture-time range/consistency edits (impossible values stopped at source), post-collection editing (systematic outliers documented and queried), and output checking (year-on-year discontinuity review). Never delete an outlier silently — winsorise or retain with documentation so estimates stay reproducible.",
  },
  {
    keywords: ["python", "pandas", "sql", "script", "automation"],
    body: "For official statistics work, prefer scripted pipelines over manual spreadsheets: read raw data unchanged, apply validation rules as code, log every transformation, and emit both outputs and a run manifest. In pandas, validate key uniqueness before merges, never bare dropna() without diagnosing missingness, and vectorise row-wise logic for speed.",
  },
  {
    keywords: ["confidential", "disclosure", "privacy", "ethics", "consent"],
    body: "Statistical confidentiality means responses are used only for statistics — never for enforcement or identification of the provider. Practically: suppress cells below thresholds, check secondary suppression so hidden cells can't be re-derived, and for microdata access consider formal privacy methods that bound any single contributor's influence on released outputs.",
  },
  {
    keywords: ["sdg", "indicator", "standard", "mospi", "nso", "classification"],
    body: "Official statistics gain authority from standards: UN Fundamental Principles (impartiality, scientific rigour, equal access), standard classifications (NIC, NSO codes) for comparability, published revision policies balancing timeliness with accuracy, and SDG indicator metadata alignment so national figures aggregate into global monitoring.",
  },
];

function answer(query: string, ctx: { topGap?: string; lastScore?: number }): string {
  const q = query.toLowerCase();
  const entry = KB.find((e) => e.keywords.some((k) => q.includes(k)));
  if (entry) return entry.body;

  if (/why.*wrong|mistake|missed/.test(q)) {
    return ctx.lastScore !== undefined
      ? `From your most recent assessment (${ctx.lastScore}%): misses cluster where questions shift from recall to application — the concept is recognised but not yet applied to unfamiliar scenarios. The fastest correction is working one applied scenario per weak domain, then immediately re-testing with a generated assessment.`
      : "I don't have assessment evidence yet — take an assessment and I can diagnose exactly which application patterns you're missing.";
  }
  if (/what.*(learn|next)|recommend/.test(q)) {
    return ctx.topGap
      ? `Based on your profile, ${ctx.topGap.toLowerCase()} is your largest open gap — your learning path already sequences it first. After completing that module, generate a practice assessment on the same domain to confirm the gain before moving on.`
      : "Complete your onboarding and first assessment, then I can sequence recommendations from real evidence.";
  }
  if (/example/.test(q)) {
    return "Here's a worked example from field conditions: during a household expenditure round, urban migrant settlements show 30% non-response while the rest of the district sits at 8%. Uniform sample increases won't help — the missing units are systematic. Targeted callback protocols convert refusals, then calibration weights reconcile remaining imbalance against known population totals.";
  }
  return `I'm tuned to your learning context — try:\n• "Explain stratified sampling"\n• "Why did I get this wrong?"\n• "What should I learn next?"\n• "How does disclosure control work?"\nTopics I know well: sampling, weighting, non-response, validation, Python workflows, confidentiality, official statistics standards.`;
}

export default function Assistant() {
  const profile = useQuery(api.quiza.myProfile);
  const attempts = useQuery(api.quiza.myAttempts);

  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "assistant",
      content:
        "I'm StatGyan's learning assistant. I know your competency profile, recent assessments, learning path and uploaded materials. Ask me something task-focused.",
    },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (profile === undefined || attempts === undefined) {
    return (
      <PageContainer width="reading">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="mt-8 h-64 rounded-2xl" />
      </PageContainer>
    );
  }

  const gaps = profile
    ? analyseGaps(profile.competencies, {
        primaryDomain: profile.primaryDomain,
        secondaryDomains: profile.secondaryDomains,
      })
    : [];
  const topGap = gaps.find((g) => g.gap >= 6)?.name;
  const lastScore = attempts[0]?.scorePct;

  const send = (text: string) => {
    const query = text.trim();
    if (!query) return;
    setTurns((t) => [...t, { role: "user", content: query }]);
    setInput("");
    // Deterministic demo responder — swap for LLM service behind same signature.
    setTimeout(() => {
      setTurns((t) => [...t, { role: "assistant", content: answer(query, { topGap, lastScore }) }]);
    }, 350);
  };

  const QUICK = [
    { icon: HelpCircle, label: "Why did I get this wrong?", q: "Why did I get this wrong?" },
    { icon: Route, label: "What should I learn next?", q: "What should I learn next?" },
    { icon: BookOpenCheck, label: "Explain stratified sampling", q: "Explain stratified sampling" },
    { icon: Lightbulb, label: "Give me an example", q: "Give me an example" },
  ];

  return (
    <PageContainer width="reading">
      <div className="max-w-xl">
        <p className="eyebrow mb-2">AI assistant</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ask StatGyan</h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Task-focused coaching grounded in your profile — not a general chatbot.
        </p>
      </div>

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        {QUICK.map((a) => (
          <button
            key={a.label}
            onClick={() => send(a.q)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border hairline bg-white/[0.02] px-3.5 text-xs font-medium text-secondary transition-colors hover:border-[var(--qz-accent)]/40 hover:text-[var(--qz-text)]"
          >
            <a.icon className="size-3 text-[var(--qz-accent)]" /> {a.label}
          </button>
        ))}
      </div>

      {/* Conversation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="edge-glow mt-5 flex min-h-[22rem] flex-col rounded-2xl border hairline bg-[var(--qz-surface-1)] p-5"
        aria-live="polite"
      >
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {turns.map((t, i) => (
            <div key={i} className={`flex gap-3 ${t.role === "user" ? "justify-end" : ""}`}>
              {t.role === "assistant" && (
                <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--qz-accent)]/25 bg-[var(--qz-accent)]/[0.08]">
                  <BrainCircuit className="size-3.5 text-[var(--qz-accent)]" />
                </span>
              )}
              <p
                className={`max-w-[85%] whitespace-pre-line rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
                  t.role === "user"
                    ? "rounded-br-sm bg-[var(--qz-accent)]/[0.14] text-[var(--qz-text)]"
                    : "rounded-bl-sm border hairline-faint bg-white/[0.02] text-secondary"
                }`}
              >
                {t.content}
              </p>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
            inputRef.current?.focus();
          }}
          className="mt-4 flex gap-2 border-t hairline-faint pt-4"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a concept, your results, or what to learn…"
            aria-label="Message"
            className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none placeholder:text-muted-qz focus-visible:border-[var(--qz-accent)]/50"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send"
            data-cursor="hover"
            className="btn-specular grid size-11 place-items-center rounded-xl disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </form>
      </motion.div>

      {/* Context chips */}
      <section className="mt-6 pb-10 text-xs text-muted-qz">
        <p className="eyebrow mb-2">Context I'm using</p>
        <div className="flex flex-wrap gap-2">
          <Chip>{profile?.roleTitle ?? "Learner"}</Chip>
          {topGap && <Chip>Largest gap: {topGap}</Chip>}
          {lastScore !== undefined && <Chip>Last assessment: {lastScore}%</Chip>}
          <Link to="/materials" className="inline-flex items-center rounded-full border hairline-faint bg-white/[0.03] px-2.5 py-1 font-medium transition-colors hover:text-secondary">
            Your uploaded materials →
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border hairline-faint bg-white/[0.03] px-2.5 py-1 font-medium text-secondary">
      {children}
    </span>
  );
}
