"use client";

import { useCart } from "@/hooks/use-cart";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ImSpinner2 } from "react-icons/im";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FormatPrice } from "@/lib/utils";

export const CheckoutClient = () => {
  const router = useRouter();
  const sp = useSearchParams();

  const { cartProducts, cartTotalAmount, clearWholeCart } = useCart();

  // Form người nhận
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // UI
  const [isLoading, setIsLoading] = useState(false);

  // Kết quả từ VNPAY
  const [vnpayStatus, setVnpayStatus] = useState<"success" | "failed" | null>(null);
  const [vnpayOrderId, setVnpayOrderId] = useState("");

  // Đọc kết quả callback (?provider=vnpay&status=...&orderId=...)
  useEffect(() => {
    const provider = sp?.get("provider");
    const status = sp?.get("status");
    const orderId = sp?.get("orderId") || "";

    if (provider === "vnpay" && status) {
      const ok = status === "success";
      setVnpayStatus(ok ? "success" : "failed");
      setVnpayOrderId(orderId);

      // clear giỏ 1 lần duy nhất cho mỗi đơn
      if (ok && orderId) {
        const key = `vnpay_cleared_${orderId}`;
        try {
          if (!sessionStorage.getItem(key)) {
            clearWholeCart();
            sessionStorage.setItem(key, "1");
          }
        } catch {}
      }
      if (!ok) toast.error("Thanh toán VNPAY thất bại");
    }
  }, [sp, clearWholeCart]);

  const handlePayWithVnpay = async () => {
    try {
      if (!cartProducts?.length) return toast.error("Giỏ hàng trống!");
      if (!fullName || !phone || !address) return toast.error("Vui lòng nhập đủ thông tin!");

      setIsLoading(true);
      const res = await fetch("/api/vnpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(cartTotalAmount),
          items: cartProducts,   // gửi snapshot giỏ để BE tạo đơn PENDING
          fullName,
          phone,
          address,
        }),
      });
      setIsLoading(false);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(data?.error || "Không tạo được phiên VNPAY!");
      if (!data?.url) return toast.error("Thiếu URL thanh toán VNPAY!");

      window.location.href = data.url;
    } catch (e) {
      setIsLoading(false);
      console.error(e);
      toast.error("Đã xảy ra lỗi khi tạo thanh toán VNPAY!");
    }
  };

  // Nếu đã có kết quả VNPAY → trang kết quả
  if (vnpayStatus) {
    return (
      <div className="w-full flex flex-col items-center gap-4 py-8">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          {vnpayStatus === "success" ? "Thanh toán thành công" : "Thanh toán thất bại"}
          {vnpayStatus === "success" && <AiOutlineCheckCircle className="text-green-500" />}
        </h1>
        {vnpayOrderId && (
          <div className="text-base">
            Mã đơn hàng: <b>{vnpayOrderId}</b>
          </div>
        )}
        <div className="flex gap-3">
          <Button><Link href="/orders">Xem đơn đặt hàng của bạn</Link></Button>
          <Button variant="outline" onClick={() => router.replace("/checkout")}>
            Làm mới trang
          </Button>
        </div>
      </div>
    );
  }

  // Form + nút VNPAY
  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl mt-2 text-center font-semibold">Thông tin thanh toán (VNPAY)</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Họ và tên</label>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Ví dụ: Nguyễn Văn A"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Số điện thoại</label>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="09xxxxxxxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Địa chỉ nhận hàng</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={3}
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="py-3 text-center text-lg font-bold">
        Tổng cộng: {FormatPrice(cartTotalAmount)} VND
      </div>

      <Button
        onClick={handlePayWithVnpay}
        className="w-full"
        disabled={isLoading || !cartProducts?.length}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <ImSpinner2 className="animate-spin" /> Đang tạo phiên VNPAY...
          </span>
        ) : (
          "Thanh toán qua VNPAY"
        )}
      </Button>
    </div>
  );
};
