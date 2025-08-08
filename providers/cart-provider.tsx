"use client";

interface CartProviderProps {
  children: React.ReactNode;
}

import { CartContextProvider } from "@/hooks/use-cart";

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  return <CartContextProvider>{children}</CartContextProvider>;
};
