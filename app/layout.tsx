import { ChristmasTheme } from "@/components/christmas-theme";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import Link from "next/link";
// @ts-ignore
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Planner — PHY10615",
  description: "Ứng dụng quản lý thu chi, ngân sách và mục tiêu tiết kiệm",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <nav className="bg-white border-b border-slate-200 px-6 py-3">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <Link href="/dashboard" className="font-bold text-lg text-slate-900">
              Finance Planner
            </Link>
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/dashboard" className="hover:text-emerald-600">Dashboard</Link>
              <Link href="/transactions" className="hover:text-emerald-600">Giao dịch</Link>
              <Link href="/wishlist" className="hover:text-emerald-600">Wishlist</Link>
              <Link href="/budgets" className="hover:text-emerald-600">Ngân sách</Link>
              <Link href="/login" className="text-slate-500 hover:text-rose-600">Tài khoản</Link>
            </div>
          </div>
        </nav>
        {children}
      <Toaster richColors position="top-right" />
      <ChristmasTheme />
    </body>
  </html>
  );
}