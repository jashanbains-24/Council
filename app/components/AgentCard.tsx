import { useEffect, useState } from "react";
import { getSimulatedTypingMs } from "@/lib/deliberation-pacing";
import type { AgentName, AgentResponse } from "@/lib/types";
import { AgentGlyph } from "./AgentGlyph";
import { AgentSignalMeter } from "./AgentSignalMeter";

type AgentCardProps = {
  agent: AgentResponse;
  index: number;
  phase: "opening" | "rebuttal";
  rebuttalSlot?: number;
  simulateTyping?: boolean;
};

const borderByAgent: Record<AgentName, string> = {
  Strategist: "border-amber-400",
  Skeptic: "border-red-400",
  Operator: "border-blue-400",
  Psychologist: "border-emerald-400",
};

const glyphTone: Record<AgentName, string> = {
  Strategist: "text-amber-600",
  Skeptic: "text-red-600",
  Operator: "text-blue-600",
  Psychologist: "text-emerald-600",
};

export function AgentCard({
  agent,
  index,
  phase,
  rebuttalSlot = 0,
  simulateTyping = true,
}: AgentCardProps) {
  const full = agent.response;
  const [visibleText, setVisibleText] = useState(() =>
    simulateTyping ? "" : full,
  );
  const [showCaret, setShowCaret] = useState(simulateTyping);

  useEffect(() => {
    if (!simulateTyping) {
      setVisibleText(full);
      setShowCaret(false);
      return;
    }

    setVisibleText("");
    setShowCaret(true);
    const durationMs = getSimulatedTypingMs(full);
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const n = Math.max(0, Math.round(p * full.length));
      setVisibleText(full.slice(0, n));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setShowCaret(false);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [full, simulateTyping]);

  const label =
    phase === "opening"
      ? `I-${String(index + 1).padStart(2, "0")}`
      : `II-${String(rebuttalSlot + 1).padStart(2, "0")}`;

  if (phase === "opening") {
    return (
      <article
        className={`grid gap-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-council opacity-0 animate-[fadeIn_400ms_ease-out_forwards] sm:grid-cols-[5.5rem_1fr] sm:gap-6 ${borderByAgent[agent.name]} border-t-[3px]`}
        style={{ animationDelay: `${index * 120}ms` }}
      >
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <div
            className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 ${glyphTone[agent.name]}`}
          >
            <div className="absolute inset-1 rounded-lg border border-slate-200/60" />
            <AgentGlyph name={agent.name} className="h-11 w-11" />
          </div>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
            {label}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
                {agent.name}
              </h3>
              <p className="mt-1 text-xs text-slate-600">{agent.role}</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] font-medium text-slate-600">
              opening position
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-700">
            {visibleText}
            {showCaret ? (
              <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-slate-400 align-middle" />
            ) : null}
          </p>
        </div>
      </article>
    );
  }

  const alignRight = rebuttalSlot % 2 === 1;

  return (
    <article
      className={`flex max-w-[min(100%,42rem)] opacity-0 animate-[fadeIn_400ms_ease-out_forwards] ${
        alignRight ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
      } gap-4`}
      style={{ animationDelay: `${rebuttalSlot * 100}ms` }}
    >
      <div
        className={`flex w-14 shrink-0 flex-col items-center gap-2 pt-1 ${glyphTone[agent.name]}`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <AgentGlyph name={agent.name} className="h-9 w-9" />
        </div>
        <AgentSignalMeter name={agent.name} />
        <span className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">
          {label}
        </span>
      </div>
      <div
        className={`min-w-0 flex-1 border border-slate-200/90 bg-white px-4 py-4 shadow-sm ${
          alignRight ? "rounded-2xl rounded-tr-md" : "rounded-2xl rounded-tl-md"
        } ${borderByAgent[agent.name]} border-b-[3px]`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
              {agent.name}
            </h3>
            <p className="mt-0.5 text-xs text-slate-600">{agent.role}</p>
          </div>
          <span className="rounded-md bg-cyan-50 px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-cyan-800">
            cross-fire reply
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          {visibleText}
          {showCaret ? (
            <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-cyan-500 align-middle" />
          ) : null}
        </p>
      </div>
    </article>
  );
}
