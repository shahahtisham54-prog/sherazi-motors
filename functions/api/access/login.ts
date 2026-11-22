import { generateLoginURL } from "@cloudflare/pages-plugin-cloudflare-access/api";
interface Env { CF_ACCESS_TEAM_DOMAIN: string; CF_ACCESS_AUD: string }

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.CF_ACCESS_TEAM_DOMAIN || !env.CF_ACCESS_AUD) {
    return new Response("Admin sign-in is not configured yet.", { status: 503 });
  }
  const current = new URL(request.url);
  const requested = current.searchParams.get("returnTo") || "/";
  let redirectURL = new URL("/", current.origin).toString();
  try {
    const candidate = new URL(requested, current.origin);
    if (candidate.origin === current.origin) redirectURL = candidate.toString();
  } catch { /* use safe same-origin default */ }
  const loginURL = generateLoginURL({
    redirectURL,
    domain: env.CF_ACCESS_TEAM_DOMAIN,
    aud: env.CF_ACCESS_AUD
  });
  return Response.redirect(loginURL, 302);
};
