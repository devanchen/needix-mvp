// scripts/send-test-email.mjs
import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;
if (!key) {
  console.error("Missing RESEND_API_KEY");
  process.exit(1);
}
const resend = new Resend(key);

const from = process.env.NEXT_PUBLIC_RESEND_FROM || "Needix <onboarding@resend.dev>";
const to = "delivered@resend.dev";

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: "Needix test email",
  text: "Hello from Needix — test message.",
});

if (error) {
  console.error("Resend error:", error);
  process.exit(1);
}
console.log("Sent! id=", data?.id);
