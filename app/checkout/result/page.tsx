export default function CheckoutResultPage({
  searchParams,
}: {
  searchParams?: { status?: string; orderId?: string };
}) {
  const status = searchParams?.status;
  const orderId = searchParams?.orderId;

  const ok = status === "success";

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div
        className={`rounded-xl border p-5 ${
          ok ? "border-green-300 bg-green-50 text-green-800" : "border-red-300 bg-red-50 text-red-800"
        }`}
      >
        <div className="text-2xl font-semibold mb-2">
          {ok ? "✅ Thanh toán thành công" : "❌ Thanh toán thất bại"}
        </div>
        {orderId ? <div>Mã đơn hàng: <b>{orderId}</b></div> : null}
        <div className="mt-4 flex gap-3">
          <a href="/cart" className="underline">Quay lại giỏ hàng</a>
          <a href="/orders" className="underline">Xem đơn hàng của tôi</a>
          <a href="/" className="underline">Tiếp tục mua sắm</a>
        </div>
      </div>
    </div>
  );
}
