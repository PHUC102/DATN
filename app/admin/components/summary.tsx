// app/admin/components/summary.tsx
"use client";

import { FormatPrice } from "@/lib/utils";

export type GraphData = { label: string; value: number };

type OrderLike = {
  amount?: number | string | null;
  status?: string | null;
  createdDate?: Date | string;
};

interface SummaryProps {
  orders: OrderLike[];
  productsCount: number;
  usersCount: number;
}

function isPaidStatus(s?: string | null) {
  if (!s) return false;
  const t = s.toLowerCase();
  return (
    t === "complete" ||
    t === "completed" ||
    t === "succeeded" ||
    t === "paid"
  );
}

function toAmount(a: number | string | null | undefined) {
  if (typeof a === "number") return a || 0;
  if (typeof a === "string") {
    const n = parseFloat(a.replace(/[^\d.-]/g, ""));
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

// 👉 NAMED EXPORT
export function Summary({ orders, productsCount, usersCount }: SummaryProps) {
  const paidOrders = (orders || []).filter((o) => isPaidStatus(o.status));
  const unpaidOrders = (orders || []).filter((o) => !isPaidStatus(o.status));
  const totalSale = paidOrders.reduce((sum, o) => sum + toAmount(o.amount), 0);

  return (
    <div className="w-full">
      {/* Heading “Thống kê” */}
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6">
        Thống kê
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 p-6 text-center">
          <div className="text-4xl font-extrabold">
            {FormatPrice(totalSale)} VND
          </div>
          <div className="mt-2 text-gray-600">Tổng doanh thu (VND)</div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6 text-center">
          <div className="text-4xl font-extrabold">{productsCount}</div>
          <div className="mt-2 text-gray-600">Tổng số sản phẩm</div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6 text-center">
          <div className="text-4xl font-extrabold">
            {orders?.length ?? 0}
          </div>
          <div className="mt-2 text-gray-600">Tổng số đơn đặt hàng</div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6 text-center">
          <div className="text-4xl font-extrabold">{paidOrders.length}</div>
          <div className="mt-2 text-gray-600">Đơn đặt hàng đã thanh toán</div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6 text-center">
          <div className="text-4xl font-extrabold">{unpaidOrders.length}</div>
          <div className="mt-2 text-gray-600">Đơn hàng chưa thanh toán</div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6 text-center">
          <div className="text-4xl font-extrabold">{usersCount}</div>
          <div className="mt-2 text-gray-600">Tổng số người dùng</div>
        </div>
      </div>
    </div>
  );
}

// 👉 DEFAULT EXPORT (để nơi khác có thể `import Summary from ...`)
export default Summary;
