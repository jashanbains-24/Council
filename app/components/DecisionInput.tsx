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
    <form onSubmit={handleSubmit} className="border border-neutral-800 bg-neutral-950">
      <div className="border-b border-neutral-800 px-5 py-4">
        <label
          htmlFor="decision"
          className="font-mono text-xs uppercase tracking-[0.24em] text-neutral-500"
        >
          What is your agent about to assume?
        </label>
      </div>
      <div className="p-5">
        <textarea
          id="decision"
          value={decision}
          onChange={(event) => setDecision(event.target.value)}
          disabled={isLoading}
          rows={7}
          className="min-h-40 w-full resize-none border border-neutral-800 bg-[#0b0b0b] p-4 text-base leading-7 text-neutral-200 outline-none transition focus:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="mt-5 flex flex-col gap-4 border-t border-neutral-900 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-neutral-500">
            Also available as an API for direct agent integration.
          </p>
          <button
            type="submit"
            disabled={!trimmedDecision || isLoading}
            className="border border-neutral-500 bg-neutral-100 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-neutral-950 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:bg-neutral-800 disabled:text-neutral-500"
          >
            {isLoading ? "Convening..." : "Convene Council"}
          </button>
        </div>
      </div>
    </form>
  );
}
