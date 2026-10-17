import { NextRequest, NextResponse } from "next/server";

export const MAX_QUERY_CHARS = 1000;
const MAX_HISTORY_MESSAGES = 6;
const MAX_HISTORY_CHARS = 4000;

// Per-IP sliding window. In-memory, so on serverless it is per-instance and
// best-effort — enough to stop casual abuse, not a determined attacker.
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

export type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing unbounded.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

/**
 * Validates and normalises a chat request body. Returns either the parsed
 * query + history, or an error response to send back as-is.
 */
export async function parseChatRequest(
  req: NextRequest
): Promise<{ query: string; history: HistoryMessage[] } | { error: NextResponse }> {
  if (isRateLimited(clientIp(req))) {
    return {
      error: NextResponse.json(
        { error: "Too many requests — please wait a minute and try again." },
        { status: 429, headers: { "Retry-After": String(RATE_WINDOW_MS / 1000) } }
      ),
    };
  }

  const body = await req.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (!query) {
    return { error: NextResponse.json({ error: "Missing query" }, { status: 400 }) };
  }
  if (query.length > MAX_QUERY_CHARS) {
    return {
      error: NextResponse.json(
        { error: `Question is too long — keep it under ${MAX_QUERY_CHARS} characters.` },
        { status: 400 }
      ),
    };
  }

  const rawHistory: unknown[] = Array.isArray(body?.history) ? body.history : [];
  const history: HistoryMessage[] = rawHistory
    .slice(-MAX_HISTORY_MESSAGES)
    .filter(
      (m): m is { role: string; content: string } =>
        typeof m === "object" &&
        m !== null &&
        typeof (m as Record<string, unknown>).role === "string" &&
        typeof (m as Record<string, unknown>).content === "string"
    )
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.slice(0, MAX_HISTORY_CHARS),
    }));

  return { query, history };
}
