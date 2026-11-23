import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatVND, wishlistProgress } from "@/lib/finance";
import { addWishlistItem, deleteWishlistItem } from "./actions";

export default async function WishlistPage() {
  const user = await requireUser();

  const [thu, chi, items] = await Promise.all([
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { userId: user.id, type: "INCOME" } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { userId: user.id, type: "EXPENSE" } }),
    prisma.wishlistItem.findMany({ where: { userId: user.id }, orderBy: { cost: "asc" } }),
  ]);

  const balance = (thu._sum.amount ?? 0) - (chi._sum.amount ?? 0);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Mục tiêu mua sắm (Wishlist)</h1>
          <p className="text-sm text-slate-500">Số dư khả dụng hiện tại: <strong className="text-emerald-600">{formatVND(balance)}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form action={addWishlistItem} className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 h-fit">
          <h2 className="font-semibold">Thêm mục tiêu mới</h2>
          <input name="name" required placeholder="Tên món đồ (VD: Bàn phím cơ)" className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input name="cost" type="number" min="1000" required placeholder="Giá tiền (VND)" className="w-full border rounded-lg px-3 py-2 text-sm" />
          <select name="priority" defaultValue="MEDIUM" className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="HIGH">Ưu tiên Cao</option>
            <option value="MEDIUM">Ưu tiên Trung bình</option>
            <option value="LOW">Ưu tiên Thấp</option>
          </select>
          <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium cursor-pointer">
            + Thêm vào Wishlist
          </button>
        </form>

        <div className="md:col-span-2 space-y-4">
          {items.map((item) => {
            const pct = wishlistProgress(balance, item.cost);
            return (
              <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium mr-2">{item.priority}</span>
                    <span className="font-bold">{item.name}</span>
                    <p className="text-sm text-slate-500 mt-0.5">Mục tiêu: {formatVND(item.cost)} — Đạt <strong>{pct}%</strong></p>
                  </div>
                  <form action={deleteWishlistItem.bind(null, item.id)}>
                    <button type="submit" className="text-xs text-slate-400 hover:text-rose-600 cursor-pointer">Xóa</button>
                  </form>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${pct >= 100 ? "bg-emerald-500" : pct >= 75 ? "bg-blue-500" : pct >= 50 ? "bg-amber-500" : "bg-slate-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}