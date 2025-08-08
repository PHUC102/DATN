import prisma from "@/lib/prismadb";

export const getCategories = async () => {
  try {
    const products = await prisma.product.findMany();
    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.category))
    );
    return uniqueCategories;
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
