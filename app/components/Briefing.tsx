import type { Briefing as BriefingType } from "@/lib/types";

type BriefingProps = {
  briefing: BriefingType;
};

const confidenceClass = {
  high: "border-emerald-700 bg-emerald-950/40 text-emerald-300",
  medium: "border-amber-700 bg-amber-950/40 text-amber-300",
  low: "border-red-700 bg-red-950/40 text-red-300",
};

export function Briefing({ briefing }: BriefingProps) {
  return (
    <section className="border border-neutral-700 bg-neutral-950 p-5">
      <div className="flex flex-col gap-4 border-b border-neutral-800 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-neutral-500">
            Recommendation
          </p>
          <h3 className="mt-3 font-display text-3xl leading-tight text-neutral-50">
            {briefing.recommendation}
          </h3>
        </div>
        <span
          className={`w-fit border px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] ${confidenceClass[briefing.confidence]}`}
        >
          {briefing.confidence} confidence
        </span>
      </div>

      <div className="grid gap-5 py-5">
        <BriefingSection title="Reasoning" body={briefing.reasoning} />
        <BriefingSection
          title="Key Dissent"
          body={briefing.dissent}
          className="italic text-neutral-400"
        />
        <BriefingSection
          title="Biggest Risk"
          body={briefing.biggest_risk}
          className="border-l border-amber-600 pl-4 text-amber-200"
        />
        <BriefingSection
          title="What Would Change This"
          body={briefing.what_would_change_this}
          className="text-sm text-neutral-500"
        />
      </div>

      {briefing.should_ask_human ? (
        <div className="border border-amber-800 bg-[#1a1500] p-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-amber-400">
            ⚠ Council recommends pausing.
          </p>
          <p className="mt-3 text-sm text-neutral-300">
            Before proceeding, ask the user:
          </p>
          <p className="mt-3 break-words text-lg leading-7 text-amber-100">
            &quot;{briefing.suggested_question}&quot;
          </p>
        </div>
      ) : null}

      <div className="mt-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-neutral-600">
          Structured JSON
        </p>
        <pre className="mt-3 max-w-full overflow-x-auto whitespace-pre-wrap break-words border border-neutral-900 bg-council-json p-4 font-mono text-xs leading-6 text-neutral-300">
          {JSON.stringify(briefing, null, 2)}
        </pre>
      </div>
    </section>
  );
}

function BriefingSection({
  title,
  body,
  className = "text-neutral-300",
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-600">
        {title}
      </p>
      <p className={`mt-2 leading-7 ${className}`}>{body}</p>
    </div>
  );
}
