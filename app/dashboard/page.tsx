"use client";

import { useMemo, useState } from "react";
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
  calculateSpendingTrend,
} from "@/lib/monthly-report";

interface MonthlyComparisonChartProps {
  data: MonthlySummaryItem[];
}

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
  const [range, setRange] = useState<3 | 6 | 12>(6);

  const filteredData = useMemo(() => data.slice(-range), [data, range]);
  const trend = useMemo(
    () => calculateSpendingTrend(filteredData),
    [filteredData]
  );

  const trendText =
    trend.direction === "up"
      ? `Chi tiêu tháng này tăng ${Math.abs(trend.diffPercent)}% (+${formatVND(trend.diffAmount)}) so với tháng trước`
      : trend.direction === "down"
      ? `Chi tiêu tháng này giảm ${Math.abs(trend.diffPercent)}% (-${formatVND(Math.abs(trend.diffAmount))}) so với tháng trước`
      : "Chi tiêu tháng này tương đương tháng trước";

  const trendBadgeClass =
    trend.direction === "up"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
      : trend.direction === "down"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium ${trendBadgeClass}`}
        >
          {trendText}
        </div>

        <div className="inline-flex rounded-xl border border-slate-700/80 bg-[#0b1120] p-1 text-xs font-medium">
          {([3, 6, 12] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setRange(m)}
              className={`px-3 py-1 rounded-lg transition ${
                range === m
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {m} tháng
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#1e293b"
            />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
            />
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
            <Bar
              dataKey="income"
              name="Thu nhập"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="expense"
              name="Chi tiêu"
              fill="#f43f5e"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Báo cáo so sánh thu chi theo tháng</caption>
        <thead>
          <tr>
            <th>Tháng</th>
            <th>Thu nhập</th>
            <th>Chi tiêu</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
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