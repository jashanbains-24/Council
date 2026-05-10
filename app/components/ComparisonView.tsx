"use client";

import { useEffect, useState } from "react";
import { Briefing } from "./Briefing";
import { ChatDivider } from "./ChatDivider";
import { ChatPlaceholder } from "./ChatPlaceholder";
import { ChatTurn } from "./ChatTurn";
import { SingleModelTurn } from "./SingleModelTurn";
import type {
  AgentName,
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
 * event and resolves once the body is fully consumed.
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
};

const INITIAL_COUNCIL: CouncilState = {
  round1: [],
  round2: [],
  isSynthesizing: false,
  briefing: null,
  errors: [],
  status: "idle",
};

type SpeakerSlot = {
  name: AgentName;
  phase: "opening" | "rebuttal";
};

const ROUND_ORDER: SpeakerSlot[] = [
  { phase: "opening", name: "Strategist" },
  { phase: "opening", name: "Skeptic" },
  { phase: "opening", name: "Operator" },
  { phase: "opening", name: "Psychologist" },
  { phase: "rebuttal", name: "Strategist" },
  { phase: "rebuttal", name: "Skeptic" },
  { phase: "rebuttal", name: "Operator" },
  { phase: "rebuttal", name: "Psychologist" },
];

function nextSpeaker(round1: number, round2: number): SpeakerSlot | null {
  const completed = round1 + round2;
  if (completed >= ROUND_ORDER.length) return null;
  return ROUND_ORDER[completed];
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
    setCouncil({ ...INITIAL_COUNCIL, status: "streaming" });

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
          return { ...prev, round1, round2 };
        }
        if (event.type === "synthesizing") {
          return { ...prev, isSynthesizing: true };
        }
        if (event.type === "briefing") {
          return {
            ...prev,
            isSynthesizing: false,
            briefing: event.briefing,
            status: "done",
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

  const upcomingSpeaker =
    council.status === "streaming" && !council.isSynthesizing
      ? nextSpeaker(council.round1.length, council.round2.length)
      : null;

  // Show the Round II divider once Round 1 is fully delivered.
  const showRoundTwoDivider =
    council.round1.length === 4 ||
    council.round2.length > 0 ||
    upcomingSpeaker?.phase === "rebuttal";

  return (
    <section className="mt-10 pb-12 animate-[fadeIn_500ms_ease-out_forwards]">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white/80 shadow-council-md backdrop-blur-sm">
        <header className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Council session · live
            </p>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-800">
            {decision}
          </p>
        </header>

        <div className="space-y-5 bg-[radial-gradient(circle_at_top,rgba(241,245,249,0.6),transparent_60%)] px-4 py-6 sm:px-6">
          <SingleModelTurn
            response={reasoning}
            isLoading={reasoningLoading}
            error={reasoningError}
          />

          <ChatDivider
            label="Council convened"
            hint="4 advisors · 2 rounds · synthesizer returns structured judgment"
            variant="warm"
          />

          {council.round1.map((agent, i) => (
            <ChatTurn
              key={`opening-${agent.name}-${i}`}
              agent={agent}
              phase="opening"
            />
          ))}

          {upcomingSpeaker?.phase === "opening" ? (
            <ChatPlaceholder
              key={`placeholder-opening-${upcomingSpeaker.name}`}
              name={upcomingSpeaker.name}
              phase="opening"
            />
          ) : null}

          {showRoundTwoDivider ? (
            <ChatDivider label="Round II — replies" variant="cool" />
          ) : null}

          {council.round2.map((agent, i) => (
            <ChatTurn
              key={`rebuttal-${agent.name}-${i}`}
              agent={agent}
              phase="rebuttal"
            />
          ))}

          {upcomingSpeaker?.phase === "rebuttal" ? (
            <ChatPlaceholder
              key={`placeholder-rebuttal-${upcomingSpeaker.name}`}
              name={upcomingSpeaker.name}
              phase="rebuttal"
            />
          ) : null}

          {council.isSynthesizing ? (
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-800">
                Synthesizing judgment
              </p>
            </div>
          ) : null}

          {council.briefing ? (
            <>
              <ChatDivider label="Verdict returned to agent" variant="warm" />
              <Briefing briefing={council.briefing} />
              <p className="mx-auto max-w-md text-center text-[11px] leading-relaxed text-slate-500">
                The agent received this as structured JSON and continued its
                task — no human interruption required.
              </p>
            </>
          ) : null}

          {council.status === "failed" ? (
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-4">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-red-700">
                Council stream interrupted
              </p>
            </div>
          ) : null}

          {council.errors.length > 0 ? (
            <ul className="space-y-2">
              {council.errors.map((msg, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  {msg}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
