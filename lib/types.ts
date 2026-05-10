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
  briefing: Briefing;
};

export type ReasoningResponse = {
  response: string;
};
