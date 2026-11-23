import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { upsertBudget } from "./actions";

const CATEGORIES = [
  "Ăn uống",
  "Di chuyển",
  "Học tập",
  "Giải trí",
  "Mua sắm",
  "Hóa đơn",
  "Khác",
];

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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Ngân sách tháng {now.getMonth() + 1}/{now.getFullYear()}
        </h1>
        <p className="text-sm text-gray-500">
          Thiết lập hạn mức chi tiêu theo từng danh mục để kiểm soát dòng tiền
        </p>
      </div>

      <form
        action={upsertBudget}
        className="p-4 border rounded-xl bg-white shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Danh mục</label>
          <select
            name="category"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hạn mức (VNĐ)</label>
          <input
            type="number"
            name="limit"
            min={1000}
            step={1000}
            placeholder="Ví dụ: 1500000"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800"
        >
          Lưu hạn mức
        </button>
      </form>

      <div className="space-y-4">
        {budgets.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8 border rounded-xl">
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
                className="p-4 border rounded-xl bg-white shadow-sm space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{b.category}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100">
                      {statusText} ({rawPercent}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      <strong>{spent.toLocaleString("vi-VN")} đ</strong> /{" "}
                      {limitVal.toLocaleString("vi-VN")} đ
                    </span>
                    <form action={deleteBudget}>
                      <input type="hidden" name="id" value={b.id} />
                      <button
                        type="submit"
                        className="text-xs text-red-600 hover:underline"
                      >
                        Xóa
                      </button>
                    </form>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
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