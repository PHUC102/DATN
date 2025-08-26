"use client";

import { Separator } from "@/components/ui/separator";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SetQuantity } from "./set-quantity";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./product-image";
import { SetColor } from "./set-color";
import { SetSize } from "./set-size";
import { useCart } from "@/hooks/use-cart";
import { FormatPrice } from "@/lib/utils";
import { Rating } from "@mui/material";

interface ProductDetailsProps {
  product: any;
}

export type CartProductType = {
  id: string;
  name: string;
  description: string;
  category: string;
  selectedImage: SelectedImageType;
  selectedSize: string;
  quantity: number;
  price: number;
};

export type SelectedImageType = {
  color: string;
  colorCode: string;
  image: string;
};

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const { handleAddProductToCart, cartProducts } = useCart();
  const [isProductInCart, setIsProductInCart] = useState(false);

  const [cartProduct, setCartProduct] = useState<CartProductType>({
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    selectedImage: { ...product.images[0] },
    selectedSize: "",
    quantity: 1, // ✅ Bắt đầu từ 1 là đúng
    price: product.price,
  });

  const router = useRouter();

  // =========================
  // HANDLERS SỐ LƯỢNG
  // =========================

  const handleQuantityIncrease = useCallback(() => {
    if (cartProduct.quantity === 15) {
      return null;
    }

    // ❌ SAI: mutate trực tiếp prev.quantity bằng ++ (dễ gây nhảy 2,4,6… hoặc về 0 trong Strict Mode)
    // setCartProduct((prev) => {
    //   return { ...prev, quantity: ++prev.quantity };
    // });

    // ✅ ĐÚNG: không mutate, tăng đúng 1 đơn vị và giữ trần = 15
    setCartProduct((prev) => ({ ...prev, quantity: Math.min(15, prev.quantity + 1) }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartProduct.quantity]);

  const handleQuantityDecrease = useCallback(() => {
    if (cartProduct.quantity === 1) {
      return null;
    }

    // ❌ SAI: mutate trực tiếp prev.quantity bằng -- (có thể về 0/âm)
    // setCartProduct((prev) => {
    //   return { ...prev, quantity: --prev.quantity };
    // });

    // ✅ ĐÚNG: không mutate, giảm đúng 1 đơn vị và giữ sàn = 1
    setCartProduct((prev) => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartProduct.quantity]);

  // =========================
  // RATING
  // =========================
  const productRating =
    product.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) /
    product.reviews.length;

  // =========================
  // COLOR & SIZE
  // =========================
  const handleColorSelect = useCallback((value: SelectedImageType) => {
    setCartProduct((prev) => ({ ...prev, selectedImage: value }));
  }, []);

  const handleSizeSelect = (size: string) => {
    setCartProduct((prev) => ({ ...prev, selectedSize: size }));
  };

  // =========================
  // CHECK SẢN PHẨM ĐANG Ở TRONG GIỎ HAY CHƯA
  // =========================
  useEffect(() => {
    setIsProductInCart(false);

    if (cartProducts) {
      const existingIndex = cartProducts.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        setIsProductInCart(true);
      }
    }
  }, [cartProducts, product.id]);

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <ProductImage
          cartProduct={cartProduct}
          product={product}
          handleColorSelect={handleColorSelect}
        />
      </div>

      <div>
        <h2 className="text-3xl font-medium">{product.name}</h2>

        <div className="flex items-center gap-2">
          <Rating value={productRating} readOnly />
          <div>{product.reviews.length} Đánh giá</div>
        </div>

        <div className="mt-3 text-justify">{product.description}</div>
        <Separator />

        <div>
          <span className="font-semibold uppercase">Giá:</span> {FormatPrice(product.price)} VND
        </div>
        <Separator />

        <div>
          <span className="font-semibold uppercase">Danh mục:</span> {product.category}
        </div>

        <div className={`${product.inStock ? "text-teal-500" : "text-red-600"} font-semibold`}>
          {product.inStock ? "Còn hàng" : "Hết hàng"}
        </div>
        <Separator />

        <SetSize
          sizes={product.sizes}
          cartProduct={cartProduct}
          handleSizeSelect={handleSizeSelect}
        />

        <Separator />

        <SetColor
          cartProduct={cartProduct}
          images={product.images}
          handleColorSelect={handleColorSelect}
        />

        <Separator />

        <SetQuantity
          cartProduct={cartProduct}
          handleQuantityIncrease={handleQuantityIncrease}
          handleQuantityDecrease={handleQuantityDecrease}
        />

        <Separator />

        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={() => handleAddProductToCart(cartProduct)}
            className="w-full"
            disabled={!product.inStock}
          >
            Thêm vào giỏ hàng
          </Button>

          {isProductInCart && (
            <Button
              variant="outline"
              className="w-full border-teal-400"
              onClick={() => router.push("/cart")}
            >
              Xem giỏ hàng
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
