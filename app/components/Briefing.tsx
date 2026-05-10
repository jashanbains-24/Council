import type { Briefing as BriefingType } from "@/lib/types";

type BriefingProps = {
  briefing: BriefingType;
};

const confidenceClass = {
  high: "border-emerald-300 bg-emerald-50 text-emerald-800",
  medium: "border-amber-300 bg-amber-50 text-amber-800",
  low: "border-red-300 bg-red-50 text-red-800",
};

/**
 * Final verdict that lives at the bottom of the Council chat panel. Keeps
 * its own visual weight (it IS the conclusion) but uses the same chat-canvas
 * surface — no nested shadow / outer card.
 */
export function Briefing({ briefing }: BriefingProps) {
  const hasOverride =
    Boolean(briefing.what_would_change_this?.trim()) &&
    briefing.what_would_change_this.trim().length > 0;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Verdict
          </p>
          <h3 className="mt-2 font-display text-xl leading-snug text-slate-900 sm:text-2xl">
            {briefing.recommendation}
          </h3>
        </div>
        <span
          className={`w-fit shrink-0 rounded-md border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] ${confidenceClass[briefing.confidence]}`}
        >
          {briefing.confidence} confidence
        </span>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Why
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
            {briefing.reasoning}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Where they disagreed
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
              {briefing.dissent}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-3.5 py-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800">
              Main risk
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-amber-900/90">
              {briefing.biggest_risk}
            </p>
          </div>
        </div>

        {hasOverride ? (
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Would change the call
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
              {briefing.what_would_change_this}
            </p>
          </div>
        ) : null}
      </div>

      <details className="group border-t border-slate-100 bg-slate-50/60 px-5 py-3">
        <summary className="flex cursor-pointer items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          <span>Agent payload (JSON)</span>
          <span className="text-slate-400 transition group-open:rotate-180">
            ▾
          </span>
        </summary>
        <pre className="mt-3 max-h-52 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white p-3 font-mono text-[11px] leading-5 text-slate-600">
          {JSON.stringify(briefing, null, 2)}
        </pre>
      </details>
    </div>
  );
}
