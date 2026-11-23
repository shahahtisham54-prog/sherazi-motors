interface AdminData { adminEmail?: string }
export const onRequestGet: PagesFunction<unknown, string, AdminData> = async ({ data }) => {
  if (!data.adminEmail) return Response.json({ error: "Not authorised." }, { status: 401 });
  return Response.json({ user: { email: data.adminEmail } });
};