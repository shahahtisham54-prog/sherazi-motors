interface Env { DB: D1Database; RESEND_API_KEY?: string; NOTIFICATION_EMAIL?: string }
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

  let emailNotified = false;
  if (env.RESEND_API_KEY && env.NOTIFICATION_EMAIL) {
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] || char));
    try {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Sherazi Motors <onboarding@resend.dev>",
          to: [env.NOTIFICATION_EMAIL],
          subject: "New website enquiry · " + name,
          text: "A new enquiry was submitted on the Sherazi Motors website.\n\nName: " + name + "\nPhone: " + phone + "\nInterest: " + interest + "\nDetails: " + (message || "Not provided") + "\nReference: " + id,
          html: "<h2>New website enquiry</h2><p><b>Name:</b> " + escapeHtml(name) + "</p><p><b>Phone:</b> " + escapeHtml(phone) + "</p><p><b>Interest:</b> " + escapeHtml(interest) + "</p><p><b>Details:</b><br>" + escapeHtml(message || "Not provided").replace(/\n/g, "<br>") + "</p><p><b>Reference:</b> " + id + "</p>"
        })
      });
      emailNotified = emailResponse.ok;
      if (!emailResponse.ok) console.error("Resend email request failed", emailResponse.status, await emailResponse.text());
    } catch (error) {
      console.error("Enquiry email notification failed", error);
    }
  }

  return Response.json({
    ok: true,
    enquiryId: id,
    emailNotified,
    whatsappUrl: "https://wa.me/923196982676?text=" + encodeURIComponent(whatsappText)
  });
};
