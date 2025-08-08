import { getCurrentUser } from "@/actions/get-current-user";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import bcrypt from "bcrypt";

// Lấy danh sách người dùng
export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

// Tạo người dùng mới
export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, role } = body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role: role || "USER", // Mặc định là USER
    },
  });

  return NextResponse.json(user);
}

// Cập nhật thông tin người dùng
export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }

  const body = await request.json();
  const { id, name, email, role } = body;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { name, email, role },
  });

  return NextResponse.json(updatedUser);
}

// Xóa người dùng
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.error();
  }

  const deletedUser = await prisma.user.delete({
    where: { id: params.id },
  });

  return NextResponse.json(deletedUser);
}

