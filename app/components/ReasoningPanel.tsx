import type { ReasoningResponse } from "@/lib/types";

type ReasoningPanelProps = {
  response: ReasoningResponse | null;
  isLoading: boolean;
  error?: string | null;
};

export function ReasoningPanel({
  response,
  isLoading,
  error,
}: ReasoningPanelProps) {
  return (
    <section className="min-h-[28rem] overflow-hidden rounded-2xl border border-slate-200/90 bg-council-reasoning shadow-council">
      <div className="border-b border-slate-200/80 bg-white/60 px-6 py-5 backdrop-blur-sm">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
          Reasoning Model
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          Single Model Response
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          One perspective. No uncertainty surfaced.
        </p>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-[92%] animate-pulse rounded bg-slate-200/90" />
            <div className="h-4 w-[83%] animate-pulse rounded bg-slate-200/90" />
            <div className="h-4 w-[66%] animate-pulse rounded bg-slate-200/90" />
          </div>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {response ? (
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-slate-700">
              {response.response}
            </p>
            <p className="border-t border-slate-200/90 pt-4 font-mono text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Confident. Fast. One-dimensional.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
