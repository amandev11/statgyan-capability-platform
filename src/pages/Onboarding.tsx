import { PageBackdrop, Wordmark } from "@/components/quiza/nav";
import {
  DEPARTMENTS,
  DOMAINS,
  EXPERIENCE_BANDS,
  ROLES,
  baselineFor,
} from "@/lib/statgyan/engine";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useMemo, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Onboarding() {
  const upsert = useMutation(api.quiza.upsertProfile);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [roleId, setRoleId] = useState(ROLES[0].id);
  const [experience, setExperience] = useState(EXPERIENCE_BANDS[1]);
  const [primaryDomain, setPrimaryDomain] = useState(DOMAINS[0].id);
  const [secondary, setSecondary] = useState<string[]>([]);
  const [responsibilities, setResponsibilities] = useState("");
  const [goals, setGoals] = useState("");

  const role = ROLES.find((r) => r.id === roleId)!;
  const baseline = useMemo(() => baselineFor(roleId), [roleId]);
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(baseline.map((b) => [b.id, b.score])),
  );

  // When role changes, reset scores to that role's template
  const selectRole = (id: string) => {
    setRoleId(id);
    const next = baselineFor(id);
    setScores(Object.fromEntries(next.map((b) => [b.id, b.score])));
  };

  const toggleSecondary = (id: string) => {
    setSecondary((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(0, 3),
    );
  };

  const finish = async () => {
    setSaving(true);
    try {
      await upsert({
        fullName: fullName || undefined,
        roleTitle: role.title,
        department,
        experience,
        primaryDomain,
        secondaryDomains: secondary,
        responsibilities: responsibilities || undefined,
        goals: goals || undefined,
        competencies: baseline.map((b) => ({
          id: b.id,
          score: scores[b.id] ?? b.score,
          target: b.target,
        })),
      });
      window.location.href = "/dashboard";
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  return (
    <div className="studio-light relative flex min-h-screen flex-col">
      <PageBackdrop />
      <header className="px-5 pt-6 sm:px-8">
        <Wordmark />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-16 pt-10">
        {/* Stepper */}
        <div className="mb-8 flex items-center gap-3" aria-label={`Step ${step + 1} of 3`}>
          {["Your role", "Domains & goals", "Baseline"].map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-3">
              <span
                className={cn(
                  "num grid size-7 shrink-0 place-items-center rounded-lg border text-xs font-semibold",
                  i < step && "border-[var(--qz-accent)]/40 bg-[var(--qz-accent)]/[0.12] text-[var(--qz-accent)]",
                  i === step && "border-white/25 bg-white/[0.08] text-[var(--qz-text)]",
                  i > step && "hairline-faint text-muted-qz",
                )}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className={cn("hidden text-xs font-medium sm:block", i === step ? "text-secondary" : "text-muted-qz")}>
                {label}
              </span>
              {i < 2 && <span className="h-px flex-1 bg-white/[0.07]" />}
            </div>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          {step === 0 && (
            <section aria-label="Your role">
              <h1 className="text-2xl font-semibold tracking-tight">Let's calibrate StatGyan to you.</h1>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Your role and experience shape target proficiency levels and how gaps are prioritised.
              </p>

              <div className="mt-7 space-y-5">
                <Field label="Full name">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm outline-none placeholder:text-muted-qz focus-visible:border-[var(--qz-accent)]/50"
                  />
                </Field>
                <Field label="Department / organisation">
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className={selectCls}>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Role">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => selectRole(r.id)}
                        aria-pressed={roleId === r.id}
                        className={cn(
                          "rounded-xl border p-3.5 text-left transition-all duration-200",
                          roleId === r.id
                            ? "edge-glow border-[var(--qz-accent)]/40 bg-[var(--qz-accent)]/[0.09]"
                            : "hairline bg-white/[0.02] hover:bg-white/[0.05]",
                        )}
                      >
                        <span className="block text-sm font-medium">{r.title}</span>
                        <span className="mt-0.5 block text-xs text-muted-qz">{r.blurb}</span>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Years of experience">
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_BANDS.map((band) => (
                      <button
                        key={band}
                        onClick={() => setExperience(band)}
                        aria-pressed={experience === band}
                        className={cn(
                          "h-9 rounded-full border px-4 text-[13px] font-medium transition-colors",
                          experience === band
                            ? "border-[var(--qz-accent)]/40 bg-[var(--qz-accent)]/[0.12]"
                            : "hairline bg-white/[0.02] text-muted-qz hover:text-secondary",
                        )}
                      >
                        {band}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </section>
          )}

          {step === 1 && (
            <section aria-label="Domains and goals">
              <h1 className="text-2xl font-semibold tracking-tight">Where do you work?</h1>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Gaps in your primary domain are prioritised highest in recommendations.
              </p>

              <div className="mt-7 space-y-6">
                <Field label="Primary statistical domain">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {DOMAINS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setPrimaryDomain(d.id)}
                        aria-pressed={primaryDomain === d.id}
                        className={cn(
                          "rounded-xl border p-3 text-left transition-all duration-200",
                          primaryDomain === d.id
                            ? "edge-glow border-[var(--qz-accent)]/40 bg-[var(--qz-accent)]/[0.09]"
                            : "hairline bg-white/[0.02] hover:bg-white/[0.05]",
                        )}
                      >
                        <span className="block text-[13px] font-medium">{d.name}</span>
                        <span className="mt-0.5 block text-xs text-muted-qz">{d.tagline}</span>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Secondary domains (up to three)">
                  <div className="flex flex-wrap gap-2">
                    {DOMAINS.filter((d) => d.id !== primaryDomain).map((d) => (
                      <button
                        key={d.id}
                        onClick={() => toggleSecondary(d.id)}
                        aria-pressed={secondary.includes(d.id)}
                        className={cn(
                          "h-9 rounded-full border px-4 text-[13px] font-medium transition-colors",
                          secondary.includes(d.id)
                            ? "border-[var(--qz-accent)]/40 bg-[var(--qz-accent)]/[0.12]"
                            : "hairline bg-white/[0.02] text-muted-qz hover:text-secondary",
                        )}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Current responsibilities" hint="Optional — sharpens AI explanations">
                  <textarea
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    rows={2}
                    placeholder="e.g. Supervise NSS round fieldwork; review tables before release"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm outline-none placeholder:text-muted-qz focus-visible:border-[var(--qz-accent)]/50"
                  />
                </Field>
                <Field label="Learning goals" hint="Optional">
                  <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    rows={2}
                    placeholder="e.g. Strengthen sampling practice; automate validation with Python"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm outline-none placeholder:text-muted-qz focus-visible:border-[var(--qz-accent)]/50"
                  />
                </Field>
              </div>
            </section>
          )}

          {step === 2 && (
            <section aria-label="Baseline calibration">
              <h1 className="text-2xl font-semibold tracking-tight">Set your starting profile.</h1>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Pre-filled for a {role.title}. Adjust anything that feels off — every future assessment refines these numbers.
              </p>

              <div className="edge-glow mt-7 space-y-5 rounded-2xl border hairline bg-[var(--qz-surface-1)] p-6">
                {baseline.map((b) => (
                  <div key={b.id}>
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-[13px] font-medium">{DOMAINS.find((d) => d.id === b.id)?.name}</span>
                      <span className="num text-xs text-muted-qz">
                        <span className="text-sm font-semibold text-[var(--qz-text)]">{scores[b.id]}</span> / target {b.target}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={95}
                      value={scores[b.id]}
                      onChange={(e) => setScores((s) => ({ ...s, [b.id]: Number(e.target.value) }))}
                      aria-label={`${DOMAINS.find((d) => d.id === b.id)?.name} self-assessment`}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-[var(--qz-accent)]"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-qz">
                Baselines are self-assessed starting estimates — the first assessment replaces them with evidence-based scores.
              </p>
            </section>
          )}
        </motion.div>

        {/* Nav buttons */}
        <div className="mt-9 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-medium",
              step === 0 ? "pointer-events-none opacity-0" : "text-muted-qz hover:text-secondary",
            )}
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          {step < 2 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              data-cursor="hover"
              className="btn-specular inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold"
            >
              Continue <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={() => void finish()}
              disabled={saving}
              data-cursor="hover"
              className="btn-specular inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Building your profile…" : "Build my competency profile"}
              {!saving && <ArrowRight className="size-4" />}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-baseline gap-2 text-[13px] font-medium text-secondary">
        {label}
        {hint && <span className="text-[11px] font-normal text-muted-qz">· {hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

const selectCls =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-[var(--qz-text)] outline-none focus-visible:border-[var(--qz-accent)]/50 [&>option]:bg-[var(--qz-surface-2)]";
