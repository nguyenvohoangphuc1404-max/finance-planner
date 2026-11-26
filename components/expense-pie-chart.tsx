"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatVND } from "@/lib/finance";

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#64748b"];

export function ExpensePieChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-400 py-8 text-center">Chưa có dữ liệu chi tiêu để vẽ biểu đồ.</p>;
  }

  return (
    <div className="w-full">
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val) => formatVND(Number(val ?? 0))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bảng số liệu thay thế cho trình đọc màn hình (Accessibility) */}
      <table className="sr-only">
        <caption>Tỉ lệ chi tiêu theo danh mục trong tháng hiện tại</caption>
        <thead>
          <tr>
            <th>Danh mục</th>
            <th>Số tiền</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{formatVND(item.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}