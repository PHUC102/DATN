"use client";

import { FormatPrice } from "@/lib/utils";
import { TruncateText } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Rating } from "@mui/material";

interface ProductCardProps {
  data: any;
}

export const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  const router = useRouter();
  const productRating =
    data.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) /
    data.reviews.length;
  return (
    <Link
      href={`/product/${data.id}`}
      className="col-span-1 cursor-pointer border rounded p-2 transition hover:scale-105 text-center text-sm"
    >
      <div className="flex flex-col items-center w-full gap-1">
        {data.images[0]?.image && (
          <div className="aspect-square overflow-hidden relative w-full">
            <Image
              priority
              fill
              sizes="(max-width: 768px) 100vw"
              className="w-full h-full object-contain"
              src={data.images[0].image}
              alt={data.name}
            />
          </div>
        )}
        <div className="mt-4 uppercase">{TruncateText(data.name)}</div>
        <div>
          <Rating value={productRating} readOnly />
        </div>
        <div>{data.reviews.length} đánh giá</div>
        <div>{FormatPrice(data.price)} VND</div>
      </div>
    </Link>
  );
};
