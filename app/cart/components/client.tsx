"use client";

import { useCart } from "@/hooks/use-cart";
import Link from "next/link";
import { MdArrowBack } from "react-icons/md";
import { BsTrash } from "react-icons/bs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ItemContent } from "./item-content";
import { FormatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { SafeUser } from "@/types";

interface CartClientProps {
  currentUser: SafeUser | null;
}

export const CartClient: React.FC<CartClientProps> = ({ currentUser }) => {
  const { cartProducts, clearWholeCart, cartTotalAmount } = useCart();
  const router = useRouter();

  if (!cartProducts || cartProducts.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-2xl mt-5">Giỏ của bạn trống !</h1>
        <div>
          <Link
            href={"/"}
            className="text-slate-500 flex items-center gap-2 hover:text-slate-900 dark:text-white transition mt-2"
          >
            <MdArrowBack />
            <span>Bắt đầu mua sắm</span>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-2xl md:text-3xl text-slate-900 dark:text-white mt-5 text-center font-semibold">
        Giỏ hàng của bạn
      </h1>
      <div className="mt-5">
        <Table>
          <TableCaption className="text-center lg:text-right text-xl font-semibold">
            Tổng tiền: {FormatPrice(cartTotalAmount)} VND
          </TableCaption>
          <TableCaption className="text-center lg:text-right ">
            Phí giao hàng nếu có sẽ được tính khi thanh toán
          </TableCaption>
          <TableCaption className="text-center lg:text-right ">
            <Link className="hover:underline" href={"/"}>
              Tiếp tục mua sắm?
            </Link>
          </TableCaption>
          <TableCaption className="text-right">
            <Button
              onClick={() =>
                currentUser ? router.push("/checkout") : router.push("/login")
              }
              className="w-full lg:w-1/3"
            >
              {currentUser ? "Thanh toán" : "Đăng nhập để thanh toán"}
            </Button>
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead className="text-right">Tổng cộng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cartProducts &&
              cartProducts.map((item) => (
                <ItemContent
                  key={item.selectedImage.color + item.name}
                  item={item}
                />
              ))}
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell>
                <Button
                  onClick={clearWholeCart}
                  variant="outline"
                  className="flex items-center text-red-600 font-bold gap-1 w-full"
                >
                  <span className="hidden md:flex">
                    <BsTrash />
                  </span>
                  <span className="text-center">Dọn dẹp giỏ hàng</span>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
