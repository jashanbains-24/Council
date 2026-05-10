"use client";

import { FormEvent, useState } from "react";

type DecisionInputProps = {
  initialValue: string;
  isLoading: boolean;
  onSubmit: (decision: string) => void;
};

export function DecisionInput({
  initialValue,
  isLoading,
  onSubmit,
}: DecisionInputProps) {
  const [decision, setDecision] = useState(initialValue);
  const trimmedDecision = decision.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedDecision || isLoading) {
      return;
    }

    onSubmit(trimmedDecision);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-council-md"
    >
      <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
        <label
          htmlFor="decision"
          className="font-mono text-xs font-medium uppercase tracking-[0.24em] text-slate-500"
        >
          What is your agent about to assume?
        </label>
      </div>
      <div className="p-6">
        <textarea
          id="decision"
          value={decision}
          onChange={(event) => setDecision(event.target.value)}
          disabled={isLoading}
          rows={7}
          className="min-h-40 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-base leading-relaxed text-slate-800 outline-none ring-slate-900/5 transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-slate-500">
            Also available as an API for direct agent integration.
          </p>
          <button
            type="submit"
            disabled={!trimmedDecision || isLoading}
            className="rounded-xl bg-slate-900 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {isLoading ? "Convening..." : "Convene Council"}
          </button>
        </div>
      </div>
    </form>
  );
}
