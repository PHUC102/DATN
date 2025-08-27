"use client";

import React from "react";
import type { IconType } from "react-icons";

interface CategoryInputProps {
  selected?: boolean;
  label: string;
  icon?: IconType;           // <-- cho phép optional
  image?: string;            // <-- hỗ trợ truyền hình minh hoạ nếu có
  onClick: (value: string) => void;
}

export const CategoryInput: React.FC<CategoryInputProps> = ({
  selected,
  label,
  icon: Icon,
  image,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className={`rounded-xl border-2 p-4 w-full flex flex-col items-center gap-2 hover:border-slate-500 transition cursor-pointer
      ${selected ? "border-slate-500" : "border-slate-200"}`}
    >
      {Icon ? (
        <Icon size={30} />
      ) : image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={label} className="w-8 h-8 object-contain" />
      ) : null}
      <span className="font-medium">{label}</span>
    </button>
  );
};
