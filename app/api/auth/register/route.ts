// app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập email và mật khẩu" },
        { status: 400 }
      );
    }

    const emailNorm = String(email).trim().toLowerCase();

    // 1) Kiểm tra tồn tại
    const existed = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (existed) {
      // Nếu đã có tài khoản mật khẩu -> báo dùng chức năng đăng nhập/quên mật khẩu
      if (existed.hashedPassword) {
        return NextResponse.json(
          { error: "Email đã được đăng ký. Hãy đăng nhập hoặc dùng 'Quên mật khẩu'." },
          { status: 409 }
        );
      }
      // Nếu là tài khoản tạo qua Google (không có hashedPassword)
      return NextResponse.json(
        { error: "Email này đã liên kết Google. Hãy đăng nhập bằng Google hoặc đặt mật khẩu qua 'Quên mật khẩu'." },
        { status: 409 }
      );
    }

    // 2) Tạo user mới
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: emailNorm,
        hashedPassword: hashed,
        role: "USER",
        // emailVerified: null, // Nếu bạn đang bắt buộc xác thực email trong NextAuth
      },
      select: { id: true, email: true },
    });

    // (Tuỳ chọn) Gửi email xác thực ở đây nếu bạn đã làm flow xác thực email
    // - Tạo token vào EmailVerificationToken
    // - Gửi mail chứa link verify

    return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
  } catch (e: any) {
    // Bắt lỗi unique của Prisma nếu race-condition
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "Email đã được đăng ký. Hãy đăng nhập hoặc dùng 'Quên mật khẩu'." },
        { status: 409 }
      );
    }
    console.error("[REGISTER_ERROR]", e);
    return NextResponse.json(
      { error: "Có lỗi xảy ra, vui lòng thử lại." },
      { status: 500 }
    );
  }
}
