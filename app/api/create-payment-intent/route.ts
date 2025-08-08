import Stripe from "stripe";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/get-current-user";
import { CartProductType } from "@/app/product/components/product-details";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  
});

const calculateOrderAmount = (items: CartProductType[]) => {
  const totalPrice = items.reduce((acc, items) => {
    const itemTotal = items.price * items.quantity;

    return acc + itemTotal;
  }, 0);

  const price: any = Math.floor(totalPrice);

  return price;
};

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const { items, payment_intent_id } = body;
  const total = calculateOrderAmount(items);
  const orderData = {
    user: { connect: { id: currentUser.id } },
    amount: total,
    currency: "VND",
    status: "complete",
    deliveryStatus: "pending",
    paymentIntentId: payment_intent_id,
    products: items,
  };

  if (payment_intent_id) {
    const current_intent = await stripe.paymentIntents.retrieve(
      payment_intent_id
    );

    if (current_intent) {
      const updated_intent = await stripe.paymentIntents.update(
        payment_intent_id,
        { amount: total }
      );

   
      // update the order
      const [existing_order, update_order] = await Promise.all([
        prisma.order.findFirst({
          where: { paymentIntentId: payment_intent_id },
        }),
        prisma.order.update({
          where: { paymentIntentId: payment_intent_id },
          data: {
            amount: total,
            products: items,
          },
        }),
      ]);

      if (!existing_order) {
        return NextResponse.error();
      }

      return NextResponse.json({ paymentIntent: updated_intent });
    }
    
  } else {
    // create the intent
    //const session = await stripe.checkout.sessions.create({
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "VND",
      automatic_payment_methods: { enabled: true },
    });

    // create the order
    await prisma.order.create({
      data: { 
        user: { connect: { id: currentUser.id } },
        amount: total,
        currency: "VND",
        status: "complete",
        deliveryStatus: "pending",
        paymentIntentId: paymentIntent.id,
        products: items,
      }
    });
    
  }

  return NextResponse.error();
}
