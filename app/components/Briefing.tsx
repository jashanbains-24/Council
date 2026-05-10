import type { Briefing as BriefingType } from "@/lib/types";

type BriefingProps = {
  briefing: BriefingType;
};

const confidenceConfig = {
  high: { dot: "bg-emerald-400", text: "text-emerald-400" },
  medium: { dot: "bg-accent", text: "text-accent" },
  low: { dot: "bg-red-400", text: "text-red-400" },
};

/**
 * Final verdict at the bottom of the council transcript. Most distinctive
 * block in the session — uses a slightly raised surface and a heavier rule
 * to set it apart as the compiled output.
 */
export function Briefing({ briefing }: BriefingProps) {
  const conf = confidenceConfig[briefing.confidence];
  const hasOverride = Boolean(briefing.what_would_change_this?.trim());

  return (
    <div className="relative scan-in">
      <div className="mb-4 h-px bg-accent/40" />
      <div className="border border-surface-line bg-surface-raised">
        <header className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-surface-line px-6 py-4">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-ultra-wide text-accent">
            {"// verdict"}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
            structured judgment compiled
          </span>
          <span
            className={`flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-ultra-wide ${conf.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${conf.dot}`} />
            {briefing.confidence} confidence
          </span>
        </header>

        <div className="px-6 py-7">
          <p className="text-[10px] font-mono uppercase tracking-ultra-wide text-ink-faint">
            recommendation
          </p>
          <h3 className="mt-3 max-w-[60ch] text-2xl font-medium leading-snug tracking-tight text-ink sm:text-[28px]">
            {briefing.recommendation}
          </h3>

          <div className="mt-7">
            <p className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
              reasoning
            </p>
            <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-ink-muted">
              {briefing.reasoning}
            </p>
          </div>

          <div className="mt-7 grid gap-4 border-t border-surface-line pt-6 sm:grid-cols-2">
            <div className="border-l-2 border-surface-line-strong pl-4">
              <p className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
                where they disagreed
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink/85">
                {briefing.dissent}
              </p>
            </div>
            <div className="border-l-2 border-accent/60 pl-4">
              <p className="font-mono text-[10px] uppercase tracking-ultra-wide text-accent">
                main risk
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink/85">
                {briefing.biggest_risk}
              </p>
            </div>
          </div>

          {hasOverride ? (
            <div className="mt-5 border-t border-surface-line pt-5">
              <p className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
                would change the call
              </p>
              <p className="mt-2 max-w-[68ch] text-[13px] leading-relaxed text-ink-muted">
                {briefing.what_would_change_this}
              </p>
            </div>
          ) : null}
        </div>

        <details className="group border-t border-surface-line bg-surface px-6 py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-ultra-wide text-ink-faint transition hover:text-ink-muted">
            <span>{"// agent payload (json)"}</span>
            <span className="text-ink-dim transition group-open:rotate-180">
              ▾
            </span>
          </summary>
          <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words border border-surface-line bg-surface-raised p-3 font-mono text-[11px] leading-5 text-ink-muted">
            {JSON.stringify(briefing, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
