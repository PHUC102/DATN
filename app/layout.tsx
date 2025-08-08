import "./globals.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/providers/cart-provider";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "G Cosmetic",
  description: "Mua Sự Yên Tâm",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster />
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
