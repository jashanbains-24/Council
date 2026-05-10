import type { AgentName } from "@/lib/types";

type ChatPlaceholderProps = {
  name: AgentName;
  phase: "opening" | "rebuttal";
  index: number;
  total: number;
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

const ROLE_BY_AGENT: Record<AgentName, string> = {
  Strategist: "big picture & opportunity",
  Skeptic: "risks & failure modes",
  Operator: "execution reality",
  Psychologist: "people & second-order effects",
};

const PHASE_DOT: Record<"opening" | "rebuttal", string> = {
  opening: "#c9a449",
  rebuttal: "#7eb6c8",
};

export function ChatPlaceholder({
  name,
  phase,
  index,
  total,
}: ChatPlaceholderProps) {
  const accent = ACCENT[name];
  const side = SIDE_BY_AGENT[name];
  const isRight = side === "right";
  const idx = String(index).padStart(2, "0");
  const tot = String(total).padStart(2, "0");
  const phaseDot = PHASE_DOT[phase];

  return (
    <article
      className={`relative w-full opacity-0 animate-[fadeIn_280ms_ease-out_forwards] sm:max-w-[min(78%,720px)] ${
        isRight ? "sm:ml-auto" : "sm:mr-auto"
      }`}
    >
      <div
        className={`rule-draw mb-4 h-px bg-surface-line-strong ${
          isRight ? "origin-right" : "origin-left"
        }`}
      />

      <div
        className="px-4 py-3"
        style={{
          backgroundImage: `linear-gradient(${isRight ? "270deg" : "90deg"}, ${accent}1c, ${accent}08 28%, transparent 65%)`,
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
            <span className="font-semibold">{name}</span>
            <span
              className="ml-1 inline-block h-1.5 w-1.5 rounded-full pulse-ring"
              style={{ background: accent }}
            />
          </div>
          <p
            className={`hidden flex-1 font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint sm:block ${
              isRight ? "text-right" : "text-left"
            }`}
          >
            {ROLE_BY_AGENT[name]}
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
          <div
            className={`flex items-center gap-3 font-mono text-[13px] italic text-ink-faint ${
              isRight ? "flex-row-reverse" : ""
            }`}
          >
            <span>composing</span>
            <span className="flex gap-[3px]">
              <span
                className="inline-block h-1 w-1 rounded-full"
                style={{
                  background: accent,
                  animation: "dotStep 1.2s ease-in-out 0ms infinite",
                }}
              />
              <span
                className="inline-block h-1 w-1 rounded-full"
                style={{
                  background: accent,
                  animation: "dotStep 1.2s ease-in-out 200ms infinite",
                }}
              />
              <span
                className="inline-block h-1 w-1 rounded-full"
                style={{
                  background: accent,
                  animation: "dotStep 1.2s ease-in-out 400ms infinite",
                }}
              />
            </span>
            <span
              className={`inline-block h-3.5 w-[6px] cursor-blink ${
                isRight ? "mr-auto" : "ml-auto"
              }`}
              style={{ background: accent }}
            />
          </div>
          {isRight ? (
            <div className="w-[2px]" style={{ background: `${accent}55` }} />
          ) : null}
        </div>
      </div>
    </article>
  );
}
