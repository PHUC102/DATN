// app/api/order/shipping/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getCurrentUser } from "@/actions/get-current-user";

export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, receiverName, receiverPhone, address } = body as {
      id?: string;
      receiverName?: string;
      receiverPhone?: string;
      address?: string;
    };
    if (!id) return NextResponse.json({ error: "Missing 'id'" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Chỉ chủ đơn hoặc ADMIN mới được sửa
    const isOwner = order.userId === currentUser.id;
    const isAdmin = currentUser.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Không cho sửa khi đã giao
    if ((order.deliveryStatus ?? "").toUpperCase() === "DELIVERED") {
      return NextResponse.json({ error: "Order already delivered" }, { status: 400 });
    }

    const data: Record<string, any> = {};
    if (typeof receiverName === "string") data.receiverName = receiverName.trim() || null;
    if (typeof receiverPhone === "string") data.receiverPhone = receiverPhone.trim() || null;
    if (typeof address === "string") {
      data.address = {
        country: "VN",
        line1: address.trim(),
        city: "",
        state: "",
        post_code: "",
        county: "",
      };
    }

    const updated = await prisma.order.update({ where: { id }, data });
    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    console.error("[ORDER_SHIPPING_UPDATE_ERROR]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
