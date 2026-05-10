# Council Deliberation Plan

This file captures the decisions, plan, and open questions for Council. It is the single forward-looking source of truth. If anything in `BUILD_PLAN.md`, `AGENTS.MD`, or `NEXT_SESSION_PROMPT.md` conflicts, this file wins.

## Snapshot — what is true today

**Phase 1 (refactor + streaming) is DONE.**
**Phase 2 (live CLōD integration) is DONE and verified live four times via curl.**

What is working today:
- Next.js 14 app router scaffold, Tailwind UI, TypeScript types in `lib/types.ts`.
- Mock backend in `lib/council.ts` (`mockCouncil`, `mockCouncilStream`, `mockReasoning`).
- Real backend in `lib/council.ts` (`realCouncil`, `realCouncilStream`, `realReasoning`).
- POST `app/api/reasoning/route.ts` — single CLōD call, JSON response.
- POST `app/api/council/route.ts` — **NDJSON streaming** of 9 CLōD events (8 turns + briefing).
- `app/components/ComparisonView.tsx` consumes the NDJSON stream via `response.body.getReader()` and renders agents one at a time as they arrive.
- Landing page with editable assumption input.
- Round 1: full-width agent cards with abstract glyphs.
- Round 2: separate "cross-fire channel" panel (`RoundTwoChamber.tsx`) with alternating left/right alignment.
- Synthesizer briefing card (`Briefing.tsx`) with confidence badge, dissent, biggest risk, raw JSON, and pause callout.
- Per-card typewriter effect via `lib/deliberation-pacing.ts::getSimulatedTypingMs`.
- `MOCK_API=true` is the safe demo default; flip to `false` for live runs.
- `npm run lint` and `npm run build` pass cleanly.

Verified live curl runs (in chronological order):
1. First run — confirmed streaming works one event at a time, but Strategist's `GPT-5` model id was rejected and synthesis fell back.
2. Second run — confirmed canonical lowercase model ids, `claude-opus-4-7` rejected for synth.
3. Third run — synth fixed via `claude-sonnet-4-5`, but `gpt-5-mini` was also rejected on this account and the DeepSeek V3.2 fallback leaked CoT into Strategist's response.
4. Fourth run — **all 4 advisors on assigned models with `usedFallback:false`, synth produced real briefing JSON, tone is conversational, no CoT leaks, ~25-35 second total.**

What is NOT done yet:
- **Browser smoke test of the live stream.** The UI is wired but has only been visually verified in mock mode by the teammate. We need to load `http://localhost:3000` with `MOCK_API=false` and confirm the stream renders correctly in the browser.
- Visual polish (intentionally deferred per user). The UI is light/cream rather than the dark spec in `AGENTS.MD` — the user chose to leave the visual style alone for now. Revisit at the end.
- Restore `MOCK_API=true` after live testing is complete, so the demo is reproducible without burning credits.

## Product framing (locked)

- Council is a thinking-phase **tool** that an AI agent calls when it hits a significant assumption.
- The tool spawns multiple agent personas that deliberate; a synthesizer returns structured JSON the parent AI can consume.
- No human-in-the-loop. The website is a visualization of the internal deliberation, used for the demo.
- One-line pitch: **"Don't assume. Consult."**

## Architecture (locked)

- Pattern: **sequential, 2 cycles, 4 agents, 1 synthesizer**.
- Order: **Strategist → Skeptic → Operator → Psychologist** (both rounds).
- Round 1: each agent reads the assumption + all prior turns in this round.
- Round 2: each agent reads the assumption + all 4 Round 1 turns + any Round 2 turns produced before them.
- Synthesizer (call 9) reads the full 8-turn transcript and returns the Briefing JSON.
- Hard cap at 2 rounds. No looping. No early exits.
- Total CLōD calls per Council run: **9**, plus **1** for the single-model panel = **10 calls per demo run**.

## Data shape (live)

The original plan proposed migrating `CouncilResponse.agents: AgentResponse[]` to a unified `transcript: CouncilTurn[]`. **We deliberately did NOT make this change** — the teammate's existing UI consumed the `agents` + `discussionFollowUp` shape, and switching shapes would have forced a UI rewrite for zero functional gain.

Actual shape in use:

```ts
export type CouncilResponse = {
  agents: AgentResponse[];          // Round 1, 4 entries
  discussionFollowUp?: AgentResponse[]; // Round 2, 4 entries
  briefing: Briefing;
};

export type CouncilStreamEvent =
  | { type: "turn"; phase: "opening" | "rebuttal"; agent: AgentResponse; model: string; usedFallback: boolean }
  | { type: "synthesizing" }
  | { type: "briefing"; briefing: Briefing }
  | { type: "error"; message: string; agent?: AgentName };
```

The streaming protocol is the source of truth for the live pipeline; `realCouncil` (non-streaming) is a thin wrapper that collects the stream into a single `CouncilResponse` for any caller that wants JSON.

## CLōD model lineup (locked, all canonical lowercase api ids)

Confirmed live on the user's account via the fourth verified run.

| Role | Model | Why |
|---|---|---|
| Strategist | `gpt-4.1` | Confident OpenAI workhorse. Reliable. No CoT leak. |
| Skeptic | `grok-4` | xAI default-contrarian voice. Best at adversarial pushback. |
| Operator | `Qwen/Qwen3-235B-A22B-Thinking-2507` | Analytical, procedural, distinct vendor. |
| Psychologist | `claude-sonnet-4-5` | Best at human-dynamics, reframing voice. |
| Synthesizer (call 9) | `claude-sonnet-4-5` | Reliable strict-JSON output. Temperature 0.2. |
| Single-pass left panel | `fireworks/deepseek-v3p2` | Rambly thinking-style output is the demo contrast against Council. |
| Silent fallback (any agent error) | `gpt-4o-mini` | Cheap, fast, no CoT leak. NEVER use a "thinking" model here — it leaks CoT into responses and breaks persona. |

Hard rules learned the hard way:
- **Use canonical lowercase api ids** (the strings `GET /v1/models` returns), not the display names from `clod.io/models`. Display name aliasing is inconsistent.
- **Do NOT use thinking-style models for agent personas** (DeepSeek R1, DeepSeek V3.2, gpt-5 series rejected this account, Qwen "Thinking" variant is fine because it doesn't emit visible CoT). Reserve them for the single-pass baseline.
- **gpt-5 and gpt-5-mini are rejected on this account.** Don't try them again.
- **claude-opus-4-7 is rejected on this account.** Use claude-sonnet-4-5 instead.

## Token budgets (locked)

```ts
const AGENT_TOKEN_LIMIT = 180;     // 2-3 sentences per turn
const SYNTHESIS_TOKEN_LIMIT = 700; // full briefing JSON with margin
const REASONING_TOKEN_LIMIT = 200; // single-pass left panel
```

Synthesis call uses `temperature: 0.2`. All other calls default to `0.7`.

## Conversational prompt rules (locked)

The shared rules and personas in `lib/council.ts` were rewritten to make the agents sound like four real people in a room arguing — not four formal essays. Key rules:

- 2-3 sentences MAX. Be terse.
- Talk *to* other advisors by name. Use contractions.
- React: "Yeah but…", "I don't buy that because…", "Fair point, but you're missing…".
- No preamble. No "Great point." No markdown headers or bullet lists.

This is what produced the live output: *"Strategist, you're hand-waving the part where 'everyone knows it' means nothing when your query performance tanks at 100 concurrent users..."*

## Streaming UX (locked)

`ComparisonView` consumes NDJSON from `/api/council`:
- Each `turn` event appends to `round1` or `round2` state and triggers a fresh `AgentCard` render.
- `synthesizing` event flips an indicator banner.
- `briefing` event renders the `Briefing` card.
- `error` events accumulate into a list and render as red callout cards (silent per-turn fallbacks do NOT emit errors — the UI never sees them).

The mock backend (`mockCouncilStream`) fake-streams with ~1.4s delays so dev/demo without CLōD looks identical to live.

## Open / next steps

1. **Browser smoke test of live stream.** Load `http://localhost:3000` with `MOCK_API=false` and click "Convene Council". Verify each card appears one-at-a-time, typewriter plays, Round 2 panel opens, briefing renders. Capture any UI issues for targeted fixes.
2. **Targeted UI fixes (only what the smoke test surfaces).** Likely candidates: a more visible "current speaker" indicator since real CLōD takes 5-10s per turn, and a "what model is this" badge per card to show off the multi-model architecture.
3. **Restore `MOCK_API=true`** so the recorded demo state is reproducible. Mock fake-streams now too, so the visual experience is the same.
4. **Optional visual polish.** The UI is light/cream not dark — user explicitly deferred this. Touch only if there is time after the demo is reliable.
5. **Optional: a small "Tool call from thinking phase" preamble** in `ComparisonView` so the framing (this is a tool an AI calls, not a chatbot) is unmistakable to demo viewers.

## Constraints to respect

- Keep `MOCK_API=true` as the default unless explicit live testing is requested.
- Never commit `.env.local`. `.gitignore` already excludes it; do not change that.
- Never expose `CLOD_API_KEY` to the client. All CLōD calls must be server-side.
- Visual style: dark, sharp, infrastructure-flavored per `AGENTS.MD`. Currently light/cream — deferred. No purple gradients, no chat bubbles, no rounded pill buttons.
- `npm run dev` previously hit an EMFILE watcher limit locally. Use production mode: `npm run build && npm run start -- -p 3000`.
- Do NOT use thinking-style models for agent personas (see CLōD model lineup above).
- Do NOT use display names from `clod.io/models` as model ids — use canonical ids from `GET /v1/models`.

## Pending inputs from the user

- Browser smoke test feedback (the next session's first practical task).
- Approval for any visual polish before merging it.
