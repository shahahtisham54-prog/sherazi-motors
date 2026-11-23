interface Env { VEHICLE_PHOTOS: R2Bucket }
const keyPattern = /^[a-f0-9-]+\.(?:jpg|jpeg|png|webp)$/i;
export const onRequestGet: PagesFunction<Env, string> = async ({ env, params }) => {
  const key = String(params.key || "");
  if (!keyPattern.test(key)) return new Response("Not found", { status: 404 });
  const object = await env.VEHICLE_PHOTOS.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
};
