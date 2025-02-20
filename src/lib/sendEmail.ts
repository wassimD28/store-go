import axios from "axios";

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({
  to,
  subject,
  text,
}: SendEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not set in the environment");
  }

  const data = {
    sender: { name: "storeGo", email: process.env.EMAIL_VERIFICATION_SENDER },
    to: [{ email: to }],
    subject,
    textContent: text,
  };

  await axios.post("https://api.brevo.com/v3/smtp/email", data, {
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
  });
}
