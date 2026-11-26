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
      <body className="text-slate-900 min-h-screen">
        <nav className="bg-gradient-to-r from-rose-900/95 via-red-800/95 to-emerald-900/95 backdrop-blur border-b border-amber-300/30 px-6 py-3.5 text-white shadow-md">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <Link href="/dashboard" className="font-bold text-lg text-amber-200 flex items-center gap-2">
              <span>🎄</span>
              <span>Finance Planner</span>
            </Link>
            <div className="flex items-center gap-5 text-sm font-medium text-white/90">
              <Link href="/dashboard" className="hover:text-amber-300 transition">Dashboard</Link>
              <Link href="/transactions" className="hover:text-amber-300 transition">Giao dịch</Link>
              <Link href="/wishlist" className="hover:text-amber-300 transition">Wishlist</Link>
              <Link href="/budgets" className="hover:text-amber-300 transition">Ngân sách</Link>
              <Link href="/login" className="text-amber-200 hover:text-white transition">Tài khoản</Link>
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