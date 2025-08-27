// app/verify-email/components/resend-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function ResendButton({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gửi lại email thất bại");
      toast.success("Đã gửi lại email xác thực!");
    } catch (e: any) {
      toast.error(e?.message || "Gửi lại thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={resend} disabled={loading}>
      {loading ? "Đang gửi..." : "Gửi lại email"}
    </Button>
  );
}
