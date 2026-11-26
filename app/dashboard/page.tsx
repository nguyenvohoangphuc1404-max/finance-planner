import Link from "next/link";
import { formatVND } from "@/lib/finance";
import { buildMonthlyComparison } from "@/lib/monthly-report";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import ExpensePieChart from "@/components/expense-pie-chart";
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
    <main className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Xin chào, {user.name}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Chào mừng quay trở lại bảng điều khiển tài chính
          </p>
        </div>
        <Link
          href="/transactions"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition shadow-md shadow-blue-600/20"
        >
          + Thêm giao dịch
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#151e32] border border-slate-800/80 shadow-lg">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Số dư hiện tại
          </p>
          <p className="text-2xl font-bold text-white mt-2">
            {formatVND(soDu)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#151e32] border border-slate-800/80 shadow-lg">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Tổng thu nhập
          </p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {formatVND(tongThu)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#151e32] border border-slate-800/80 shadow-lg">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Tổng chi tiêu
          </p>
          <p className="text-2xl font-bold text-rose-400 mt-2">
            {formatVND(tongChi)}
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#151e32] border border-slate-800/80 shadow-lg">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white">
            Báo cáo so sánh thu chi & Xu hướng
          </h2>
          <p className="text-xs text-slate-400">
            Theo dõi biến động dòng tiền theo chu kỳ 3, 6 hoặc 12 tháng
          </p>
        </div>
        <MonthlyComparisonChart data={monthlyData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#151e32] border border-slate-800/80 shadow-lg">
          <h2 className="text-base font-semibold text-white mb-3">
            Phân loại chi tiêu
          </h2>
          <ExpensePieChart data={chartData} />
          <div className="mt-4 border-t border-slate-800 pt-3">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-800">
                  <th className="py-2 font-medium">Danh mục</th>
                  <th className="py-2 text-right font-medium">Tổng chi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {theo.map((d) => (
                  <tr key={d.category}>
                    <td className="py-2.5 font-medium text-slate-200">
                      {d.category}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-white">
                      {formatVND(d._sum.amount ?? 0)}
                    </td>
                  </tr>
                ))}
                {theo.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-slate-500">
                      Chưa có dữ liệu chi tiêu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#151e32] border border-slate-800/80 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Ngân sách tháng {currentMonth}/{currentYear}
                </h2>
                <p className="text-xs text-slate-400">
                  Tiến độ sử dụng hạn mức theo danh mục
                </p>
              </div>
              <Link
                href="/budgets"
                className="text-xs font-medium text-blue-400 hover:text-blue-300"
              >
                Quản lý →
              </Link>
            </div>

            {budgets.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500 border border-dashed border-slate-700 rounded-xl">
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
                        <span className="font-medium text-slate-200">
                          {b.category}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            isOver ? "text-rose-400" : "text-slate-300"
                          }`}
                        >
                          {formatVND(spent)} / {formatVND(b.limit)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? "bg-rose-500" : "bg-blue-500"
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

      <div className="p-6 rounded-2xl bg-[#151e32] border border-slate-800/80 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">
            Giao dịch gần đây
          </h2>
          <Link
            href="/transactions"
            className="text-xs font-medium text-blue-400 hover:text-blue-300"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="py-2.5 font-medium">Ngày</th>
                <th className="py-2.5 font-medium">Danh mục</th>
                <th className="py-2.5 font-medium">Mô tả</th>
                <th className="py-2.5 text-right font-medium">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40">
                  <td className="py-3 text-slate-300 whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-blue-300 border border-slate-700">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">
                    {tx.description || "—"}
                  </td>
                  <td
                    className={`py-3 text-right font-semibold whitespace-nowrap ${
                      tx.type === "INCOME"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}
                    {formatVND(tx.amount)}
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
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