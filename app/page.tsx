import { getDashboardData, addTransaction, deleteTransaction } from "./actions";

export default async function Home() {
  const { categories, transactions } = await getDashboardData();

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatVND = (num: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

  // Tính tiến độ ngân sách theo từng danh mục chi tiêu
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Finance Planner</h1>
            <p className="text-sm text-slate-500">Quản lý thu chi & ngân sách cá nhân</p>
          </div>
          <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full w-fit">
            Đã kết nối Neon PostgreSQL
          </span>
        </header>

        {/* 3 Thẻ tổng quan */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Số dư hiện tại</p>
            <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? "text-slate-900" : "text-rose-600"}`}>
              {formatVND(balance)}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Tổng thu nhập</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">+{formatVND(totalIncome)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Tổng chi tiêu</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">-{formatVND(totalExpense)}</p>
          </div>
        </section>

        {/* Form thêm giao dịch & Theo dõi ngân sách */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Form nhập */}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h2 className="font-semibold text-lg mb-4">Ghi chép giao dịch mới</h2>
            <form action={addTransaction} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Loại giao dịch</label>
                <select
                  name="type"
                  defaultValue="EXPENSE"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="EXPENSE">Chi tiêu (-)</option>
                  <option value="INCOME">Thu nhập (+)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Số tiền (VNĐ)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1000"
                  step="1000"
                  placeholder="Ví dụ: 35000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Danh mục</label>
                <select
                  name="categoryId"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type === "INCOME" ? "Thu" : "Chi"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ngày</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú</label>
                <input
                  type="text"
                  name="note"
                  placeholder="Cơm gà xé, cà phê đen..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer"
              >
                + Lưu giao dịch
              </button>
            </form>
          </section>

          {/* Cột phải: Ngân sách & Lịch sử giao dịch */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thanh tiến độ ngân sách */}
            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Hạn mức chi tiêu theo danh mục</h2>
              <div className="space-y-4">
                {expenseCategories.map((cat) => {
                  const spent = transactions
                    .filter((t) => t.categoryId === cat.id && t.type === "EXPENSE")
                    .reduce((sum, t) => sum + t.amount, 0);
                  const limit = cat.budgetLimit || 1000000;
                  const percent = Math.min(Math.round((spent / limit) * 100), 100);
                  const isOver = spent > limit;

                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{cat.name}</span>
                        <span className={isOver ? "text-rose-600 font-semibold" : "text-slate-600"}>
                          {formatVND(spent)} / {formatVND(limit)} ({Math.round((spent / limit) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOver ? "bg-rose-500" : percent >= 80 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Danh sách giao dịch */}
            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Lịch sử giao dịch gần đây</h2>
              {transactions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  Chưa có giao dịch nào. Hãy nhập thử một khoản ở khung bên trái!
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm text-slate-900">
                          {t.note || t.category.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t.category.name} • {new Date(t.date).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-semibold text-sm ${
                            t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {t.type === "INCOME" ? "+" : "-"}
                          {formatVND(t.amount)}
                        </span>
                        <form action={deleteTransaction.bind(null, t.id)}>
                          <button
                            type="submit"
                            className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1 rounded cursor-pointer"
                            title="Xóa giao dịch"
                          >
                            Xóa
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}