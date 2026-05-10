"use client";

import { useEffect, useState } from "react";
import { getSimulatedTypingMs } from "@/lib/deliberation-pacing";
import type { AgentName, AgentResponse } from "@/lib/types";
import { AgentGlyph } from "./AgentGlyph";

type ChatTurnProps = {
  agent: AgentResponse;
  phase: "opening" | "rebuttal";
  simulateTyping?: boolean;
};

const SIDE_BY_AGENT: Record<AgentName, "left" | "right"> = {
  Strategist: "left",
  Skeptic: "right",
  Operator: "left",
  Psychologist: "right",
};

const ACCENT: Record<
  AgentName,
  { bubble: string; avatar: string; name: string; tag: string; caret: string }
> = {
  Strategist: {
    bubble: "border-amber-200/80",
    avatar: "border-amber-300 bg-amber-50 text-amber-600",
    name: "text-amber-700",
    tag: "bg-amber-50 text-amber-700",
    caret: "bg-amber-500",
  },
  Skeptic: {
    bubble: "border-red-200/80",
    avatar: "border-red-300 bg-red-50 text-red-600",
    name: "text-red-700",
    tag: "bg-red-50 text-red-700",
    caret: "bg-red-500",
  },
  Operator: {
    bubble: "border-blue-200/80",
    avatar: "border-blue-300 bg-blue-50 text-blue-600",
    name: "text-blue-700",
    tag: "bg-blue-50 text-blue-700",
    caret: "bg-blue-500",
  },
  Psychologist: {
    bubble: "border-emerald-200/80",
    avatar: "border-emerald-300 bg-emerald-50 text-emerald-600",
    name: "text-emerald-700",
    tag: "bg-emerald-50 text-emerald-700",
    caret: "bg-emerald-500",
  },
};

export function ChatTurn({
  agent,
  phase,
  simulateTyping = true,
}: ChatTurnProps) {
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

  const side = SIDE_BY_AGENT[agent.name];
  const accent = ACCENT[agent.name];
  const isLeft = side === "left";

  return (
    <article
      className={`flex w-full max-w-[min(100%,44rem)] gap-3 opacity-0 animate-[fadeIn_400ms_ease-out_forwards] ${
        isLeft ? "mr-auto flex-row" : "ml-auto flex-row-reverse"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${accent.avatar}`}
      >
        <AgentGlyph name={agent.name} className="h-6 w-6" />
      </div>
      <div
        className={`min-w-0 flex-1 rounded-2xl border bg-white px-4 py-3 shadow-sm ${accent.bubble} ${
          isLeft ? "rounded-tl-md" : "rounded-tr-md"
        }`}
      >
        <div
          className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${
            isLeft ? "justify-start" : "justify-end"
          }`}
        >
          <h3
            className={`font-mono text-[11px] font-semibold uppercase tracking-[0.18em] ${accent.name}`}
          >
            {agent.name}
          </h3>
          <p className="text-[11px] text-slate-500">{agent.role}</p>
          {phase === "rebuttal" ? (
            <span
              className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.16em] ${accent.tag}`}
            >
              reply
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
          {visibleText}
          {showCaret ? (
            <span
              className={`ml-0.5 inline-block h-4 w-[2px] animate-pulse align-middle ${accent.caret}`}
            />
          ) : null}
        </p>
      </div>
    </article>
  );
}
