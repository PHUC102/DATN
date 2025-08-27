// app/login/page.tsx
import { getCurrentUser } from "@/actions/get-current-user";
import { Container } from "@/components/ui/container";
import { LoginForm } from "./components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { verified?: string };
}) {
  const currentUser = await getCurrentUser();
  const verified = (searchParams?.verified ?? "") === "1";

  return (
    <div className="p-8">
      <Container>
        {verified && (
          <div className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
            Email đã được xác thực. Vui lòng đăng nhập.
          </div>
        )}
        <LoginForm currentUser={currentUser} />
      </Container>
    </div>
  );
}
