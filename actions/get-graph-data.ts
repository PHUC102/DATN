import prisma from "@/lib/prismadb";
import moment from "moment";

export default async function getGraphData() {
  try {
    const startDate = moment().subtract(6, "days").startOf("day");
    const endDate = moment().endOf("days");

    const result = await prisma.order.groupBy({
      by: ["createdDate"],
      where: {
        createdDate: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
        status: "complete",
      },
      _sum: {
        amount: true,
      },
    });

    const aggregateData: {
      [day: string]: { day: string; date: string; totalAmount: number };
    } = {};

    const currentDate = startDate.clone();

    while (currentDate <= endDate) {
      const day = currentDate.format("dddd");
      aggregateData[day] = {
        day,
        date: currentDate.format("YYYY-MM-DD"),
        totalAmount: 0,
      };

      currentDate.add(1, "day");
    }

    result.forEach((entry) => {
      const day = moment(entry.createdDate).format("dddd");
      const amount = entry._sum.amount || 0;
      aggregateData[day].totalAmount += amount / 100;
    });

    const formattedDate = Object.values(aggregateData).sort((a, b) =>
      moment(a.date).diff(moment(b.date))
    );

    return formattedDate;
  } catch (error: any) {
    throw new Error(error);
  }
}
