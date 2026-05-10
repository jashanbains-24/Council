"use client";

import { FormEvent, useEffect, useState } from "react";

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
  const [focused, setFocused] = useState(false);
  const trimmedDecision = decision.trim();
  const characterCount = decision.length;

  useEffect(() => {
    setDecision(initialValue);
  }, [initialValue]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedDecision || isLoading) return;
    onSubmit(trimmedDecision);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="opacity-0 animate-[fadeIn_700ms_ease-out_forwards]"
      style={{ animationDelay: "200ms" }}
    >
      <div className="flex items-center justify-between border-b border-surface-line pb-3">
        <label
          htmlFor="decision"
          className="font-mono text-[10px] font-medium uppercase tracking-ultra-wide text-accent"
        >
          {"// input · the assumption your agent is about to make"}
        </label>
        <span className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint tabular-nums">
          {characterCount.toString().padStart(3, "0")} ch
        </span>
      </div>

      <div
        className={`relative mt-4 border-l-2 transition-colors ${
          focused ? "border-accent" : "border-surface-line"
        }`}
      >
        <div className="pointer-events-none absolute left-3 top-3 select-none font-mono text-sm text-accent">
          &gt;
        </div>
        <textarea
          id="decision"
          value={decision}
          onChange={(event) => setDecision(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isLoading}
          rows={5}
          spellCheck={false}
          className="block min-h-32 w-full resize-none bg-transparent py-3 pl-9 pr-4 text-lg leading-relaxed text-ink outline-none placeholder:text-ink-faint disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="describe the assumption..."
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={!trimmedDecision || isLoading}
          className="group inline-flex items-center gap-3 border border-accent bg-accent/10 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-ultra-wide text-accent transition hover:bg-accent hover:text-surface disabled:cursor-not-allowed disabled:border-surface-line disabled:bg-transparent disabled:text-ink-faint"
        >
          {isLoading ? "convening" : "convene council"}
          <span className="font-mono text-[14px] leading-none transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>
    </form>
  );
}
