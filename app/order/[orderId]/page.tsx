// app/order/[orderId]/page.tsx
import getOrderById from "@/actions/get-order-by-id";
import { Container } from "@/components/ui/container";
import { OrderDetails } from "../components/order-details";
import { AccessDenied } from "@/components/access-denied";

interface OrderPageProps {
  orderId: string;
}

export default async function OrderPage({
  params,
}: {
  params: OrderPageProps;
}) {
  // Lấy đơn theo id
  const order = await getOrderById(params);

  if (!order) {
    return (
      <AccessDenied title="Có vẻ như không có Đơn hàng nào có ID đó." />
    );
  }

  return (
    <div>
      <Container>
        <OrderDetails order={order} />
      </Container>
    </div>
  );
}
