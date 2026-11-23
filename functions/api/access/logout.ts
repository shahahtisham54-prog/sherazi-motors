import { sessionCookie } from "../../lib/admin-auth";
export const onRequestPost: PagesFunction = async () => new Response(JSON.stringify({ ok: true }), {
  headers: { "Content-Type": "application/json", "Set-Cookie": sessionCookie("", 0) }
});