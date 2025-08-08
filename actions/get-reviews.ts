import prisma from "@/lib/prismadb";


export default async function getReviews() {
  try {
    const reviews = prisma?.review.findMany();
    return reviews;
  } catch (error: any) {
    throw new Error(error);
  }
}
