// actions/get-graph-data.ts
import prisma from "@/lib/prismadb";
import moment from "moment-timezone";

export type GraphPoint = { date: string; total: number };

const TZ = "Asia/Ho_Chi_Minh";
const PAID = ["complete", "completed", "succeeded", "paid"]; // chuẩn chữ thường

export default async function getGraphData(): Promise<GraphPoint[]> {
  const end = moment().tz(TZ).endOf("day");
  const start = end.clone().subtract(6, "days").startOf("day");

  // lấy tất cả order trong 7 ngày
  const orders = await prisma.order.findMany({
    where: {
      createdDate: { gte: start.toDate(), lte: end.toDate() },
    },
    select: { createdDate: true, amount: true, status: true },
  });

  // seed 7 ngày mặc định
  const buckets: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = start.clone().add(i, "days");
    buckets[d.format("YYYY-MM-DD")] = 0;
  }

  // lọc & cộng tiền
  for (const o of orders) {
    if (!PAID.includes(o.status.toLowerCase())) continue; // lọc status an toàn
    const key = moment(o.createdDate).tz(TZ).format("YYYY-MM-DD");
    const amt =
      typeof o.amount === "number" ? o.amount : parseFloat(String(o.amount));
    if (!isNaN(amt)) {
      buckets[key] = (buckets[key] ?? 0) + amt;
    }
  }

  return Object.entries(buckets).map(([date, total]) => ({ date, total }));
}
