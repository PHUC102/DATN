// app/register/page.tsx
import { getCurrentUser } from "@/actions/get-current-user";
import { Container } from "@/components/ui/container";
import { RegisterForm } from "./components/register-form";
import Link from "next/link";

export default async function RegisterPage() {
  const currentUser = await getCurrentUser();

  // Nếu đã đăng nhập thì điều hướng nhẹ nhàng (hoặc hiển thị link quay lại)
  if (currentUser) {
    return (
      <div className="p-8">
        <Container>
          <div className="text-center">
            Bạn đã đăng nhập. Về{" "}
            <Link href="/" className="underline">
              trang chủ
            </Link>
            .
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Container>
        <RegisterForm />
        <p className="text-sm mt-3">
          Đã có tài khoản?{" "}
          <Link href="/login" className="underline">
            Đăng nhập
          </Link>
        </p>
      </Container>
    </div>
  );
}
