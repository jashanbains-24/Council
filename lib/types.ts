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
  /** Second round: agents answer each other and narrow toward a decision */
  discussionFollowUp?: AgentResponse[];
  briefing: Briefing;
};

export type ReasoningResponse = {
  response: string;
};

/** Streaming event protocol used by /api/council (NDJSON, one JSON per line). */
export type CouncilStreamEvent =
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
