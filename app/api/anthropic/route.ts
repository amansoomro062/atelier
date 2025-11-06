import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";

// Rate limiting (simple in-memory store - for production use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 20) { // 20 requests per minute
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Check origin - only allow requests from same origin in production
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");

    if (process.env.NODE_ENV === "production" && origin) {
      const allowedOrigins = [
        `https://${host}`,
        `http://${host}`,
        process.env.NEXT_PUBLIC_APP_URL,
      ].filter(Boolean);

      if (!allowedOrigins.some(allowed => origin.startsWith(allowed as string))) {
        return NextResponse.json(
          { error: "Unauthorized origin" },
          { status: 403 }
        );
      }
    }

    // Rate limiting by IP
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const { systemPrompt, userPrompt, model, apiKey, images, messages: conversationHistory } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key is required" },
        { status: 400 }
      );
    }

    // Input validation
    if (systemPrompt && systemPrompt.length > 100000) {
      return NextResponse.json(
        { error: "System prompt is too long" },
        { status: 400 }
      );
    }

    if (userPrompt && userPrompt.length > 100000) {
      return NextResponse.json(
        { error: "User prompt is too long" },
        { status: 400 }
      );
    }

    if (images && images.length > 10) {
      return NextResponse.json(
        { error: "Too many images. Maximum 10 allowed." },
        { status: 400 }
      );
    }

    if (conversationHistory && conversationHistory.length > 100) {
      return NextResponse.json(
        { error: "Conversation history is too long" },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey,
    });

    // Build content array for vision support
    let content: any = userPrompt;

    if (images && images.length > 0) {
      content = [
        { type: "text", text: userPrompt }
      ];

      images.forEach((img: any) => {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: img.mimeType,
            data: img.data
          }
        });
      });
    }

    // Build messages array - use conversation history if provided, otherwise single message
    const messages = conversationHistory && conversationHistory.length > 0
      ? [...conversationHistory, { role: "user", content }]
      : [{ role: "user", content }];

    const stream = await anthropic.messages.stream({
      model: model || "claude-3-5-sonnet-20241022",
      max_tokens: 8192,
      system: systemPrompt || undefined,
      messages,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          let usage = { input_tokens: 0, output_tokens: 0 };

          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const content = chunk.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            } else if (chunk.type === "message_start" && chunk.message.usage) {
              usage.input_tokens = chunk.message.usage.input_tokens || 0;
            } else if (chunk.type === "message_delta" && chunk.usage) {
              usage.output_tokens = chunk.usage.output_tokens || 0;
            }
          }

          // Send token usage at the end
          const tokens = {
            prompt: usage.input_tokens,
            completion: usage.output_tokens,
            total: usage.input_tokens + usage.output_tokens
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ tokens })}\n\n`)
          );
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
