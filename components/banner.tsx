"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/products";
import Image from "next/image";

export const Banner = () => {
  const pathname = usePathname();
  const currentPage = pathname ? pathname.split("/")[1] : null; // Get the current page

  const currentCategory = categories.find(
    (category) => category.label === currentPage
  );

  return (
    <div className="relative border m-8 rounded-lg h-[400px] w-full">
      <div className="flex items-center justify-center px-8 py-12 h-full w-full flex-col gap-5 lg:gap-2 lg:flex-row">
        <div className="space-y-2">
          {currentCategory ? (
            // If we're on a category page
            <div className="flex items-center gap-x-6">
              <h1 className="text-4xl text-center lg:text-left">
                {currentCategory.label}
              </h1>
              <currentCategory.icon size={50} className="text-indigo-700" />
            </div>
          ) : (
            // If we're on the home page
            <div className="w-full h-full">
              <Image
                src={"/banner.png"}
                alt="banner"
                fill
                priority
                sizes=""
                className="object-fill object-left rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
