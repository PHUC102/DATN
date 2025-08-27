// app/api/auth/verify-email/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";
    if (!token) {
      return NextResponse.redirect(new URL("/verify-email/sent?warn=INVALID", url.origin));
    }

    const rec = await prisma.emailVerificationToken.findUnique({ where: { token } });
    if (!rec || rec.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/verify-email/sent?warn=EXPIRED", url.origin));
    }

    await prisma.user.update({
      where: { email: rec.email },
      data: { emailVerified: new Date() },
    });
    await prisma.emailVerificationToken.delete({ where: { token } });

    // ✅ Điều hướng về trang thông báo thành công
    const done = new URL("/verify-email/sent", url.origin);
    done.searchParams.set("ok", "1");
    done.searchParams.set("email", rec.email);
    return NextResponse.redirect(done);
  } catch (e) {
    console.error("[VERIFY_EMAIL]", e);
    return NextResponse.redirect(new URL("/verify-email/sent?warn=ERROR", new URL(req.url).origin));
  }
}
