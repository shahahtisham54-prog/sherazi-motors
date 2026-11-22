import { generateLogoutURL } from "@cloudflare/pages-plugin-cloudflare-access/api";
interface Env { CF_ACCESS_TEAM_DOMAIN: string }

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.CF_ACCESS_TEAM_DOMAIN) return Response.redirect(new URL("/", request.url).toString(), 302);
  const logoutURL = generateLogoutURL({ domain: env.CF_ACCESS_TEAM_DOMAIN });
  return Response.redirect(logoutURL, 302);
};
