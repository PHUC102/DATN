"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { FormatPrice } from "@/lib/utils";

type BillInfo = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string; // VN
};

export default function PayWithVnpayForm() {
  const { cartTotalAmount } = useCart();
  const [bill, setBill] = useState<BillInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "VN",
  });
  const [loading, setLoading] = useState(false);

  const formatted = FormatPrice(cartTotalAmount);

  const handleChange =
    (key: keyof BillInfo) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBill((s) => ({ ...s, [key]: e.target.value }));
    };

  async function handlePay() {
    if (!cartTotalAmount) return;

    // validate đơn giản
    if (!bill.fullName || !bill.phone || !bill.address || !bill.city) {
      alert("Vui lòng nhập đầy đủ Họ tên, SĐT, Địa chỉ, Tỉnh/Thành phố.");
      return;
    }

    try {
      setLoading(true);

      // orderId nên là duy nhất
      const orderId = `ORDER-${Date.now()}`;

      const res = await fetch("/api/vnpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(cartTotalAmount), // VND
          orderId,
          bill, // gửi thông tin khách
          ship: {
            address: bill.address,
            city: bill.city,
            country: bill.country || "VN",
            phone: bill.phone,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.url) {
        console.error(data);
        alert(data?.error || "Không tạo được link thanh toán VNPAY.");
        return;
      }

      // chuyển sang VNPAY
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi tạo thanh toán.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 border rounded-xl p-4 space-y-3">
      <h3 className="text-lg font-semibold">Thông tin thanh toán (VNPAY)</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Họ và tên"
          value={bill.fullName}
          onChange={handleChange("fullName")}
        />
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Email (không bắt buộc)"
          value={bill.email}
          onChange={handleChange("email")}
          type="email"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Số điện thoại"
          value={bill.phone}
          onChange={handleChange("phone")}
        />
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Tỉnh/Thành phố"
          value={bill.city}
          onChange={handleChange("city")}
        />
      </div>

      <input
        className="border rounded-md px-3 py-2 w-full"
        placeholder="Địa chỉ (số nhà, đường, phường/xã)"
        value={bill.address}
        onChange={handleChange("address")}
      />

      <div className="flex items-center justify-between pt-2">
        <div className="font-medium">
          Tổng thanh toán: <span className="font-bold">{formatted} VND</span>
        </div>
        <Button onClick={handlePay} disabled={loading || !cartTotalAmount}>
          {loading ? "Đang tạo thanh toán..." : "Thanh toán qua VNPAY"}
        </Button>
      </div>
    </div>
  );
}
