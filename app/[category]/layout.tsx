import type { Metadata } from "next";
import { CartProvider } from "@/providers/cart-provider";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Danh mục sản phẩm",
  description: "Danh mục sản phẩm",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <CartProvider>{children}</CartProvider>
    </Container>
  );
}
