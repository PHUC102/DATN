"use client";

import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { AiOutlineShoppingCart } from "react-icons/ai";

export const CartCount = () => {
  const router = useRouter();
  const { cartTotalQuantity } = useCart();

  return (
    <div
      onClick={() => router.push("/cart")}
      className="relative cursor-pointer"
    >
      <span>
        <AiOutlineShoppingCart size={23} />
      </span>
      {cartTotalQuantity > 0 && (
        <span className="absolute top-[-10px] right-[22px] bg-black dark:bg-white dark:text-black text-white h-6 w-6 rounded-full flex items-center justify-center text-sm">
          {cartTotalQuantity}
        </span>
      )}
    </div>
  );
};
