import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, userPrompt, model, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is required" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey,
    });

    const messages: Array<{ role: "system" | "user"; content: string }> = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    if (userPrompt) {
      messages.push({ role: "user", content: userPrompt });
    }

    const stream = await openai.chat.completions.create({
      model: model || "gpt-4",
      messages,
      stream: true,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
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
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
