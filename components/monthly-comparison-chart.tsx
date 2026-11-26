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

  const filteredData = useMemo(() => {
    return data.slice(-range);
  }, [data, range]);

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
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : trend.direction === "down"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium ${trendBadgeClass}`}
        >
          {trendText}
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
          {([3, 6, 12] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setRange(m)}
              className={`px-2.5 py-1 rounded-md transition ${
                range === m
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#475569" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#475569" }}
              tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
            />
            <Tooltip formatter={(value) => formatVND(Number(value ?? 0))} />
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
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
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