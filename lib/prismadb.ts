import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Khởi tạo Prisma Client (dùng lại nếu có)
const client = globalThis.prisma || new PrismaClient();

// Trong môi trường development, lưu instance vào global để tránh tạo nhiều kết nối
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = client;
}

export default client;
