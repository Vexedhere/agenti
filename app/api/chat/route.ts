import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const model = process.env.AI_MODEL;
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = (process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai").replace(/\/$/, "");

    if (!apiKey || !model) {
      return NextResponse.json({ error: "AI provider is not configured. Set AI_API_KEY and AI_MODEL in the deployment environment." }, { status: 503 });
    }

    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.2, stream: false }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json({ error: data?.error?.message || "The AI provider returned an error." }, { status: 502 });
    }

    return NextResponse.json({ message: data?.choices?.[0]?.message?.content || "The model returned an empty response." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not process the chat request." }, { status: 500 });
  }
}
