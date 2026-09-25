// North-Stars Swim School — waitlist capture endpoint
// Ticket NSSS-WAITLIST-DEAD.
//
// Before this existed, js/main.js wrote each signup to localStorage and nothing
// drained it, so every parent who signed up was invisible. This endpoint is the
// consumer: it writes the signup to NI-Brain (public.nsss_waitlist) and emails JB.
//
// Deployed to Supabase project kxijunwgbrlfzvgkhklo as function `nsss-waitlist`
// with verify_jwt = false (public form endpoint, no user auth).
// POST https://kxijunwgbrlfzvgkhklo.supabase.co/functions/v1/nsss-waitlist
//   body: { email, name?, source?, page_url?, referrer?, company? }
//   200  -> { ok: true, id, duplicate: bool, emailed: bool }
//   400  -> { ok: false, error: "invalid_email" }
//   500  -> { ok: false, error: "db_insert_failed", detail }

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const REST = `${SUPABASE_URL}/rest/v1`;

const ALLOWED_ORIGINS = [
  "https://www.northstarsswimschool.org",
  "https://northstarsswimschool.org",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];

// Only northsideintelligence.com and match-fit.net are verified in Resend.
// northstarsswimschool.org is NOT verified, so we cannot send as @northstarsswimschool.org yet.
const FROM_PRIMARY = "North-Stars Swim School <alerts@northsideintelligence.com>";
const FROM_FALLBACK = "North-Stars Swim School <alerts@match-fit.net>";
const NOTIFY_TO = ["northside.ventures.llc@gmail.com"];

function corsHeaders(origin: string | null): Record<string, string> {
  const allow =
    origin && (ALLOWED_ORIGINS.includes(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin))
      ? origin
      : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

const sbHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function getSecrets(keys: string[]): Promise<Record<string, string>> {
  const q = `${REST}/ni_platform_secrets?select=key,value&key=in.(${keys.join(",")})`;
  const res = await fetch(q, { headers: sbHeaders });
  if (!res.ok) return {};
  const rows = (await res.json()) as Array<{ key: string; value: string }>;
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

async function sendAlert(row: Record<string, unknown>, total: number): Promise<string> {
  const secrets = await getSecrets(["RESEND_API_KEY_NI", "RESEND_API_KEY"]);
  const attempts: Array<[string, string]> = [];
  if (secrets.RESEND_API_KEY_NI) attempts.push([secrets.RESEND_API_KEY_NI, FROM_PRIMARY]);
  if (secrets.RESEND_API_KEY) attempts.push([secrets.RESEND_API_KEY, FROM_FALLBACK]);
  if (!attempts.length) return "no_resend_key";

  const email = String(row.email ?? "");
  const name = row.name ? String(row.name) : "";
  const html = `
    <div style="font-family:Inter,Helvetica,Arial,sans-serif;color:#0a1024">
      <h2 style="margin:0 0 4px">New North-Stars Swim School waitlist signup</h2>
      <p style="margin:0 0 16px;color:#12508a">Waitlist total: <strong>${total}</strong></p>
      <table cellpadding="6" style="border-collapse:collapse;font-size:14px">
        <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
        ${name ? `<tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>` : ""}
        <tr><td><strong>Source</strong></td><td>${escapeHtml(String(row.source ?? ""))}</td></tr>
        <tr><td><strong>Page</strong></td><td>${escapeHtml(String(row.page_url ?? ""))}</td></tr>
        <tr><td><strong>Signed up</strong></td><td>${escapeHtml(String(row.created_at ?? ""))}</td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:13px;color:#5a6480">
        Stored in NI-Brain &rarr; public.nsss_waitlist (row id ${escapeHtml(String(row.id ?? ""))}).
      </p>
    </div>`;

  let lastErr = "";
  for (const [key, from] of attempts) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: NOTIFY_TO,
          reply_to: email,
          subject: `NSSS waitlist: ${email}`,
          html,
        }),
      });
      if (res.ok) return "sent";
      lastErr = `${res.status}:${(await res.text()).slice(0, 180)}`;
    } catch (e) {
      lastErr = String(e).slice(0, 180);
    }
  }
  return `failed:${lastErr}`;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405, origin);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400, origin);
  }

  // Honeypot — real humans never fill this hidden field.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return json({ ok: true, id: null, duplicate: false, emailed: false }, 200, origin);
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ ok: false, error: "invalid_email" }, 400, origin);
  }

  // Already on the list? Report success without a duplicate row or a duplicate alert.
  const existing = await fetch(
    `${REST}/nsss_waitlist?select=id&email=eq.${encodeURIComponent(email)}&limit=1`,
    { headers: sbHeaders }
  );
  if (existing.ok) {
    const rows = (await existing.json()) as Array<{ id: string }>;
    if (rows.length) {
      return json({ ok: true, id: rows[0].id, duplicate: true, emailed: false }, 200, origin);
    }
  }

  const insert = await fetch(`${REST}/nsss_waitlist`, {
    method: "POST",
    headers: { ...sbHeaders, Prefer: "return=representation" },
    body: JSON.stringify({
      email,
      name: body.name ? String(body.name).slice(0, 120) : null,
      source: body.source ? String(body.source).slice(0, 60) : "website",
      page_url: body.page_url ? String(body.page_url).slice(0, 500) : null,
      referrer: body.referrer ? String(body.referrer).slice(0, 500) : null,
      user_agent: (req.headers.get("user-agent") ?? "").slice(0, 500) || null,
    }),
  });

  if (!insert.ok) {
    const detail = (await insert.text()).slice(0, 300);
    // 23505 = unique violation: someone raced us. Still a success for the parent.
    if (insert.status === 409 || detail.includes("23505")) {
      return json({ ok: true, id: null, duplicate: true, emailed: false }, 200, origin);
    }
    console.error("nsss-waitlist db_insert_failed", insert.status, detail);
    return json({ ok: false, error: "db_insert_failed", detail }, 500, origin);
  }

  const row = ((await insert.json()) as Array<Record<string, unknown>>)[0];

  let total = 0;
  try {
    const c = await fetch(`${REST}/nsss_waitlist?select=id`, {
      headers: { ...sbHeaders, Prefer: "count=exact", Range: "0-0" },
    });
    total = Number(c.headers.get("content-range")?.split("/")[1] ?? 0);
  } catch { /* count is cosmetic */ }

  const notify = await sendAlert(row, total);

  await fetch(`${REST}/nsss_waitlist?id=eq.${row.id}`, {
    method: "PATCH",
    headers: sbHeaders,
    body: JSON.stringify({
      notify_status: notify,
      notified_at: notify === "sent" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }),
  });

  return json({ ok: true, id: row.id, duplicate: false, emailed: notify === "sent" }, 200, origin);
});
