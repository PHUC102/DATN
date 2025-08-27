"use client";

import { useCart } from "@/hooks/use-cart";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Elements } from "@stripe/react-stripe-js";
import { ImSpinner2 } from "react-icons/im";
import { CheckoutForm } from "./checkout-form";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ✅ THAY nút cũ bằng FORM VNPAY mới
import PayWithVnpayForm from "./pay-with-vnpay-form";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

// Gộp item giống nhau theo đúng shape giỏ hàng (id + màu + size)
function groupCartItems(cartItems: any[]) {
  const grouped: Record<string, any> = {};
  cartItems.forEach((item) => {
    const key = `${item.id}-${item?.selectedImage?.color ?? ""}-${item?.selectedSize ?? ""}`;
    if (grouped[key]) grouped[key].quantity += item.quantity;
    else grouped[key] = { ...item };
  });
  return Object.values(grouped);
}

export const CheckoutClient = () => {
  const router = useRouter();
  const sp = useSearchParams();

  const {
    cartProducts,
    paymentIntent,
    handleSetPaymentIntent,
    clearWholeCart,
  } = useCart();

  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // kết quả từ VNPAY (nếu có)
  const [vnpayStatus, setVnpayStatus] = useState<"success" | "failed" | null>(null);
  const [vnpayOrderId, setVnpayOrderId] = useState("");

  const hasFetchedRef = useRef(false);

  // Nhận kết quả VNPAY từ callback (?provider=vnpay&status=...&orderId=...)
  useEffect(() => {
    const provider = sp?.get("provider") ?? null;
    const status = sp?.get("status") ?? null;
    const orderId = sp?.get("orderId") ?? "";

    if (provider === "vnpay" && status) {
      hasFetchedRef.current = true;

      setVnpayStatus(status === "success" ? "success" : "failed");
      setVnpayOrderId(orderId);

      if (status === "success") {
        try {
          clearWholeCart();
          handleSetPaymentIntent(null);
        } catch {
          /* ignore */
        }
      } else {
        toast.error("Thanh toán VNPAY thất bại");
      }
      // KHÔNG replace ngay để UI còn hiển thị; có nút "Làm mới" bên dưới
    }
  }, [sp, clearWholeCart, handleSetPaymentIntent]);

  // Tạo Stripe Payment Intent (khi chưa có kết quả VNPAY)
  useEffect(() => {
    if (
      hasFetchedRef.current ||                // tránh gọi 2 lần
      !cartProducts?.length ||                // giỏ trống
      paymentSuccess ||                       // stripe đã xong
      vnpayStatus                              // đang hiển thị kết quả vnpay
    ) return;

    hasFetchedRef.current = true;
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
        if (res.status === 401) return router.push("/login");
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
  }, [cartProducts, paymentIntent, paymentSuccess, vnpayStatus, router, handleSetPaymentIntent]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: { theme: "stripe", labels: "floating" },
  };

  return (
    <div className="w-full">
      {/* ======= KẾT QUẢ TRẢ VỀ TỪ VNPAY ======= */}
      {vnpayStatus && (
        <div className="text-3xl flex flex-col items-center justify-center w-full h-full gap-4">
          <div>
            <h1 className="flex items-center gap-2">
              {vnpayStatus === "success" ? "Thanh toán thành công" : "Thanh toán thất bại"}
              {vnpayStatus === "success" && <AiOutlineCheckCircle className="text-green-500" />}
            </h1>
          </div>
          {vnpayOrderId && <div className="text-base">Mã đơn hàng: <b>{vnpayOrderId}</b></div>}
          <div className="flex gap-3">
            <Button><Link href="/orders">Xem đơn đặt hàng của bạn</Link></Button>
            <Button variant="outline" onClick={() => router.replace("/checkout")}>Làm mới trang</Button>
          </div>
        </div>
      )}

      {/* ======= STRIPE CHECKOUT (nếu không hiển thị kết quả VNPAY) ======= */}
      {!vnpayStatus && clientSecret && cartProducts && !paymentSuccess && !error && (
        <div className="space-y-6">
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm
              clientSecret={clientSecret}
              handleSetPaymentSuccess={setPaymentSuccess}
            />
          </Elements>

          {/* Ngăn cách 2 lựa chọn */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-sm text-gray-500">hoặc</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>
        </div>
      )}

      {/* ======= FORM VNPAY (độc lập với Stripe) ======= */}
      {!vnpayStatus && (cartProducts?.length ?? 0) > 0 && (
        <PayWithVnpayForm />
      )}

      {/* ======= CÁC TRẠNG THÁI KHÁC ======= */}
      {!vnpayStatus && isLoading && (
        <div className="text-3xl flex flex-col items-center justify-center w-full h-full gap-3">
          <h1>Đang tải thanh toán...</h1>
          <ImSpinner2 className="animate-spin" />
        </div>
      )}

      {!vnpayStatus && error && (
        <div className="text-3xl flex items-center justify-center w-full h-full text-rose-500">
          <h1>Đã xảy ra lỗi! 😟</h1>
        </div>
      )}

      {!vnpayStatus && paymentSuccess && (
        <div className="text-3xl flex flex-col items-center justify-center w-full h-full gap-4">
          <h1 className="flex items-center gap-2">
            Thanh toán thành công
            <AiOutlineCheckCircle className="text-green-500" />
          </h1>
          <Button><Link href="/orders">Xem đơn đặt hàng của bạn</Link></Button>
        </div>
      )}

      {/* Chỉ hiện thông báo giỏ trống khi thật sự không có gì để hiển thị */}
      {!vnpayStatus &&
        (!cartProducts || cartProducts.length === 0) &&
        !clientSecret &&
        !isLoading &&
        !error &&
        !paymentSuccess && (
          <div className="text-center text-gray-600 py-10">
            Giỏ hàng trống hoặc thanh toán chưa sẵn sàng.
          </div>
        )}
    </div>
  );
};
