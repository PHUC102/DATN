"use client";

import { useCart } from "@/hooks/use-cart";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Elements } from "@stripe/react-stripe-js";
import { ImSpinner2 } from "react-icons/im";
import { CheckoutForm } from "./checkout-form";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Stripe key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

// ✅ Gộp sản phẩm giống nhau
function groupCartItems(cartItems: any[]) {
  const grouped: Record<string, any> = {};

  cartItems.forEach((item) => {
    const key = `${item.id}-${item.color}-${item.size}`;
    if (grouped[key]) {
      grouped[key].quantity += item.quantity;
    } else {
      grouped[key] = { ...item };
    }
  });

  return Object.values(grouped);
}

export const CheckoutClient = () => {
  const router = useRouter();
  const { cartProducts, paymentIntent, handleSetPaymentIntent } = useCart();
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // ✅ Ngăn gọi nhiều lần
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (
      hasFetchedRef.current ||          // đã gọi rồi → không gọi nữa
      !cartProducts?.length || 
      paymentSuccess
    ) return;

    hasFetchedRef.current = true; // Đánh dấu đã gọi rồi

    setIsLoading(true);
    setError(false);

    const groupedItems = groupCartItems(cartProducts);

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: groupedItems,
        payment_intent_id: paymentIntent,
      }),
    })
      .then((res) => {
        setIsLoading(false);
        if (res.status === 401) {
          return router.push("/login");
        }

        return res.json();
      })
      .then((data) => {
        if (data?.paymentIntent) {
          setClientSecret(data.paymentIntent.client_secret);
          handleSetPaymentIntent(data.paymentIntent.id);
        }
      })
      .catch(() => {
        setError(true);
        toast.error("Đã xảy ra lỗi!");
      });
  }, [cartProducts, paymentIntent, paymentSuccess, router, handleSetPaymentIntent]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      labels: "floating",
    },
  };

  return (
    <div className="w-full">
      {clientSecret && cartProducts && !paymentSuccess && !error && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm
            clientSecret={clientSecret}
            handleSetPaymentSuccess={setPaymentSuccess}
          />
        </Elements>
      )}
      {isLoading && (
        <div className="text-3xl flex flex-col items-center justify-center w-full h-full gap-3">
          <h1>Đang tải thanh toán...</h1>
          <ImSpinner2 className="animate-spin" />
        </div>
      )}
      {error && (
        <div className="text-3xl flex items-center justify-center w-full h-full text-rose-500">
          <h1>Đã xảy ra lỗi! 😟</h1>
        </div>
      )}
      {paymentSuccess && (
        <div className="text-3xl flex flex-col items-center justify-center w-full h-full gap-4">
          <div>
            <h1 className="flex items-center gap-2">
              Thanh toán thành công
              <span>
                <AiOutlineCheckCircle className="text-green-500" />
              </span>
            </h1>
          </div>
          <div>
            <Button>
              <Link href="/orders">Xem đơn đặt hàng của bạn</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
