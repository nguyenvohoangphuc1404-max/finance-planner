import { formatVND } from "@/lib/finance";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  const [thu, chi, theo] = await Promise.all([
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
  ]);

  const soDu = (thu._sum.amount ?? 0) - (chi._sum.amount ?? 0);

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-500">Xin chào, {user.name} ({user.email})</p>
        </div>
        <Link
          href="/transactions"
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Quản lý giao dịch →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl bg-white">
          <p className="text-sm text-slate-500">Tổng thu</p>
          <p className="text-xl font-bold text-emerald-600">{formatVND(thu._sum.amount ?? 0)}</p>
        </div>
        <div className="p-4 border rounded-xl bg-white">
          <p className="text-sm text-slate-500">Tổng chi</p>
          <p className="text-xl font-bold text-rose-600">{formatVND(chi._sum.amount ?? 0)}</p>
        </div>
        <div className="p-4 border rounded-xl bg-white">
          <p className="text-sm text-slate-500">Số dư hiện tại</p>
          <p className="text-xl font-bold">{formatVND(soDu)}</p>
        </div>
      </div>

      <div className="p-4 border rounded-xl bg-white">
        <h2 className="font-semibold mb-2">Chi tiêu theo danh mục</h2>
        <ul className="space-y-1 text-sm">
          {theo.map((d) => (
            <li key={d.category} className="flex justify-between">
              <span>{d.category}</span>
              <span className="font-medium">{formatVND(d._sum.amount ?? 0)}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}