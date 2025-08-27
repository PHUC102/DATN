// app/api/order/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getCurrentUser } from "@/actions/get-current-user";

// Từ điển trạng thái (string enum)
const ORDER_STATUSES = ["PENDING", "PAID", "PROCESSING", "COMPLETED", "CANCELLED"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

const DELIVERY_STATUSES = ["PENDING", "SHIPPING", "DELIVERED"] as const;
type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

// Chuẩn hoá: nhận cả lowercase/uppercase, trim
function norm(v?: string | null) {
  return (v ?? "").toString().trim().toUpperCase();
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    let { id, deliveryStatus, status } = body as {
      id?: string;
      deliveryStatus?: string;
      status?: string;
    };

    if (!id) {
      return NextResponse.json({ error: "Missing 'id'" }, { status: 400 });
    }

    // chuẩn hoá input
    const d = norm(deliveryStatus);
    const s = norm(status);

    const data: Record<string, any> = {};

    if (deliveryStatus !== undefined) {
      if (!DELIVERY_STATUSES.includes(d as DeliveryStatus)) {
        return NextResponse.json({ error: "Invalid deliveryStatus" }, { status: 400 });
      }
      data.deliveryStatus = d as DeliveryStatus;
    }

    if (status !== undefined) {
      if (!ORDER_STATUSES.includes(s as OrderStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = s as OrderStatus;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data,
    });

    return NextResponse.json(order, { status: 200 });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    console.error("[ORDER_UPDATE_ERROR]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
