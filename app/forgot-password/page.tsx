// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }
    try {
      setLoading(true);
      await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      toast.success(
        "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu (hạn 1 giờ)."
      );
    } catch {
      toast.error("Có lỗi xảy ra, thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Quên mật khẩu
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
        </Button>

        <p className="text-sm text-center">
          Nhớ mật khẩu rồi?{" "}
          <Link href="/login" className="underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
