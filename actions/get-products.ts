import prisma from "@/lib/prismadb";

export interface ProductParams {
  category?: string | null;
  searchTerm?: string | null;
}

export default async function getProducts(params: ProductParams) {
  try {
    const { category, searchTerm } = params || {};

    let searchString = searchTerm;
    if (!searchTerm) {
      searchString = "";
    }

    let query: any = {};

    if (category) {
      query.category = category;
    }

    const products = await prisma.product.findMany({
      where: {
        ...query,
        OR: [
          {
            name: { contains: searchString, mode: "insensitive" },
            description: { contains: searchString, mode: "insensitive" },
          },
        ],
      },
      include: {
        reviews: {
          include: {
            user: true,
          },
          orderBy: {
            createdDate: "desc",
          },
        },
      },
    });

    return products;
  } catch (error: any) {
    console.error("Error in getProducts:", error);
    throw error; // Re-throw the original error for further handling, if needed
  }
}
