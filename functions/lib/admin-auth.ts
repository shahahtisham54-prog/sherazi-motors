const OWNER = "as3703195@gmail.com";
const COOKIE = "sm_admin_session";
const encoder = new TextEncoder();
function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}
async function keyFor(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
export async function createSession(secret: string) {
  const payload = toBase64Url(encoder.encode(JSON.stringify({ email: OWNER, exp: Date.now() + 12 * 60 * 60 * 1000 })));
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", await keyFor(secret), encoder.encode(payload)));
  return payload + "." + toBase64Url(signature);
}
export async function verifySession(token: string, secret: string) {
  try {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) return false;
    const valid = await crypto.subtle.verify("HMAC", await keyFor(secret), fromBase64Url(signature), encoder.encode(payload));
    if (!valid) return false;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return data.email === OWNER && Number(data.exp) > Date.now();
  } catch { return false; }
}
export function sessionCookie(token: string, maxAge = 43200) {
  return COOKIE + "=" + token + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + maxAge;
}
export function readSessionCookie(request: Request) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.split(";").map(x => x.trim()).find(x => x.startsWith(COOKIE + "="));
  return match ? match.slice(COOKIE.length + 1) : "";
}
export { OWNER };
