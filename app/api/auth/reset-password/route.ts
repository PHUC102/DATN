// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Thiếu token hoặc mật khẩu" }, { status: 400 });
    }

    // 1) Lấy token đặt lại mật khẩu
    const rec = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!rec || rec.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token không hợp lệ hoặc đã hết hạn" }, { status: 400 });
    }

    // 2) Đổi mật khẩu + TỰ ĐỘNG XÁC THỰC EMAIL
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email: rec.email },
      data: {
        hashedPassword: hashed,
        emailVerified: new Date(), // ✅ auto-verify sau khi reset
      },
    });

    // 3) Xóa token reset để đảm bảo 1 lần dùng
    await prisma.passwordResetToken.delete({ where: { token } });

    // 4) (tuỳ chọn) dọn các token verify cũ nếu có
    await prisma.emailVerificationToken.deleteMany({ where: { email: rec.email } }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[RESET_PASSWORD]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
