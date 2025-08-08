"use client";

import { Status } from "@/components/ui/status";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormatPrice } from "@/lib/utils";
import { Order } from "@prisma/client";
import moment from "moment";
import { useRouter } from "next/navigation";
import { MdDone, MdLockClock } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { ItemContent } from "./item-content";
import "moment/locale/vi";
moment.locale('vi');
interface OrderDetailsProps {
  order: Order;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const router = useRouter();

  return (
    <div className="p-8 m-auto flex flex-col gap-2">
      <h1 className="text-2xl mt-5 text-center font-semibold mb-5">
        Chi tiết đơn hàng
      </h1>
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Đơn hàng: </span>
          <span>{order.id}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold">Tổng tiền: </span>
          <span className="font-bold">{FormatPrice(order.amount)} VND</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold">Tình trạng thanh toán: </span>
          <span className="capitalize">
            {order.status === "pending" ? (
              <Status
                text="Đang xử lý"
                icon={MdLockClock}
                className="bg-orange-500 text-white"
              />
            ) : order.status === "complete" ? (
              <Status
                text="Hoàn thành"
                icon={MdDone}
                className="bg-green-500 text-white"
              />
            ) : (
              <></>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold">Tình trạng giao hàng: </span>
          <span className="capitalize">
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
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold">Thời gian:</span>
          <span>{moment(order.createdDate).fromNow()}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold">Thời gian đặt hàng:</span>
          <span>{moment(order.createdDate).format("LLL")}</span>
        </div>

      </div>

      <div>
        <h2 className="font-semibold">Sản phẩm đã đặt hàng</h2>
        <Table className="mt-5">
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead className="text-right">Tổng cộng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.products &&
              order.products.map((item) => {
                return <ItemContent key={item.id} item={item} />;
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
