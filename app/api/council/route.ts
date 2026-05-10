import { NextResponse } from "next/server";
import {
  mockCouncilStream,
  realCouncilStream,
} from "@/lib/council";
import type { CouncilStreamEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let decision: string;
  try {
    const body = await req.json();
    decision = body.decision;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!decision || typeof decision !== "string") {
    return NextResponse.json(
      { error: "decision is required" },
      { status: 400 },
    );
  }

  const useMock = process.env.MOCK_API !== "false";
  const generator = useMock
    ? mockCouncilStream(decision)
    : realCouncilStream(decision);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (event: CouncilStreamEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        for await (const event of generator) {
          write(event);
        }
      } catch (err) {
        console.error("Council stream error:", err);
        write({
          type: "error",
          message: "Council stream failed unexpectedly.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
