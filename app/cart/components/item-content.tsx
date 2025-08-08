"use client";

import { CartProductType } from "@/app/product/components/product-details";
import { SetQuantity } from "@/app/product/components/set-quantity";
import { Button } from "@/components/ui/button";
import { FormatPrice } from "@/lib/utils";
import { TruncateText } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { BsTrash } from "react-icons/bs";

import { TableRow, TableCell } from "@/components/ui/table";
import { useCart } from "@/hooks/use-cart";

interface ItemContentProps {
  item: CartProductType;
}

export const ItemContent: React.FC<ItemContentProps> = ({ item }) => {
  const {
    handleRemoveProductFromCart,
    handleCartQuantityIncrease,
    handleCartQuantityDecrease,
  } = useCart();
  return (
    <TableRow>
      <TableCell className="flex items-center gap-5">
        <Link className="hidden md:flex" href={`/product/${item.id}`}>
          <Image
            src={item.selectedImage.image}
            alt={item.name}
            width={50}
            height={50}
            className="object-contain"
          />
        </Link>
        <div className="flex flex-col gap-1">
          <span className="md:flex hidden">{TruncateText(item.name)}</span>
          <Link
            className="md:hidden flex text-blue-400 underline"
            href={`/product/${item.id}`}
          >
            {TruncateText(item.name)}
          </Link>
          <span>{item.selectedImage.color}</span>
          <span>{item.selectedSize}</span>
          <div>
            <span>
              <Button
                onClick={() => handleRemoveProductFromCart(item)}
                className="text-red-600 flex items-center gap-1"
                variant={"outline"}
                size={"sm"}
              >
                <BsTrash />
                <span className="hidden md:flex">Xóa</span>
              </Button>
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>{FormatPrice(item.price)} VND</TableCell>
      <TableCell>
        <SetQuantity
          cartCounter={true}
          cartProduct={item}
          handleQuantityDecrease={() => handleCartQuantityDecrease(item)}
          handleQuantityIncrease={() => handleCartQuantityIncrease(item)}
        />
      </TableCell>
      <TableCell className="text-right">
        {FormatPrice(item.price * item.quantity)} VND
      </TableCell>
    </TableRow>
  );
};
