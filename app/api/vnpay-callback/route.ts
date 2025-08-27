// app/api/vnpay-callback/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import prisma from "@/lib/prismadb"; // ⬅️ thêm import prisma

// build RAW string (KHÔNG encode) từ object đã decode
function buildRawFromParams(params: URLSearchParams) {
  const entries = Array.from(params.entries())
    .filter(([k]) => k !== "vnp_SecureHash" && k !== "vnp_SecureHashType")
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}=${v}`).join("&");
}

// build string từ CHUỖI QUERY GỐC (giữ nguyên dấu +), sort theo key
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

  return pairs.map(([k, v]) => `${k}=${v}`).join("&"); // giữ nguyên encoding & dấu +
}

function hmac512(data: string, secret: string) {
  return crypto.createHmac("sha512", secret).update(data, "utf8").digest("hex");
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secret = (process.env.VNP_HASH_SECRET || "").trim();

  const given = url.searchParams.get("vnp_SecureHash") || "";

  // Cách 1: ký trên giá trị đã DECODE (space)
  const rawDecoded = buildRawFromParams(url.searchParams);
  const calcDecoded = hmac512(rawDecoded, secret);

  // Cách 2: ký trên QUERY GỐC (giữ “+”)
  const rawEncoded = buildFromOriginalSearch(url.search);
  const calcEncoded = hmac512(rawEncoded, secret);

  // Log để đối chiếu
  console.log("[VNPAY_CB] given       =", given);
  console.log("[VNPAY_CB] rawDecoded  =", rawDecoded);
  console.log("[VNPAY_CB] calcDecoded =", calcDecoded);
  console.log("[VNPAY_CB] rawEncoded  =", rawEncoded);
  console.log("[VNPAY_CB] calcEncoded =", calcEncoded);

  const okHash = given === calcEncoded || given === calcDecoded;

  const respOk = url.searchParams.get("vnp_ResponseCode") === "00";
  const transOk = url.searchParams.get("vnp_TransactionStatus") === "00";
  const ok = okHash && respOk && transOk;

  const vnpRef = url.searchParams.get("vnp_TxnRef") || ""; // chính là paymentIntentId mình đã gán trước đó

  // ✅ Cập nhật đơn: paymentIntentId = vnp_TxnRef → status = "PAID"
  if (ok && vnpRef) {
    try {
      const result = await prisma.order.updateMany({
        where: { paymentIntentId: vnpRef },
        data: { status: "PAID" }, // giữ dạng String, đúng schema hiện tại của em
      });
      if (result.count === 0) {
        console.warn("[VNPAY_CB] Không tìm thấy order với paymentIntentId =", vnpRef);
      } else {
        console.log("[VNPAY_CB] Đã cập nhật", result.count, "đơn về PAID");
      }
    } catch (e) {
      console.error("[VNPAY_CB_UPDATE_ORDER_ERROR]", e);
      // vẫn redirect xuống trang kết quả; chỉ log lỗi
    }
  }

  // Redirect về trang kết quả của em
  const dest = new URL(
    `/checkout/result?status=${ok ? "success" : "failed"}${
      vnpRef ? `&orderId=${encodeURIComponent(vnpRef)}` : ""
    }`,
    url.origin
  );
  return NextResponse.redirect(dest);
}
