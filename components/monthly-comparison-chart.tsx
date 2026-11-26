"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatVND } from "@/lib/finance";
import {
  MonthlySummaryItem,
  SpendingTrendResult,
} from "@/lib/monthly-report";

interface MonthlyComparisonChartProps {
  data: MonthlySummaryItem[];
  trend: SpendingTrendResult;
}

export function MonthlyComparisonChart({
  data,
  trend,
}: MonthlyComparisonChartProps) {
  const trendText =
    trend.direction === "up"
      ? `Chi tiêu tháng này tăng ${Math.abs(trend.diffPercent)}% (+${formatVND(trend.diffAmount)}) so với tháng trước`
      : trend.direction === "down"
      ? `Chi tiêu tháng này giảm ${Math.abs(trend.diffPercent)}% (-${formatVND(Math.abs(trend.diffAmount))}) so với tháng trước`
      : "Chi tiêu tháng này tương đương tháng trước";

  const trendBadgeClass =
    trend.direction === "up"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : trend.direction === "down"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div className="space-y-4">
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium ${trendBadgeClass}`}
      >
        {trendText}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
            />
            <Tooltip
              formatter={(value) => formatVND(Number(value ?? 0))}
            />
            <Legend />
            <Bar
              dataKey="income"
              name="Thu nhập"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              name="Chi tiêu"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bảng dữ liệu thay thế cho trình đọc màn hình (Accessibility) */}
      <table className="sr-only">
        <caption>Báo cáo so sánh thu chi 6 tháng gần nhất</caption>
        <thead>
          <tr>
            <th>Tháng</th>
            <th>Thu nhập</th>
            <th>Chi tiêu</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.monthKey}>
              <td>{row.label}</td>
              <td>{formatVND(row.income)}</td>
              <td>{formatVND(row.expense)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}