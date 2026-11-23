interface Env { DB: D1Database }
function photoList(value: unknown): string[] {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && /^[a-f0-9-]+\.(?:jpg|jpeg|png|webp)$/i.test(item)).slice(0, 8);
  } catch { return []; }
}
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const result = await env.DB.prepare(
      "SELECT id, make, model, year, mileage, price, transmission, fuel, description, status, photos FROM vehicles WHERE status = 'available' ORDER BY created_at DESC LIMIT 100"
    ).all();
    const vehicles = (result.results || []).map((row: Record<string, unknown>) => {
      const photos = photoList(row.photos);
      return { ...row, photos, photoUrls: photos.map(key => "/media/" + key) };
    });
    return Response.json({ vehicles }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (error) {
    console.error("Vehicle list read failed", error);
    return Response.json({ error: "Vehicle listings are temporarily unavailable." }, { status: 500 });
  }
};
