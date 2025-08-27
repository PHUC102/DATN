"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import toast from "react-hot-toast";

export default function PayWithVnpayButton() {
  const { cartProducts, cartTotalAmount } = useCart();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!cartProducts?.length) return toast.error("Giỏ hàng trống");

    setLoading(true);
    try {
      const res = await fetch("/api/vnpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartProducts,           // snapshot giỏ hàng
          amount: cartTotalAmount,       // đề phòng
          // address: {...}               // nếu có form địa chỉ, gửi kèm
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Không tạo được link VNPAY");
      if (data?.url) window.location.href = data.url;
      else toast.error("Thiếu URL trả về từ /api/vnpay");
    } catch (err: any) {
      toast.error(err.message || "Lỗi tạo thanh toán VNPAY");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePay} disabled={loading} className="w-full">
      {loading ? "Đang chuyển đến VNPAY..." : "Thanh toán qua VNPAY (ATM/QR)"}
    </Button>
  );
}
