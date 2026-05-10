import type { ReasoningResponse } from "@/lib/types";

type SingleModelTurnProps = {
  response: ReasoningResponse | null;
  isLoading: boolean;
  error?: string | null;
};

/**
 * The agent's first attempt — what one model alone would say if it just
 * pattern-matched and kept going. Visually muted so the Council deliberation
 * below reads as the contrast.
 */
export function SingleModelTurn({
  response,
  isLoading,
  error,
}: SingleModelTurnProps) {
  return (
    <article className="mr-auto flex w-full max-w-[min(100%,44rem)] gap-3 opacity-0 animate-[fadeIn_400ms_ease-out_forwards]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-500">
        <span className="font-mono text-[10px] font-semibold tracking-tight">
          AI
        </span>
      </div>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-slate-200 bg-slate-50/80 px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Agent thinking alone
          </h3>
          <p className="text-[11px] text-slate-500">one model · no Council</p>
        </div>

        {isLoading ? (
          <div className="mt-3 space-y-2">
            <div className="h-3 w-[88%] animate-pulse rounded bg-slate-200/80" />
            <div className="h-3 w-[72%] animate-pulse rounded bg-slate-200/80" />
            <div className="h-3 w-[56%] animate-pulse rounded bg-slate-200/80" />
          </div>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {response ? (
          <>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              {response.response}
            </p>
            <p className="mt-3 border-t border-slate-200/70 pt-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
              Confident · fast · one-dimensional
            </p>
          </>
        ) : null}
      </div>
    </article>
  );
}
