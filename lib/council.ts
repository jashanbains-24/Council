import OpenAI from "openai";
import { MOCK_COUNCIL_RESPONSE, MOCK_REASONING_RESPONSE } from "./mock";
import type {
  AgentName,
  AgentResponse,
  Briefing,
  CouncilResponse,
  CouncilStreamEvent,
  ReasoningResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Model assignment per role. Strings MUST match a canonical model id returned
// by GET https://api.clod.io/v1/models.
//
// Important: do NOT use "thinking" models here (DeepSeek R1, DeepSeek V3.2,
// Qwen Thinking variants, gpt-5 series). They leak chain-of-thought into the
// response, which breaks the persona illusion. Reserve those for the single-
// pass baseline on the left, where the rambling actually helps the demo.
//
// AGENT_FALLBACK is the silent-retry target if any role's model errors. It
// must also be a non-thinking model.
// ---------------------------------------------------------------------------
const AGENT_FALLBACK = "gpt-4o-mini";

const MODEL_BY_ROLE: Record<AgentName, string> = {
  // gpt-5 / gpt-5-mini were both rejected by the API on this account.
  // gpt-4.1 is the most reliable OpenAI workhorse — confident, decisive,
  // and won't emit chain-of-thought.
  Strategist: "gpt-4.1",
  Skeptic: "grok-4",
  Operator: "Qwen/Qwen3-235B-A22B-Thinking-2507",
  Psychologist: "claude-sonnet-4-5",
};

// claude-sonnet-4-5 is proven to work on this account (used for Psychologist
// in the live test) and is reliable for strict-JSON output.
const SYNTHESIS_MODEL = "claude-sonnet-4-5";

// The left "single-pass" panel intentionally uses a thinking-style DeepSeek
// model — its rambly output is the demo contrast against the Council.
const REASONING_MODEL = "fireworks/deepseek-v3p2";

// 180 tokens fits 2-3 sentences without truncating mid-word.
const AGENT_TOKEN_LIMIT = 180;
const SYNTHESIS_TOKEN_LIMIT = 700;
const REASONING_TOKEN_LIMIT = 200;

const ROLE_DESCRIPTION: Record<AgentName, string> = {
  Strategist: "Big picture & opportunity",
  Skeptic: "Risks & failure modes",
  Operator: "Execution reality",
  Psychologist: "People & second-order effects",
};

const ROUND_TWO_ROLE: Record<AgentName, string> = {
  Strategist: "Reply — narrowing the path",
  Skeptic: "Reply — stress-testing consensus",
  Operator: "Reply — operational lock-in",
  Psychologist: "Reply — closing the loop",
};

const COUNCIL_ORDER: AgentName[] = [
  "Strategist",
  "Skeptic",
  "Operator",
  "Psychologist",
];

// ---------------------------------------------------------------------------
// CLōD client
// ---------------------------------------------------------------------------

function getClient(): OpenAI {
  if (!process.env.CLOD_API_KEY) {
    throw new Error("Missing CLOD_API_KEY");
  }
  return new OpenAI({
    baseURL: "https://api.clod.io/v1",
    apiKey: process.env.CLOD_API_KEY,
  });
}

type ChatMsg = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function chat(params: {
  model: string;
  messages: ChatMsg[];
  maxTokens: number;
  temperature?: number;
}): Promise<string> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: params.model,
    messages: params.messages,
    temperature: params.temperature ?? 0.7,
    max_completion_tokens: params.maxTokens,
  });
  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error(`Empty response from model ${params.model}`);
  }
  return content;
}

/**
 * Calls the agent's assigned model. If that model fails (404, rate limit,
 * empty response, etc.), silently retries on the DeepSeek fallback so the
 * Council still completes. Returns both the text and which model actually
 * answered.
 */
async function callAgentWithFallback(params: {
  preferredModel: string;
  messages: ChatMsg[];
  maxTokens: number;
  temperature?: number;
}): Promise<{ content: string; model: string; usedFallback: boolean }> {
  try {
    const content = await chat({
      model: params.preferredModel,
      messages: params.messages,
      maxTokens: params.maxTokens,
      temperature: params.temperature,
    });
    return { content, model: params.preferredModel, usedFallback: false };
  } catch (err) {
    console.warn(
      `[council] preferred model "${params.preferredModel}" failed; retrying on ${AGENT_FALLBACK}.`,
      err,
    );
    const content = await chat({
      model: AGENT_FALLBACK,
      messages: params.messages,
      maxTokens: params.maxTokens,
      temperature: params.temperature,
    });
    return { content, model: AGENT_FALLBACK, usedFallback: true };
  }
}

// ---------------------------------------------------------------------------
// Prompts (per AGENTS.MD section 12-15)
// ---------------------------------------------------------------------------

const PERSONA_PROMPTS: Record<AgentName, string> = {
  Strategist: `You are Strategist — a founder who has scaled two companies. You think momentum, opportunity, and direction matter more than perfection. You push toward action when a path is clear.

You overweight opportunity and momentum. You underweight execution friction. You sound confident, direct, outcome-focused, and you talk like a real person — not a memo.

If you're pushing to proceed, sound like a founder talking to a co-founder over coffee: "Look, the obvious move is X because Y. Yeah, there's a risk Z, but the bigger risk is sitting still." If you actually think pausing is right, say so plainly.`,

  Skeptic: `You are Skeptic — a former operator who has watched good ideas die because of one bad assumption nobody questioned. You distrust confidence without evidence. You find the one assumption that, if wrong, makes everything else irrelevant.

You overweight downside. You challenge framing before accepting it. Your voice is pointed, dry, and a little uncomfortable — but you talk like a real person, not a research paper.

When you push back, sound like a friend telling someone the hard truth: "Yeah but you're skipping over the part where..." or "That sounds reasonable until you ask..." Don't quote others verbatim — react to them.`,

  Operator: `You are Operator — a COO type. You've built things, managed budgets, dealt with 2am failures, and cleaned up decisions that sounded great in meetings. You're unromantic about execution. You think in sequencing, dependencies, and what breaks first.

You overweight logistics. You underweight strategic importance. Voice is blunt, practical, timeline-aware. You talk like someone who's actually shipped things — not like a consultant.

When you reply, address the specific people in the room: "Strategist, you're hand-waving the part where..." or "Skeptic's right about X, but you're both missing the actual blocker, which is..."`,

  Psychologist: `You are Psychologist — trained in behavioral economics and organizational dynamics. You believe most decisions fail not because of bad strategy but because of unexamined human dynamics: ego, fear, trust, unclear ownership, misaligned incentives, unstated preferences.

You overweight interpersonal and behavioral factors. You may miss structural issues. Voice is curious, reframing, human-centered, sometimes incisive — but always conversational, not clinical.

When you talk, ask the question the others didn't: "Wait — who actually owns this decision?" or "You're all arguing tech, but the real question is..." React to what people just said, don't summarize them.`,
};

const SHARED_RULES = `You are part of Council, a small panel of advisors an AI agent calls when it's about to make a significant assumption. Sound like four real people in a room arguing — not four formal essays stacked together.

Hard rules:
- 2-3 sentences MAX. Be terse. Every word earns its place.
- Talk to the other advisors. Use their names. Use contractions ("that's", "you're", "I'd").
- React to what was just said. "Yeah but…", "I don't buy that because…", "Fair point, but you're missing…" are all fine. Polite agreement is not.
- Be specific. Concrete examples, numbers, named tools, named failure modes.
- No preamble. No "Great point." No "As Strategist mentioned…". No markdown headers. No bullet lists. Just talk.`;

function systemPromptFor(name: AgentName): string {
  return `${PERSONA_PROMPTS[name]}\n\n${SHARED_RULES}`;
}

function round1UserPrompt(params: {
  decision: string;
  speaker: AgentName;
  prior: AgentResponse[];
}): string {
  const { decision, speaker, prior } = params;
  const priorBlock =
    prior.length === 0
      ? "(You are speaking first. There are no previous Council responses yet.)"
      : prior
          .map((p) => `${p.name}:\n${p.response}`)
          .join("\n\n");

  return `Original decision:
${decision}

Previous Council responses (Round 1):

${priorBlock}

Now respond as ${speaker}. Add what they missed and challenge what you disagree with.`;
}

function round2UserPrompt(params: {
  decision: string;
  speaker: AgentName;
  round1: AgentResponse[];
  round2SoFar: AgentResponse[];
}): string {
  const { decision, speaker, round1, round2SoFar } = params;
  const r1 = round1.map((p) => `${p.name}:\n${p.response}`).join("\n\n");
  const r2 =
    round2SoFar.length === 0
      ? "(You are the first to speak in Round 2.)"
      : round2SoFar.map((p) => `${p.name}:\n${p.response}`).join("\n\n");

  return `Original decision:
${decision}

Round 1 deliberation:

${r1}

Round 2 so far:

${r2}

You are ${speaker}, speaking again in Round 2. The Council has already heard everyone's opening positions. Sharpen your stance. Respond directly to what changed your mind, what you still hold against another agent, or where the discussion missed the point. 3-4 sharp sentences. No padding.`;
}

const SYNTHESIS_SYSTEM_PROMPT = `You have observed a Council deliberation between four advisors with genuinely different perspectives.

Your job is to produce structured judgment for the AI agent that called Council.

You are not a summarizer. Capture not just the recommendation but the actual disagreement that shaped it.

A clean consensus is suspicious. If agents disagreed, that disagreement belongs in the output.

The calling agent needs to know:
- what to do
- why
- how confident to be
- what could break the recommendation
- what information would change the recommendation
- whether to proceed or ask the human

Return ONLY valid JSON. No preamble. No markdown fences. No comments. No trailing commas.

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
- if should_ask_human is false, suggested_question may be an empty string`;

function synthesisUserPrompt(params: {
  decision: string;
  round1: AgentResponse[];
  round2: AgentResponse[];
}): string {
  const { decision, round1, round2 } = params;
  const block = (label: string, list: AgentResponse[]) =>
    list.map((a) => `${a.name} (${label}):\n${a.response}`).join("\n\n");

  return `Original decision:
${decision}

Council deliberation — Round 1:

${block("opening", round1)}

Council deliberation — Round 2:

${block("reply", round2)}

Produce the structured judgment now.`;
}

// ---------------------------------------------------------------------------
// JSON extraction & validation (per AGENTS.MD section 16-17)
// ---------------------------------------------------------------------------

function extractJson(text: string): unknown {
  // Strip markdown fences first.
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  // If the model wrapped the JSON in prose, slice the outermost { ... } block.
  if (!cleaned.startsWith("{")) {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      cleaned = cleaned.slice(first, last + 1);
    }
  }

  return JSON.parse(cleaned);
}

function isValidBriefing(value: unknown): value is Briefing {
  if (!value || typeof value !== "object") return false;
  const b = value as Partial<Briefing>;
  return (
    typeof b.recommendation === "string" &&
    typeof b.reasoning === "string" &&
    typeof b.dissent === "string" &&
    typeof b.biggest_risk === "string" &&
    (b.confidence === "high" ||
      b.confidence === "medium" ||
      b.confidence === "low") &&
    typeof b.what_would_change_this === "string" &&
    typeof b.should_ask_human === "boolean" &&
    typeof b.suggested_question === "string"
  );
}

const FALLBACK_BRIEFING: Briefing = {
  recommendation:
    "Council could not finish synthesis cleanly. Do not proceed blindly.",
  reasoning:
    "The deliberation layer failed before producing reliable structured judgment. Because this is a significant assumption point, the safest next action is to ask the human for clarification.",
  dissent: "Unavailable because the Council process did not complete.",
  biggest_risk: "The agent may continue based on an unsupported assumption.",
  confidence: "low",
  what_would_change_this:
    "A successful Council run or direct clarification from the human.",
  should_ask_human: true,
  suggested_question:
    "Can you clarify the missing requirement before I proceed?",
};

// ---------------------------------------------------------------------------
// Public surface — non-streaming wrappers (kept for backwards compatibility
// and for the API route's MOCK fast path).
// ---------------------------------------------------------------------------

export async function mockCouncil(
  decision: string,
): Promise<CouncilResponse> {
  void decision;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return MOCK_COUNCIL_RESPONSE;
}

export async function mockReasoning(
  decision: string,
): Promise<ReasoningResponse> {
  void decision;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return MOCK_REASONING_RESPONSE;
}

export async function realReasoning(
  decision: string,
): Promise<ReasoningResponse> {
  try {
    const content = await chat({
      model: REASONING_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an AI coding agent. Answer the user's decision question directly and briefly. Do not simulate a panel. Do not mention Council.",
        },
        { role: "user", content: decision },
      ],
      maxTokens: REASONING_TOKEN_LIMIT,
    });
    return { response: content };
  } catch (error) {
    console.error("realReasoning failed:", error);
    return {
      response:
        "I cannot complete this reasoning pass right now. Because this decision involves a significant assumption, the agent should avoid proceeding blindly and ask the user for clarification.",
    };
  }
}

/**
 * Non-streaming Council; collects the streamed pipeline into a single
 * CouncilResponse. Kept so callers that only want JSON still work.
 */
export async function realCouncil(
  decision: string,
): Promise<CouncilResponse> {
  const round1: AgentResponse[] = [];
  const round2: AgentResponse[] = [];
  let briefing: Briefing = FALLBACK_BRIEFING;

  for await (const event of realCouncilStream(decision)) {
    if (event.type === "turn" && event.phase === "opening") {
      round1.push(event.agent);
    } else if (event.type === "turn" && event.phase === "rebuttal") {
      round2.push(event.agent);
    } else if (event.type === "briefing") {
      briefing = event.briefing;
    }
  }

  return { agents: round1, discussionFollowUp: round2, briefing };
}

// ---------------------------------------------------------------------------
// Streaming pipeline. Emits NDJSON-shaped events as turns finish.
// ---------------------------------------------------------------------------

/**
 * Real Council pipeline. 4 Round 1 calls + 4 Round 2 calls + 1 synthesis
 * call, all sequential. Each agent uses its assigned model with a silent
 * DeepSeek V3 fallback on failure. Emits events as turns complete.
 */
export async function* realCouncilStream(
  decision: string,
): AsyncGenerator<CouncilStreamEvent> {
  const round1: AgentResponse[] = [];
  const round2: AgentResponse[] = [];

  // Round 1
  for (const speaker of COUNCIL_ORDER) {
    try {
      const result = await callAgentWithFallback({
        preferredModel: MODEL_BY_ROLE[speaker],
        maxTokens: AGENT_TOKEN_LIMIT,
        messages: [
          { role: "system", content: systemPromptFor(speaker) },
          {
            role: "user",
            content: round1UserPrompt({
              decision,
              speaker,
              prior: [...round1],
            }),
          },
        ],
      });
      const agent: AgentResponse = {
        name: speaker,
        role: ROLE_DESCRIPTION[speaker],
        response: result.content,
      };
      round1.push(agent);
      yield {
        type: "turn",
        phase: "opening",
        agent,
        model: result.model,
        usedFallback: result.usedFallback,
      };
    } catch (err) {
      console.error(`[council] Round 1 ${speaker} failed entirely:`, err);
      yield {
        type: "error",
        agent: speaker,
        message: `Round 1 ${speaker} failed.`,
      };
    }
  }

  // Round 2
  for (const speaker of COUNCIL_ORDER) {
    try {
      const result = await callAgentWithFallback({
        preferredModel: MODEL_BY_ROLE[speaker],
        maxTokens: AGENT_TOKEN_LIMIT,
        messages: [
          { role: "system", content: systemPromptFor(speaker) },
          {
            role: "user",
            content: round2UserPrompt({
              decision,
              speaker,
              round1,
              round2SoFar: [...round2],
            }),
          },
        ],
      });
      const agent: AgentResponse = {
        name: speaker,
        role: ROUND_TWO_ROLE[speaker],
        response: result.content,
      };
      round2.push(agent);
      yield {
        type: "turn",
        phase: "rebuttal",
        agent,
        model: result.model,
        usedFallback: result.usedFallback,
      };
    } catch (err) {
      console.error(`[council] Round 2 ${speaker} failed entirely:`, err);
      yield {
        type: "error",
        agent: speaker,
        message: `Round 2 ${speaker} failed.`,
      };
    }
  }

  // Synthesis. If the preferred synthesis model errors, retry on DeepSeek V3.
  yield { type: "synthesizing" };
  let briefing: Briefing = FALLBACK_BRIEFING;
  try {
    const result = await callAgentWithFallback({
      preferredModel: SYNTHESIS_MODEL,
      maxTokens: SYNTHESIS_TOKEN_LIMIT,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYNTHESIS_SYSTEM_PROMPT },
        {
          role: "user",
          content: synthesisUserPrompt({ decision, round1, round2 }),
        },
      ],
    });
    console.log(
      `[council] Synthesis raw response (model=${result.model}, fallback=${result.usedFallback}):\n${result.content}`,
    );
    try {
      const parsed = extractJson(result.content);
      if (isValidBriefing(parsed)) {
        briefing = parsed;
      } else {
        console.error("[council] Synthesis JSON failed validation:", parsed);
      }
    } catch (parseErr) {
      console.error(
        "[council] Synthesis JSON parse failed. Raw content above. Error:",
        parseErr,
      );
    }
  } catch (err) {
    console.error("[council] Synthesis call failed entirely:", err);
  }
  yield { type: "briefing", briefing };
}

/**
 * Mock streaming. Replays the existing MOCK_COUNCIL_RESPONSE with realistic
 * delays so the dev experience matches the live pipeline.
 */
export async function* mockCouncilStream(
  decision: string,
): AsyncGenerator<CouncilStreamEvent> {
  void decision;
  const PER_TURN_MS = 1400;

  for (const agent of MOCK_COUNCIL_RESPONSE.agents) {
    await delay(PER_TURN_MS);
    yield {
      type: "turn",
      phase: "opening",
      agent,
      model: `${MODEL_BY_ROLE[agent.name]} (mock)`,
      usedFallback: false,
    };
  }

  for (const agent of MOCK_COUNCIL_RESPONSE.discussionFollowUp ?? []) {
    await delay(PER_TURN_MS);
    yield {
      type: "turn",
      phase: "rebuttal",
      agent,
      model: `${MODEL_BY_ROLE[agent.name]} (mock)`,
      usedFallback: false,
    };
  }

  await delay(900);
  yield { type: "synthesizing" };
  await delay(1200);
  yield { type: "briefing", briefing: MOCK_COUNCIL_RESPONSE.briefing };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
