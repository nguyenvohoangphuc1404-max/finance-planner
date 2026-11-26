import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
// @ts-ignore
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Planner — PHY10615",
  description: "Ứng dụng quản lý thu chi, ngân sách và mục tiêu tiết kiệm",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        <AppSidebar />
        <div className="md:pl-64 min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}