export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import crypto from "crypto";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ ok: true });

    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.id) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { email, token, expiresAt },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
      await sendMail({
        to: email,
        subject: "Đặt lại mật khẩu - G-cosmetic",
        html: `
          <p>Xin chào,</p>
          <p>Nhấn vào liên kết dưới đây để đặt lại mật khẩu (hiệu lực 1 giờ):</p>
          <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
          <p>Nếu không phải bạn, vui lòng bỏ qua email này.</p>
        `,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[REQUEST_PW_RESET]", e);
    return NextResponse.json({ ok: true });
  }
}
