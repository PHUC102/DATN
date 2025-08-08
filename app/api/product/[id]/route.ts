import { getCurrentUser } from "@/actions/get-current-user";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }
  await prisma.review.deleteMany({
    where: {
      productId: params.id,
    },
  });
  const product = await prisma?.product.delete({
    where: {
      id: params.id,
    },
  });
  return NextResponse.json(product);
}
