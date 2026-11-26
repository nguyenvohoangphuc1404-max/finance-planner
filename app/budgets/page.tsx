import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { upsertBudget } from "./actions";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { value: "FOOD", label: "Ăn uống (FOOD)" },
  { value: "TRANSPORT", label: "Di chuyển (TRANSPORT)" },
  { value: "STUDY", label: "Học tập (STUDY)" },
  { value: "ENTERTAINMENT", label: "Giải trí (ENTERTAINMENT)" },
  { value: "SHOPPING", label: "Mua sắm (SHOPPING)" },
  { value: "BILLS", label: "Hóa đơn (BILLS)" },
  { value: "OTHER", label: "Khác (OTHER)" },
];

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
);

export default async function BudgetsPage() {
  const user = await requireUser();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [budgets, expenses] = await Promise.all([
    prisma.categoryBudget.findMany({
      where: { userId: user.id },
      orderBy: { category: "asc" },
    }),
    prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
  ]);

  const spentByCategory = expenses.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});

  async function deleteBudget(formData: FormData) {
    "use server";
    const currentUser = await requireUser();
    const id = String(formData.get("id") || "");
    if (!id) return;

    await prisma.categoryBudget.deleteMany({
      where: { id, userId: currentUser.id },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Ngân sách tháng {now.getMonth() + 1}/{now.getFullYear()}
        </h1>
        <p className="text-sm text-slate-400">
          Thiết lập hạn mức chi tiêu theo từng danh mục để kiểm soát dòng tiền
        </p>
      </div>

      <form
        action={upsertBudget}
        className="p-4 border border-slate-800 rounded-xl bg-white text-slate-900 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
      >
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">
            Danh mục
          </label>
          <select
            name="category"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
            required
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">
            Hạn mức (VNĐ)
          </label>
          <input
            type="number"
            name="limit"
            min={1000}
            step={1000}
            placeholder="Ví dụ: 1500000"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-500 transition cursor-pointer"
        >
          Lưu hạn mức
        </button>
      </form>

      <div className="space-y-4">
        {budgets.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8 border border-slate-800 rounded-xl">
            Chưa có ngân sách nào. Hãy thiết lập hạn mức ở biểu mẫu phía trên.
          </p>
        ) : (
          budgets.map((b) => {
            const limitVal = Number(b.limit);
            const spent = spentByCategory[b.category] || 0;
            const percent =
              limitVal > 0 ? Math.min(Math.round((spent / limitVal) * 100), 100) : 0;
            const rawPercent =
              limitVal > 0 ? Math.round((spent / limitVal) * 100) : 0;

            let barColor = "bg-emerald-500";
            let statusText = "An toàn";
            if (rawPercent >= 100) {
              barColor = "bg-red-500";
              statusText = "Vượt hạn mức!";
            } else if (rawPercent >= 80) {
              barColor = "bg-amber-500";
              statusText = "Sắp chạm trần (≥ 80%)";
            }

            return (
              <div
                key={b.id}
                className="p-4 border border-slate-200 rounded-xl bg-white text-slate-900 shadow-sm space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-900">
                      {CATEGORY_LABELS[b.category] || b.category}
                    </span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {statusText} ({rawPercent}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-800">
                      <strong>{spent.toLocaleString("vi-VN")} đ</strong> /{" "}
                      {limitVal.toLocaleString("vi-VN")} đ
                    </span>
                    <form action={deleteBudget}>
                      <input type="hidden" name="id" value={b.id} />
                      <button
                        type="submit"
                        className="text-xs text-red-600 hover:underline border-0 p-0 cursor-pointer"
                      >
                        Xóa
                      </button>
                    </form>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}