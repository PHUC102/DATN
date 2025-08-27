"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyEmailResult() {
  const sp = useSearchParams();
  const status = sp?.get("status");

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Xác thực email thành công 🎉</h1>
        <p>Bây giờ bạn có thể đăng nhập.</p>
        <Button asChild><Link href="/login">Đăng nhập</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 text-center space-y-4">
      <h1 className="text-2xl font-semibold">Xác thực thất bại</h1>
      <p>Liên kết không hợp lệ hoặc đã hết hạn.</p>
      <Button asChild variant="outline"><Link href="/login">Quay lại đăng nhập</Link></Button>
    </div>
  );
}
