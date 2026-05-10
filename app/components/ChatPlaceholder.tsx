import type { AgentName } from "@/lib/types";
import { AgentGlyph } from "./AgentGlyph";

type ChatPlaceholderProps = {
  name: AgentName;
  phase: "opening" | "rebuttal";
};

const SIDE_BY_AGENT: Record<AgentName, "left" | "right"> = {
  Strategist: "left",
  Skeptic: "right",
  Operator: "left",
  Psychologist: "right",
};

const ACCENT: Record<
  AgentName,
  { bubble: string; avatar: string; name: string; dot: string }
> = {
  Strategist: {
    bubble: "border-amber-200/80",
    avatar: "border-amber-300 bg-amber-50 text-amber-600",
    name: "text-amber-700",
    dot: "bg-amber-400",
  },
  Skeptic: {
    bubble: "border-red-200/80",
    avatar: "border-red-300 bg-red-50 text-red-600",
    name: "text-red-700",
    dot: "bg-red-400",
  },
  Operator: {
    bubble: "border-blue-200/80",
    avatar: "border-blue-300 bg-blue-50 text-blue-600",
    name: "text-blue-700",
    dot: "bg-blue-400",
  },
  Psychologist: {
    bubble: "border-emerald-200/80",
    avatar: "border-emerald-300 bg-emerald-50 text-emerald-600",
    name: "text-emerald-700",
    dot: "bg-emerald-400",
  },
};

const ROLE_BY_AGENT: Record<AgentName, string> = {
  Strategist: "Big picture & opportunity",
  Skeptic: "Risks & failure modes",
  Operator: "Execution reality",
  Psychologist: "People & second-order effects",
};

function ThinkingDots({ tone }: { tone: string }) {
  return (
    <span className="ml-1 inline-flex items-end gap-[3px] align-middle">
      <span
        className={`h-1.5 w-1.5 rounded-full ${tone}`}
        style={{
          animation: "pulse 1.2s ease-in-out 0ms infinite",
        }}
      />
      <span
        className={`h-1.5 w-1.5 rounded-full ${tone}`}
        style={{
          animation: "pulse 1.2s ease-in-out 200ms infinite",
        }}
      />
      <span
        className={`h-1.5 w-1.5 rounded-full ${tone}`}
        style={{
          animation: "pulse 1.2s ease-in-out 400ms infinite",
        }}
      />
    </span>
  );
}

export function ChatPlaceholder({ name, phase }: ChatPlaceholderProps) {
  const side = SIDE_BY_AGENT[name];
  const accent = ACCENT[name];
  const isLeft = side === "left";
  const verb =
    phase === "opening"
      ? `${name} is thinking`
      : `${name} is composing a reply`;

  return (
    <article
      className={`flex w-full max-w-[min(100%,44rem)] gap-3 opacity-0 animate-[fadeIn_280ms_ease-out_forwards] ${
        isLeft ? "mr-auto flex-row" : "ml-auto flex-row-reverse"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${accent.avatar} animate-[pulse_2s_ease-in-out_infinite]`}
      >
        <AgentGlyph name={name} className="h-6 w-6" />
      </div>
      <div
        className={`min-w-0 flex-1 rounded-2xl border border-dashed bg-white/80 px-4 py-3 shadow-sm ${accent.bubble} ${
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
            {name}
          </h3>
          <p className="text-[11px] text-slate-500">{ROLE_BY_AGENT[name]}</p>
        </div>
        <p className="mt-2 flex items-center text-[14px] italic leading-relaxed text-slate-500">
          {verb}
          <ThinkingDots tone={accent.dot} />
        </p>
      </div>
    </article>
  );
}
