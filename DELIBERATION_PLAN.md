# Council Deliberation Plan

This file captures the decisions, plan, and open questions for the next phase of work on Council. It is the single forward-looking source of truth. If anything in `BUILD_PLAN.md` or `NEXT_SESSION_PROMPT.md` conflicts, this file wins.

## Snapshot

What is working today:
- Next.js 14 app router scaffold, Tailwind dark UI, TypeScript types in `lib/types.ts`.
- Mock backend in `lib/council.ts` powered by `lib/mock.ts`.
- POST routes at `app/api/reasoning/route.ts` and `app/api/council/route.ts`.
- Landing page with editable assumption input.
- Split-screen comparison: single model vs Council.
- Council animation reveals 4 agent cards, briefing card, pause callout, raw JSON.
- Recent fixes: post-submit auto-scroll to results, briefing column no longer overflows horizontally.
- Production smoke test: `/`, `/api/reasoning`, `/api/council` all 200.
- `MOCK_API=true` is the default and must stay default until live testing.

What is not working yet:
- `realReasoning` and `realCouncil` in `lib/council.ts` are explicit stubs. No CLōD calls yet.
- The current UI shows 4 single-shot agent responses. The agreed product flow is 2 sequential rounds (8 turns) + synthesis.

## Product framing (locked)

- Council is a thinking-phase **tool** that an AI calls when it hits a significant assumption.
- The tool spawns multiple agent personas that deliberate; a synthesizer returns structured JSON the parent AI can consume.
- No human-in-the-loop. The website is a visualization of the internal deliberation, used for the demo.
- One-line pitch: **"Don't assume. Consult."**

## Architectural decision (locked)

- Pattern: **sequential, 2 cycles, 4 agents, 1 synthesizer**.
- Agents and order: **Strategist → Skeptic → Operator → Psychologist**.
- Round 1: each agent reads the assumption + all prior turns in this round.
- Round 2: each agent reads the assumption + all 4 Round 1 turns + any Round 2 turns produced before them.
- Synthesizer (call 9) reads the full 8-turn transcript and returns the Briefing JSON.
- Hard cap at 2 rounds. No looping. No early exits.
- Total CLōD calls per Council run: **9**, plus **1** for the single-model panel = **10 calls per demo run**.

Why sequential and not parallel:
- The product goal is the human feel of agents arguing with each other.
- Each agent must be able to disagree with what came before. Parallel calls cannot do that.

## CLōD integration cheatsheet

- Base URL: `https://api.clod.io/v1`
- Auth header: `Authorization: Bearer ${CLOD_API_KEY}`
- Model id: `"DeepSeek V3"` (exact string)
- Tokens: use `max_completion_tokens`, not `max_tokens`
- Temperature: `0.7`
- API is OpenAI-compatible, use the `openai` npm package with `baseURL` + `apiKey`
- Streaming supported via `stream: true`
- Free tier: **100 requests/day**, auto-replenished — that's roughly **10 full Council demos per day**

Token budgets to start with:
- Each agent turn: `max_completion_tokens: 200`
- Synthesizer: `max_completion_tokens: 400`
- Single-model panel: `max_completion_tokens: 200`

## Data shape changes (Phase 1)

Current `CouncilResponse` has a flat `agents: CouncilAgent[]` of 4 items.

Target shape (additive, do not break existing fields if possible):

```ts
export type CouncilTurn = {
  agent: "Strategist" | "Skeptic" | "Operator" | "Psychologist";
  role: string;
  cycle: 1 | 2;
  response: string;
};

export type CouncilResponse = {
  transcript: CouncilTurn[]; // 8 entries in deliberation order
  briefing: Briefing;        // unchanged
  agents?: CouncilAgent[];   // legacy, can be derived from transcript or removed
};
```

UI consumes `transcript` directly and renders turns in order with a cycle label.

## Phase plan

### Phase 1 — Refactor and streaming (no API key needed)

1. Refactor `lib/types.ts` to add `CouncilTurn` and `transcript` on `CouncilResponse`.
2. Rewrite `lib/mock.ts` to produce a believable 8-turn transcript that matches the demo assumption (Postgres database scenario), with each Round 2 turn explicitly reacting to Round 1.
3. Convert `app/api/council/route.ts` to **NDJSON streaming**. Event types:
   - `{"type":"turn", "turn": CouncilTurn}` — emitted as each turn finishes
   - `{"type":"synthesizing"}` — emitted before the synthesis call
   - `{"type":"briefing", "briefing": Briefing}` — emitted with the final briefing
   - `{"type":"error", "message": string}` — on any failure
4. Mock backend fake-streams turns with realistic delays (~600ms per turn) so the UI can be tested end-to-end without spending CLōD credits.
5. Update `ComparisonView` to consume the NDJSON stream via `fetch` + `response.body.getReader()`. Render turns one-by-one in order. Label each card with `Round 1` or `Round 2`.
6. Decide and implement the open Round 2 UI question (see below).
7. `npm run lint && npm run build` must pass. Smoke test the mock demo.

### Phase 2 — Real CLōD (requires `CLOD_API_KEY`)

1. `npm install openai`.
2. Implement `realReasoning(decision)` — one CLōD call powering the left "Single Model Response" panel.
3. Implement `realCouncil(decision)`:
   - Build the running `messages` array for each turn. System prompt is the agent persona; user message is the assumption; prior turns are injected as `assistant` messages prefixed with the speaker name.
   - Execute 8 sequential turn calls.
   - Execute the synthesizer call with all 8 turns + the assumption.
   - Parse synthesis as JSON (strip optional markdown fences first). Validate it matches the `Briefing` shape.
   - Stream each turn out via the same NDJSON channel as Phase 1.
4. Safe fallbacks:
   - If any individual turn fails, emit an `error` event for that turn but keep going.
   - If synthesis fails or JSON is malformed, return a fallback briefing that says Council was unable to synthesize and recommends pausing.
5. Test order, with explicit user approval before each step:
   - One test call with `max_completion_tokens: 50` to confirm auth works.
   - One full Round 1 (4 turns) live, no synthesizer, no Round 2.
   - Full 2-round + synthesizer live, end-to-end.
   - Restore `MOCK_API=true` so the demo state is safe.

### Phase 3 — Optional polish

- Add a small "Tool call from thinking phase" preamble in `ComparisonView` so the framing is unmistakable to demo viewers.
- Add a tiny request counter so the user knows how many of their 100 daily free requests have been spent.
- Final demo pass per `BUILD_PLAN.md` Step 7.

## Open decisions (need user input before Phase 1 step 6)

**Round 2 visual layout:**
- Option A (transcript): each Round 2 turn appears as a new card underneath the Round 1 cards. The full 8-card transcript reads top-to-bottom. **Recommended.**
- Option B (per-agent): each agent has a single card that updates with their latest take. Round 2 replaces or appends inside the same card.

Default if no answer: Option A.

## Constraints to respect

- Keep `MOCK_API=true` as the default until explicit live testing is requested.
- Never commit `.env.local`. Never expose `CLOD_API_KEY` to the client.
- Do not rebuild the project from scratch.
- Visual style: dark, sharp, infrastructure-flavored. No purple gradients, chat bubbles, or rounded pill buttons.
- `npm run dev` previously hit an EMFILE watcher limit locally. Use production mode for viewing if it happens:
  1. `npm run build`
  2. `npm run start -- -p 3000`
  3. Open http://localhost:3000

## Pending inputs from the user

- `CLOD_API_KEY` placed in `.env.local` (only needed when starting Phase 2).
- Answer to the Round 2 UI question above (only needed during Phase 1 step 6).
- Confirmation that the teammate's UI updates have been pulled before any new edits begin.
