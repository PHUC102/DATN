// app/verify-email/sent/page.tsx
import Link from "next/link";

export default function VerifyEmailSentPage({
  searchParams,
}: {
  searchParams?: { ok?: string; email?: string; warn?: string };
}) {
  const ok = searchParams?.ok === "1";
  const email = searchParams?.email || "";
  const warn = searchParams?.warn || "";

  let title = "Xác thực email";
  let message = "";
  let tone: "success" | "warn" | "error" = "success";

  if (ok) {
    title = "Xác thực thành công 🎉";
    message = email
      ? `Email ${email} đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.`
      : "Email của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.";
    tone = "success";
  } else {
    tone = "error";
    switch (warn) {
      case "INVALID":
        title = "Liên kết không hợp lệ";
        message = "Token xác thực không hợp lệ. Vui lòng yêu cầu gửi lại email xác thực.";
        break;
      case "EXPIRED":
        title = "Liên kết đã hết hạn";
        message = "Token xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.";
        break;
      case "ERROR":
      default:
        title = "Đã xảy ra lỗi";
        message = "Không thể xác thực email. Vui lòng thử lại hoặc yêu cầu gửi lại email xác thực.";
        break;
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1
        className={`text-2xl font-semibold mb-3 ${
          tone === "success" ? "text-emerald-600" : "text-rose-600"
        }`}
      >
        {title}
      </h1>
      <p className="text-gray-700 mb-6">{message}</p>

      <div className="flex gap-3">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Về trang đăng nhập
        </Link>
        {!ok && (
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
          >
            Gửi lại email xác thực
          </Link>
        )}
      </div>
    </div>
  );
}
