import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, userPrompt, model, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key is required" },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey,
    });

    const stream = await anthropic.messages.stream({
      model: model || "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: systemPrompt || undefined,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const content = chunk.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Anthropic API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
