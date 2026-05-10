import type { AgentResponse } from "@/lib/types";
import { AgentCard } from "./AgentCard";

type RoundTwoChamberProps = {
  agents: AgentResponse[];
};

export function RoundTwoChamber({ agents }: RoundTwoChamberProps) {
  if (agents.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-cyan-200/80 bg-gradient-to-br from-cyan-50/90 to-sky-50/50 px-5 py-10 shadow-council">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(14,165,233,0.06)_50%,transparent_100%)]" />
        <div className="relative flex items-center gap-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
          <p className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-cyan-900">
            Cross-fire channel open — awaiting counter-positions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-200/70 bg-gradient-to-b from-cyan-50/40 via-white to-slate-50/30 shadow-council-md">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.08) 1px, transparent 1px)`,
          backgroundSize: "100% 12px, 24px 100%",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-300/40 to-transparent md:block" />

      <div className="relative border-b border-cyan-100/90 bg-white/70 px-5 py-4 backdrop-blur-sm">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-cyan-800">
          Round II
        </p>
        <h3 className="mt-2 font-display text-xl font-medium text-slate-900">
          Cross-fire channel
        </h3>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600">
          Replies are routed as a contested trace: alternating lanes, live
          channel meters, and a different surface than opening positions—not a
          second stack of the same cards.
        </p>
      </div>

      <div className="relative space-y-6 px-3 py-6 sm:px-6">
        {agents.map((agent, i) => (
          <AgentCard
            key={`rebuttal-${agent.name}-${i}`}
            agent={agent}
            index={i}
            phase="rebuttal"
            rebuttalSlot={i}
          />
        ))}
      </div>
    </div>
  );
}
