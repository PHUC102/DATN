// app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const normName = String(name || "").trim();
    const normEmail = String(email || "").trim().toLowerCase();
    const normPass = String(password || "");

    if (!normName || !normEmail || !normPass) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    // 1) Check trùng email
    const existed = await prisma.user.findUnique({ where: { email: normEmail } });
    if (existed) {
      return NextResponse.json({ error: "Email này đã được đăng ký." }, { status: 409 });
    }

    // 2) Tạo user
    const hashed = await bcrypt.hash(normPass, 10);
    await prisma.user.create({
      data: {
        name: normName,
        email: normEmail,
        hashedPassword: hashed,
        role: "USER",
      },
    });

    // 3) Tạo token xác thực email (24h)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: { email: normEmail, token, expiresAt },
    });

    // 4) Gửi mail xác thực (không làm fail đăng ký nếu gửi lỗi)
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    const mailRes = await sendMail({
      to: normEmail,
      subject: "Xác thực email - G-cosmetic",
      html: `
        <p>Xin chào ${normName},</p>
        <p>Nhấn vào liên kết để xác thực email của bạn:</p>
        <p><a href="${verifyUrl}" target="_blank">${verifyUrl}</a></p>
        <p>Liên kết có hiệu lực trong 24 giờ.</p>
      `,
    });

    return NextResponse.json(
      { ok: true, email: normEmail, warn: mailRes.ok ? undefined : "EMAIL_SEND_FAILED" },
      { status: 201 }
    );
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Email này đã được đăng ký." }, { status: 409 });
    }
    console.error("[REGISTER_ERROR]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
