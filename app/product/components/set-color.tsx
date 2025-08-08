"use client";

import { CartProductType, SelectedImageType } from "./product-details";

interface SetColorProps {
  images: SelectedImageType[];
  cartProduct: CartProductType;
  handleColorSelect: (value: SelectedImageType) => void;
}

export const SetColor: React.FC<SetColorProps> = ({
  images,
  cartProduct,
  handleColorSelect,
}) => {
  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="uppercase font-semibold">Loại:</span>
        <div className="flex gap-1 items-center">
          {images.map((image) => (
            <div
              onClick={() => handleColorSelect(image)}
              key={image.image}
              className={`h-7 cursor-pointer rounded-full border-teal-300 flex items-center justify-center ${cartProduct.selectedImage.color === image.color
                ? "border-[1.5px]"//border-[1.5px]
                : "border-none"
                }`}
            >
              <div
              // style={{ background: image.colorCode }}
              // className="h-5 w-5 rounded-full border-[1.2px] border-slate-300 cursor-pointer"
              >{image.color}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
