"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatVND } from "@/lib/finance";

interface ExpensePieChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-sm text-slate-500 border border-dashed border-slate-700 rounded-xl">
        Chưa có dữ liệu chi tiêu để hiển thị biểu đồ
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#151e32"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "12px",
              color: "#f8fafc",
            }}
            formatter={(value) => formatVND(Number(value ?? 0))}
          />
          <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ExpensePieChart;