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

interface BarGraphProps {
  data: GraphData[];
}

type GraphData = {
  day: string;
  date: string;
  totalAmount: number;
};

export const BarGraph: React.FC<BarGraphProps> = ({ data }) => {
  const labels = data.map((item) => item.date);
  const amounts = data.map((item) => item.totalAmount * 100);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Doanh thu (Ngày)",
        data: amounts,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};
