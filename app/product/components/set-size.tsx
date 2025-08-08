"use client";

import { Button } from "@/components/ui/button";
import { CartProductType } from "./product-details";

interface SetSizeProps {
  sizes: string[];
  cartProduct: CartProductType;
  handleSizeSelect: (value: string) => void;
}

export const SetSize: React.FC<SetSizeProps> = ({
  sizes,
  cartProduct,
  handleSizeSelect,
}) => {
  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="uppercase font-semibold">Dung tích:</span>
        <div className="flex flex-wrap gap-1 items-center">
          {sizes.map((size) => (
            <Button
              variant={"outline"}
              onClick={() => handleSizeSelect(size)}
              key={size}
              className={`${cartProduct.selectedSize === size
                ? "border-teal-300 border-[2px]"
                : "border-gray-300"
                }`}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
