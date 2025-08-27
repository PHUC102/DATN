// app/api/vnpay-callback/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import prisma from "@/lib/prismadb";
import { getCurrentUser } from "@/actions/get-current-user";

// RAW từ params (đã decode khoảng trắng)
function buildRawFromParams(params: URLSearchParams) {
  const entries = Array.from(params.entries())
    .filter(([k]) => k !== "vnp_SecureHash" && k !== "vnp_SecureHashType")
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}=${v}`).join("&");
}

// RAW từ query gốc (giữ nguyên '+')
function buildFromOriginalSearch(originalSearch: string) {
  const pairs = originalSearch
    .replace(/^\?/, "")
    .split("&")
    .filter(Boolean)
    .map((p) => {
      const i = p.indexOf("=");
      return i === -1 ? [p, ""] : [p.slice(0, i), p.slice(i + 1)];
    })
    .filter(([k]) => k !== "vnp_SecureHash" && k !== "vnp_SecureHashType")
    .sort(([a], [b]) => a.localeCompare(b));
  return pairs.map(([k, v]) => `${k}=${v}`).join("&");
}

function hmac512(data: string, secret: string) {
  return crypto.createHmac("sha512", secret).update(data, "utf8").digest("hex");
}

// YYYYMMDDHHmmss -> Date (mặc định theo giờ máy)
function parseVnpDate(s: string | null) {
  if (!s || s.length !== 14) return new Date();
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6)) - 1;
  const d = Number(s.slice(6, 8));
  const hh = Number(s.slice(8, 10));
  const mm = Number(s.slice(10, 12));
  const ss = Number(s.slice(12, 14));
  return new Date(y, m, d, hh, mm, ss);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secret = (process.env.VNP_HASH_SECRET || "").trim();

  const given = url.searchParams.get("vnp_SecureHash") || "";

  // Ký theo 2 cách để an toàn
  const rawDecoded  = buildRawFromParams(url.searchParams);
  const rawEncoded  = buildFromOriginalSearch(url.search);
  const calcDecoded = hmac512(rawDecoded, secret);
  const calcEncoded = hmac512(rawEncoded, secret);

  console.log("[VNPAY_CB] given       =", given);
  console.log("[VNPAY_CB] rawDecoded  =", rawDecoded);
  console.log("[VNPAY_CB] calcDecoded =", calcDecoded);
  console.log("[VNPAY_CB] rawEncoded  =", rawEncoded);
  console.log("[VNPAY_CB] calcEncoded =", calcEncoded);

  const okHash = given === calcEncoded || given === calcDecoded;
  const respOk = url.searchParams.get("vnp_ResponseCode") === "00";
  const transOk = url.searchParams.get("vnp_TransactionStatus") === "00";
  const ok = okHash && respOk && transOk;

  const orderId = url.searchParams.get("vnp_TxnRef") || "";
  const amountVnd = Number(url.searchParams.get("vnp_Amount") || "0") / 100;
  const paidAt = parseVnpDate(url.searchParams.get("vnp_PayDate"));

  // Nếu thanh toán OK thì update/create Order.
  if (ok && orderId) {
    try {
      await prisma.order.update({
        where: { paymentIntentId: orderId },
        data: {
          status: "PAID",
          deliveryStatus: "PENDING",
          amount: amountVnd || undefined,
          currency: "VND",
          createdDate: paidAt,
        },
      });
      console.log("[VNPAY_CB] Order updated =", orderId);
    } catch (e: any) {
      // Không có -> tạo mới (nếu user còn đăng nhập)
      console.log("[VNPAY_CB] Order not found by paymentIntentId =", orderId);
      try {
        const currentUser = await getCurrentUser();
        if (currentUser?.id) {
          await prisma.order.create({
            data: {
              userId: currentUser.id,
              amount: amountVnd,
              currency: "VND",
              status: "PAID",
              deliveryStatus: "PENDING",
              paymentIntentId: orderId,
              products: [], // Không có giỏ => để trống. Tốt nhất: tạo PENDING trước khi đẩy qua VNPAY
              createdDate: paidAt,
            },
          });
          console.log("[VNPAY_CB] Order created =", orderId, "for user =", currentUser.id);
        } else {
          console.warn("[VNPAY_CB] Cannot create order: user not logged in.");
        }
      } catch (err) {
        console.error("[VNPAY_CB] Create order failed:", err);
      }
    }
  }

  // Kết quả trả về UI dựa theo kết quả VNPAY, không phụ thuộc vào DB
  const dest = new URL(
    `/checkout?provider=vnpay&status=${ok ? "success" : "failed"}${orderId ? `&orderId=${encodeURIComponent(orderId)}` : ""}`,
    url.origin
  );
  return NextResponse.redirect(dest);
}
