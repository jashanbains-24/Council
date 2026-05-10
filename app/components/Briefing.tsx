import type { Briefing as BriefingType } from "@/lib/types";

type BriefingProps = {
  briefing: BriefingType;
};

const confidenceClass = {
  high: "border-emerald-200 bg-emerald-50 text-emerald-900",
  medium: "border-amber-200 bg-amber-50 text-amber-900",
  low: "border-red-200 bg-red-50 text-red-900",
};

export function Briefing({ briefing }: BriefingProps) {
  const hasOverride =
    Boolean(briefing.what_would_change_this?.trim()) &&
    briefing.what_would_change_this.trim().length > 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-council-md">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
            What to do
          </p>
          <h3 className="mt-3 font-display text-2xl leading-snug text-slate-900 sm:text-3xl">
            {briefing.recommendation}
          </h3>
        </div>
        <span
          className={`w-fit shrink-0 rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] ${confidenceClass[briefing.confidence]}`}
        >
          {briefing.confidence} confidence
        </span>
      </div>

      <div className="space-y-5 px-6 py-6">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Why
          </p>
          <p className="mt-2 leading-relaxed text-slate-700">{briefing.reasoning}</p>
        </div>

        <div className="rounded-xl border-l-4 border-slate-300 bg-slate-50/80 py-3 pl-4 pr-2">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Where they disagreed
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {briefing.dissent}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200/90 bg-amber-50/60 px-4 py-4">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-amber-800">
            Main risk
          </p>
          <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
            {briefing.biggest_risk}
          </p>
        </div>

        {hasOverride ? (
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Would change the call
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {briefing.what_would_change_this}
            </p>
          </div>
        ) : null}
      </div>

      {briefing.should_ask_human ? (
        <div className="mx-6 mb-6 rounded-xl border border-amber-300/80 bg-amber-50 p-5">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-amber-900">
            Council recommends pausing.
          </p>
          <p className="mt-3 text-sm text-slate-700">Ask the user:</p>
          <p className="mt-3 break-words text-lg font-medium leading-relaxed text-amber-950">
            &quot;{briefing.suggested_question}&quot;
          </p>
        </div>
      ) : null}

      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
          Agent payload (JSON)
        </p>
        <pre className="mt-3 max-h-52 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-council-json p-4 font-mono text-[11px] leading-5 text-slate-600">
          {JSON.stringify(briefing, null, 2)}
        </pre>
      </div>
    </section>
  );
}
