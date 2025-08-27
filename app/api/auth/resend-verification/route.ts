import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import crypto from "crypto";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ ok: true });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) {
      // Không tiết lộ thông tin
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerificationToken.deleteMany({ where: { email } }).catch(() => {});
    await prisma.emailVerificationToken.create({ data: { email, token, expiresAt } });

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    await sendMail({
      to: email,
      subject: "Gửi lại email xác thực - G-cosmetic",
      html: `
        <p>Nhấn vào liên kết để xác thực email:</p>
        <p><a href="${verifyUrl}" target="_blank">${verifyUrl}</a></p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[RESEND_VERIFY]", e);
    return NextResponse.json({ ok: true });
  }
}
