"use client";

import { categories } from "@/lib/products";
import { Category } from "@/components/category";
import { Container } from "@/components/ui/container";
import { usePathname, useSearchParams } from "next/navigation";

export const CategoriesNavbar: React.FC = () => {
  const params = useSearchParams();
  const category = params?.get("category");
  const pathname = usePathname();

  if (!categories) return null;
  if (pathname?.startsWith("/admin")) return null;

  return (
    <Container>
      <div className="pt-4 flex flex-row items-center justify-evenly overflow-x-auto">
        {categories.map((item) => (
          <Category
            key={item.label}
            label={item.label}
            image={item.image} // truyền đường dẫn ảnh
            selected={category === item.label} // xác định category nào đang chọn
          />
        ))}
      </div>
    </Container>
  );
};
