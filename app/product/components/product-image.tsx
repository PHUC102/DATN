"use client";

import Image from "next/image";
import { CartProductType, SelectedImageType } from "./product-details";

interface ProductImageProps {
  cartProduct: CartProductType;
  product: any;
  handleColorSelect: (value: SelectedImageType) => void;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  cartProduct,
  product,
  handleColorSelect,
}) => {
  return (
    <div className="grid grid-cols-6 gap-2 h-full max-h-[500px] min-h-[300px] sm:min-h-[400px]">
      <div className="flex flex-col items-center justify-center gap-4 cursor-pointer h-full max-h-[500px] min-h-[300px] sm:min-h-[400px]">
        {product.images.map((image: SelectedImageType) => (
          <div
            onClick={() => handleColorSelect(image)}
            key={image.image}
            className={`relative w-[80%] aspect-square rounded border-indigo-300 my-5 ${
              cartProduct.selectedImage.color === image.color
                ? "border-[2px]"
                : "border-none"
            }`}
          >
            <Image
              src={image.image}
              alt={image.image}
              fill
              priority
              sizes="(max-width: 768px) 100vw"
              className="object-contain"
            />
          </div>
        ))}
      </div>
      <div className="col-span-5 relative aspect-square">
        <Image
          fill
          priority
          src={cartProduct.selectedImage.image}
          alt={cartProduct.name}
          sizes="(max-width: 768px) 100vw"
          className="w-full h-full object-contain max-h-[500px] min-h-[300px] sm:min-h-[400px]"
        />
      </div>
    </div>
  );
};
