import cloudflareAccessPlugin from "@cloudflare/pages-plugin-cloudflare-access";

interface Env {
  CF_ACCESS_TEAM_DOMAIN: string;
  CF_ACCESS_AUD: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const domain = context.env.CF_ACCESS_TEAM_DOMAIN;
  const aud = context.env.CF_ACCESS_AUD;
  if (!domain || !aud) {
    return new Response("Admin authentication is not configured.", { status: 503 });
  }
  const access = cloudflareAccessPlugin({ domain, aud });
  return access(context);
};
