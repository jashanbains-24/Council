"use client";

import { useEffect, useState } from "react";
import { AgentCard } from "./AgentCard";
import { Briefing } from "./Briefing";
import { ReasoningPanel } from "./ReasoningPanel";
import type { CouncilResponse, ReasoningResponse } from "@/lib/types";

type ComparisonViewProps = {
  decision: string;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export function ComparisonView({ decision }: ComparisonViewProps) {
  const [reasoning, setReasoning] = useState<ReasoningResponse | null>(null);
  const [council, setCouncil] = useState<CouncilResponse | null>(null);
  const [reasoningLoading, setReasoningLoading] = useState(true);
  const [councilLoading, setCouncilLoading] = useState(true);
  const [visibleAgentCount, setVisibleAgentCount] = useState(0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [reasoningError, setReasoningError] = useState<string | null>(null);
  const [councilError, setCouncilError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    setReasoning(null);
    setCouncil(null);
    setReasoningLoading(true);
    setCouncilLoading(true);
    setVisibleAgentCount(0);
    setIsSynthesizing(false);
    setShowBriefing(false);
    setReasoningError(null);
    setCouncilError(null);

    postJson<ReasoningResponse>("/api/reasoning", { decision })
      .then((result) => {
        if (isActive) {
          setReasoning(result);
        }
      })
      .catch(() => {
        if (isActive) {
          setReasoningError(
            "The single model response failed. The agent should not proceed blindly.",
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setReasoningLoading(false);
        }
      });

    postJson<CouncilResponse>("/api/council", { decision })
      .then((result) => {
        if (isActive) {
          setCouncil(result);
        }
      })
      .catch(() => {
        if (isActive) {
          setCouncilError(
            "Council could not complete this run. The agent should not proceed blindly.",
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setCouncilLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [decision]);

  useEffect(() => {
    if (!council) {
      return;
    }

    setVisibleAgentCount(0);
    setIsSynthesizing(false);
    setShowBriefing(false);

    const timers = council.agents.map((_, index) =>
      window.setTimeout(() => {
        setVisibleAgentCount(index + 1);
      }, index * 450),
    );

    const synthesisTimer = window.setTimeout(
      () => {
        setIsSynthesizing(true);
      },
      Math.max(council.agents.length * 450, 450),
    );

    const briefingTimer = window.setTimeout(
      () => {
        setIsSynthesizing(false);
        setShowBriefing(true);
      },
      Math.max(council.agents.length * 450 + 850, 1300),
    );

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(synthesisTimer);
      window.clearTimeout(briefingTimer);
    };
  }, [council]);

  const visibleAgents = council?.agents.slice(0, visibleAgentCount) ?? [];
  const shouldShowThinking =
    councilLoading ||
    Boolean(council && visibleAgentCount < council.agents.length);

  return (
    <section className="mt-12 pb-12 animate-[fadeIn_500ms_ease-out_forwards]">
      <div className="mb-6 border border-neutral-800 bg-neutral-950 p-5">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-neutral-500">
          Assumption point detected
        </p>
        <p className="mt-3 text-sm leading-6 text-neutral-400">{decision}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_auto_1fr]">
        <div className="min-w-0">
          <ReasoningPanel
            response={reasoning}
            isLoading={reasoningLoading}
            error={reasoningError}
          />
        </div>

        <div className="flex items-center justify-center">
          <span className="font-display text-5xl text-[#333333]">VS</span>
        </div>

        <section className="min-w-0 min-h-[28rem] border border-neutral-800 bg-council-deliberation">
          <div className="border-b border-neutral-800 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-neutral-500">
              Council
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-neutral-100">
              Council Deliberation
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Four perspectives. Explicit disagreement. Structured judgment.
            </p>
          </div>

          <div className="space-y-4 p-5">
            {visibleAgents.map((agent, index) => (
              <AgentCard key={agent.name} agent={agent} index={index} />
            ))}

            {shouldShowThinking ? (
              <div className="border border-dashed border-neutral-800 bg-neutral-950/40 p-4">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse bg-neutral-500" />
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
                    {councilLoading ? "Assembling Council..." : "thinking..."}
                  </p>
                </div>
              </div>
            ) : null}

            {isSynthesizing ? (
              <div className="border border-neutral-800 bg-neutral-950 p-4">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400">
                  Synthesizing judgment...
                </p>
              </div>
            ) : null}

            {councilError ? (
              <p className="border border-red-950 bg-red-950/20 p-4 text-sm text-red-300">
                {councilError}
              </p>
            ) : null}
          </div>
        </section>
      </div>

      {showBriefing && council ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_auto_1fr]">
          <div className="hidden xl:block" />
          <div className="hidden xl:block xl:w-[4.5rem]" />
          <div className="min-w-0">
            <Briefing briefing={council.briefing} />
            <p className="mt-5 text-sm text-neutral-500">
              The agent received this as structured JSON and updated its next
              action.
            </p>
            <p className="mt-8 text-center font-mono text-xs uppercase tracking-[0.24em] text-neutral-600">
              No assumption was made. No human was interrupted unnecessarily.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
