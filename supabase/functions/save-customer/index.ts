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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const ip = clientIp(req);
    const count = await supabase.rpc("bump_rate_limit", {
      p_key: `customer:${ip}`,
      p_window_seconds: 60,
    });
    if (!count.error && typeof count.data === "number" && count.data > 12) {
      return json({ error: "Demasiadas solicitudes. Intenta de nuevo en un momento." }, 429);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ error: "Solicitud inválida" }, 400);
    }

    const name = String(body.name ?? "").trim();
    const phoneCountry = String(body.phone_country ?? "+51").trim();
    const digits = String(body.phone ?? "").replace(/[^0-9]/g, "");

    if (!name || name.length < 2 || name.length > 80) {
      return json({ error: "Ingresa un nombre válido." }, 400);
    }
    if (!/^\+\d{1,4}$/.test(phoneCountry)) {
      return json({ error: "Prefijo de país inválido." }, 400);
    }
    if (digits.length < 6 || digits.length > 15) {
      return json({ error: "Ingresa un número de teléfono válido." }, 400);
    }

    const normalized = `${phoneCountry}${digits}`;

    const { error } = await supabase.rpc("upsert_customer", {
      p_name: name.slice(0, 80),
      p_country: phoneCountry,
      p_phone: digits,
      p_normalized: normalized,
    });

    if (error) {
      return json({ error: "No se pudo guardar el cliente." }, 500);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
