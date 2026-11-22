interface Env { DB: D1Database }
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ error: "Invalid request body." }, { status: 400 }); }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const digits = phone.replace(/\D/g, "");
  if (name.length < 2 || name.length > 80 || digits.length < 7 || digits.length > 15) {
    return Response.json({ error: "Please enter a valid name and phone number." }, { status: 400 });
  }

  const interest = typeof body.interest === "string" ? body.interest.slice(0, 80) : "I have a question";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  try {
    await env.DB.prepare(
      "INSERT INTO enquiries (id, name, phone, interest, message, status, created_at, source) VALUES (?, ?, ?, ?, ?, 'new', ?, 'Sherazi Motors website')"
    ).bind(id, name, phone, interest, message, createdAt).run();
  } catch (error) {
    console.error("Enquiry insert failed", error);
    return Response.json({ error: "Your enquiry could not be saved." }, { status: 500 });
  }

  const whatsappText = [
    "Hello Sherazi Motors, I submitted an enquiry.",
    "Name: " + name,
    "Phone: " + phone,
    "Interest: " + interest,
    "Details: " + (message || "Not provided"),
    "Reference: " + id
  ].join("\n");

  return Response.json({
    ok: true,
    enquiryId: id,
    emailNotified: false,
    whatsappUrl: "https://wa.me/923196982676?text=" + encodeURIComponent(whatsappText)
  });
};
