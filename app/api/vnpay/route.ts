// app/api/vnpay/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import moment from "moment-timezone";
import prisma from "@/lib/prismadb";
import { getCurrentUser } from "@/actions/get-current-user";

// x-www-form-urlencoded encode (space -> '+')
function enc(v: string) {
  return encodeURIComponent(v).replace(/%20/g, "+");
}

// sort A→Z + encode, bỏ key rỗng
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

    // Luôn unique tránh trùng TxnRef
    const orderId: string =
      body.orderId || `ORDER-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

    // Ghim đơn PENDING trước
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

    const createData: any = {
      userId: currentUser.id,
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

    // ===== VNPAY PARAMS (GMT+7) =====
    const ip =
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "127.0.0.1";

    const nowVN = moment().tz("Asia/Ho_Chi_Minh");
    const createDate = nowVN.format("YYYYMMDDHHmmss");
    const expireDate = nowVN.clone().add(20, "minutes").format("YYYYMMDDHHmmss"); // +20'

    const baseParams: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.VNP_TMN_CODE!.trim(),
      vnp_Amount: String(Math.round(amount) * 100), // VND * 100
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl: process.env.VNP_RETURN_URL!.trim(),
      vnp_IpAddr: ip,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
      // Không gửi vnp_Bill_* để tránh phiền ở sandbox
    };

    // Sort & sign SHA512 (không double-encode)
    const signData = buildSignedQuery(baseParams);
    const secureHash = crypto
      .createHmac("sha512", process.env.VNP_HASH_SECRET!.trim())
      .update(signData, "utf8")
      .digest("hex");

    const payUrl = `${process.env.VNP_URL}?${signData}&vnp_SecureHash=${secureHash}`;

    // Logs phục vụ debug trên Vercel Functions
    console.log("[VN] now      =", nowVN.format("YYYY-MM-DD HH:mm:ss"));
    console.log("[VN] create   =", createDate, "expire =", expireDate);
    console.log("[VN] txnRef   =", orderId, "amount =", Math.round(amount) * 100);
    console.log("[VNPAY] url   =", payUrl);

    return NextResponse.json({ url: payUrl, orderId }, { status: 200 });
  } catch (e) {
    console.error("[VNPAY_CREATE_ERROR]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
