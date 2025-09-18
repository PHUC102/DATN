// app/api/rating/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getCurrentUser } from "@/actions/get-current-user";

/** chuẩn hoá trạng thái, không phân biệt hoa/thường */
function isPaid(status?: string | null) {
  if (!status) return false;
  const s = status.toString().trim().toLowerCase();
  return s === "paid" || s === "succeeded" || s === "complete" || s === "completed" || s === "success";
}
function isDelivered(deliveryStatus?: string | null) {
  if (!deliveryStatus) return false;
  return deliveryStatus.toString().trim().toLowerCase() === "delivered";
}

/** GET /api/rating?productId=... → lấy danh sách review của 1 sản phẩm */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdDate: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(reviews, { status: 200 });
  } catch (err) {
    console.error("[GET /api/rating] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** POST /api/rating
 *  body: { productId: string, rating: number(1..5), comment?: string }
 */
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const productId = (body?.productId ?? "").toString().trim();
    const ratingRaw = body?.rating;
    const comment = (body?.comment ?? "").toString();

    if (!productId || ratingRaw === undefined) {
      return NextResponse.json({ error: "Thiếu productId hoặc rating" }, { status: 400 });
    }

    const rating = typeof ratingRaw === "string" ? parseInt(ratingRaw, 10) : ratingRaw;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating phải là số nguyên từ 1 đến 5" }, { status: 400 });
    }

    // Sản phẩm có tồn tại không?
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });

    // Đã đánh giá sản phẩm này trước đó chưa?
    const existed = await prisma.review.findFirst({
      where: { productId, userId: currentUser.id },
      select: { id: true },
    });
    if (existed) {
      return NextResponse.json({ error: "Bạn đã đánh giá sản phẩm này rồi" }, { status: 400 });
    }

    // Có đơn hàng chứa sản phẩm này, đã giao & đã thanh toán chưa?
    // (Lấy tất cả đơn của user rồi lọc mềm bằng JS để không bị lệch hoa/thường)
    const orders = await prisma.order.findMany({
      where: { userId: currentUser.id },
      select: { id: true, products: true, deliveryStatus: true, status: true },
    });

    const eligible = orders.some((o) => {
      const hasProduct =
        Array.isArray(o.products) && o.products.some((p: any) => p?.id === productId);
      return hasProduct && isDelivered(o.deliveryStatus) && isPaid(o.status);
    });

    if (!eligible) {
      return NextResponse.json(
        { error: "Chỉ được đánh giá sản phẩm bạn đã nhận hàng (đã giao) và đã thanh toán." },
        { status: 403 }
      );
    }

    // Tạo review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: currentUser.id,
        rating,
        comment,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error("[POST /api/rating] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
