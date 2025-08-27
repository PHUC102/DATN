"use client";

import { Order, User } from "@prisma/client";
import { FormatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MdDone, MdRemoveRedEye } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { HiMiniClock } from "react-icons/hi2";
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
import moment from "moment";
import "moment/locale/vi";
moment.locale("vi");

interface OrderClientProps {
  orders: ExtendedOrder[];
}

type ExtendedOrder = Order & {
  user: User;
};

export const OrderClient: React.FC<OrderClientProps> = ({ orders }) => {
  const router = useRouter();

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-5 text-center font-semibold">Đơn hàng của bạn</h1>
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
            // ✅ Chuẩn hoá trạng thái về UPPERCASE (tương thích dữ liệu cũ)
            const pay = (order.status || "").toString().trim().toUpperCase();
            const del = (order.deliveryStatus || "")
              .toString()
              .trim()
              .toUpperCase()
              // chấp nhận "DISPATCHED" cũ và map sang SHIPPING để hiển thị đúng
              .replace(/^DISPATCHED$/, "SHIPPING");

            return (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.user?.name ?? "-"}</TableCell>

                <TableCell>{FormatPrice(order.amount)} VND</TableCell>

                {/* ====== Thanh toán ====== */}
                <TableCell className="capitalize">
                  {pay === "PENDING" && (
                    <Status
                      text="Chờ thanh toán"
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
                  {pay === "PROCESSING" && (
                    <Status
                      text="Đang xử lý"
                      icon={HiMiniClock}
                      className="bg-orange-500 text-white"
                    />
                  )}
                  {pay === "COMPLETED" || pay === "COMPLETE" ? (
                    <Status
                      text="Hoàn Thành"
                      icon={MdDone}
                      className="bg-green-600 text-white"
                    />
                  ) : null}
                  {pay === "CANCELLED" && (
                    <Status
                      text="Đã huỷ"
                      icon={MdDone}
                      className="bg-rose-600 text-white"
                    />
                  )}
                  {!pay && <span>—</span>}
                </TableCell>

                {/* ====== Thời gian ====== */}
                <TableCell>{moment(order.createdDate).fromNow()}</TableCell>

                {/* ====== Giao hàng ====== */}
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
                  {!del && <span>—</span>}
                </TableCell>

                {/* ====== Hành động ====== */}
                <TableCell className="flex items-center justify-end gap-3">
                  <Button
                    onClick={() => router.push(`/order/${order.id}`)}
                    variant="outline"
                    size="icon"
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
