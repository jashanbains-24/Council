# Next Session Prompt

Copy everything inside the code block into the next Cursor session.

```txt
We are continuing a hackathon demo called "Council" (Next.js 14 app router, TypeScript, Tailwind).

Before changing any code, read these files in order:
1. DELIBERATION_PLAN.md  (the active plan; this is the source of truth)
2. AGENTS.MD
3. PRD.md
4. BUILD_PLAN.md

Important context for this session:
- A teammate may have just pushed updated UI to the same repo. The very first thing you must do is `git status` and `git log -n 5 --oneline` to see what changed since the last session, and read any modified files in app/ before editing anything.
- The product framing is locked: Council is a thinking-phase tool an AI calls when it hits an assumption. The website is a visualization of the internal deliberation. No human-in-the-loop.
- The architecture is locked: sequential, 2 cycles, 4 agents (Strategist → Skeptic → Operator → Psychologist), then 1 synthesizer. 9 CLōD calls per Council run plus 1 for the single-model panel = 10 calls per demo.
- CLōD details, types, phase plan, and open questions are all in DELIBERATION_PLAN.md. Do not deviate without asking.

Hard constraints:
- Keep MOCK_API=true as the default until live testing is explicitly requested.
- Never commit .env.local. Never expose CLOD_API_KEY to the client.
- Do not rebuild the project from scratch.
- Keep the dark, sharp infrastructure visual style. No purple gradients, chat bubbles, or rounded pill buttons.
- If `npm run dev` hits an EMFILE watcher error, use:
    npm run build
    npm run start -- -p 3000
    Open http://localhost:3000

First actions for this session (in order, stop after each for user approval):
1. Run `git status` and `git log -n 5 --oneline`. Tell the user what changed since the last session and whether the working tree is clean.
2. Read DELIBERATION_PLAN.md fully and summarize the current state in 5-8 lines.
3. If the teammate's UI changes touch any of these files, read them carefully and report any conflicts with the upcoming refactor:
   - app/page.tsx
   - app/components/DecisionInput.tsx
   - app/components/ComparisonView.tsx
   - app/components/ReasoningPanel.tsx
   - app/components/AgentCard.tsx
   - app/components/Briefing.tsx
4. Ask the user to answer the only open design question from the plan:
   "When Round 2 starts, should the Round 2 responses appear as NEW cards underneath the Round 1 cards (transcript style), or REPLACE each agent's card with the latest take?"
   Recommended default: transcript style.
5. After the user answers, begin Phase 1 from DELIBERATION_PLAN.md, one substep at a time, stopping for approval between each:
   - Step 1: refactor lib/types.ts to add CouncilTurn and transcript on CouncilResponse.
   - Step 2: rewrite lib/mock.ts to a believable 8-turn transcript with explicit Round 2 reactions.
   - Step 3: convert app/api/council/route.ts to NDJSON streaming with `turn`, `synthesizing`, `briefing`, and `error` events.
   - Step 4: have the mock backend fake-stream turns with ~600ms delays so the UI can be tested without burning CLōD credits.
   - Step 5: update ComparisonView to consume the NDJSON stream and render turns in order, labeled by cycle.
   - Step 6: ensure mock demo still works end-to-end. `npm run lint` and `npm run build` must pass.

After Phase 1 is approved, ASK the user before starting Phase 2. Phase 2 needs CLOD_API_KEY in .env.local. Phase 2 plan and test order are in DELIBERATION_PLAN.md.

General rules of engagement for this session:
- Ask before adding any new dependency.
- Ask before flipping MOCK_API=false or making any live CLōD call.
- Do not edit the teammate's new UI to suit the refactor without first explaining the conflict and getting approval.
- Keep changes small and reversible. Prefer additive changes to existing types and components.
- After each substep, run `npm run lint` and report results.

If anything is unclear, ask. Do not guess about CLōD model names, endpoints, or response shapes; verify against DELIBERATION_PLAN.md.
```

## Short summary

Council is a thinking-phase tool an AI calls when it hits an assumption. The website visualizes the internal deliberation: 4 agents speak in sequence over 2 rounds, a synthesizer produces structured JSON, and the parent AI uses it. The mock demo is in place. Next phase is a refactor to a streaming NDJSON transcript, then live CLōD integration. Full plan and decisions live in `DELIBERATION_PLAN.md`.
