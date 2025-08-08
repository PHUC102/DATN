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
  const deletedReview = await prisma?.review.delete({
    where: {
      id: params.id,
    },
  });
  if (!deletedReview) {
    return NextResponse.error();
  }
  return NextResponse.json(deletedReview);
}
