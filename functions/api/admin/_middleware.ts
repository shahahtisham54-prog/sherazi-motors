import { readSessionCookie, verifySession } from "../../lib/admin-auth";
interface Env { ADMIN_SESSION_SECRET?: string }
export const onRequest: PagesFunction<Env> = async (context) => {
  const secret = context.env.ADMIN_SESSION_SECRET;
  const token = readSessionCookie(context.request);
  if (!secret || !token || !(await verifySession(token, secret))) {
    return Response.json({ error: "Please sign in to manage vehicle listings." }, { status: 401 });
  }
  (context.data as { adminEmail?: string }).adminEmail = "as3703195@gmail.com";
  return context.next();
};