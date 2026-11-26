import { formatVND } from "@/lib/finance";
import {
  buildMonthlyComparison,
  calculateSpendingTrend,
} from "@/lib/monthly-report";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ExpensePieChart } from "@/components/expense-pie-chart";
import { MonthlyComparisonChart } from "@/components/monthly-comparison-chart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [thu, chi, theo, recentTransactions] = await Promise.all([
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
        date: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    }),
  ]);

  const soDu = (thu._sum.amount ?? 0) - (chi._sum.amount ?? 0);
  const chartData = theo.map((d) => ({
    name: d.category,
    value: d._sum.amount ?? 0,
  }));

  const monthlyData = buildMonthlyComparison(recentTransactions, 6);
  const spendingTrend = calculateSpendingTrend(monthlyData);

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="p-5 rounded-2xl bg-white/95 shadow-lg border border-slate-200/70">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Xin chào, {user.name} ({user.email})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/95 shadow-lg border border-slate-200/70">
          <p className="text-sm text-slate-500">Tổng thu</p>
          <p className="text-xl font-bold text-emerald-600">
            {formatVND(thu._sum.amount ?? 0)}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white/95 shadow-lg border border-slate-200/70">
          <p className="text-sm text-slate-500">Tổng chi</p>
          <p className="text-xl font-bold text-rose-600">
            {formatVND(chi._sum.amount ?? 0)}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white/95 shadow-lg border border-slate-200/70">
          <p className="text-sm text-slate-500">Số dư hiện tại</p>
          <p className="text-xl font-bold text-slate-900">{formatVND(soDu)}</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-white/95 shadow-lg border border-slate-200/70">
        <h2 className="font-semibold mb-3 text-slate-900">
          Báo cáo so sánh thu chi 6 tháng & Xu hướng chi tiêu
        </h2>
        <MonthlyComparisonChart data={monthlyData} trend={spendingTrend} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white/95 shadow-lg border border-slate-200/70">
          <h2 className="font-semibold mb-2 text-slate-900">
            Biểu đồ tỉ lệ chi tiêu
          </h2>
          <ExpensePieChart data={chartData} />
        </div>

        <div className="p-5 rounded-2xl bg-white/95 shadow-lg border border-slate-200/70">
          <h2 className="font-semibold mb-3 text-slate-900">
            Bảng chi tiêu theo danh mục
          </h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2">Danh mục</th>
                <th className="py-2 text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {theo.map((d) => (
                <tr key={d.category}>
                  <td className="py-2 font-medium">{d.category}</td>
                  <td className="py-2 text-right">
                    {formatVND(d._sum.amount ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}