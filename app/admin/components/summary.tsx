"use client";

import { FormatNumber, FormatPrice } from "@/lib/utils";
import { Order, Product, User } from "@prisma/client";
import { useEffect, useState } from "react";

interface SummaryProps {
  orders: Order[];
  products: Product[];
  users: User[];
}

type SummaryDataType = {
  [key: string]: {
    label: string;
    digit: number;
  };
};

export const Summary: React.FC<SummaryProps> = ({
  orders,
  products,
  users,
}) => {
  const [summaryData, setSummaryData] = useState<SummaryDataType>({
    sale: { label: "Tổng doanh thu (VND)", digit: 0 },
    products: { label: "Tổng số sản phẩm", digit: 0 },
    orders: { label: "Tổng số đơn đặt hàng", digit: 0 },
    paidOrders: { label: "Đơn đặt hàng đã thanh toán", digit: 0 },
    unpaidOrders: { label: "Đơn hàng chưa thanh toán", digit: 0 },
    users: { label: "Tổng số người dùng", digit: 0 },
  });

  useEffect(() => {
    setSummaryData((prev) => {
      let tempData = { ...prev };

      const totalSale = orders.reduce((acc, item) => {
        if (item.status === "complete") {
          return acc + item.amount;
        } else return acc;
      }, 0);

      const paidOrders = orders.filter((order) => {
        return order.status === "complete";
      });

      const unpaidOrders = orders.filter((order) => {
        return order.status === "pending";
      });

      tempData.sale.digit = totalSale;
      tempData.orders.digit = orders.length;
      tempData.paidOrders.digit = paidOrders.length;
      tempData.unpaidOrders.digit = unpaidOrders.length;
      tempData.products.digit = products.length;
      tempData.users.digit = users.length;

      return tempData;
    });
  }, [orders, products, users]);

  const summaryKeys = Object.keys(summaryData);

  return (
    <div className="max-w-[1150px] m-auto">
      <h1 className="text-2xl mt-5 mb-4 text-center font-semibold">Thống kê</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 max-h-full overflow-y-auto gap-2 mb-5">
        {summaryKeys &&
          summaryKeys.map((key) => {
            return (
              <div
                key={key}
                className="rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition"
              >
                <div className="text-xl md:text-4xl font-bold">
                  {summaryData[key].label === "Total Sale" ? (
                    <>{(summaryData[key].digit)}</>
                  ) : (
                    <>{(summaryData[key].digit)}</>
                  )}
                </div>
                <div>{summaryData[key].label}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
