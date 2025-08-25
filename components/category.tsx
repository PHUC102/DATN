"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface CategoryProps {
  label: string;
  image: string;
  selected: boolean;
}

export const Category: React.FC<CategoryProps> = ({ label, image, selected }) => {
  return (
    <Link href={`/${label}`}>
      <span
        className={`flex flex-col md:flex-row gap-2 items-center justify-between p-2 border-b-2 hover:text-slate-800 transition cursor-pointer
          ${selected
            ? "border-b-slate-800 text-slate-800 dark:text-white font-semibold"
            : "border-transparent text-slate-500"
          }`}
      >
        {/* Hiển thị ảnh từ image */}
        <div className="w-10 h-10 relative">
          <img
            src={image}
            alt={label}
            className="w-10 h-10 object-contain rounded-full"
          />

        </div>

        <span className="font-medium text-sm">{label}</span>
      </span>
    </Link>
  );
};
