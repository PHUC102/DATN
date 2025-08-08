"use client";

import { CartProductType } from "./product-details";

interface SetQuantityProps {
  cartCounter?: boolean;
  cartProduct: CartProductType;
  handleQuantityIncrease: () => void;
  handleQuantityDecrease: () => void;
}

const buttonStyles = "border border-slate-300 px-2 rounded";

export const SetQuantity: React.FC<SetQuantityProps> = ({
  cartProduct,
  cartCounter,
  handleQuantityDecrease,
  handleQuantityIncrease,
}) => {
  return (
    <div className="flex gap-8 items-center">
      {cartCounter ? null : (
        <div className="font-semibold uppercase">Số lượng: </div>
      )}
      <div className="flex items-center gap-4 text-base">
        <button className={buttonStyles} onClick={handleQuantityDecrease}>
          -
        </button>
        <div>{cartProduct.quantity}</div>
        <button className={buttonStyles} onClick={handleQuantityIncrease}>
          +
        </button>
      </div>
    </div>
  );
};
