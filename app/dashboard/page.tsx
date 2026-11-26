import Link from "next/link";
import { formatVND } from "@/lib/finance";
import { buildMonthlyComparison } from "@/lib/monthly-report";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ExpensePieChart } from "@/components/expense-pie-chart";
import { MonthlyComparisonChart } from "@/components/monthly-comparison-chart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const startOfCurrentMonth = new Date(currentYear, now.getMonth(), 1);
  const twelveMonthsAgo = new Date(currentYear, now.getMonth() - 11, 1);

  const [
    thu,
    chi,
    theo,
    twelveMonthTxs,
    budgets,
    currentMonthExpenses,
    recentTransactions,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, type: "INCOME" },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, type: "EXPENSE" },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: { userId: user.id, type: "EXPENSE" },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: twelveMonthsAgo },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    }),
    prisma.categoryBudget.findMany({
      where: { userId: user.id },
      orderBy: { category: "asc" },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: startOfCurrentMonth },
      },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
  ]);

  const tongThu = thu._sum.amount ?? 0;
  const tongChi = chi._sum.amount ?? 0;
  const soDu = tongThu - tongChi;

  const chartData = theo.map((d) => ({
    name: d.category,
    value: d._sum.amount ?? 0,
  }));

  const monthlyData = buildMonthlyComparison(twelveMonthTxs, 12, now);

  const spentMap = new Map<string, number>();
  for (const item of currentMonthExpenses) {
    spentMap.set(item.category, item._sum.amount ?? 0);
  }

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tổng quan tài chính
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Xin chào, {user.name} ({user.email})
          </p>
        </div>
        <Link
          href="/transactions"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
        >
          + Thêm giao dịch
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Tổng thu nhập
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {formatVND(tongThu)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Tổng chi tiêu
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            {formatVND(tongChi)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Số dư hiện tại
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatVND(soDu)}
          </p>
        </div>
      </div>

      {/* Main Comparison Bar Chart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Báo cáo so sánh thu chi & Xu hướng
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi biến động dòng tiền theo chu kỳ 3, 6 hoặc 12 tháng
          </p>
        </div>
        <MonthlyComparisonChart data={monthlyData} />
      </div>

      {/* Category Breakdown & Monthly Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Phân loại chi tiêu
          </h2>
          <ExpensePieChart data={chartData} />
          <div className="mt-4 border-t border-slate-100 pt-3">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="py-2 font-medium">Danh mục</th>
                  <th className="py-2 text-right font-medium">Tổng chi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {theo.map((d) => (
                  <tr key={d.category}>
                    <td className="py-2.5 font-medium text-slate-700">
                      {d.category}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">
                      {formatVND(d._sum.amount ?? 0)}
                    </td>
                  </tr>
                ))}
                {theo.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-slate-400">
                      Chưa có dữ liệu chi tiêu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Ngân sách tháng {currentMonth}/{currentYear}
                </h2>
                <p className="text-xs text-slate-500">
                  Tiến độ sử dụng hạn mức theo danh mục
                </p>
              </div>
              <Link
                href="/budgets"
                className="text-xs font-medium text-slate-900 hover:underline"
              >
                Quản lý →
              </Link>
            </div>

            {budgets.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Chưa thiết lập ngân sách cho tháng này.
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((b) => {
                  const spent = spentMap.get(b.category) ?? 0;
                  const percent =
                    b.limit > 0
                      ? Math.min(Math.round((spent / b.limit) * 100), 100)
                      : 0;
                  const isOver = spent > b.limit;

                  return (
                    <div key={b.id} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-800">
                          {b.category}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            isOver ? "text-rose-600" : "text-slate-600"
                          }`}
                        >
                          {formatVND(spent)} / {formatVND(b.limit)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? "bg-rose-500" : "bg-slate-900"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Giao dịch gần đây
          </h2>
          <Link
            href="/transactions"
            className="text-xs font-medium text-slate-900 hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="py-2.5 font-medium">Ngày</th>
                <th className="py-2.5 font-medium">Danh mục</th>
                <th className="py-2.5 font-medium">Mô tả</th>
                <th className="py-2.5 text-right font-medium">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80">
                  <td className="py-3 text-slate-600 whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">
                    {tx.description || "—"}
                  </td>
                  <td
                    className={`py-3 text-right font-semibold whitespace-nowrap ${
                      tx.type === "INCOME"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}
                    {formatVND(tx.amount)}
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    Chưa có giao dịch nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}