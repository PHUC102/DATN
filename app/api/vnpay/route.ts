// app/api/vnpay/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import prisma from "@/lib/prismadb";
import { getCurrentUser } from "@/actions/get-current-user";

// x-www-form-urlencoded encode (space -> '+')
function enc(v: string) {
  return encodeURIComponent(v).replace(/%20/g, "+");
}

// YYYYMMDDHHmmss theo giờ máy (nên đặt TZ=Asia/Ho_Chi_Minh khi dev)
function toVnpTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

// sort A→Z + encode
function buildSignedQuery(params: Record<string, string>) {
  const keys = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort();
  return keys.map((k) => `${enc(k)}=${enc(params[k])}`).join("&");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const amount = Number(body.amount);
    const items = Array.isArray(body.items) ? body.items : [];
    const fullName = (body.fullName ?? "").toString().trim();
    const phone = (body.phone ?? "").toString().trim();
    const address = (body.address ?? "").toString().trim();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Missing/invalid amount" }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Luôn unique để tránh code=99 do trùng TxnRef
    const orderId: string =
      body.orderId || `ORDER-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

    // 1) Ghim đơn PENDING trước (để admin/user nhìn thấy ngay cả khi thoát giữa chừng)
    const addrObj = address
      ? {
          country: "VN",
          line1: address,
          city: "",
          state: "",
          post_code: "",
          county: "",
        }
      : null;

    // ⚠️ Dùng `as any` tạm thời để không bị TS kẹt nếu Prisma Client chưa refresh types.
    // Khi bạn xác nhận trong node_modules/@prisma/client/index.d.ts có:
    //   receiverName?: string | null; receiverPhone?: string | null;
    // thì bỏ `as any` đi để type-safe.
    const createData: any = {
      userId: currentUser.id,    // hoặc user: { connect: { id: currentUser.id } } nếu bạn dùng relation create
      amount: Math.round(amount),
      currency: "VND",
      status: "PENDING",
      deliveryStatus: "PENDING",
      createdDate: new Date(),
      paymentIntentId: orderId,
      products: items,
      address: addrObj,
      receiverName: fullName || null,
      receiverPhone: phone || null,
    };

    const updateData: any = {
      amount: Math.round(amount),
      products: items,
      address: addrObj ?? undefined,
      receiverName: fullName || undefined,
      receiverPhone: phone || undefined,
    };

    await prisma.order.upsert({
      where: { paymentIntentId: orderId },
      create: createData,
      update: updateData,
    });

    // 2) Tạo URL thanh toán VNPAY
    const ip = (req.headers.get("x-forwarded-for") || "127.0.0.1").toString();

    const now = new Date();
    const createDate = toVnpTime(now);
    const expireDate = toVnpTime(new Date(now.getTime() + 15 * 60 * 1000)); // +15 phút

    const baseParams: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.VNP_TMN_CODE!.trim(),
      vnp_Amount: String(Math.round(amount) * 100), // VND*100
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl: process.env.VNP_RETURN_URL!.trim(),
      vnp_IpAddr: ip,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
      // ❗ KHÔNG gửi vnp_Bill_* để tránh code=99 (sandbox đôi khi rất "khó")
    };

    const signData = buildSignedQuery(baseParams);
    const secureHash = crypto
      .createHmac("sha512", process.env.VNP_HASH_SECRET!.trim())
      .update(signData, "utf8")
      .digest("hex");

    const payUrl = `${process.env.VNP_URL}?${signData}&vnp_SecureHash=${secureHash}`;

    // Log để debug khi cần
    console.log("[VNPAY] create   =", createDate, "expire =", expireDate);
    console.log("[VNPAY] signData =", signData);
    console.log("[VNPAY] url      =", payUrl);

    return NextResponse.json({ url: payUrl, orderId }, { status: 200 });
  } catch (e) {
    console.error("[VNPAY_CREATE_ERROR]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
