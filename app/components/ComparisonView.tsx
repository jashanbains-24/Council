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

const TOTAL_TURNS = ROUND_ORDER.length;

function nextSpeaker(round1: number, round2: number): SpeakerSlot | null {
  const completed = round1 + round2;
  if (completed >= TOTAL_TURNS) return null;
  return ROUND_ORDER[completed];
}

function nowStamp(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function ComparisonView({ decision }: ComparisonViewProps) {
  const [reasoning, setReasoning] = useState<ReasoningResponse | null>(null);
  const [reasoningLoading, setReasoningLoading] = useState(true);
  const [reasoningError, setReasoningError] = useState<string | null>(null);

  const [council, setCouncil] = useState<CouncilState>(INITIAL_COUNCIL);
  const [sessionStarted] = useState(() => nowStamp());

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

  const completedTurns = council.round1.length + council.round2.length;
  const upcomingSpeaker =
    council.status === "streaming" && !council.isSynthesizing
      ? nextSpeaker(council.round1.length, council.round2.length)
      : null;

  const showRoundTwoMarker =
    council.round1.length === 4 ||
    council.round2.length > 0 ||
    upcomingSpeaker?.phase === "rebuttal";

  const statusLabel =
    council.status === "failed"
      ? "interrupted"
      : council.briefing
        ? "complete"
        : council.isSynthesizing
          ? "synthesizing"
          : "deliberating";

  const statusDot =
    council.status === "failed"
      ? "bg-red-400"
      : council.briefing
        ? "bg-emerald-400"
        : "bg-accent";

  return (
    <section className="opacity-0 animate-[fadeIn_500ms_ease-out_forwards]">
      <SessionHeader
        decision={decision}
        startStamp={sessionStarted}
        completed={completedTurns}
        total={TOTAL_TURNS}
        status={statusLabel}
        statusDot={statusDot}
      />

      <div className="mt-10 space-y-7">
        <SingleModelTurn
          response={reasoning}
          isLoading={reasoningLoading}
          error={reasoningError}
        />

        <ChatDivider
          label="council convened"
          hint="04 advisors · 02 rounds · sequential"
          variant="warm"
        />

        {council.round1.map((agent, i) => (
          <ChatTurn
            key={`opening-${agent.name}-${i}`}
            agent={agent}
            phase="opening"
            index={i + 1}
            total={TOTAL_TURNS}
          />
        ))}

        {upcomingSpeaker?.phase === "opening" ? (
          <ChatPlaceholder
            key={`placeholder-opening-${upcomingSpeaker.name}`}
            name={upcomingSpeaker.name}
            phase="opening"
            index={council.round1.length + 1}
            total={TOTAL_TURNS}
          />
        ) : null}

        {showRoundTwoMarker ? (
          <ChatDivider label="round ii — replies" variant="cool" />
        ) : null}

        {council.round2.map((agent, i) => (
          <ChatTurn
            key={`rebuttal-${agent.name}-${i}`}
            agent={agent}
            phase="rebuttal"
            index={4 + i + 1}
            total={TOTAL_TURNS}
          />
        ))}

        {upcomingSpeaker?.phase === "rebuttal" ? (
          <ChatPlaceholder
            key={`placeholder-rebuttal-${upcomingSpeaker.name}`}
            name={upcomingSpeaker.name}
            phase="rebuttal"
            index={4 + council.round2.length + 1}
            total={TOTAL_TURNS}
          />
        ) : null}

        {council.isSynthesizing ? (
          <article className="opacity-0 animate-[fadeIn_280ms_ease-out_forwards]">
            <div className="rule-draw mb-4 h-px origin-left bg-accent/50" />
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-ultra-wide text-accent">
                [09/09] Synthesizer
              </span>
              <span className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
                compiling structured judgment
              </span>
              <span className="ml-auto inline-block h-3.5 w-[6px] cursor-blink bg-accent" />
            </div>
          </article>
        ) : null}

        {council.briefing ? (
          <Briefing briefing={council.briefing} />
        ) : null}

        {council.briefing ? (
          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
            {"// agent received structured json · session closed"}
          </p>
        ) : null}

        {council.status === "failed" ? (
          <div className="border border-red-500/30 bg-red-500/5 p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-ultra-wide text-red-400">
              council stream interrupted
            </p>
          </div>
        ) : null}

        {council.errors.length > 0 ? (
          <ul className="space-y-2">
            {council.errors.map((msg, i) => (
              <li
                key={i}
                className="border border-red-500/30 bg-red-500/5 p-3 font-mono text-[12px] text-red-400"
              >
                {msg}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

const ADVISORS: Array<{ name: AgentName; color: string; side: "L" | "R" }> = [
  { name: "Strategist", color: "#c9a449", side: "L" },
  { name: "Skeptic", color: "#c97a6f", side: "R" },
  { name: "Operator", color: "#7eb6c8", side: "L" },
  { name: "Psychologist", color: "#9ab39a", side: "R" },
];

function SessionHeader({
  decision,
  startStamp,
  completed,
  total,
  status,
  statusDot,
}: {
  decision: string;
  startStamp: string;
  completed: number;
  total: number;
  status: string;
  statusDot: string;
}) {
  return (
    <div className="border border-surface-line bg-surface-elevated">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-surface-line px-5 py-3">
        <span className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot} pulse-ring`} />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-ultra-wide text-ink">
            council session
          </span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
          started · <span className="text-ink-soft">{startStamp}</span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint tabular-nums">
          turns ·{" "}
          <span className="text-ink-soft">
            {String(completed).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
        </span>
        <span className="ml-auto font-mono text-[10px] font-semibold uppercase tracking-ultra-wide text-accent">
          {status}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-surface-line bg-surface-raised px-5 py-2.5">
        <span className="font-mono text-[9px] uppercase tracking-ultra-wide text-ink-faint">
          advisors
        </span>
        {ADVISORS.map((a) => (
          <span key={a.name} className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: a.color }}
            />
            <span
              className="font-mono text-[9px] uppercase tracking-wider"
              style={{ color: a.color }}
            >
              {a.name.toLowerCase()}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-ultra-wide text-ink-dim">
              {a.side}
            </span>
          </span>
        ))}
      </div>

      <div className="px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
          {"// assumption"}
        </p>
        <p className="mt-2 max-w-[78ch] text-[15px] leading-relaxed text-ink-soft">
          {decision}
        </p>
      </div>
      <ProgressBar completed={completed} total={total} />
    </div>
  );
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  return (
    <div className="grid grid-cols-8 gap-px border-t border-surface-line bg-surface-line">
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < completed;
        return (
          <div
            key={i}
            className={`h-[3px] transition-colors duration-300 ${
              filled ? "bg-accent" : "bg-surface-raised"
            }`}
          />
        );
      })}
    </div>
  );
}
