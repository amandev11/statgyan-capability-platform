import { AiLabel, GlassCard, PageHeader } from "@/components/statgyan/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COMPETENCY_MAP } from "@/lib/statgyan/data";
import { ai } from "@/lib/statgyan/ai";
import { useStatgyan } from "@/lib/statgyan/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Brain, CornerDownLeft, Send, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

interface Msg {
  role: "user" | "ai";
  content: string;
  suggestions?: string[];
}

const MODES = [
  { id: "explain", label: "Explain" },
  { id: "teach", label: "Teach Me" },
  { id: "quiz", label: "Quiz Me" },
  { id: "example", label: "Give an Example" },
  { id: "challenge", label: "Challenge Me" },
  { id: "summarize", label: "Summarize" },
];

const STARTERS = [
  "Why is Data Quality a priority for my role?",
  "Explain stratified sampling",
  "How do I reduce non-response bias?",
  "What is a design effect?",
  "How should I automate validation checks?",
];

export default function Tutor() {
  const { skillGaps, profile, competencies } = useStatgyan();
  const [mode, setMode] = useState("explain");
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      content: `Hello ${profile.name.split(" ")[0]} — I'm StatGPT, your competency-aware tutor. I answer from your uploaded materials, your assessment evidence and the official statistics body of knowledge. Ask a question, or pick a mode: I can teach step by step, quiz you, or challenge your reasoning.`,
      suggestions: STARTERS.slice(0, 3),
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const topGap = skillGaps[0];

  const send = (text: string) => {
    const question = text.trim();
    if (!question || thinking) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: question }]);
    setThinking(true);
    setTimeout(() => {
      const { content, suggestions } = ai.tutorRespond(mode, question);
      let final = content;
      // Contextual tie-in to the learner's live profile
      if (topGap && question.toLowerCase().includes(topGap.competencyId.split("-")[1] ?? "zzz")) {
        final += `\n\n📌 Note: this is also your highest-priority gap right now (${COMPETENCY_MAP[topGap.competencyId]?.name}, ${competencies.find((c) => c.competencyId === topGap.competencyId)?.score}% vs target ${topGap.target}%). A focused module is on your learning path.`;
      }
      setMessages((m) => [...m, { role: "ai", content: final, suggestions }]);
      setThinking(false);
      requestAnimationFrame(() =>
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }),
      );
    }, 900);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Personalized AI Tutor"
        title="Ask StatGPT"
        subtitle="Grounded in your learning materials, competency profile and current learning path — with modes for how you want to learn."
      />

      {/* Mode selector */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tutor modes">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
              mode === m.id
                ? "border-indigo-300 bg-indigo-100/90 text-indigo-800 shadow-sm"
                : "border-white/80 bg-white/60 text-slate-500 hover:bg-white",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chat */}
      <GlassCard className="flex h-[62vh] min-h-[420px] flex-col overflow-hidden">
        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" && "justify-end")}>
              {msg.role === "ai" && (
                <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow">
                  <Brain className="size-4" />
                </span>
              )}
              <div className={cn("max-w-[80%]", msg.role === "user" && "order-first")}>
                <div
                  className={cn(
                    "whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "rounded-br-md bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "glass-subtle rounded-bl-md text-slate-800",
                  )}
                >
                  {msg.content}
                </div>
                {msg.suggestions && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-indigo-200 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-3">
              <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow">
                <Sparkles className="size-4 animate-pulse" />
              </span>
              <div className="glass-subtle flex items-center gap-1.5 rounded-2xl rounded-bl-md px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="size-1.5 rounded-full bg-indigo-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-white/70 bg-white/50 p-3 backdrop-blur-xl"
        >
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask StatGPT — mode: ${MODES.find((m) => m.id === mode)?.label}…`}
              className="glass-subtle pr-24"
              aria-label="Message StatGPT"
            />
            <Button type="submit" size="sm" disabled={thinking || !input.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 gap-1">
              <Send className="size-3.5" /> Send
            </Button>
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            <CornerDownLeft className="size-3" /> Responses are AI-generated for demonstration and cite your materials where available. Verify before official use.
          </p>
        </form>
      </GlassCard>

      <AiLabel>Tutor answers draw on your uploaded documents, assessment evidence and the competency framework</AiLabel>
    </div>
  );
}
