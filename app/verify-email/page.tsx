// app/verify-email/page.tsx
import { redirect } from "next/navigation";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const token = searchParams?.token || "";
  if (!token) {
    redirect("/verify-email/sent?warn=INVALID");
  }
  // Đẩy sang API xác thực (API sẽ set emailVerified và redirect về /verify-email/sent)
  redirect(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
}
