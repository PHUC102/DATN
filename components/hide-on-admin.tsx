"use client";

import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

export default function HideOnAdmin({ children }: PropsWithChildren) {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin")) return null; // ẩn khi URL là /admin/*
  return <>{children}</>;
}
