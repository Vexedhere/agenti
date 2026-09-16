const ALLOWED_ORIGIN = "https://agent.sparkagent.in.net";
const MAX_BODY_BYTES = 120000;
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 12000;
const MODEL = "openrouter/free";

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": ALLOWED_ORIGIN,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  },
});

export default async function handler(request, context) {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": ALLOWED_ORIGIN,
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "86400",
      },
    });
  }

  if (origin && origin !== ALLOWED_ORIGIN) {
    return json({ error: "Origin not allowed." }, 403);
  }

  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const apiKey = Netlify.env.get("OPENROUTER_API_KEY");
  if (!apiKey) return json({ error: "SparkAgent AI is not configured yet." }, 503);

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return json({ error: "Request is too large." }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request." }, 400);
  }

  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  if (!incoming.length || incoming.length > MAX_MESSAGES) {
    return json({ error: "Invalid message history." }, 400);
  }

  const messages = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant" || m.role === "system") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));

  if (!messages.length) return json({ error: "No valid messages supplied." }, 400);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": ALLOWED_ORIGIN,
      "X-Title": "SparkAgent",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    let message = `OpenRouter returned HTTP ${response.status}.`;
    try {
      const data = JSON.parse(text);
      message = data?.error?.message || message;
    } catch {}
    return json({ error: message }, response.status >= 500 ? 502 : response.status);
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "connection": "keep-alive",
      "access-control-allow-origin": ALLOWED_ORIGIN,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "x-accel-buffering": "no",
    },
  });
}
