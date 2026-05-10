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
    <main className="min-h-screen bg-council-background px-6 py-10 text-neutral-100">
      <section
        className={`mx-auto flex max-w-7xl flex-col ${
          hasSubmitted ? "min-h-screen justify-start" : "min-h-[calc(100vh-5rem)] justify-center"
        }`}
      >
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.32em] text-neutral-500">
          Agent judgment layer
        </p>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <h1 className="font-display text-6xl leading-none tracking-tight text-neutral-50 md:text-8xl">
              Council
            </h1>
            <p className="mt-5 max-w-2xl text-2xl text-neutral-300">
              Don&apos;t assume. Consult.
            </p>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-neutral-400">
              When your agent is about to make a significant assumption, Council
              convenes a panel of specialized advisors who deliberate and return
              structured judgment automatically, without interrupting you.
            </p>
          </div>
          <div className="border border-neutral-800 bg-neutral-950 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-neutral-500">
              Demo scenario
            </p>
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              A fake coding agent is mid-task. The codebase has no clear database
              choice, and the agent is about to assume PostgreSQL. This is the
              moment where silent confidence becomes expensive.
            </p>
          </div>
        </div>

        <div className="mt-12 max-w-4xl">
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
