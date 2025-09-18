import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return null;
    }

    // Lấy user trước (không include Order vì include.products gây lỗi TS)
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return null;
    }

    // Lấy riêng orders của user — select các trường cần dùng (products, deliveryStatus, ...)
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdDate: "desc" },
      select: {
        id: true,
        products: true,
        deliveryStatus: true,
        createdDate: true,
        status: true,
      },
    });

    return {
      ...user,
      // gắn orders vào trường Order để giữ tương thích với code hiện tại
      Order: orders,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      emailVerified: user.emailVerified?.toISOString() || null,
    };
  } catch (error) {
    return null;
  }
}
