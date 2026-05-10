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
  briefing: {
    recommendation:
      "Do not assume PostgreSQL yet; ask the user one targeted question before proceeding.",
    reasoning:
      "The database choice depends on team familiarity, product data shape, deployment constraints, and whether the user wants a managed backend. None of that information is currently known, and choosing wrong could create avoidable migration work.",
    dissent:
      "The Strategist favored momentum through a reasonable managed default, while the Skeptic argued that even choosing the database category is premature without knowing access patterns. The Operator shifted the debate toward what the team can realistically operate, and the Psychologist highlighted the trust cost of silently deciding.",
    biggest_risk:
      "The agent may lock the project into an architectural path before understanding the product's data model or the team's ability to operate it.",
    confidence: "low",
    what_would_change_this:
      "Knowing the team's database experience, expected data model, deployment preference, and whether they want a managed backend would allow a confident recommendation.",
    should_ask_human: true,
    suggested_question:
      "Before I choose a database, what database technologies is your team comfortable operating, and do you already know the rough data model or expected scale?",
  },
};
