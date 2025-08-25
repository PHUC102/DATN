"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/products";
import Image from "next/image";

export const Banner = () => {
  const pathname = usePathname();
  const currentPage = pathname ? pathname.split("/")[1] : null;

  const currentCategory = categories.find(
    (category) => category.label.toLowerCase() === currentPage?.toLowerCase()
  );

  return (
  <div className="relative w-full max-w-[1440px] aspect-[3/1] mx-auto rounded-lg overflow-hidden border">

      {currentCategory ? (
        // 🔥 Banner cho category
        <Image
          src={currentCategory.image}
          alt={currentCategory.label}
          fill
          priority
          className="object-fill object-center"
        />
      ) : (
        // 🔥 Banner cho trang chủ
        <Image
          src={"/banner.png"}
          alt="banner"
          fill
          priority
          className="object-fill rounded-lg"
        />
      )}
    </div>
  );
};
