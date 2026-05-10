# Council

<div align="center">
  <h3>Don't assume. Consult.</h3>
  <p>
    Council is a judgment layer for AI agents that catches meaningful assumption points,
    convenes multiple specialized advisors, surfaces disagreement, and returns structured
    judgment before the agent acts.
  </p>
  <p>
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript&logoColor=white" />
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white" />
    <img alt="Status" src="https://img.shields.io/badge/status-demo_ready-c9a449?style=flat-square" />
  </p>
</div>

## What It Is

AI agents often fail at the moment they sound most confident: when they make a plausible assumption silently.

Council gives an agent a better option. Instead of guessing, halting, or relying on one longer reasoning pass, the agent calls a small panel of advisors with distinct perspectives. They deliberate over two rounds, challenge each other, and produce a structured verdict the parent agent can use.

This repository is a polished hackathon demo of that idea. The app visualizes the difference between a single-pass model answer and a streamed multi-agent Council session.

## The Demo

The default scenario is an AI coding agent building a web app for an early-stage startup. The user did not specify a database, so the agent is about to assume PostgreSQL.

Council shows what happens when the agent pauses before acting:

- A baseline model gives one fast response.
- Four advisors deliberate in sequence: Strategist, Skeptic, Operator, and Psychologist.
- The same advisors return for a second round of replies.
- A synthesizer compiles the discussion into structured JSON.
- The final briefing includes recommendation, reasoning, dissent, risk, confidence, and whether to ask the human.

The product story is simple: no assumption was made silently, and no human was interrupted unnecessarily.

## Features

- Dark, modern, infrastructure-style UI with sharp borders, muted surfaces, and high-contrast typography.
- Editable assumption input with a prefilled demo prompt.
- Baseline single-model comparison panel.
- Streaming Council transcript over NDJSON, rendered as each advisor responds.
- Two-round deliberation with visible disagreement and role-specific voices.
- Live composing placeholders, progress indicators, timestamps, and typewriter pacing.
- Final structured briefing with confidence badge, dissent, biggest risk, and raw JSON payload.
- Mock mode that mirrors the live streaming experience without requiring credits or an API key.
- Live CLoD integration using the OpenAI-compatible API client.
- Server-side fallback behavior so model failures do not crash the demo.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- OpenAI npm client pointed at `https://api.clod.io/v1`
- NDJSON streaming via `ReadableStream`

There is intentionally no database, auth, account system, dashboard, or persistent storage. Council is scoped as a focused agent-infrastructure demo.

## How It Works

Council runs as a sequential pipeline:

1. The user submits an assumption or decision point.
2. `/api/reasoning` returns the single-pass baseline answer.
3. `/api/council` streams a Council session as one JSON event per line.
4. Round 1 runs Strategist -> Skeptic -> Operator -> Psychologist.
5. Round 2 runs the same advisors again with the full prior transcript.
6. A synthesizer reads all 8 turns and returns the final briefing JSON.
7. The UI renders each turn as it arrives and closes with the structured verdict.

Live mode uses distinct models per role, with a silent fallback model if an advisor call fails. Mock mode replays high-quality canned responses with realistic delays so the demo remains reliable.

## Quick Start

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
touch .env.local
```

Add safe demo defaults:

```env
MOCK_API=true
CLOD_API_KEY=your_clod_key_here
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If the local watcher hits an `EMFILE: too many open files` error, use production mode instead:

```bash
npm run build
npm run start -- -p 3000
```

## Environment Variables

`MOCK_API`

Controls whether the app uses the mock pipeline or live CLoD calls. Any value other than `"false"` uses mock mode, so the safe default is mock mode.

`CLOD_API_KEY`

Server-side API key for live CLoD calls. This is only required when `MOCK_API=false`. Never expose it to the client and never commit `.env.local`.

## Scripts

```bash
npm run dev      # Start Next.js in development mode
npm run build    # Create a production build
npm run start    # Start the production server
npm run lint     # Run Next.js linting
```

## API

### `POST /api/reasoning`

Returns the single-model baseline response.

Request:

```json
{
  "decision": "I am about to assume PostgreSQL. Should I proceed?"
}
```

Response:

```json
{
  "response": "PostgreSQL is a solid default choice..."
}
```

### `POST /api/council`

Streams the Council session as NDJSON.

Request:

```json
{
  "decision": "I am about to assume PostgreSQL. Should I proceed?"
}
```

Event types:

```ts
type CouncilStreamEvent =
  | {
      type: "turn";
      phase: "opening" | "rebuttal";
      agent: AgentResponse;
      model: string;
      usedFallback: boolean;
    }
  | { type: "synthesizing" }
  | { type: "briefing"; briefing: Briefing }
  | { type: "error"; message: string; agent?: AgentName };
```

## Project Structure

```txt
app/
  api/
    council/route.ts      # NDJSON Council stream
    reasoning/route.ts    # Single-pass baseline response
  components/
    Briefing.tsx          # Structured verdict card
    ChatDivider.tsx       # Transcript phase markers
    ChatPlaceholder.tsx   # Live composing state
    ChatTurn.tsx          # Advisor transcript entry
    ComparisonView.tsx    # Streaming orchestration UI
    DecisionInput.tsx     # Assumption input
    SingleModelTurn.tsx   # Baseline model entry
  globals.css             # Dark theme, animation primitives
  layout.tsx
  page.tsx

lib/
  council.ts              # Mock and live Council pipelines
  deliberation-pacing.ts  # Typewriter timing helpers
  mock.ts                 # Demo-safe mock responses
  types.ts                # Shared API contracts
```

## Design Direction

Council is not a chatbot, brainstorm toy, or generic AI dashboard. The UI is designed to feel like agent infrastructure:

- dark surfaces
- thin rules
- monospace system labels
- sharp geometry
- subtle motion
- visible JSON output
- no chat bubbles
- no purple SaaS gradients

The important visual moment is the contrast between a fast single answer and a slower, more accountable judgment process.

## Demo Safety

For judging or recording, keep `MOCK_API=true`. Mock mode is complete, polished, and visually matches the live streaming flow.

Use `MOCK_API=false` only when you intentionally want to spend CLoD credits and test the live multi-model pipeline.

## Status

Council is demo-ready:

- Mock pipeline works end to end.
- Live CLoD integration is implemented.
- Council streams advisor turns one at a time.
- The final briefing returns structured JSON.
- The app ships a complete dark theme and polished demo flow.
