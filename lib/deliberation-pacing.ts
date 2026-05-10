import type { AgentResponse, CouncilResponse } from "./types";

export type DeliberationStep =
  | {
      kind: "agent";
      agent: AgentResponse;
      phase: "opening" | "rebuttal";
    }
  | { kind: "divider"; label: string };

/** Total time budget for the back-and-forth (typing + pauses), ~5–10s */
const DISCUSSION_TARGET_MIN_MS = 5200;
const DISCUSSION_TARGET_MAX_MS = 9800;

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Matches the simulated “human drafting” duration used in the UI */
export function getSimulatedTypingMs(text: string): number {
  return Math.min(1400, Math.max(280, Math.round(text.length * 4.5)));
}

function stepCompositionMs(step: DeliberationStep): number {
  if (step.kind === "divider") {
    return 380;
  }
  return getSimulatedTypingMs(step.agent.response);
}

export function buildDeliberationSteps(
  council: CouncilResponse,
): DeliberationStep[] {
  const steps: DeliberationStep[] = council.agents.map((agent) => ({
    kind: "agent",
    phase: "opening",
    agent,
  }));
  const followUp = council.discussionFollowUp ?? [];
  if (followUp.length > 0) {
    steps.push({ kind: "divider", label: "Continuing deliberation" });
    followUp.forEach((agent) =>
      steps.push({ kind: "agent", phase: "rebuttal", agent }),
    );
  }
  return steps;
}

/**
 * When each deliberation step becomes visible, and when the last step finishes
 * “composing”, so synthesis can start without cutting the discussion short.
 */
export function buildRevealSchedule(
  steps: DeliberationStep[],
  seed: string,
): { revealAtMs: number[]; discussionEndMs: number } {
  const n = steps.length;
  if (n === 0) {
    return { revealAtMs: [], discussionEndMs: 0 };
  }

  const h = hashString(seed);
  const target =
    DISCUSSION_TARGET_MIN_MS +
    (h % (DISCUSSION_TARGET_MAX_MS - DISCUSSION_TARGET_MIN_MS + 1));
  const initialPauseMs = 380 + (h % 220);
  const comp = steps.map(stepCompositionMs);
  const sumComp = comp.reduce((a, b) => a + b, 0);
  const gapBudget = Math.max(0, target - initialPauseMs - sumComp);
  const gaps = n - 1;

  const revealAtMs: number[] = [];
  let t = initialPauseMs;
  revealAtMs.push(t);

  let x = h >>> 0;
  const weights: number[] = [];
  for (let i = 0; i < gaps; i++) {
    x = (x * 1664525 + 1013904223) >>> 0;
    weights.push(0.72 + (x % 56) / 100);
  }
  const wsum = weights.reduce((a, b) => a + b, 0) || 1;

  for (let i = 0; i < gaps; i++) {
    t += comp[i] + (gapBudget * weights[i]) / wsum;
    revealAtMs.push(t);
  }

  const discussionEndMs = t + comp[n - 1];
  return { revealAtMs, discussionEndMs };
}
