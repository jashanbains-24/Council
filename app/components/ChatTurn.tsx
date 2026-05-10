"use client";

import { useEffect, useState } from "react";
import { getSimulatedTypingMs } from "@/lib/deliberation-pacing";
import type { AgentName, AgentResponse } from "@/lib/types";

type ChatTurnProps = {
  agent: AgentResponse;
  phase: "opening" | "rebuttal";
  index: number;
  total: number;
  simulateTyping?: boolean;
};

const ACCENT: Record<AgentName, string> = {
  Strategist: "#c9a449",
  Skeptic: "#c97a6f",
  Operator: "#7eb6c8",
  Psychologist: "#9ab39a",
};

const SIDE_BY_AGENT: Record<AgentName, "left" | "right"> = {
  Strategist: "left",
  Skeptic: "right",
  Operator: "left",
  Psychologist: "right",
};

const PHASE_DOT: Record<"opening" | "rebuttal", string> = {
  opening: "#c9a449",
  rebuttal: "#7eb6c8",
};

export function ChatTurn({
  agent,
  phase,
  index,
  total,
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

  const accent = ACCENT[agent.name];
  const side = SIDE_BY_AGENT[agent.name];
  const isRight = side === "right";
  const idx = String(index).padStart(2, "0");
  const tot = String(total).padStart(2, "0");
  const phaseDot = PHASE_DOT[phase];

  return (
    <article
      className={`group relative w-full opacity-0 animate-[fadeIn_400ms_ease-out_forwards] sm:max-w-[min(78%,720px)] ${
        isRight ? "sm:ml-auto" : "sm:mr-auto"
      }`}
    >
      <div
        className={`rule-draw mb-4 h-px bg-surface-line-strong ${
          isRight ? "origin-right" : "origin-left"
        }`}
      />

      <div
        className="px-4 py-3 transition-colors duration-300"
        style={{
          backgroundImage: `linear-gradient(${isRight ? "270deg" : "90deg"}, ${accent}14, ${accent}05 28%, transparent 65%)`,
        }}
      >
        <header
          className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 ${
            isRight ? "flex-row-reverse" : ""
          }`}
        >
          <div
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-ultra-wide tabular-nums"
            style={{ color: accent }}
          >
            <span className="text-ink-faint">
              [{idx}/{tot}]
            </span>
            <span className="font-semibold">{agent.name}</span>
          </div>
          <p
            className={`hidden flex-1 font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint sm:block ${
              isRight ? "text-right" : "text-left"
            }`}
          >
            {agent.role.toLowerCase()}
          </p>
          <span
            className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint ${
              isRight ? "flex-row-reverse" : ""
            }`}
          >
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{ background: phaseDot, opacity: 0.7 }}
            />
            {phase === "opening" ? "round 1" : "round 2"}
          </span>
        </header>

        <div
          className={`mt-4 grid gap-4 ${
            isRight ? "grid-cols-[1fr_2px]" : "grid-cols-[2px_1fr]"
          }`}
        >
          {!isRight ? (
            <div className="w-[2px]" style={{ background: `${accent}55` }} />
          ) : null}
          <p className="text-[16px] leading-relaxed text-ink-soft">
            {visibleText}
            {showCaret ? (
              <span
                className="ml-0.5 inline-block h-4 w-[7px] translate-y-[2px] cursor-blink align-middle"
                style={{ background: accent }}
              />
            ) : null}
          </p>
          {isRight ? (
            <div className="w-[2px]" style={{ background: `${accent}55` }} />
          ) : null}
        </div>
      </div>
    </article>
  );
}
