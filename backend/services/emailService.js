import sendGrid from "@sendgrid/mail";

const frontendUrl = () => process.env.FRONTEND_URL;
export async function sendEmail({ to, subject, text, html }) {
  console.log("sendEmail chiamata per:", to);
  sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const [response] = await sendGrid.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      text,
      html,
    });
    console.log("SendGrid status:", response.statusCode); // 202 = accettata
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error);
    throw error;
  }
}

export function sendWelcomeEmail(to) {
  return sendEmail({
    to,
    subject: "Benvenuto su PetCare",
    text: "Grazie per esserti registrato su PetCare!",
    html: "<p>Grazie per esserti registrato su PetCare!</p>",
  });
}

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
export function sendShareInviteEmail({
  to,
  ownerName,
  petName,
  role,
  isRegistered,
}) {
  const link = isRegistered
    ? `${frontendUrl()}/`
    : `${frontendUrl()}/register?email=${encodeURIComponent(to)}`;

  const roleLabel = role === "editor" ? "modificare" : "consultare";
  const action = isRegistered ? "Accedi" : "Registrati";

  return sendEmail({
    to,
    subject: `${ownerName} ha condiviso ${petName} con te su PetCare`,
    text: `${ownerName} ti ha dato accesso per ${roleLabel} il profilo di ${petName}. ${action} qui: ${link}`,
    html: `<p>${escapeHtml(ownerName)} ti ha dato accesso per ${roleLabel} il profilo di <strong>${escapeHtml(petName)}</strong>.</p>
       <p><a href="${link}">${action} su PetCare</a></p>`,
  });
}
