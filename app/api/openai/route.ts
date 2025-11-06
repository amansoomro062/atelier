import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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
        { error: "OpenAI API key is required" },
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

    const openai = new OpenAI({
      apiKey,
    });

    const messages: Array<any> = [];

    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    // Add current user message
    if (userPrompt) {
      // If images are provided, use vision format
      if (images && images.length > 0) {
        const content: any[] = [
          { type: "text", text: userPrompt }
        ];

        images.forEach((img: any) => {
          content.push({
            type: "image_url",
            image_url: {
              url: `data:${img.mimeType};base64,${img.data}`
            }
          });
        });

        messages.push({ role: "user", content });
      } else {
        messages.push({ role: "user", content: userPrompt });
      }
    }

    const stream = await openai.chat.completions.create({
      model: model || "gpt-4o",
      messages,
      stream: true,
      stream_options: { include_usage: true },
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

            // Send token usage if available (last chunk)
            if (chunk.usage) {
              const tokens = {
                prompt: chunk.usage.prompt_tokens,
                completion: chunk.usage.completion_tokens,
                total: chunk.usage.total_tokens
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ tokens })}\n\n`));
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
