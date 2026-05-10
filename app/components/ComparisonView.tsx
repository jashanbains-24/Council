"use client";

import { useEffect, useState } from "react";
import { AgentCard } from "./AgentCard";
import { Briefing } from "./Briefing";
import { ReasoningPanel } from "./ReasoningPanel";
import { RoundTwoChamber } from "./RoundTwoChamber";
import {
  buildDeliberationSteps,
  buildRevealSchedule,
} from "@/lib/deliberation-pacing";
import type { CouncilResponse, ReasoningResponse } from "@/lib/types";

const PAUSE_AFTER_DISCUSSION_MS = 650;
const SYNTHESIS_HOLD_MS = 1100;

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

    const steps = buildDeliberationSteps(council);
    const { revealAtMs, discussionEndMs } = buildRevealSchedule(
      steps,
      decision,
    );

    const timers = revealAtMs.map((ms, index) =>
      window.setTimeout(() => {
        setVisibleAgentCount(index + 1);
      }, ms),
    );

    const synthesisAt = discussionEndMs + PAUSE_AFTER_DISCUSSION_MS;
    const synthesisTimer = window.setTimeout(() => {
      setIsSynthesizing(true);
    }, synthesisAt);

    const briefingTimer = window.setTimeout(() => {
      setIsSynthesizing(false);
      setShowBriefing(true);
    }, synthesisAt + SYNTHESIS_HOLD_MS);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(synthesisTimer);
      window.clearTimeout(briefingTimer);
    };
  }, [council, decision]);

  const steps = council ? buildDeliberationSteps(council) : [];
  const visibleSteps = steps.slice(0, visibleAgentCount);
  const dividerVisible = visibleSteps.some((s) => s.kind === "divider");
  const openingAgents = visibleSteps.flatMap((s) =>
    s.kind === "agent" && s.phase === "opening" ? [s.agent] : [],
  );
  const rebuttalAgents = visibleSteps.flatMap((s) =>
    s.kind === "agent" && s.phase === "rebuttal" ? [s.agent] : [],
  );
  const shouldShowThinking =
    councilLoading ||
    Boolean(council && visibleAgentCount < steps.length);

  const nextStep =
    !councilLoading && council && visibleAgentCount < steps.length
      ? steps[visibleAgentCount]
      : null;

  const deliberationStatusLabel = councilLoading
    ? "Assembling Council..."
    : nextStep
      ? nextStep.kind === "agent"
        ? `${nextStep.agent.name} composing…`
        : "Panel regrouping between rounds…"
      : "Deliberation in progress…";

  return (
    <section className="mt-12 pb-12 animate-[fadeIn_500ms_ease-out_forwards]">
      <div className="mb-8 rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-council backdrop-blur-sm">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
          Assumption point detected
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{decision}</p>
      </div>

      <div className="flex flex-col gap-12">
        <div className="min-w-0">
          <ReasoningPanel
            response={reasoning}
            isLoading={reasoningLoading}
            error={reasoningError}
          />
        </div>

        <div className="flex items-center gap-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <span className="font-display text-2xl font-medium tracking-tight text-slate-400">
            VS
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        </div>

        <section className="min-h-[28rem] overflow-hidden rounded-2xl border border-slate-200/90 bg-council-deliberation shadow-council-md">
          <div className="border-b border-amber-100/80 bg-gradient-to-r from-white/90 to-amber-50/30 px-6 py-5">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
              Council
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Council Deliberation
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              Opening positions render as instrumented roster tiles. If a second
              round exists, it plays out in a separate cross-fire channel—not
              another paragraph stack.
            </p>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500">
                Round I
              </p>
              <h3 className="mt-1 font-display text-lg font-medium text-slate-900">
                Initial positions
              </h3>
              <p className="mt-2 text-xs text-slate-600">
                Each advisor is a rendered node: glyph, lane id, and opening
                stance.
              </p>
            </div>

            <div className="space-y-4">
              {openingAgents.map((agent, i) => (
                <AgentCard
                  key={`opening-${agent.name}-${i}`}
                  agent={agent}
                  index={i}
                  phase="opening"
                />
              ))}
            </div>

            {dividerVisible ? (
              <div className="mt-10">
                <RoundTwoChamber agents={rebuttalAgents} />
              </div>
            ) : null}

            {shouldShowThinking ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                  <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
                    {deliberationStatusLabel}
                  </p>
                </div>
              </div>
            ) : null}

            {isSynthesizing ? (
              <div className="mt-6 rounded-xl border border-amber-200/90 bg-amber-50/80 px-4 py-4">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-amber-800">
                  Synthesizing judgment...
                </p>
              </div>
            ) : null}

            {councilError ? (
              <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {councilError}
              </p>
            ) : null}
          </div>
        </section>
      </div>

      {showBriefing && council ? (
        <div className="mt-12 min-w-0">
          <Briefing briefing={council.briefing} />
          <p className="mt-5 text-sm text-slate-600">
            The agent received this as structured JSON and updated its next
            action.
          </p>
          <p className="mt-8 text-center font-mono text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
            {council.briefing.should_ask_human
              ? "Council flagged missing information. Prefer a targeted human check before acting."
              : "Council closed the loop internally. Proceed using the recommendation and documented risks."}
          </p>
        </div>
      ) : null}
    </section>
  );
}
