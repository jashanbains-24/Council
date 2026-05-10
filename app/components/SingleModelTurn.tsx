import type { ReasoningResponse } from "@/lib/types";

type SingleModelTurnProps = {
  response: ReasoningResponse | null;
  isLoading: boolean;
  error?: string | null;
};

/**
 * The agent's first attempt — what one model alone would say if it just
 * pattern-matched and kept going. Rendered as a baseline log entry [00] so
 * the deliberation that follows is the contrast.
 */
export function SingleModelTurn({
  response,
  isLoading,
  error,
}: SingleModelTurnProps) {
  return (
    <article className="relative opacity-0 animate-[fadeIn_400ms_ease-out_forwards]">
      <div className="rule-draw mb-4 h-px origin-left bg-surface-line-strong" />
      <header className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-ultra-wide tabular-nums text-ink-muted">
          <span className="text-ink-faint">[00/00]</span>
          <span className="font-semibold">Baseline</span>
        </div>
        <p className="hidden font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint sm:block">
          one model · no council
        </p>
        <span className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-dim">
          control
        </span>
      </header>

      <div className="mt-4 grid grid-cols-[2px_1fr] gap-4">
        <div className="w-[2px] bg-surface-line" />
        <div>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-3 w-[88%] animate-pulse bg-surface-line" />
              <div className="h-3 w-[72%] animate-pulse bg-surface-line" />
              <div className="h-3 w-[56%] animate-pulse bg-surface-line" />
            </div>
          ) : null}

          {error ? (
            <p className="border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
              {error}
            </p>
          ) : null}

          {response ? (
            <>
              <p className="text-[15px] leading-relaxed text-ink-muted">
                {response.response}
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
                confident · fast · one-dimensional
              </p>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
