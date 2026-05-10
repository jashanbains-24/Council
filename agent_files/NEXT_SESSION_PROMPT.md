# Next Session Prompt

Copy everything inside the code block into the next Cursor session.

```txt
We are continuing a hackathon demo called "Council" (Next.js 14 app router, TypeScript, Tailwind).

Before changing any code, read these files in order:
1. DELIBERATION_PLAN.md  (the active plan and current truth; this is the source of truth)
2. AGENTS.MD
3. PRD.md
4. BUILD_PLAN.md

What is true today (do not re-litigate, just confirm by reading the files above):
- Phase 1 (NDJSON streaming refactor) is DONE. /api/council streams events one at a time.
- Phase 2 (live CLōD integration) is DONE. Verified live four times via curl. All 4 advisors run on distinct CLōD models with silent fallback to gpt-4o-mini, synthesizer is claude-sonnet-4-5, single-pass left panel is fireworks/deepseek-v3p2.
- Conversational tone prompts are in place. Agents address each other by name in 2-3 sentences and produce real disagreement. The synthesizer returns valid Briefing JSON.
- The teammate's UI was kept intact. Round 1 = full-width cards, Round 2 = separate "cross-fire channel" panel. Briefing card at the bottom. Visual style is light/cream (intentionally deferred from the dark spec).
- The Strategist was originally meant to use gpt-5; that and gpt-5-mini are rejected on this account. Use gpt-4.1. Do not retry gpt-5 family.
- claude-opus-4-7 is also rejected on this account. Use claude-sonnet-4-5 for synth.
- Use canonical lowercase api ids from GET https://api.clod.io/v1/models, NOT display names from clod.io/models.
- Do NOT use "thinking-style" models (DeepSeek R1, DeepSeek V3.2, gpt-5 series) for agent personas — they leak chain-of-thought into responses and break the persona illusion. They are fine for the single-pass left panel because rambling is the point there.

Hard constraints:
- Keep MOCK_API=true as the default unless live testing is explicitly requested. The mock backend fake-streams now, so it visually matches live.
- Never commit .env.local. Never expose CLOD_API_KEY to the client.
- Do not rebuild the project from scratch.
- Do not switch the data shape from `agents` + `discussionFollowUp` to `transcript: CouncilTurn[]`. That migration was deliberately skipped — the existing shape is what the UI consumes.
- Keep the existing UI components (AgentCard, RoundTwoChamber, Briefing, ReasoningPanel) intact unless explicitly asked to redesign.
- If `npm run dev` hits an EMFILE watcher error, use:
    npm run build
    npm run start -- -p 3000
    Open http://localhost:3000

First actions for this session (in order, stop after each for user approval):
1. Run `git status` and `git log -n 5 --oneline`. Confirm the working tree state and that the previous commit ("Wire live CLōD pipeline with per-role models and NDJSON streaming") is in place.
2. Read DELIBERATION_PLAN.md fully and summarize the current state in 5-8 lines.
3. Confirm `.env.local` has CLOD_API_KEY set and MOCK_API value (true or false). Tell the user which.
4. Ask the user: "What are we working on this session?" Most likely options:
   - Browser smoke test of the live stream (open localhost, click Convene Council, report what you see).
   - Targeted UI fixes after the smoke test (e.g. a more visible "current speaker" indicator, per-card model badge).
   - Visual polish (dark theme alignment with AGENTS.MD).
   - Demo polish: a "Tool call from thinking phase" preamble in ComparisonView, a request counter, etc.
   - Something new the user wants.
5. Once direction is set, make small, reversible changes one substep at a time. Run `npm run lint` and `npm run build` after each substep. Stop for approval between substeps.

Test order rules (if anything live is being changed):
- Always run mock first (`MOCK_API=true`) to confirm the change does not break the demo path.
- Only flip to `MOCK_API=false` for an explicitly-approved single test.
- Restore `MOCK_API=true` immediately after the live test.
- The user has $50 in CLōD credit, so do not over-optimize for cost — but do not run live tests in a loop either.

General rules of engagement:
- Ask before adding any new dependency.
- Ask before making any change to lib/types.ts CouncilResponse shape (UI depends on it).
- Ask before flipping MOCK_API=false.
- Keep changes small and reversible.
- After every code edit, run `npm run lint` and report results.
- The user is a beginner with this stack. Give step-by-step terminal instructions. Never assume they will guess what `Ctrl+C` does in context — say it.

If anything is unclear, ask. Do not guess about CLōD model ids — verify against GET /v1/models. Do not guess about response shapes — read lib/types.ts.
```

## Short summary

Council is a thinking-phase tool an AI calls when it hits an assumption. The website visualizes the internal deliberation: 4 agents on 4 different CLōD models speak in sequence over 2 rounds, a 5th model synthesizes structured JSON, and the parent AI uses it. Live CLōD integration is working end-to-end; per-agent silent fallback handles model failures invisibly. Next session most likely starts with a browser smoke test, then targeted UI fixes. Full plan and all locked decisions live in `DELIBERATION_PLAN.md`.
