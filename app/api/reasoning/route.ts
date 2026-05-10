import { NextResponse } from "next/server";
import { mockReasoning, realReasoning } from "@/lib/council";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const decision = body.decision;

    if (!decision || typeof decision !== "string") {
      return NextResponse.json(
        { error: "decision is required" },
        { status: 400 },
      );
    }

    const useMock = process.env.MOCK_API !== "false";
    const result = useMock
      ? await mockReasoning(decision)
      : await realReasoning(decision);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Reasoning API error:", error);

    return NextResponse.json(
      { error: "Failed to generate reasoning response" },
      { status: 500 },
    );
  }
}
