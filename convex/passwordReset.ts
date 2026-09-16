import { Email } from "@convex-dev/auth/providers/Email";
import { sendEmail, senderAddress } from "./lib/emailDelivery";
export const passwordReset = Email({
  id: "password-reset",
  maxAge: 10 * 60,
  generateVerificationToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    return Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("").toUpperCase();
  },
  async sendVerificationRequest({ identifier, token }) {
    await sendEmail({ from: senderAddress(), to: [identifier], subject: "Reset your Diplomaxdelivery password",
      html: `<div style="font-family:Arial,sans-serif;color:#123d32;max-width:520px;margin:auto;padding:32px"><h1>Reset your password</h1><p>Enter this one-time code with your account email address:</p><p style="font-size:30px;letter-spacing:6px;font-weight:bold">${token}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p><p>Diplomaxdelivery</p></div>` });
  },
});
