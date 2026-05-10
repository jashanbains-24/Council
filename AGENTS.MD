# AGENTS.md

## Purpose

This file defines how AI coding agents should work inside this repository.

Naming update: the public product name for this hackathon build is `Council`. If older planning text refers to `Contraria`, treat it as legacy wording for the same product and use `Council` in the UI, API copy, and implementation.

Before writing or editing any code, read:

1. `PRD.md`
2. `AGENTS.md`
3. Existing project files
4. Existing implementation state

This is a hackathon project. The priority is a polished, stable, demo-ready MVP, not a full production platform.

---

# 1. Product Summary

## Product Name

Council

## Internal Concept

Council

## Tagline

Don't assume. Consult.

## One-Sentence Description

Council is a judgment layer for AI agents that detects significant assumption points, convenes multiple specialized advisors, surfaces disagreement, and returns structured judgment before the agent acts.

## Core Idea

AI agents often fail by making reasonable-sounding assumptions silently.

Council prevents this by giving agents a structured way to pause, deliberate, and decide whether to proceed, ask a human, or change direction.

This app demonstrates the difference between:

1. A single-pass AI response
2. A multi-agent deliberation layer with explicit disagreement and structured output

---

# 2. Absolute Rules

## 2.1 Build Mock First

Do not build real API integration until the mock system works end to end.

Correct order:

1. `/lib/types.ts`
2. `/lib/mock.ts`
3. `/lib/council.ts` with mock functions first
4. `/app/api/reasoning/route.ts`
5. `/app/api/council/route.ts`
6. UI using mock data
7. Real CLōD functions
8. Final polish

Even if asked to build the whole project, follow this order.

---

## 2.2 Do Not Add Unrequested Infrastructure

Do not add:

- Database
- Authentication
- Prisma
- Supabase
- Clerk
- NextAuth
- Redux
- Zustand
- tRPC
- LangChain
- Vector database
- Payment flow
- User accounts
- Dashboard
- Multi-page navigation
- Browser extension
- Real SDK publishing
- Persistent storage
- Complex settings page
- Model selector

This is a one-day hackathon demo. Keep the scope tight.

---

## 2.3 Keep the Demo Stable

The app must be fully demoable with:

```env
MOCK_API=true
```

Real API mode is optional. The UI must look complete and convincing even if no real API key is available.

---

## 2.4 Do Not Break Existing Working Code

When editing:

- Make small changes
- Preserve existing types
- Preserve working mock behavior
- Do not rename files unless explicitly asked
- Do not change the public response schema
- Do not remove fallback behavior
- Do not introduce build errors
- Do not delete UI sections that are already working

---

# 3. Tech Stack

Use:

- Next.js 14
- App Router
- TypeScript
- Tailwind CSS
- React functional components
- OpenAI npm package for CLōD integration

Use only necessary dependencies.

Avoid unnecessary libraries unless they meaningfully improve the demo and do not increase risk.

---

# 4. Required File Structure

The final project should use this structure:

```txt
/app
  /api
    /council
      route.ts
    /reasoning
      route.ts
  /components
    DecisionInput.tsx
    AgentCard.tsx
    Briefing.tsx
    ReasoningPanel.tsx
    ComparisonView.tsx
  page.tsx
  globals.css
  layout.tsx

/lib
  council.ts
  mock.ts
  types.ts

.env.local
PRD.md
AGENTS.md
```

Do not create extra folders unless necessary.

---

# 5. Environment Variables

Use `.env.local`:

```env
CLOD_API_KEY=your_key_here
MOCK_API=true
```

Rules:

- If `MOCK_API=true`, API routes return mock data.
- If `MOCK_API=false`, API routes call CLōD.
- If `MOCK_API` is missing, default to mock mode.
- If `CLOD_API_KEY` is missing in real mode, return graceful fallback.
- Never expose `CLOD_API_KEY` to the client.
- All CLōD calls must happen server-side only.

Use this logic:

```ts
const useMock = process.env.MOCK_API !== "false";
```

This makes mock mode the safe default.

---

# 6. Required TypeScript Types

Create `/lib/types.ts`.

Use these exact types unless explicitly asked to extend them:

```ts
export type Confidence = "high" | "medium" | "low";

export type AgentName =
  | "Strategist"
  | "Skeptic"
  | "Operator"
  | "Psychologist";

export type AgentResponse = {
  name: AgentName;
  role: string;
  response: string;
};

export type Briefing = {
  recommendation: string;
  reasoning: string;
  dissent: string;
  biggest_risk: string;
  confidence: Confidence;
  what_would_change_this: string;
  should_ask_human: boolean;
  suggested_question: string;
};

export type CouncilResponse = {
  agents: AgentResponse[];
  briefing: Briefing;
};

export type ReasoningResponse = {
  response: string;
};
```

Do not rename these fields. The UI and API depend on them.

---

# 7. Mock Data Requirements

Create `/lib/mock.ts`.

It must export:

```ts
export const MOCK_REASONING_RESPONSE: ReasoningResponse;
export const MOCK_COUNCIL_RESPONSE: CouncilResponse;
```

Use this exact mock data unless asked to improve the copy:

```ts
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
```

Mock responses are part of the demo. They should not feel like placeholder text.

---

# 8. Core Library Requirements

Create `/lib/council.ts`.

It must export:

```ts
export async function mockCouncil(decision: string): Promise<CouncilResponse>;

export async function mockReasoning(
  decision: string
): Promise<ReasoningResponse>;

export async function realCouncil(decision: string): Promise<CouncilResponse>;

export async function realReasoning(
  decision: string
): Promise<ReasoningResponse>;
```

---

## 8.1 `mockCouncil`

Implementation requirement:

```ts
export async function mockCouncil(
  decision: string
): Promise<CouncilResponse> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return MOCK_COUNCIL_RESPONSE;
}
```

The `decision` argument may be unused in mock mode, but keep it for API consistency.

---

## 8.2 `mockReasoning`

Implementation requirement:

```ts
export async function mockReasoning(
  decision: string
): Promise<ReasoningResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return MOCK_REASONING_RESPONSE;
}
```

---

# 9. CLōD Integration

Use the OpenAI package:

```ts
import OpenAI from "openai";
```

Client setup:

```ts
const client = new OpenAI({
  baseURL: "https://api.clod.io/v1",
  apiKey: process.env.CLOD_API_KEY,
});
```

Model:

```ts
const MODEL = "DeepSeek V3";
```

Important:

Use:

```ts
max_completion_tokens
```

Do not use:

```ts
max_tokens
```

Suggested token limits:

```ts
const AGENT_TOKEN_LIMIT = 150;
const REASONING_TOKEN_LIMIT = 200;
const SYNTHESIS_TOKEN_LIMIT = 300;
```

Use temperature:

```ts
temperature: 0.7
```

Extract response with:

```ts
completion.choices[0]?.message?.content
```

Always trim returned content.

---

# 10. Real Single-Pass Reasoning Function

`realReasoning(decision: string)` should make one simple CLōD chat completion call.

Purpose:

This is the comparison baseline. It should be a normal single-pass answer, not a fake bad answer.

System prompt:

```txt
You are an AI coding agent. Answer the user's decision question directly and briefly. Do not simulate a panel. Do not mention Council.
```

User message:

```txt
{decision}
```

Suggested implementation shape:

```ts
export async function realReasoning(
  decision: string
): Promise<ReasoningResponse> {
  try {
    const client = getClient();

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an AI coding agent. Answer the user's decision question directly and briefly. Do not simulate a panel. Do not mention Council.",
        },
        {
          role: "user",
          content: decision,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content?.trim();

    if (!response) {
      throw new Error("Empty reasoning response");
    }

    return { response };
  } catch (error) {
    console.error("realReasoning failed:", error);

    return {
      response:
        "I cannot complete this reasoning pass right now. Because this decision involves a significant assumption, the agent should avoid proceeding blindly and ask the user for clarification.",
    };
  }
}
```

---

# 11. Council Prompt Requirements

The Council must use four sequential agent calls plus one synthesis call.

Order:

1. Strategist
2. Skeptic
3. Operator
4. Psychologist
5. Synthesis agent

Each agent must receive:

1. The original decision
2. The agent’s persona
3. Previous agents’ outputs, if any
4. Strict instruction to challenge, disagree, or add missing perspective

Do not run the four agents in parallel. Sequential calls create the visible disagreement.

---

# 12. Shared Agent Prompt Template

Every Council member must follow this structure:

```txt
You are {name}, a Council member with a distinct perspective and strong opinions.

You are part of Council, a judgment layer used by AI agents when they are about to make significant assumptions.

The calling agent is facing this decision:

"{decision}"

Your job is NOT to summarize or politely agree. Your job is to add what others missed, challenge what you think is wrong, and hold your position under pressure.

If previous Council members have spoken, you have read their responses. Name disagreements explicitly.

Be specific. Do not use generic advice. Do not say "it depends" unless you immediately name what it depends on.

Keep your response to 3-4 sharp sentences. No padding.
```

Then append the agent-specific persona prompt.

---

# 13. Agent Persona Prompts

## 13.1 Strategist

```txt
You are Strategist.

Role:
Big picture, opportunity, direction, timing.

Persona:
You are a founder who has scaled two companies. You are optimistic but not naive. You believe timing and direction matter more than perfection. You push toward action when the path is clear.

Bias:
You overweight opportunity and momentum. You underweight execution friction.

Voice:
Confident, direct, outcome-focused, concrete.

Required behavior:
Identify the highest-leverage path. If proceeding is reasonable, argue for momentum. If pausing is necessary, explain the strategic reason.
```

---

## 13.2 Skeptic

```txt
You are Skeptic.

Role:
Risks, failure modes, flawed assumptions.

Persona:
You are a former operator who has watched good ideas fail because of one bad assumption nobody questioned. You distrust confidence without evidence. You find the one assumption that, if wrong, makes everything else irrelevant.

Bias:
You overweight downside. You challenge the framing before accepting it.

Voice:
Pointed, dry, uncomfortable, precise.

Required behavior:
You MUST identify at least one specific flaw or unexamined assumption in what the Strategist said. Agreement is not an option. If the Strategist's answer sounds reasonable, explain what it still missed.
```

---

## 13.3 Operator

```txt
You are Operator.

Role:
Execution reality, sequencing, resources, dependencies.

Persona:
You are a COO type. You have built things, managed budgets, dealt with failure at 2am, and cleaned up decisions that sounded good in meetings. You are unromantic about execution. You think in sequencing, dependencies, and what breaks first.

Bias:
You overweight logistics. You underweight strategic importance.

Voice:
Blunt, practical, timeline-aware, checklist-minded.

Required behavior:
You MUST ground the discussion in at least one specific execution reality that previous agents ignored. This can be time, budget, migration cost, team skill, deployment, maintenance, tooling, or operational burden.
```

---

## 13.4 Psychologist

```txt
You are Psychologist.

Role:
Human dynamics, incentives, trust, communication, behavior.

Persona:
You are trained in behavioral economics and organizational dynamics. You believe most decisions fail not because of bad strategy but because of unexamined human dynamics: ego, fear, trust, unclear ownership, misaligned incentives, or unstated preferences.

Bias:
You overweight interpersonal and behavioral factors. You may miss structural issues.

Voice:
Curious, reframing, human-centered, incisive.

Required behavior:
You MUST name a specific human or organizational dynamic relevant to this decision. For technical decisions, surface whose preferences, assumptions, or constraints were not made explicit.
```

---

# 14. Previous Agent Context Format

When calling an agent after Strategist, include previous responses in the user message.

Use this format:

```txt
Original decision:
{decision}

Previous Council responses:

Strategist:
{strategistResponse}

Skeptic:
{skepticResponse}

Operator:
{operatorResponse}

Now respond as Psychologist. Add what they missed and challenge what you disagree with.
```

Only include agents that have already spoken.

Keep the context readable. Do not include excessive internal implementation details.

---

# 15. Synthesis Prompt

The synthesis agent returns final structured judgment.

Use this exact system prompt:

```txt
You have observed a Council deliberation between four advisors with genuinely different perspectives.

Your job is to produce structured judgment for the AI agent that called Council.

You are not a summarizer. You must capture not just the recommendation but the actual disagreement that shaped it.

A clean consensus is suspicious. If agents disagreed, that disagreement belongs in the output.

The calling agent needs to know:
- what to do
- why
- how confident to be
- what could break the recommendation
- what information would change the recommendation
- whether to proceed or ask the human

Return ONLY valid JSON.
No preamble.
No markdown fences.
No comments.
No trailing commas.

The JSON must exactly match this TypeScript shape:

{
  "recommendation": "string",
  "reasoning": "string",
  "dissent": "string",
  "biggest_risk": "string",
  "confidence": "high" | "medium" | "low",
  "what_would_change_this": "string",
  "should_ask_human": boolean,
  "suggested_question": "string"
}

Rules:
- recommendation must be one clear action sentence
- reasoning must be 2-3 sentences
- dissent must identify where the Council disagreed most
- biggest_risk must name the one assumption most likely to break the decision
- confidence must be high, medium, or low
- should_ask_human must be true if the Council lacks enough information
- if should_ask_human is true, suggested_question must be exactly one question the calling agent should ask the human
- if should_ask_human is false, suggested_question may be an empty string
```

User message:

```txt
Original decision:
{decision}

Council deliberation:

Strategist:
{strategistResponse}

Skeptic:
{skepticResponse}

Operator:
{operatorResponse}

Psychologist:
{psychologistResponse}

Produce the structured judgment now.
```

---

# 16. JSON Extraction

Models may return JSON wrapped in markdown fences. Implement this helper in `/lib/council.ts`:

```ts
function extractJson(text: string): Briefing {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}
```

Also validate the parsed object.

---

# 17. Briefing Validation

After parsing synthesis JSON, ensure all required fields exist.

Validation requirements:

```ts
function isValidBriefing(value: unknown): value is Briefing {
  if (!value || typeof value !== "object") return false;

  const briefing = value as Partial<Briefing>;

  return (
    typeof briefing.recommendation === "string" &&
    typeof briefing.reasoning === "string" &&
    typeof briefing.dissent === "string" &&
    typeof briefing.biggest_risk === "string" &&
    (briefing.confidence === "high" ||
      briefing.confidence === "medium" ||
      briefing.confidence === "low") &&
    typeof briefing.what_would_change_this === "string" &&
    typeof briefing.should_ask_human === "boolean" &&
    typeof briefing.suggested_question === "string"
  );
}
```

If validation fails, use fallback briefing.

---

# 18. Fallback Behavior

The app must not crash if CLōD fails.

Use this fallback briefing:

```ts
const FALLBACK_BRIEFING: Briefing = {
  recommendation:
    "Council could not complete deliberation. Do not proceed blindly.",
  reasoning:
    "The deliberation layer failed before producing reliable judgment. Because this is a significant assumption point, the safest next action is to ask the human for clarification.",
  dissent: "Unavailable because the Council process did not complete.",
  biggest_risk: "The agent may continue based on an unsupported assumption.",
  confidence: "low",
  what_would_change_this:
    "A successful Council run or direct clarification from the human.",
  should_ask_human: true,
  suggested_question:
    "Can you clarify the missing requirement before I proceed?",
};
```

If one agent call fails, prefer returning a full fallback response instead of partial broken UI.

Fallback Council response shape:

```ts
const FALLBACK_COUNCIL_RESPONSE: CouncilResponse = {
  agents: [],
  briefing: FALLBACK_BRIEFING,
};
```

Server-side error logging is allowed.

Never expose raw API errors in the user-facing UI.

---

# 19. API Route Requirements

## 19.1 `/app/api/reasoning/route.ts`

Must:

- Accept POST only
- Parse JSON body
- Validate `decision` is a non-empty string
- Check `process.env.MOCK_API`
- Call mock or real reasoning function
- Return JSON
- Return 400 for missing or invalid decision
- Return 500 only for unexpected errors

Recommended implementation shape:

```ts
import { NextResponse } from "next/server";
import { mockReasoning, realReasoning } from "@/lib/council";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const decision = body.decision;

    if (!decision || typeof decision !== "string") {
      return NextResponse.json(
        { error: "decision is required" },
        { status: 400 }
      );
    }

    const useMock = process.env.MOCK_API !== "false";

    const result = useMock
      ? await mockReasoning(decision)
      : await realReasoning(decision);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Reasoning API error:", error);

    return NextResponse.json(
      { error: "Failed to generate reasoning response" },
      { status: 500 }
    );
  }
}
```

---

## 19.2 `/app/api/council/route.ts`

Must:

- Accept POST only
- Parse JSON body
- Validate `decision` is a non-empty string
- Check `process.env.MOCK_API`
- Call mock or real Council function
- Return JSON
- Return 400 for missing or invalid decision
- Return 500 only for unexpected errors

Recommended implementation shape:

```ts
import { NextResponse } from "next/server";
import { mockCouncil, realCouncil } from "@/lib/council";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const decision = body.decision;

    if (!decision || typeof decision !== "string") {
      return NextResponse.json(
        { error: "decision is required" },
        { status: 400 }
      );
    }

    const useMock = process.env.MOCK_API !== "false";

    const result = useMock
      ? await mockCouncil(decision)
      : await realCouncil(decision);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Council API error:", error);

    return NextResponse.json(
      { error: "Failed to generate Council response" },
      { status: 500 }
    );
  }
}
```

---

# 20. UI Design Rules

## 20.1 Design Personality

The UI should feel like:

- Infrastructure
- Serious
- Technical
- Sharp
- Trustworthy
- Minimal

The UI should not feel like:

- A chatbot
- A toy
- A purple AI SaaS landing page
- A social app
- A generic dashboard
- A playful brainstorm tool

---

## 20.2 Visual Rules

Use:

- Dark backgrounds
- Thin borders
- Sharp or minimally rounded corners
- Muted text
- Strong typography hierarchy
- Subtle hover states
- Small uppercase labels
- Monospace for JSON

Avoid:

- Large rounded pill buttons
- Bright gradients
- Purple glow
- Chat bubbles
- Overuse of emojis
- Excessive shadows
- Cartoon icons

---

## 20.3 Color Reference

Use these as design references:

```txt
background: #0f0f0f
left panel: #111318
right panel: #110f0a
json block: #0a0a0a
muted VS label: #333333
border color: neutral-800
muted text: neutral-400
```

Agent accent colors:

```txt
Strategist: amber / #f59e0b
Skeptic: red / #ef4444
Operator: blue / #3b82f6
Psychologist: green / #10b981
```

Confidence colors:

```txt
high: green
medium: amber
low: red
```

Human pause callout:

```txt
background: #1a1500
border: amber
```

---

# 21. Component Requirements

## 21.1 `DecisionInput.tsx`

Props:

```ts
type DecisionInputProps = {
  initialValue: string;
  isLoading: boolean;
  onSubmit: (decision: string) => void;
};
```

Responsibilities:

- Display the default decision
- Allow editing
- Use a textarea
- Disable submit while loading
- Disable submit if input is empty
- Call `onSubmit(decision)`

Required label:

```txt
What is your agent about to assume?
```

Button states:

```txt
Idle: Convene Council
Loading: Convening...
```

Default decision text:

```txt
I am building a web app for an early-stage startup. The user has not specified a database, auth strategy, or expected scale. I am about to assume PostgreSQL with a standard relational schema. Should I proceed with this assumption, or is there something I am missing before I make this architectural decision?
```

---

## 21.2 `ReasoningPanel.tsx`

Props:

```ts
type ReasoningPanelProps = {
  response: ReasoningResponse | null;
  isLoading: boolean;
  error?: string | null;
};
```

Responsibilities:

- Show title: `Single-Pass Agent`
- Show subtext: `One pass. One perspective. No deliberation layer.`
- Show loading skeleton/pulse while loading
- Show response once complete
- Show final label: `Confident. Fast. One-dimensional.`
- Show controlled error if needed

Do not use chat bubbles.

---

## 21.3 `AgentCard.tsx`

Props:

```ts
type AgentCardProps = {
  agent: AgentResponse;
  index: number;
};
```

Responsibilities:

- Show agent name
- Show role
- Show response
- Use left accent border based on agent name
- Use staggered animation based on index

Accent mapping:

```ts
const accentByAgent = {
  Strategist: "border-l-amber-500",
  Skeptic: "border-l-red-500",
  Operator: "border-l-blue-500",
  Psychologist: "border-l-emerald-500",
};
```

---

## 21.4 `Briefing.tsx`

Props:

```ts
type BriefingProps = {
  briefing: Briefing;
};
```

Sections:

1. Recommendation
2. Confidence badge
3. Reasoning
4. Key dissent
5. Biggest risk
6. What would change this
7. Pause callout if `should_ask_human` is true
8. Raw JSON

Pause callout copy:

```txt
Council recommends pausing.

Before proceeding, ask the user:

"{suggested_question}"
```

The raw JSON must be visible. It proves this is an agent-facing judgment layer, not just a pretty UI.

---

## 21.5 `ComparisonView.tsx`

Props:

```ts
type ComparisonViewProps = {
  decision: string;
};
```

Responsibilities:

- Trigger `/api/reasoning` and `/api/council`
- Run both API calls simultaneously
- Manage loading states
- Show split-screen layout
- Show ReasoningPanel on left
- Show Council cards and Briefing on right
- Show final loop-closing copy

Required final copy:

```txt
The agent received this as structured JSON and updated its next action.
```

```txt
No assumption was made. No human was interrupted unnecessarily.
```

---

# 22. Fetching API Data

Use a helper like this:

```ts
async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}
```

In `ComparisonView`, call both routes at the same time:

```ts
const [reasoningResult, councilResult] = await Promise.all([
  postJson<ReasoningResponse>("/api/reasoning", { decision }),
  postJson<CouncilResponse>("/api/council", { decision }),
]);
```

---

# 23. Loading State Requirements

Because mock mode includes fake delay, loading should feel intentional.

Recommended flow:

1. User submits decision
2. Split screen appears immediately
3. Left panel shows loading
4. Right panel shows `Assembling Council...`
5. Reasoning response appears first
6. Council result returns
7. Agent cards reveal one by one
8. Show `Synthesizing judgment...`
9. Briefing appears
10. Raw JSON appears

Do not over-engineer streaming. Simple timed reveal is enough.

---

# 24. Accessibility Requirements

Minimum requirements:

- Buttons must be keyboard accessible
- Text contrast must be readable
- Textarea must have a label
- Do not rely on color alone for meaning
- Use semantic HTML where possible
- Do not remove focus outlines unless replacing them with visible focus styles

---

# 25. Error State Requirements

If an API call fails:

- Show a controlled error message
- Do not show stack traces
- Do not crash the page
- Keep the input available
- Allow retry

Suggested UI text:

```txt
Council could not complete this run. The agent should not proceed blindly.
```

---

# 26. Required Product Copy

Use this exact copy where possible.

Product description:

```txt
When your agent is about to make a significant assumption, Council convenes a panel of specialized advisors who deliberate and return structured judgment — automatically, without interrupting you.
```

Left panel subtext:

```txt
One pass. One perspective. No deliberation layer.
```

Right panel subtext:

```txt
Four perspectives. Explicit disagreement. Structured judgment.
```

Final line:

```txt
No assumption was made. No human was interrupted unnecessarily.
```

---

# 27. Things Not to Say in the UI

Avoid:

```txt
Chat with your advisors
Ask AI anything
Your personal AI boardroom
AI brainstorm
Council of experts
Magic
Autonomous superintelligence
```

The app is not a generic chatbot.

It is an agent infrastructure tool.

---

# 28. Real Council Function Implementation Outline

Use helper functions in `/lib/council.ts`.

Recommended constants:

```ts
const MODEL = "DeepSeek V3";
const AGENT_TOKEN_LIMIT = 150;
const REASONING_TOKEN_LIMIT = 200;
const SYNTHESIS_TOKEN_LIMIT = 300;
```

Client helper:

```ts
function getClient() {
  if (!process.env.CLOD_API_KEY) {
    throw new Error("Missing CLOD_API_KEY");
  }

  return new OpenAI({
    baseURL: "https://api.clod.io/v1",
    apiKey: process.env.CLOD_API_KEY,
  });
}
```

Agent call helper:

```ts
async function callAgent(params: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    temperature: 0.7,
    max_completion_tokens: AGENT_TOKEN_LIMIT,
  });

  const content = completion.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Empty agent response");
  }

  return content;
}
```

Synthesis helper should use `SYNTHESIS_TOKEN_LIMIT`.

---

# 29. Agent Output Validation

After each agent call:

- Trim the response
- Ensure it is not empty
- Store it as plain text
- Do not parse it as JSON
- Display it in the UI

Only the synthesis output should be parsed as JSON.

---

# 30. Testing Checklist

Before demo, verify:

- `npm run dev` works
- No TypeScript errors
- No console errors in mock mode
- Landing page loads
- Default input appears
- Submit works
- Both panels appear
- Reasoning response appears
- Council agents appear
- Briefing appears
- Raw JSON appears
- Pause callout appears
- Page works on projector-sized screen
- Text is readable from a distance
- `MOCK_API=false` was tested at least once
- `MOCK_API=true` is restored before demo unless intentionally using live mode

---

# 31. Demo Safety Rules

For the actual judging demo:

- Prefer `MOCK_API=true`
- Do not depend on live API unless asked
- Keep `.env.local` ready
- Keep terminal already running
- Keep browser already loaded
- Do not change code right before judging
- Have the demo input pre-filled
- Have one backup screenshot or video if possible

---

# 32. Suggested Cursor Workflow

Do not ask Cursor to build everything at once.

Use these prompts one at a time.

---

## Prompt 1: Types and Mock Data

```txt
Read PRD.md and AGENTS.md. Set up the required TypeScript types in /lib/types.ts and mock data in /lib/mock.ts only. Do not build UI yet. Do not implement real API calls yet.
```

---

## Prompt 2: Mock Library

```txt
Now implement /lib/council.ts with mockCouncil and mockReasoning working. Add realCouncil and realReasoning as safe stubs for now. Do not call CLōD yet.
```

---

## Prompt 3: API Routes

```txt
Implement /app/api/reasoning/route.ts and /app/api/council/route.ts. They should read process.env.MOCK_API and call mock functions when MOCK_API is not exactly "false". Validate decision input.
```

---

## Prompt 4: Landing Page

```txt
Build the landing page and DecisionInput component according to PRD.md. Use dark sharp styling. Do not build comparison view yet.
```

---

## Prompt 5: Comparison UI

```txt
Build ComparisonView, ReasoningPanel, AgentCard, and Briefing components using the mock API routes. The split screen, loading states, agent cards, briefing, pause callout, and raw JSON display must work.
```

---

## Prompt 6: UI Polish

```txt
Polish the UI according to the design section in PRD.md and AGENTS.md. Keep the dark infrastructure aesthetic. No purple gradients, no chat bubbles, no rounded pill buttons.
```

---

## Prompt 7: Real CLōD Integration

```txt
Now implement realReasoning and realCouncil using the OpenAI npm package and CLōD baseURL. Follow the exact prompts and JSON parsing rules in AGENTS.md. Keep mock mode as the default.
```

---

## Prompt 8: Bug Fix Only

```txt
Do not add features. Only inspect the code for TypeScript errors, runtime errors, missing imports, broken API calls, or mismatches with AGENTS.md. Fix only those issues.
```

---

# 33. Common Mistakes to Avoid

Do not:

- Build the real API first
- Add a database
- Add auth
- Make it a chatbot
- Rename schema fields
- Hide the JSON
- Over-design the landing page
- Make the Council responses generic
- Remove disagreement from the synthesis
- Let the single-pass side look broken
- Make the left side artificially dumb
- Depend on live CLōD for the demo
- Forget to restore `MOCK_API=true`

---

# 34. Definition of Done

The project is done when:

- Mock mode works end to end
- UI clearly contrasts single-pass response vs Council deliberation
- Agent cards show meaningful disagreement
- Briefing card returns structured judgment
- Raw JSON is visible
- CLōD integration exists and has been tested once
- Demo can run safely without internet/model dependency using mock mode
- The project can be explained in one sentence:

```txt
Council helps AI agents avoid silent bad assumptions by convening multiple perspectives before action.
```