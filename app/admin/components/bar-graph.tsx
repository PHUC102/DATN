// app/admin/components/bar-graph.tsx
"use client";

import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export type GraphPoint = { date: string; total: number };

export default function BarGraph({ data }: { data: GraphPoint[] }) {
  const labels = data.map((d) => d.date);
  const values = data.map((d) => d.total);

  const fmt = (n: number) => (n ?? 0).toLocaleString("vi-VN");

  const chartData = {
    labels,
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: values,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options: any = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (val: number) => fmt(Number(val)) },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => `Doanh thu: ${fmt(ctx.parsed.y)} VND`,
        },
      },
      legend: { display: false },
    },
  };

  return <Bar data={chartData} options={options} />;
}
