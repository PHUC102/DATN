// app/admin/manage-orders/components/client.tsx
"use client";

import { Order, User } from "@prisma/client";
import { FormatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MdDeliveryDining, MdDone, MdRemoveRedEye } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { HiMiniClock } from "react-icons/hi2";
import { useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Status } from "@/components/ui/status";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TimeAgo from "@/components/ui/time-ago";

interface ManageOrderClientProps {
  orders: ExtendedOrder[];
}

type ExtendedOrder = Order & { user: User };

// Chuẩn hoá an toàn cho string/null/undefined
const norm = (v: string | null | undefined) =>
  (v ?? "").toString().trim().toUpperCase();

function mapPayStatus(raw: string | null | undefined) {
  const s = norm(raw);
  if (s === "PAID" || s === "SUCCESS" || s === "SUCCEEDED") return "PAID";
  if (s === "COMPLETE" || s === "COMPLETED") return "COMPLETED";
  if (s === "PENDING" || s === "PROCESSING") return "PENDING";
  if (s === "CANCEL" || s === "CANCELED" || s === "CANCELLED") return "CANCELLED";
  return s;
}

function mapDeliveryStatus(raw: string | null | undefined) {
  const s = norm(raw);
  if (s === "PENDING") return "PENDING";
  if (s === "DISPATCHED" || s === "SHIPPING") return "SHIPPING";
  if (s === "DELIVERED") return "DELIVERED";
  return s;
}

export const ManagerOrderClient: React.FC<ManageOrderClientProps> = ({ orders }) => {
  const router = useRouter();

  const handleDispatch = useCallback(
    (id: string) => {
      axios
        .put("/api/order", { id, deliveryStatus: "SHIPPING" })
        .then(() => {
          toast.success("Đơn hàng đã được gửi đi!");
          router.refresh();
        })
        .catch((error) => {
          toast.error(error?.response?.data?.error || "Đã xảy ra lỗi!");
          console.error(error);
        });
    },
    [router]
  );

  const handleDelivered = useCallback(
    (id: string) => {
      axios
        .put("/api/order", { id, deliveryStatus: "DELIVERED" })
        .then(() => {
          toast.success("Đã giao hàng!");
          router.refresh();
        })
        .catch((error) => {
          toast.error(error?.response?.data?.error || "Đã xảy ra lỗi!");
          console.error(error);
        });
    },
    [router]
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-5 text-center font-semibold">Quản lý đơn hàng</h1>
      <Table>
        <TableCaption className="text-center lg:text-right "></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Số tiền (VND)</TableHead>
            <TableHead>Tình trạng thanh toán</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Tình trạng giao hàng</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.map((order) => {
            const pay = mapPayStatus(order.status);
            const del = mapDeliveryStatus(order.deliveryStatus);

            return (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.user?.name ?? "-"}</TableCell>
                <TableCell>{FormatPrice(order.amount)} VND</TableCell>

                {/* Tình trạng thanh toán */}
                <TableCell className="capitalize">
                  {pay === "PENDING" && (
                    <Status
                      text="Đang xử lý"
                      icon={HiMiniClock}
                      className="bg-orange-500 text-white"
                    />
                  )}
                  {pay === "PAID" && (
                    <Status
                      text="Đã thanh toán"
                      icon={MdDone}
                      className="bg-emerald-600 text-white"
                    />
                  )}
                  {pay === "COMPLETED" && (
                    <Status
                      text="Hoàn thành"
                      icon={MdDone}
                      className="bg-green-600 text-white"
                    />
                  )}
                  {pay === "CANCELLED" && (
                    <Status
                      text="Đã huỷ"
                      icon={MdDone}
                      className="bg-rose-600 text-white"
                    />
                  )}
                </TableCell>

                {/* Thời gian: dùng TimeAgo (client-only) */}
                <TableCell>
                  <TimeAgo value={order.createdDate} />
                </TableCell>

                {/* Tình trạng giao hàng */}
                <TableCell>
                  {del === "PENDING" && (
                    <Status
                      text="Chờ giao"
                      icon={HiMiniClock}
                      className="bg-orange-700 text-white"
                    />
                  )}
                  {del === "SHIPPING" && (
                    <Status
                      text="Đang giao hàng"
                      icon={TbTruckDelivery}
                      className="bg-indigo-500 text-white"
                    />
                  )}
                  {del === "DELIVERED" && (
                    <Status
                      text="Đã giao hàng"
                      icon={MdDone}
                      className="bg-green-500 text-white"
                    />
                  )}
                </TableCell>

                <TableCell className="flex items-center justify-end gap-3">
                  <Button
                    onClick={() => handleDispatch(order.id)}
                    variant="outline"
                    size="icon"
                    disabled={del === "DELIVERED"}
                    title="Gửi đi"
                  >
                    <MdDeliveryDining />
                  </Button>
                  <Button
                    onClick={() => handleDelivered(order.id)}
                    variant="outline"
                    size="icon"
                    disabled={del === "DELIVERED"}
                    title="Đánh dấu đã giao"
                  >
                    <MdDone />
                  </Button>
                  <Button
                    onClick={() => router.push(`/order/${order.id}`)}
                    variant="outline"
                    size="icon"
                    title="Xem chi tiết"
                  >
                    <MdRemoveRedEye />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
