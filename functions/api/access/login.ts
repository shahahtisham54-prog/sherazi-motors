import { createSession, sessionCookie } from "../../lib/admin-auth";

interface Env {
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Cloudflare Pages applies updated secret values on a new deployment.
  // Trim accidental whitespace from dashboard entry and copied password input.
  const configuredPassword = env.ADMIN_PASSWORD?.trim();
  const sessionSecret = env.ADMIN_SESSION_SECRET?.trim();

  if (!configuredPassword || !sessionSecret) {
    return Response.json(
      { error: "Admin login is not configured. Confirm both Production secrets are saved, then deploy again.", code: "AUTH_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json() as { password?: string };
  } catch {
    return Response.json({ error: "Invalid login request.", code: "INVALID_REQUEST" }, { status: 400 });
  }

  const supplied = String(body.password || "").trim();
  if (!supplied || supplied.length > 256 || supplied !== configuredPassword) {
    return Response.json(
      { error: "Incorrect password. Check capitalization and make sure there are no extra spaces.", code: "PASSWORD_MISMATCH" },
      { status: 401 }
    );
  }

  const token = await createSession(sessionSecret);
  return new Response(JSON.stringify({ ok: true, user: { email: "as3703195@gmail.com" } }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": sessionCookie(token)
    }
  });
};
