interface Env { DB: D1Database }
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const result = await env.DB.prepare(
      "SELECT id, make, model, year, mileage, price, transmission, fuel, description, status, photos FROM vehicles WHERE status = 'available' ORDER BY created_at DESC LIMIT 100"
    ).all();
    const vehicles = (result.results || []).map((row: Record<string, unknown>) => ({
      ...row,
      photoUrls: []
    }));
    return Response.json({ vehicles });
  } catch (error) {
    console.error("Vehicle list read failed", error);
    return Response.json({ error: "Vehicle listings are temporarily unavailable." }, { status: 500 });
  }
};
