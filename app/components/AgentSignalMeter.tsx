import type { AgentName } from "@/lib/types";

const hue: Record<AgentName, string> = {
  Strategist: "bg-amber-500",
  Skeptic: "bg-red-500",
  Operator: "bg-blue-500",
  Psychologist: "bg-emerald-500",
};

type AgentSignalMeterProps = {
  name: AgentName;
};

export function AgentSignalMeter({ name }: AgentSignalMeterProps) {
  const bar = hue[name];
  const heights = [40, 72, 55, 88, 48, 95, 62, 78, 44, 100, 58, 82];
  return (
    <div
      className="flex h-10 items-end justify-center gap-px rounded-lg border border-slate-200 bg-white px-1.5 py-1 shadow-sm"
      aria-hidden
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className={`agent-signal-bar w-0.5 rounded-[1px] opacity-90 ${bar}`}
          style={{
            height: `${h}%`,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
    </div>
  );
}
