import { createSession, sessionCookie } from "../../lib/admin-auth";
interface Env { ADMIN_PASSWORD?: string; ADMIN_SESSION_SECRET?: string }
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
    return Response.json({ error: "Admin login is not configured. Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Cloudflare Pages settings." }, { status: 503 });
  }
  let body: { password?: string };
  try { body = await request.json() as { password?: string }; } catch { return Response.json({ error: "Invalid login request." }, { status: 400 }); }
  const supplied = String(body.password || "");
  if (!supplied || supplied.length > 256 || supplied !== env.ADMIN_PASSWORD) {
    return Response.json({ error: "Incorrect password." }, { status: 401 });
  }
  const token = await createSession(env.ADMIN_SESSION_SECRET);
  return new Response(JSON.stringify({ ok: true, user: { email: "as3703195@gmail.com" } }), {
    headers: { "Content-Type": "application/json", "Set-Cookie": sessionCookie(token) }
  });
};