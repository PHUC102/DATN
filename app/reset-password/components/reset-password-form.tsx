// app/reset-password/components/reset-password-form.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ResetPasswordForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp?.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Thiếu hoặc sai token đặt lại mật khẩu.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Thiếu token đặt lại mật khẩu");
      return;
    }
    if (!password || !confirm) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu mới");
      return;
    }
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirm) {
      toast.error("Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Đổi mật khẩu thất bại");
        return;
      }

      toast.success("Đổi mật khẩu thành công! Hãy đăng nhập lại.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra, thử lại sau");
    } finally {
      setSubmitting(false);
    }
  };

  // Nếu thiếu token → hiển thị hướng dẫn
  if (!token) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-center">Đặt lại mật khẩu</h1>
        <p className="text-sm text-gray-600">
          Liên kết không hợp lệ hoặc đã thiếu <code>token</code>. 
          Vui lòng yêu cầu lại từ trang{" "}
          <Link href="/forgot-password" className="text-blue-600 underline">
            Quên mật khẩu
          </Link>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-semibold text-center">Đặt lại mật khẩu</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Mật khẩu mới</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="Nhập mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Nhập lại mật khẩu</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="Nhập lại mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-black text-white py-2 font-medium disabled:opacity-60"
      >
        {submitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
      </button>

      <div className="text-center text-sm">
        <Link href="/login" className="text-blue-600 underline">
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  );
}
