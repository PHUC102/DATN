import prisma from "@/lib/prismadb";

interface OrderParams {
  orderId?: string;
}

export default async function getOrderById(params: OrderParams) {
  try {
    const { orderId } = params;

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) return null;

    return order;
  } catch (error: any) {
    throw new Error(error);
  }
}
