import Stripe from "stripe";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/get-current-user";
import { CartProductType } from "@/app/product/components/product-details";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

const calculateOrderAmount = (items: CartProductType[]) => {
  const total = items.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  return Math.floor(total);
};

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { items, payment_intent_id } = body;
    const total = calculateOrderAmount(items);

    // Nếu đã có paymentIntent → cập nhật lại
    if (payment_intent_id) {
      const current_intent = await stripe.paymentIntents.retrieve(payment_intent_id);

      const existing_order = await prisma.order.findFirst({
        where: { paymentIntentId: payment_intent_id },
      });

      if (existing_order) {
        const updated_intent = await stripe.paymentIntents.update(payment_intent_id, {
          amount: total,
        });

        await prisma.order.update({
          where: { paymentIntentId: payment_intent_id },
          data: {
            amount: total,
            products: items,
          },
        });

        return NextResponse.json({ paymentIntent: updated_intent });
      }
    }

    // Nếu chưa có paymentIntent → tạo mới
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "VND",
      automatic_payment_methods: { enabled: true },
    });

    // Chỉ tạo đơn hàng mới duy nhất tại đây
    await prisma.order.create({
      data: {
        user: { connect: { id: currentUser.id } },
        amount: total,
        currency: "VND",
        status: "complete",
        deliveryStatus: "pending",
        paymentIntentId: paymentIntent.id,
        products: items,
      },
    });

    return NextResponse.json({ paymentIntent });
  } catch (error) {
    console.error("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
