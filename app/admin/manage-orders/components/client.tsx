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
import moment from "moment";
import "moment/locale/vi";
moment.locale('vi');
interface ManageOrderClientProps {
  orders: ExtendedOrder[];
}

type ExtendedOrder = Order & {
  user: User;
};

export const ManagerOrderClient: React.FC<ManageOrderClientProps> = ({
  orders,
}) => {
  const router = useRouter();
  const handleDispatch = useCallback(
    (id: string) => {
      axios
        .put("/api/order", {
          id,
          deliveryStatus: "dispatched",
        })
        .then((res) => {
          toast.success("Đơn hàng đã được gửi đi!");
          router.refresh();
        })
        .catch((error) => {
          toast.error("Đã xảy ra lỗi!");
          console.log(error);
        });
    },
    [router]
  );

  const handleDelivered = useCallback(
    (id: string) => {
      axios
        .put("/api/order", {
          id,
          deliveryStatus: "delivered",
        })
        .then((res) => {
          toast.success("Đã giao hàng!");
          router.refresh();
        })
        .catch((error) => {
          toast.error("Đã xảy ra lỗi!");
          console.log(error);
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
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.user.name}</TableCell>
              <TableCell>{FormatPrice(order.amount)} VND</TableCell>
              <TableCell className="capitalize">
                {order.status === "pending" && (
                  <Status
                    text="Đang xử lý"
                    icon={HiMiniClock}
                    className="bg-orange-500 text-white"
                  />
                )}
                {order.status === "complete" && (
                  <Status
                    text="Hoàn thành"
                    icon={MdDone}
                    className="bg-green-500 text-white"
                  />
                )}
              </TableCell>
              <TableCell>{moment(order.createdDate).fromNow()}</TableCell>
              <TableCell>
                {order.deliveryStatus === "pending" && (
                  <Status
                    text="Đang xử lý"
                    icon={MdDone}
                    className="bg-orange-700 text-white"
                  />
                )}
                {order.deliveryStatus === "dispatched" && (
                  <Status
                    text="Đang giao hàng"
                    icon={TbTruckDelivery}
                    className="bg-indigo-500 text-white"
                  />
                )}
                {order.deliveryStatus === "delivered" && (
                  <Status
                    text="Đã giao hàng"
                    icon={MdDone}
                    className="bg-green-500 text-white"
                  />
                )}
              </TableCell>

              <TableCell className="flex items-center justify-end gap-3">
                <Button
                  onClick={() => {
                    handleDispatch(order.id);
                  }}
                  variant="outline"
                  size="icon"
                >
                  <MdDeliveryDining />
                </Button>
                <Button
                  onClick={() => {
                    handleDelivered(order.id);
                  }}
                  variant="outline"
                  size="icon"
                >
                  <MdDone />
                </Button>
                <Button
                  onClick={() => {
                    router.push(`/order/${order.id}`);
                  }}
                  variant="outline"
                  size="icon"
                >
                  <MdRemoveRedEye />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
