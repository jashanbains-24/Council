# Next Session Prompt

Copy this into the next Cursor session:

```txt
We are building a hackathon demo web app called "Council" using Next.js 14 app router, TypeScript, and Tailwind CSS.

Before changing code, read:
- AGENTS.MD
- BUILD_PLAN.md
- PRD.md

Current status:
- We have completed Steps 0-5 in BUILD_PLAN.md.
- The mock demo is working and polished enough to view locally.
- Do not rebuild the whole project from scratch.
- Do not add auth, database, Prisma, Supabase, dashboards, storage, model selectors, or extra infrastructure.
- Keep the public product name as "Council".

What currently works:
- Next.js 14 app router scaffold.
- Tailwind CSS dark infrastructure styling.
- TypeScript types in lib/types.ts.
- Mock data in lib/mock.ts.
- Mock backend functions and real stubs in lib/council.ts.
- POST API routes:
  - app/api/reasoning/route.ts
  - app/api/council/route.ts
- Landing page and editable decision input.
- Split-screen comparison view.
- Reasoning model panel.
- Council deliberation with four agent cards.
- Briefing card with recommendation, confidence, reasoning, dissent, biggest risk, what would change this, pause callout, and raw JSON.
- Safe mock mode with MOCK_API=true.

Verified:
- npm run lint passes.
- npm run build passes.
- Production smoke test returned 200 for:
  - /
  - /api/reasoning
  - /api/council
- In this local environment, npm run dev previously hit an EMFILE watcher limit. Use production mode for viewing if that happens:
  1. npm run build
  2. npm run start -- -p 3000
  3. Open http://localhost:3000

Important environment note:
- .env.local should contain:
  CLOD_API_KEY=your_real_key_here
  MOCK_API=true
- Do not expose the key to the client.
- Do not commit .env.local.
- Keep MOCK_API=true unless explicitly testing live CLōD mode.

Next task:
Start Step 6: Real CLōD Integration.

Step 6 requirements:
- Install the openai npm package if it is not installed.
- Implement realReasoning(decision) in lib/council.ts using the OpenAI-compatible CLōD API.
- Implement realCouncil(decision) in lib/council.ts with 5 sequential CLōD calls:
  1. Strategist
  2. Skeptic
  3. Operator
  4. Psychologist
  5. Synthesis JSON
- Use baseURL: https://api.clod.io/v1
- Use apiKey: process.env.CLOD_API_KEY
- Use model: "DeepSeek V3"
- Use max_completion_tokens, not max_tokens.
- Token limits:
  - agent calls: 150
  - reasoning comparison: 200
  - synthesis: 300
- temperature: 0.7
- Extract responses with completion.choices[0]?.message?.content?.trim()
- Synthesis must return only the Briefing JSON shape.
- Parse synthesis with JSON.parse after removing optional markdown fences.
- Validate the parsed briefing before returning it.
- Add safe fallback behavior if CLōD fails or returns invalid JSON.
- Keep mock mode as the default using:
  const useMock = process.env.MOCK_API !== "false";

Testing plan for Step 6:
1. Keep MOCK_API=true and confirm the mock app still builds.
2. Add the real CLōD code.
3. Temporarily set MOCK_API=false only for live testing.
4. First test one small reasoning or agent call with max_completion_tokens: 50.
5. Then test the full pipeline once.
6. Restore MOCK_API=true before ending.

Please proceed carefully from Step 6 only. Ask before flipping MOCK_API=false or running live API calls.
```

## Short Summary

Council is a judgment layer for AI agents. The current app already demonstrates the mock flow: an agent hits a database assumption, a single model gives a confident answer, and Council returns multi-perspective structured judgment with dissent and uncertainty.

The next session should not change the mock UI unless fixing a bug. The next meaningful work is the real CLōD integration in `lib/council.ts`.
