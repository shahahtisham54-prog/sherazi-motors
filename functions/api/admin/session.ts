import type { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";
interface Env { }
const OWNER = "as3703195@gmail.com";

export const onRequestGet: PagesFunction<Env, string, PluginData> = async ({ data }) => {
  const email = String(data.cloudflareAccess.JWT.payload.email || "").toLowerCase();
  if (email !== OWNER) return Response.json({ error: "Not authorised." }, { status: 403 });
  return Response.json({ user: { email } });
};
