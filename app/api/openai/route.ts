import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, userPrompt, model, apiKey, images, messages: conversationHistory } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is required" },
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
