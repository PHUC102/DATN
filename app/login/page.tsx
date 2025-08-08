import { Container } from "@/components/ui/container";
import { FormWrap } from "@/components/ui/form-wrap";
import { LoginForm } from "./components/login-form";
import { getCurrentUser } from "@/actions/get-current-user";

export default async function LoginPage() {
  const currentUser = await getCurrentUser();
  return (
    <Container>
      <FormWrap className="pt-6">
        <LoginForm currentUser={currentUser} />
      </FormWrap>
    </Container>
  );
}
