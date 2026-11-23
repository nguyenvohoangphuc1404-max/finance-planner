import { prisma } from "@/lib/prisma";
import { formatVND, getDateRange } from "@/lib/finance";
import { transactionFilterSchema } from "@/lib/validation";
import { requireUser } from "@/lib/session";
import { TransactionForm } from "./transaction-form";
import { TransactionFilters } from "./transaction-filters";
import { deleteTransaction } from "./actions";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const filter = transactionFilterSchema
    .catch({ range: "this-month" })
    .parse(await searchParams);

  const rows = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: getDateRange(filter.range),
      type: filter.type,
      category: filter.category,
    },
    orderBy: { date: "desc" },
  });

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 h-fit">
          <h2 className="font-bold mb-3">Thêm giao dịch mới</h2>
          <TransactionForm />
        </div>
        <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <TransactionFilters {...filter} />
          <p className="text-sm text-slate-500">Tìm thấy {rows.length} giao dịch</p>
          <ul className="divide-y divide-slate-100">
            {rows.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{t.description}</p>
                  <p className="text-xs text-slate-500">
                    {t.category} • {new Date(t.date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold text-sm ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                    {t.type === "INCOME" ? "+" : "-"}{formatVND(t.amount)}
                  </span>
                  <form action={deleteTransaction.bind(null, t.id)}>
                    <button type="submit" className="text-xs text-slate-400 hover:text-rose-600 cursor-pointer">
                      Xóa
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}