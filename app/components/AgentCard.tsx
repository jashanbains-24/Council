import type { AgentName, AgentResponse } from "@/lib/types";

type AgentCardProps = {
  agent: AgentResponse;
  index: number;
};

const accentByAgent: Record<AgentName, string> = {
  Strategist: "border-l-amber-500",
  Skeptic: "border-l-red-500",
  Operator: "border-l-blue-500",
  Psychologist: "border-l-emerald-500",
};

export function AgentCard({ agent, index }: AgentCardProps) {
  return (
    <article
      className={`border border-l-4 border-neutral-800 bg-neutral-950/70 p-4 opacity-0 animate-[fadeIn_400ms_ease-out_forwards] ${accentByAgent[agent.name]}`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-neutral-100">
            {agent.name}
          </h3>
          <p className="mt-1 text-xs text-neutral-500">{agent.role}</p>
        </div>
        <span className="font-mono text-xs text-neutral-700">
          0{index + 1}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-neutral-300">
        {agent.response}
      </p>
    </article>
  );
}
