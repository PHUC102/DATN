// app/order/components/order-details.tsx
"use client";

import { useState } from "react";
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
import { MdDone, MdLockClock } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { ItemContent } from "./item-content";
import TimeAgo from "@/components/ui/time-ago";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

type OrderWithShipping = Order & {
  receiverName?: string | null;
  receiverPhone?: string | null;
};

interface OrderDetailsProps {
  order: OrderWithShipping;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  // State edit shipping
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(order.receiverName ?? "");
  const [phone, setPhone] = useState(order.receiverPhone ?? "");
  const [addr, setAddr] = useState(order.address?.line1 ?? "");

  const canEdit =
    (order.deliveryStatus ?? "").toUpperCase() !== "DELIVERED";

  const saveShipping = async () => {
    try {
      const res = await fetch("/api/order/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          receiverName: name,
          receiverPhone: phone,
          address: addr,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Cập nhật thất bại!");
        return;
      }
      toast.success("Đã cập nhật thông tin giao hàng");
      setEditing(false);
      // reload nhẹ (để đồng bộ dữ liệu)
      location.reload();
    } catch (e) {
      console.error(e);
      toast.error("Có lỗi xảy ra!");
    }
  };

  return (
    <div className="p-8 m-auto flex flex-col gap-4">
      <h1 className="text-2xl mt-5 text-center font-semibold mb-2">
        Chi tiết đơn hàng
      </h1>

      {/* Thông tin cơ bản */}
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
            {(order.status ?? "").toUpperCase() === "PENDING" && (
              <Status
                text="Đang xử lý"
                icon={MdLockClock}
                className="bg-orange-500 text-white"
              />
            )}
            {(order.status ?? "").toUpperCase() === "PAID" && (
              <Status
                text="Đã thanh toán"
                icon={MdDone}
                className="bg-emerald-600 text-white"
              />
            )}
            {(order.status ?? "").toUpperCase() === "COMPLETED" && (
              <Status
                text="Hoàn thành"
                icon={MdDone}
                className="bg-green-600 text-white"
              />
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold">Tình trạng giao hàng: </span>
          <span className="capitalize">
            {(order.deliveryStatus ?? "").toUpperCase() === "PENDING" && (
              <Status
                text="Chờ giao"
                icon={MdLockClock}
                className="bg-orange-700 text-white"
              />
            )}
            {(order.deliveryStatus ?? "").toUpperCase() === "SHIPPING" && (
              <Status
                text="Đang giao hàng"
                icon={TbTruckDelivery}
                className="bg-indigo-500 text-white"
              />
            )}
            {(order.deliveryStatus ?? "").toUpperCase() === "DELIVERED" && (
              <Status
                text="Đã giao hàng"
                icon={MdDone}
                className="bg-green-500 text-white"
              />
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold">Thời gian: </span>
          <span><TimeAgo date={order.createdDate} /></span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold">Thời gian đặt hàng: </span>
          <span>
            {new Intl.DateTimeFormat("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              hour12: false,
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }).format(new Date(order.createdDate))}
          </span>
        </div>
      </div>

      {/* ✅ Thông tin giao hàng */}
      <div className="mt-2 border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Thông tin giao hàng</h2>
          {canEdit && (
            <Button size="sm" variant={editing ? "secondary" : "outline"}
              onClick={() => setEditing((v) => !v)}>
              {editing ? "Huỷ" : "Chỉnh sửa"}
            </Button>
          )}
        </div>

        {!editing ? (
          <div className="space-y-1">
            <div><span className="font-medium">Người nhận:</span> {order.receiverName || "—"}</div>
            <div><span className="font-medium">Điện thoại:</span> {order.receiverPhone || "—"}</div>
            <div><span className="font-medium">Địa chỉ:</span> {order.address?.line1 || "—"}</div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Người nhận</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Điện thoại</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 09xxxxxxx"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Địa chỉ</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              />
            </div>
            <div className="pt-1">
              <Button onClick={saveShipping}>Lưu thay đổi</Button>
            </div>
          </div>
        )}
      </div>

      {/* Danh sách sản phẩm */}
      <div>
        <h2 className="font-semibold">Sản phẩm đã đặt hàng</h2>
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead className="text-right">Tổng cộng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.products?.map((item) => (
              <ItemContent key={item.id} item={item} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
