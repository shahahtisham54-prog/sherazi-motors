interface Env { DB: D1Database }
interface AdminData { adminEmail?: string }
const OWNER = "as3703195@gmail.com";
const allowed = (data: AdminData) => data.adminEmail === OWNER;

export const onRequestPut: PagesFunction<Env, string, AdminData> = async ({ data, env, request, params }) => {
  if (!allowed(data)) return Response.json({ error: "Not authorised." }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ error: "Invalid request body." }, { status: 400 }); }
  const id = String(params.id);
  const current = await env.DB.prepare("SELECT * FROM vehicles WHERE id = ?").bind(id).first<Record<string, unknown>>();
  if (!current) return Response.json({ error: "Vehicle not found." }, { status: 404 });
  const fields: Record<string, unknown> = { ...current };
  for (const key of ["make", "model", "transmission", "fuel", "description"]) {
    if (body[key] !== undefined) fields[key] = String(body[key]).trim().slice(0, key === "description" ? 1500 : 80);
  }
  for (const key of ["year", "mileage", "price"]) {
    if (body[key] !== undefined) {
      const value = Number(body[key]);
      if (!Number.isFinite(value) || value < 0 || (key === "year" && (!Number.isInteger(value) || value < 1980 || value > new Date().getFullYear() + 1))) {
        return Response.json({ error: "Invalid " + key + " value." }, { status: 400 });
      }
      fields[key] = value;
    }
  }
  if (body.status !== undefined) {
    if (body.status !== "available" && body.status !== "sold") return Response.json({ error: "Invalid status." }, { status: 400 });
    fields.status = body.status;
  }
  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      "UPDATE vehicles SET make=?, model=?, year=?, mileage=?, price=?, transmission=?, fuel=?, description=?, status=?, updated_at=? WHERE id=?"
    ).bind(fields.make, fields.model, fields.year, fields.mileage, fields.price, fields.transmission, fields.fuel, fields.description, fields.status, now, id).run();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Vehicle update failed", error);
    return Response.json({ error: "Vehicle could not be updated." }, { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<Env, string, PluginData> = async ({ data, env, params }) => {
  if (!allowed(data)) return Response.json({ error: "Not authorised." }, { status: 403 });
  const result = await env.DB.prepare("DELETE FROM vehicles WHERE id = ?").bind(String(params.id)).run();
  if (!result.meta.changes) return Response.json({ error: "Vehicle not found." }, { status: 404 });
  return Response.json({ ok: true });
};
