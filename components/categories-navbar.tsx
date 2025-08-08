"use client";

import { categories } from "@/lib/products";
import { Category } from "@/components/category";
import { Container } from "@/components/ui/container";
import React from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface CategoriesNavbarProps { }

export const CategoriesNavbar: React.FC<CategoriesNavbarProps> = () => {
  const params = useSearchParams()
  const category = params?.get('category')
  const pathname = usePathname();
  if (!categories) {
    return null;
  }

  if (pathname?.startsWith("/admin")) return null;

  return (
    <Container>
      <div className="pt-4 flex flex-row items-center justify-evenly overflow-x-auto">
        {categories.map((item) => (
          <Category
            key={item.label}
            label={item.label}
            icon={React.createElement(item.icon)}
          />
        ))}
      </div>
    </Container>
  );
};
