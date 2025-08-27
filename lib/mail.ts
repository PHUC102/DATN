// lib/mail.ts
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  SMTP_FROM,
  SMTP_NAME,
  NODE_ENV,
} = process.env;

const secure =
  (SMTP_SECURE ?? "").toLowerCase() === "true" || Number(SMTP_PORT) === 465;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT ?? 587),
  secure, // true=465, false=587
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  // Chỉ nới lỏng TLS khi DEV để tránh lỗi self-signed trong môi trường nội bộ
  tls:
    NODE_ENV !== "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!SMTP_HOST || !SMTP_FROM) {
    console.warn("[MAIL] Missing SMTP configs – pretend to send:", opts);
    return { ok: true, previewOnly: true };
  }

  try {
    // Kiểm tra nhanh kết nối SMTP (DEV có thể bật)
    // await transporter.verify();

    const info = await transporter.sendMail({
      from: `"${SMTP_NAME || "G-cosmetic"}" <${SMTP_FROM}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });

    // Mailtrap sẽ cho preview ^_^
    console.log("[MAIL] sent:", info.messageId);
    return { ok: true, id: info.messageId };
  } catch (e) {
    console.error("[MAIL] send error:", e);
    return { ok: false, error: (e as Error).message };
  }
}
