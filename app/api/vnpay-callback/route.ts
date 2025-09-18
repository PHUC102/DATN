// app/api/vnpay-callback/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prismadb";

// encode: RFC3986 rồi thay %20 -> '+'
function encPlus(s: string) {
  return encodeURIComponent(s).replace(/%20/g, "+");
}

// build query A→Z từ URLSearchParams với encoder truyền vào
function buildSigned(params: URLSearchParams, encoder: (s: string) => string) {
  const entries = Array.from(params.entries())
    .filter(([k]) => k !== "vnp_SecureHash" && k !== "vnp_SecureHashType")
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${encoder(k)}=${encoder(v)}`).join("&");
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const given = (url.searchParams.get("vnp_SecureHash") || "").toLowerCase();
  const secret = (process.env.VNP_HASH_SECRET || "").trim();

  // Cách 1: encode theo VNPay (space -> '+')
  const sign1 = buildSigned(url.searchParams, encPlus);
  const calc1 = crypto.createHmac("sha512", secret).update(sign1, "utf8").digest("hex");

  // Cách 2: encode “thuần” (space -> %20)
  const sign2 = buildSigned(url.searchParams, encodeURIComponent);
  const calc2 = crypto.createHmac("sha512", secret).update(sign2, "utf8").digest("hex");

  const sigOk = given && (given === calc1 || given === calc2);

  const txnRef   = url.searchParams.get("vnp_TxnRef") || "";
  const respCode = url.searchParams.get("vnp_ResponseCode") || "";
  const transSt  = url.searchParams.get("vnp_TransactionStatus"); // có thể vắng ở return
  const amountVn = Number(url.searchParams.get("vnp_Amount") || 0) / 100;

  const codeOk = respCode === "00";
  const transOk = !transSt || transSt === "00"; // cho phép thiếu ở return
  const ok = sigOk && codeOk && transOk;

  console.log("[VNPAY_CB] sig1/ok=", given === calc1, "sig2/ok=", given === calc2,
              "resp=", respCode, "trans=", transSt, "txnRef=", txnRef);

  // Tìm order & cập nhật idempotent
  let order: any = null;
  if (txnRef) order = await prisma.order.findUnique({ where: { paymentIntentId: txnRef } });

  try {
    if (ok) {
      if (order && order.status !== "PAID") {
        await prisma.order.update({
          where: { paymentIntentId: txnRef },
          data: { status: "PAID", deliveryStatus: "PENDING" }, // không dùng paymentDate
        });
      }
    } else {
      if (order && order.status !== "PAID" && order.status !== "FAILED") {
        await prisma.order.update({
          where: { paymentIntentId: txnRef },
          data: { status: "FAILED" },
        });
      }
    }
  } catch (e) {
    console.error("[VNPAY_CB] UPDATE_ERROR", e);
  }

  // Redirect về UI đúng route
  const base = process.env.NEXTAUTH_URL || url.origin;
  const dest = new URL("/checkout/result", base);
  dest.searchParams.set("status", ok ? "success" : "fail");
  if (txnRef) dest.searchParams.set("orderId", txnRef);
  return NextResponse.redirect(dest);
}
