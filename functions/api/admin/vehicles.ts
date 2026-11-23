import type { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";
interface Env { DB: D1Database }
const OWNER = "as3703195@gmail.com";
const allowed = (data: PluginData) => String(data.cloudflareAccess.JWT.payload.email || "").toLowerCase() === OWNER;
function photoList(value: unknown): string[] {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && /^[a-f0-9-]+\.(?:jpg|jpeg|png|webp)$/i.test(item)).slice(0, 8);
  } catch { return []; }
}
export const onRequestGet: PagesFunction<Env, string, PluginData> = async ({ data, env }) => {
  if (!allowed(data)) return Response.json({ error: "Not authorised." }, { status: 403 });
  try {
    const result = await env.DB.prepare(
      "SELECT id, make, model, year, mileage, price, transmission, fuel, description, status, photos FROM vehicles ORDER BY created_at DESC LIMIT 100"
    ).all();
    return Response.json({ vehicles: (result.results || []).map((row: Record<string, unknown>) => {
      const photos = photoList(row.photos);
      return { ...row, photos, photoUrls: photos.map(key => "/media/" + key) };
    }) });
  } catch (error) {
    console.error("Admin vehicle read failed", error);
    return Response.json({ error: "Could not load vehicle listings." }, { status: 500 });
  }
};
export const onRequestPost: PagesFunction<Env, string, PluginData> = async ({ data, env, request }) => {
  if (!allowed(data)) return Response.json({ error: "Not authorised." }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ error: "Invalid request body." }, { status: 400 }); }
  const make = typeof body.make === "string" ? body.make.trim().slice(0, 60) : "";
  const model = typeof body.model === "string" ? body.model.trim().slice(0, 80) : "";
  const year = Number(body.year), mileage = Number(body.mileage), price = Number(body.price);
  if (!make || !model || !Number.isInteger(year) || year < 1980 || year > new Date().getFullYear() + 1 || !Number.isFinite(mileage) || mileage < 0 || !Number.isFinite(price) || price < 0) {
    return Response.json({ error: "Enter a valid make, model, year, mileage and price." }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      "INSERT INTO vehicles (id, make, model, year, mileage, price, transmission, fuel, description, status, photos, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?)"
    ).bind(id, make, model, year, mileage, price, String(body.transmission || "—").slice(0, 40), String(body.fuel || "—").slice(0, 40), String(body.description || "").slice(0, 1500), body.status === "sold" ? "sold" : "available", now, now).run();
    return Response.json({ ok: true, id });
  } catch (error) {
    console.error("Vehicle insert failed", error);
    return Response.json({ error: "Vehicle could not be saved." }, { status: 500 });
  }
};
