import { Container } from "@/components/ui/container";
import { CartClient } from "./components/client";
import { getCurrentUser } from "@/actions/get-current-user";

export default async function CartPage() {
  const currentUser = await getCurrentUser();
  return (
    <Container>
      <CartClient currentUser={currentUser} />
    </Container>
  );
}
