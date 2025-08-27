// app/api/vnpay/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

// encode x-www-form-urlencoded: khoảng trắng -> '+'
function enc(v: string) {
  return encodeURIComponent(v).replace(/%20/g, "+");
}

// YYYYMMDDHHmmss theo GIỜ MÁY (nên để GMT+7)
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

// sort A→Z + encode đúng chuẩn
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
    const fullName = (body.fullName ?? "").toString().trim();
    const phone = (body.phone ?? "").toString().trim();
    const address = (body.address ?? "").toString().trim();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Missing/invalid amount" }, { status: 400 });
    }

    // Luôn unique để tránh code=99 do trùng vnp_TxnRef
    const orderId =
      (body.orderId as string) ||
      `ORDER-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

    const ip = (req.headers.get("x-forwarded-for") || "127.0.0.1").toString();

    const now = new Date();
    const createDate = toVnpTime(now);
    const expireDate = toVnpTime(new Date(now.getTime() + 15 * 60 * 1000)); // +15 phút

    const baseParams: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.VNP_TMN_CODE!.trim(),
      vnp_Amount: String(Math.round(amount) * 100), // VND*100, phải là int
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: "other",
      vnp_Locale: "vn",
      vnp_ReturnUrl: process.env.VNP_RETURN_URL!.trim(),
      vnp_IpAddr: ip,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,

      // billing (optional nhưng nếu gửi thì phải ký!)
      vnp_Bill_FullName: fullName,
      vnp_Bill_Mobile: phone,
      vnp_Bill_Address: address,
      vnp_Bill_Country: "VN",
    };

    const signData = buildSignedQuery(baseParams);
    const secureHash = crypto
      .createHmac("sha512", process.env.VNP_HASH_SECRET!.trim())
      .update(signData, "utf8")
      .digest("hex");

    const payUrl = `${process.env.VNP_URL}?${signData}&vnp_SecureHash=${secureHash}`;

    // Log để debug nếu còn lỗi 99
    console.log("[VNPAY] create   =", createDate, "expire =", expireDate);
    console.log("[VNPAY] signData =", signData);
    console.log("[VNPAY] hash     =", secureHash);
    console.log("[VNPAY] url      =", payUrl);

    return NextResponse.json({ url: payUrl, orderId }, { status: 200 });
  } catch (e) {
    console.error("[VNPAY_CREATE_ERROR]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
