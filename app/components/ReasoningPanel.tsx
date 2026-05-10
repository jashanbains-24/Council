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
    <section className="min-h-[28rem] border border-neutral-800 bg-council-reasoning">
      <div className="border-b border-neutral-800 p-5">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-neutral-500">
          Reasoning Model
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-neutral-100">
          Single Model Response
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          One perspective. No uncertainty surfaced.
        </p>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-11/12 animate-pulse bg-neutral-800" />
            <div className="h-4 w-10/12 animate-pulse bg-neutral-800" />
            <div className="h-4 w-8/12 animate-pulse bg-neutral-800" />
          </div>
        ) : null}

        {error ? (
          <p className="border border-red-950 bg-red-950/20 p-4 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        {response ? (
          <div className="space-y-5">
            <p className="text-base leading-7 text-neutral-300">
              {response.response}
            </p>
            <p className="border-t border-neutral-800 pt-4 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
              Confident. Fast. One-dimensional.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
