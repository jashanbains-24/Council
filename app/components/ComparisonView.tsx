"use client";

import { useEffect, useState } from "react";
import { AgentCard } from "./AgentCard";
import { Briefing } from "./Briefing";
import { ReasoningPanel } from "./ReasoningPanel";
import { RoundTwoChamber } from "./RoundTwoChamber";
import type {
  AgentResponse,
  Briefing as BriefingType,
  CouncilStreamEvent,
  ReasoningResponse,
} from "@/lib/types";

type ComparisonViewProps = {
  decision: string;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

/**
 * Streams NDJSON events from /api/council. Calls onEvent for every parsed
 * event and resolves once the body is fully consumed. Throws on transport
 * failure; per-turn model failures are reported as `error` events.
 */
async function streamCouncil(
  decision: string,
  signal: AbortSignal,
  onEvent: (event: CouncilStreamEvent) => void,
): Promise<void> {
  const response = await fetch("/api/council", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision }),
    signal,
  });
  if (!response.ok || !response.body) {
    throw new Error(`Council stream failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        const event = JSON.parse(line) as CouncilStreamEvent;
        onEvent(event);
      } catch (err) {
        console.warn("[council] dropped malformed NDJSON line:", line, err);
      }
    }
  }

  const tail = buffer.trim();
  if (tail) {
    try {
      onEvent(JSON.parse(tail) as CouncilStreamEvent);
    } catch {
      /* ignore trailing junk */
    }
  }
}

type CouncilState = {
  round1: AgentResponse[];
  round2: AgentResponse[];
  isSynthesizing: boolean;
  briefing: BriefingType | null;
  errors: string[];
  status: "idle" | "streaming" | "done" | "failed";
  currentSpeaker: string | null;
};

const INITIAL_COUNCIL: CouncilState = {
  round1: [],
  round2: [],
  isSynthesizing: false,
  briefing: null,
  errors: [],
  status: "idle",
  currentSpeaker: null,
};

const ROUND_ORDER: Array<{ phase: "opening" | "rebuttal"; name: string }> = [
  { phase: "opening", name: "Strategist" },
  { phase: "opening", name: "Skeptic" },
  { phase: "opening", name: "Operator" },
  { phase: "opening", name: "Psychologist" },
  { phase: "rebuttal", name: "Strategist" },
  { phase: "rebuttal", name: "Skeptic" },
  { phase: "rebuttal", name: "Operator" },
  { phase: "rebuttal", name: "Psychologist" },
];

function nextSpeakerLabel(round1: number, round2: number): string | null {
  const completed = round1 + round2;
  if (completed >= ROUND_ORDER.length) return null;
  const next = ROUND_ORDER[completed];
  const phaseLabel = next.phase === "opening" ? "Round 1" : "Round 2";
  return `${next.name} composing… (${phaseLabel})`;
}

export function ComparisonView({ decision }: ComparisonViewProps) {
  const [reasoning, setReasoning] = useState<ReasoningResponse | null>(null);
  const [reasoningLoading, setReasoningLoading] = useState(true);
  const [reasoningError, setReasoningError] = useState<string | null>(null);

  const [council, setCouncil] = useState<CouncilState>(INITIAL_COUNCIL);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();

    setReasoning(null);
    setReasoningLoading(true);
    setReasoningError(null);
    setCouncil({
      ...INITIAL_COUNCIL,
      status: "streaming",
      currentSpeaker: nextSpeakerLabel(0, 0),
    });

    postJson<ReasoningResponse>("/api/reasoning", { decision })
      .then((result) => {
        if (!cancelled) setReasoning(result);
      })
      .catch(() => {
        if (!cancelled) {
          setReasoningError(
            "The single model response failed. The agent should not proceed blindly.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setReasoningLoading(false);
      });

    streamCouncil(decision, ac.signal, (event) => {
      if (cancelled) return;
      setCouncil((prev) => {
        if (event.type === "turn") {
          const round1 =
            event.phase === "opening"
              ? [...prev.round1, event.agent]
              : prev.round1;
          const round2 =
            event.phase === "rebuttal"
              ? [...prev.round2, event.agent]
              : prev.round2;
          return {
            ...prev,
            round1,
            round2,
            currentSpeaker: nextSpeakerLabel(round1.length, round2.length),
          };
        }
        if (event.type === "synthesizing") {
          return { ...prev, isSynthesizing: true, currentSpeaker: null };
        }
        if (event.type === "briefing") {
          return {
            ...prev,
            isSynthesizing: false,
            briefing: event.briefing,
            status: "done",
            currentSpeaker: null,
          };
        }
        if (event.type === "error") {
          return { ...prev, errors: [...prev.errors, event.message] };
        }
        return prev;
      });
    })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setCouncil((prev) => ({
          ...prev,
          status: "failed",
          currentSpeaker: null,
          errors: [
            ...prev.errors,
            "Council could not complete this run. The agent should not proceed blindly.",
          ],
        }));
      });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [decision]);

  const totalDelivered = council.round1.length + council.round2.length;
  const isStillStreaming =
    council.status === "streaming" && totalDelivered < ROUND_ORDER.length;
  const dividerVisible = council.round1.length === 4 || council.round2.length > 0;

  const deliberationStatusLabel =
    council.status === "failed"
      ? "Council stream interrupted"
      : council.currentSpeaker
        ? council.currentSpeaker
        : isStillStreaming
          ? "Awaiting next turn…"
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
              Four advisors deliberate over two rounds. Each speaks in turn,
              streamed live as their model finishes. Round 2 is a separate
              cross-fire channel where they react to each other.
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
              {council.round1.map((agent, i) => (
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
                <RoundTwoChamber agents={council.round2} />
              </div>
            ) : null}

            {isStillStreaming ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                  <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
                    {deliberationStatusLabel}
                  </p>
                </div>
              </div>
            ) : null}

            {council.isSynthesizing ? (
              <div className="mt-6 rounded-xl border border-amber-200/90 bg-amber-50/80 px-4 py-4">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-amber-800">
                  Synthesizing judgment...
                </p>
              </div>
            ) : null}

            {council.errors.length > 0 ? (
              <ul className="mt-6 space-y-2">
                {council.errors.map((msg, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                  >
                    {msg}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      </div>

      {council.briefing ? (
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
