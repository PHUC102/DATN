import { Container } from "@/components/ui/container";
import { getCurrentUser } from "@/actions/get-current-user";
import { AccessDenied } from "@/components/access-denied";
import getOrdersByUser from "@/actions/get-orders-by-user";
import { OrderClient } from "./components/client";

export default async function OrdersPage() {
  const currentUser = await getCurrentUser();
  const orders = await getOrdersByUser(currentUser?.id);

  if (!currentUser) {
    return <AccessDenied title="Chưa có đơn hàng nào..." />;
  }

  return (
    <div>
      <Container>
        <OrderClient orders={orders} />
      </Container>
    </div>
  );
}
