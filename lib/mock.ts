import type { CouncilResponse, ReasoningResponse } from "./types";

export const MOCK_REASONING_RESPONSE: ReasoningResponse = {
  response:
    "PostgreSQL is a solid default choice for most web applications. It offers strong ACID compliance, excellent community support, mature tooling, and handles most early-stage startup workloads well. I will proceed with PostgreSQL as the database choice unless the user later specifies a different requirement.",
};

export const MOCK_COUNCIL_RESPONSE: CouncilResponse = {
  agents: [
    {
      name: "Strategist",
      role: "Big picture & opportunity",
      response:
        "PostgreSQL is a reasonable default, but the real question is whether this startup needs a database decision right now or a faster path to learning. If the goal is shipping an MVP, a managed option like Supabase could preserve momentum while avoiding infrastructure drag. I would not self-host or over-architect this early.",
    },
    {
      name: "Skeptic",
      role: "Risks & failure modes",
      response:
        "I push back on the Strategist's framing. The missing issue is not managed versus unmanaged PostgreSQL; it is that we do not know the data model or access patterns yet. Choosing a relational database before understanding what the product stores, queries, and mutates is the assumption that could poison the architecture.",
    },
    {
      name: "Operator",
      role: "Execution reality",
      response:
        "Both of you are ignoring the practical blocker: what can this team actually operate under pressure? A two-person startup does not have time for a database migration halfway through the build. The decision should depend on team familiarity, deployment target, and whether auth, backups, migrations, and local dev can be set up today.",
    },
    {
      name: "Psychologist",
      role: "People & second-order effects",
      response:
        "The user left the database unspecified, which means either they do not know, forgot to say, or expected the agent to ask. If the agent silently chooses PostgreSQL, the technical risk becomes a trust risk: the user may feel the agent made a foundational product decision without permission. The missing human constraint is ownership of the architecture.",
    },
  ],
  discussionFollowUp: [
    {
      name: "Strategist",
      role: "Reply — narrowing the path",
      response:
        "Skeptic is right that we lack a full data model, but we are not designing a warehouse on day one. For a generic web app, Postgres gives us migrations, constraints, and room to evolve without a category change. I concede we should not pretend the schema is final—start minimal and iterate.",
    },
    {
      name: "Skeptic",
      role: "Reply — stress-testing consensus",
      response:
        "I will buy that if we explicitly scope v1: relational core, no exotic patterns, and a written note that this is a reversible default. My remaining worry is auth and multi-tenant shape; Strategist, your 'minimal schema' only works if we do not bake in row-level assumptions we will regret.",
    },
    {
      name: "Operator",
      role: "Reply — operational lock-in",
      response:
        "Then the decision is managed Postgres, not self-hosted, with a migration tool checked in today and backups on by default. Psychologist: we address trust by stating the assumption in the PR and offering one sentence the user can edit. That is faster than a blocking question for a demo-grade build.",
    },
    {
      name: "Psychologist",
      role: "Reply — closing the loop",
      response:
        "If the agent names the default, names what would change the choice, and leaves an obvious escape hatch in the message, we convert 'silent decision' into transparent delegation. I am satisfied we can proceed without waking the human if that transparency is non-negotiable.",
    },
  ],
  briefing: {
    recommendation:
      "Use managed PostgreSQL for v1: minimal relational schema, migrations from day one, and state the DB assumption in the next message with one line the user can edit.",
    reasoning:
      "Constrained default: managed Postgres, no exotic patterns until requirements clarify, disclosure to the user so the choice is not silent.",
    dissent:
      "Skeptic resisted any DB pick before a fuller model; Strategist and Operator carried a scoped shipping default; Psychologist required transparency, not a blocking question.",
    biggest_risk:
      "Non-relational workloads or heavy multi-tenant isolation later may require a planned migration—keep the schema small and the assumption visible.",
    confidence: "medium",
    what_would_change_this:
      "Document-first model, extreme scale, or a mandated non-Postgres stack.",
    should_ask_human: false,
    suggested_question: "",
  },
};
