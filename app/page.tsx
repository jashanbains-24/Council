"use client";

import { useEffect, useRef, useState } from "react";
import { ComparisonView } from "./components/ComparisonView";
import { DecisionInput } from "./components/DecisionInput";

const DEFAULT_DECISION =
  "I am building a web app for an early-stage startup. The user has not specified a database. I am about to assume PostgreSQL. Should I proceed or is there something I am missing?";

export default function Home() {
  const [submittedDecision, setSubmittedDecision] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const hasSubmitted = Boolean(submittedDecision);

  useEffect(() => {
    if (!submittedDecision) {
      return;
    }

    resultsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [submittedDecision]);

  return (
    <main className="min-h-screen px-5 py-10 text-slate-900 sm:px-8 sm:py-12">
      <section
        className={`mx-auto flex max-w-6xl flex-col ${
          hasSubmitted ? "min-h-screen justify-start" : "min-h-[calc(100vh-5rem)] justify-center"
        }`}
      >
        <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
          Agent judgment layer
        </p>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-12">
          <div>
            <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-slate-900 md:text-7xl lg:text-8xl">
              Council
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-medium text-slate-700 md:text-2xl">
              Don&apos;t assume. Consult.
            </p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              When your agent is about to make a significant assumption, Council
              convenes a panel of specialized advisors who deliberate and return
              structured judgment automatically, without interrupting you.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-council backdrop-blur-sm">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              Demo scenario
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              A fake coding agent is mid-task. The codebase has no clear database
              choice, and the agent is about to assume PostgreSQL. This is the
              moment where silent confidence becomes expensive.
            </p>
          </div>
        </div>

        <div className="mt-12 max-w-3xl">
          <DecisionInput
            initialValue={DEFAULT_DECISION}
            isLoading={false}
            onSubmit={setSubmittedDecision}
          />
        </div>

        {submittedDecision ? (
          <div ref={resultsRef} id="council-results">
            <ComparisonView decision={submittedDecision} />
          </div>
        ) : null}
      </section>
    </main>
  );
}
