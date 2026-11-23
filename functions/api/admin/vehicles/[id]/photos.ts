import type { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";
interface Env { DB: D1Database; VEHICLE_PHOTOS: R2Bucket }
const OWNER = "as3703195@gmail.com";
const allowed = (data: PluginData) => String(data.cloudflareAccess.JWT.payload.email || "").toLowerCase() === OWNER;
const keyPattern = /^[a-f0-9-]+\.(?:jpg|jpeg|png|webp)$/i;
function parsePhotos(value: unknown): string[] {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string" && keyPattern.test(x)).slice(0, 8) : [];
  } catch { return []; }
}
export const onRequestPost: PagesFunction<Env, string, PluginData> = async ({ data, env, request, params }) => {
  if (!allowed(data)) return Response.json({ error: "Not authorised." }, { status: 403 });
  const id = String(params.id || "");
  const vehicle = await env.DB.prepare("SELECT id, photos FROM vehicles WHERE id = ?").bind(id).first<{id:string;photos:string}>();
  if (!vehicle) return Response.json({ error: "Vehicle not found." }, { status: 404 });
  const current = parsePhotos(vehicle.photos);
  if (current.length >= 8) return Response.json({ error: "A maximum of 8 photos is allowed per vehicle." }, { status: 400 });
  let form: FormData;
  try { form = await request.formData(); } catch { return Response.json({ error: "Invalid upload form." }, { status: 400 }); }
  const files = form.getAll("photos").filter((x): x is File => x instanceof File);
  if (!files.length || files.length > 8 - current.length) return Response.json({ error: "Select between 1 and " + (8-current.length) + " images." }, { status: 400 });
  const uploaded: string[] = [];
  for (const file of files) {
    if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024 || file.size === 0) {
      return Response.json({ error: "Only JPG, PNG or WebP images up to 8 MB each are accepted." }, { status: 400 });
    }
  }
  try {
    for (const file of files) {
      const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
      const key = crypto.randomUUID() + "." + ext;
      await env.VEHICLE_PHOTOS.put(key, file.stream(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" } });
      uploaded.push(key);
    }
    const next = [...current, ...uploaded];
    await env.DB.prepare("UPDATE vehicles SET photos = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(next), new Date().toISOString(), id).run();
    return Response.json({ ok: true, photoUrls: next.map(key => "/media/" + key) });
  } catch (error) {
    await Promise.all(uploaded.map(key => env.VEHICLE_PHOTOS.delete(key).catch(() => undefined)));
    console.error("Vehicle photo upload failed", error);
    return Response.json({ error: "Photo upload failed. Please try again." }, { status: 500 });
  }
};
export const onRequestDelete: PagesFunction<Env, string, PluginData> = async ({ data, env, request, params }) => {
  if (!allowed(data)) return Response.json({ error: "Not authorised." }, { status: 403 });
  let body: { key?: string };
  try { body = await request.json() as { key?: string }; } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const key = String(body.key || "");
  if (!keyPattern.test(key)) return Response.json({ error: "Invalid photo reference." }, { status: 400 });
  const id = String(params.id || "");
  const vehicle = await env.DB.prepare("SELECT id, photos FROM vehicles WHERE id = ?").bind(id).first<{id:string;photos:string}>();
  if (!vehicle) return Response.json({ error: "Vehicle not found." }, { status: 404 });
  const next = parsePhotos(vehicle.photos).filter(item => item !== key);
  if (next.length === parsePhotos(vehicle.photos).length) return Response.json({ error: "Photo not found." }, { status: 404 });
  try {
    await env.VEHICLE_PHOTOS.delete(key);
    await env.DB.prepare("UPDATE vehicles SET photos = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(next), new Date().toISOString(), id).run();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Vehicle photo deletion failed", error);
    return Response.json({ error: "Photo could not be deleted." }, { status: 500 });
  }
};
