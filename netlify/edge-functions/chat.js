import { getStore } from "@netlify/blobs";

const ALLOWED_ORIGIN = "https://agent.sparkagent.in.net";
const MAX_BODY_BYTES = 120000;
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 12000;
const MODEL = "openrouter/free";
const FREE_CODING_DAILY_LIMIT = 5;
const FREE_ADVANCED_DAILY_LIMIT = 5;
const FREE_CODE_MAX_CHARS = 6000;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": ALLOWED_ORIGIN,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
  },
});

async function getAuthenticatedUser(accessToken) {
  if (!accessToken) return null;
  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const supabaseAnonKey = Netlify.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) return null;
  return await response.json();
}

async function getTier(userId, accessToken) {
  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const supabaseAnonKey = Netlify.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) return "FREE";

  const response = await fetch(
    `${supabaseUrl}/rest/v1/profiles?select=tier&id=eq.${encodeURIComponent(userId)}&limit=1`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) return "FREE";
  const rows = await response.json();
  return String(rows?.[0]?.tier || "FREE").toUpperCase();
}

async function consumeDailyLimit(userId, tier) {
  if (tier !== "FREE") return { allowed: true, used: 0, limit: null };

  const store = getStore("sparkagent-usage");
  const today = new Date().toISOString().slice(0, 10);
  const key = `daily/${userId}/${today}`;
  const current = (await store.get(key, { type: "json", consistency: "strong" })) || { count: 0 };
  const used = Number(current.count || 0);

  if (used >= FREE_DAILY_LIMIT) {
    return { allowed: false, used, limit: FREE_DAILY_LIMIT };
  }

  await store.setJSON(key, { count: used + 1, updatedAt: new Date().toISOString() });
  return { allowed: true, used: used + 1, limit: FREE_DAILY_LIMIT };
}

export default async function handler(request, context) {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": ALLOWED_ORIGIN,
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type, authorization",
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

  const authHeader = request.headers.get("authorization") || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const user = await getAuthenticatedUser(accessToken);

  if (!user?.id) {
    return json({ error: "Please sign in to use SparkAgent." }, 401);
  }

  const tier = await getTier(user.id, accessToken);
  const usage = await consumeDailyLimit(user.id, tier);

  if (!usage.allowed) {
    return json({
      error: "Free plan daily limit reached.",
      code: "DAILY_LIMIT_REACHED",
      used: usage.used,
      limit: usage.limit,
      upgradeUrl: "https://tiers.sparkagent.in.net",
    }, 429);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return json({ error: "Request is too large." }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request." }, 400);
  }

  const feature = ["general","coding","study","writing","summarize","brainstorm","advanced"].includes(body?.feature) ? body.feature : "general";
  const usage = await consumeFeatureLimit(user.id, tier, feature);
  if (!usage.allowed) {
    return json({ error: `Free plan ${feature} limit reached.`, code: "FEATURE_LIMIT_REACHED", feature, used: usage.used, limit: usage.limit, upgradeUrl: "https://tiers.sparkagent.in.net" }, 429);
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
      "access-control-allow-headers": "content-type, authorization",
      "x-accel-buffering": "no",
      "x-sparkagent-tier": tier,
      "x-sparkagent-daily-used": String(usage.used),
      "x-sparkagent-daily-limit": usage.limit == null ? "unlimited" : String(usage.limit),
    },
  });
}