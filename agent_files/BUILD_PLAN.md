# Council Build Plan

This project should be built in small checkpoints. After each step, stop, verify the result, and wait for approval before continuing.

## Current Status

Last completed step: **Step 5: Polish And Mock Verification**.

What is working:
- Minimal Next.js 14 app router project with TypeScript and Tailwind CSS.
- Mock-first backend contract in `lib/types.ts`, `lib/mock.ts`, and `lib/council.ts`.
- Mock API routes at `app/api/reasoning/route.ts` and `app/api/council/route.ts`.
- Landing page with editable default decision input.
- Split-screen comparison UI with reasoning model response, Council deliberation, agent cards, briefing card, pause callout, and raw JSON.
- `MOCK_API=true` safe demo mode in `.env.local`.
- `npm run lint` passes.
- `npm run build` passes.
- Production localhost smoke test returned 200 for `/`, `/api/reasoning`, and `/api/council`.

Important local note:
- `npm run dev` previously hit a local watcher limit (`EMFILE: too many open files`) in this environment.
- `npm run build && npm run start -- -p 3000` worked for viewing the mock demo at `http://localhost:3000`.
- Do not start Step 6 until the user confirms they are done reviewing the mock demo.

Next step: **Step 6: Real CLōD Integration**.

## Step 0: Project Setup Check

Goal: confirm whether the repo already has a Next.js app or needs scaffolding.

Agent actions:
- Inspect existing files.
- If no app exists, scaffold a minimal Next.js 14 + TypeScript + Tailwind app in the current repo.
- Keep the app router.
- Do not add auth, database, storage, dashboards, or extra infrastructure.

User action:
- Approve running the scaffold/install command if dependencies are missing.

Done when:
- `package.json`, `app/`, Tailwind config, and TypeScript config exist.
- `npm run dev` can start the local app.

## Step 1: Types And Mock Data

Goal: create the backend contract before UI.

Files:
- `lib/types.ts`
- `lib/mock.ts`
- `.env.local`

Agent actions:
- Add `CouncilResponse`, `ReasoningResponse`, `Briefing`, and agent types.
- Add the mock reasoning response.
- Add the mock Council agents and briefing.
- Set `.env.local` to safe demo defaults:

```env
CLOD_API_KEY=your_key_here
MOCK_API=true
```

Done when:
- TypeScript types match the required schema.
- Mock objects import and type-check.

## Step 2: Mock Backend

Goal: make the API work without CLōD.

Files:
- `lib/council.ts`
- `app/api/reasoning/route.ts`
- `app/api/council/route.ts`

Agent actions:
- Implement `mockReasoning` with a 1 second delay.
- Implement `mockCouncil` with a 2 second delay.
- Add safe stubs for `realReasoning` and `realCouncil`.
- Add API routes that use mock mode unless `MOCK_API=false`.
- Validate that `decision` is a non-empty string.

Done when:
- Both API routes return JSON in mock mode.
- Invalid requests return a controlled 400 error.

## Step 3: Landing Page

Goal: build the first visible screen.

Files:
- `app/page.tsx`
- `app/components/DecisionInput.tsx`
- `app/globals.css`
- `app/layout.tsx`

Agent actions:
- Add dark, sharp Council landing page.
- Add the default decision text.
- Add `Convene Council` button.
- Keep the UI simple and readable.

Done when:
- The landing page loads locally.
- The input can be edited.
- Submit transitions into the comparison flow placeholder.

## Step 4: Comparison Demo

Goal: build the main demo moment.

Files:
- `app/components/ComparisonView.tsx`
- `app/components/ReasoningPanel.tsx`
- `app/components/AgentCard.tsx`
- `app/components/Briefing.tsx`

Agent actions:
- Trigger `/api/reasoning` and `/api/council` at the same time.
- Show split screen: single model vs Council.
- Reveal Council agents one by one.
- Show briefing, pause callout, and raw JSON.

Done when:
- Mock flow works end to end in the browser.
- The contrast is obvious within 30 seconds.

## Step 5: Polish And Mock Verification

Goal: make it demo-ready before touching the real API.

Agent actions:
- Tighten spacing, typography, responsive layout, and loading states.
- Confirm no purple gradients, chat bubbles, or rounded pill buttons.
- Run lint/build checks if available.

Done when:
- `npm run dev` works.
- The mock demo is stable and polished.
- The UI is readable on a projected screen.

## Step 6: Real CLōD Integration

Goal: add live mode without risking the demo.

Files:
- `lib/council.ts`
- `package.json`

Agent actions:
- Install `openai`.
- Implement `realReasoning`.
- Implement `realCouncil` with 4 sequential agents plus synthesis.
- Use `max_completion_tokens`, not `max_tokens`.
- Parse synthesis JSON and fall back safely if the model fails.

User action:
- Add the real `CLOD_API_KEY` to `.env.local`.

Done when:
- One small test call works.
- Full live pipeline works once.
- `MOCK_API=true` is restored afterward.

## Step 7: Final Demo Pass

Goal: freeze a reliable hackathon demo.

Agent actions:
- Verify mock mode is on.
- Verify the page loads from a clean server start.
- Check the exact demo narrative.
- Avoid last-minute feature changes.

Done when:
- The project can be demoed safely from localhost.
- The story is clear: "Don't assume. Consult."
