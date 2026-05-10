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
    if (!submittedDecision) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [submittedDecision]);

  return (
    <main className="min-h-screen text-ink">
      <NavBar />

      <section
        className={`mx-auto w-full max-w-[1180px] px-6 sm:px-10 ${
          hasSubmitted ? "pt-10" : "pt-20 sm:pt-32"
        }`}
      >
        {!hasSubmitted ? <Hero /> : <CompactHero />}

        <div className="mt-14 sm:mt-20">
          <DecisionInput
            initialValue={DEFAULT_DECISION}
            isLoading={false}
            onSubmit={setSubmittedDecision}
          />
        </div>

        {!hasSubmitted ? <SystemFooter /> : null}

        {submittedDecision ? (
          <div ref={resultsRef} id="council-results" className="mt-16">
            <ComparisonView decision={submittedDecision} />
          </div>
        ) : null}
      </section>

      <div className="h-32" />
    </main>
  );
}

function NavBar() {
  return (
    <nav className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="font-mono text-[11px] font-medium uppercase tracking-ultra-wide text-ink-muted">
          Council
        </span>
      </div>
      <div className="hidden items-center gap-6 sm:flex">
        <span className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
          v0.1 · mock
        </span>
        <span className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
          API · soon
        </span>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
      <div className="flex flex-col justify-end opacity-0 animate-[fadeIn_700ms_ease-out_forwards]">
        <p className="font-mono text-[11px] font-medium uppercase tracking-ultra-wide text-accent">
          Agent judgment layer · 01
        </p>
        <h1 className="mt-6 text-[64px] font-semibold leading-[0.92] tracking-tightest text-ink sm:text-[88px] lg:text-[112px]">
          Don&apos;t assume.
          <br />
          <span className="text-ink-muted">Consult.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
          When your agent is about to make a significant assumption, Council
          convenes a panel of advisors. They argue. A synthesizer compiles the
          verdict. Your agent receives structured judgment and keeps moving —
          no human interrupted.
        </p>
      </div>

      <aside
        className="flex flex-col justify-end gap-6 opacity-0 animate-[fadeIn_900ms_ease-out_forwards]"
        style={{ animationDelay: "120ms" }}
      >
        <SpecRow label="advisors" value="04" />
        <SpecRow label="rounds" value="02" />
        <SpecRow label="model calls" value="09" />
        <SpecRow label="latency" value="~25s" />
        <SpecRow label="output" value="strict JSON" />
      </aside>
    </header>
  );
}

function CompactHero() {
  return (
    <header className="flex items-end justify-between border-b border-surface-line pb-6 opacity-0 animate-[fadeIn_500ms_ease-out_forwards]">
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-ultra-wide text-accent">
          Agent judgment layer
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tightest text-ink sm:text-4xl">
          Don&apos;t assume. <span className="text-ink-muted">Consult.</span>
        </h1>
      </div>
      <p className="hidden font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint sm:block">
        session · live
      </p>
    </header>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-surface-line pb-3">
      <span className="font-mono text-[10px] uppercase tracking-ultra-wide text-ink-faint">
        {label}
      </span>
      <span className="font-mono text-2xl font-medium tabular-nums text-ink">
        {value}
      </span>
    </div>
  );
}

function SystemFooter() {
  return (
    <footer className="mt-20 border-t border-surface-line pt-6 opacity-0 animate-[fadeIn_900ms_ease-out_forwards]" style={{ animationDelay: "300ms" }}>
      <div className="grid gap-6 sm:grid-cols-3">
        <FooterCol
          label="how"
          body="Sequential deliberation. 4 advisors, 2 rounds. A 5th model compiles a verdict."
        />
        <FooterCol
          label="why"
          body="Single-model agents collapse uncertainty silently. Council surfaces it as structured signal the calling agent can act on."
        />
        <FooterCol
          label="for"
          body="Agent runtimes that need to make consequential decisions without paging a human."
        />
      </div>
    </footer>
  );
}

function FooterCol({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-ultra-wide text-accent">
        {"// "}
        {label}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
