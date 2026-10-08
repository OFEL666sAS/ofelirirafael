import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || "unknown";
}

const BOT_RE = /(bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|whatsapp|telegrambot|headless|lighthouse|pagespeed|python-requests|curl|wget|axios|node-fetch)/i;

function refSource(referrer: string | null, ownHost: string | null): string | null {
  if (!referrer) return null;
  try {
    const u = new URL(referrer);
    if (ownHost && u.hostname === ownHost) return null;
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const ua = req.headers.get("user-agent") || "";
    if (BOT_RE.test(ua)) {
      return json({ ok: true, skipped: "bot" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const ip = clientIp(req);
    const rl = await supabase.rpc("bump_rate_limit", {
      p_key: `evt:${ip}`,
      p_window_seconds: 60,
    });
    if (!rl.error && typeof rl.data === "number" && rl.data > 120) {
      return json({ ok: true, skipped: "rate" });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ error: "Solicitud inválida" }, 400);
    }

    const eventType = String(body.event_type ?? "");
    if (!["pageview", "product_view", "category_view"].includes(eventType)) {
      return json({ error: "Evento inválido" }, 400);
    }

    const path = body.path ? String(body.path).slice(0, 300) : null;
    const productId = body.product_id ? String(body.product_id).slice(0, 60) : null;
    const category = body.category ? String(body.category).slice(0, 60) : null;
    const visitorId = body.visitor_id ? String(body.visitor_id).slice(0, 64) : null;
    const sessionId = body.session_id ? String(body.session_id).slice(0, 64) : null;

    let ownHost: string | null = null;
    try {
      const origin = req.headers.get("origin");
      if (origin) ownHost = new URL(origin).hostname;
    } catch { /* ignore */ }
    const source = refSource(body.referrer ? String(body.referrer) : null, ownHost);

    // Server-side dedup: ignore identical events from the same visitor within 10s
    // (protects against double renders / rapid re-fires).
    if (visitorId) {
      const since = new Date(Date.now() - 10000).toISOString();
      let dedup = supabase
        .from("analytics_events")
        .select("id")
        .eq("visitor_id", visitorId)
        .eq("event_type", eventType)
        .gte("created_at", since)
        .limit(1);
      dedup = path ? dedup.eq("path", path) : dedup.is("path", null);
      const recent = await dedup.maybeSingle();
      if (recent.data) {
        return json({ ok: true, deduped: true });
      }
    }

    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    await supabase.from("analytics_events").insert({
      event_type: eventType,
      path,
      product_id: productId && uuidRe.test(productId) ? productId : null,
      category,
      referrer_source: source,
      visitor_id: visitorId,
      session_id: sessionId,
    });

    return json({ ok: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
