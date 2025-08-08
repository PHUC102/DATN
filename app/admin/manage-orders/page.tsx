import { Container } from "@/components/ui/container";
import { ManagerOrderClient } from "./components/client";
import { getCurrentUser } from "@/actions/get-current-user";
import { AccessDenied } from "@/components/access-denied";
import getOrders from "@/actions/get-orders";

export default async function ManageOrdersPage() {
  const orders = await getOrders();
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return <AccessDenied title="Truy cập bị từ chối" />;
  }
  return (
    <div>
      <Container>
        <ManagerOrderClient orders={orders} />
      </Container>
    </div>
  );
}
