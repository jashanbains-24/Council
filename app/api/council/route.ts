import { NextResponse } from "next/server";
import { mockCouncil, realCouncil } from "@/lib/council";

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
      ? await mockCouncil(decision)
      : await realCouncil(decision);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Council API error:", error);

    return NextResponse.json(
      { error: "Failed to generate Council response" },
      { status: 500 },
    );
  }
}
