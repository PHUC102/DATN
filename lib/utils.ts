import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TruncateText = (string: string) => {
  if (string.length < 25) return string;
  return string.substring(0, 25) + "...";
};

export const FormatPrice = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
  }).format(amount);
};

export const FormatNumber = (digit: number) => {
  return new Intl.NumberFormat("vi-VN").format(digit);
};
