import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getCurrentUser } from "@/actions/get-current-user";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }

  const body = await request.json();
  const { name, description, price, category, inStock, images, sizes } = body;

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      category,
      inStock,
      images,
      sizes,
    },
  });

  return NextResponse.json(product);
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }

  const body = await request.json();
  const { id, name, description, price, category, inStock, images, sizes } =
    body;

  const product = await prisma.product.update({
    where: {
      id: id,
    },
    data: {
      name,
      description,
      price: parseFloat(price),
      category,
      inStock,
      images,
      sizes,
    },
  });

  return NextResponse.json(product);
}
export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }

  const body = await request.json();
  const { id, inStock } = body;

    const updatedProduct = await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        inStock,
      },
    });

    return NextResponse.json(updatedProduct);
  
}