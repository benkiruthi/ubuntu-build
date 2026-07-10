import { getResendClient, FROM } from "./resend";

interface SendOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendOptions): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", opts.to);
    return;
  }
  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  if (error) {
    console.error("[email] Resend error:", error);
  }
}
