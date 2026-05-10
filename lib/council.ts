import { MOCK_COUNCIL_RESPONSE, MOCK_REASONING_RESPONSE } from "./mock";
import type { CouncilResponse, ReasoningResponse } from "./types";

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

export async function realCouncil(
  decision: string,
): Promise<CouncilResponse> {
  void decision;
  return {
    agents: [],
    briefing: {
      recommendation:
        "Real Council mode is not implemented yet. Do not proceed blindly.",
      reasoning:
        "The mock system must work end to end before live CLōD calls are enabled. Keep MOCK_API=true until the live integration step.",
      dissent: "Unavailable because real Council mode has not been built yet.",
      biggest_risk:
        "The agent may continue based on a significant assumption without a working deliberation layer.",
      confidence: "low",
      what_would_change_this:
        "Implementing and testing the real CLōD Council pipeline.",
      should_ask_human: true,
      suggested_question:
        "Can you clarify the missing requirement before I proceed?",
    },
  };
}

export async function realReasoning(
  decision: string,
): Promise<ReasoningResponse> {
  void decision;
  return {
    response:
      "Real reasoning mode is not implemented yet. Keep MOCK_API=true until the live CLōD integration step.",
  };
}
