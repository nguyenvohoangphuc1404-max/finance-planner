import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { MainShell } from "@/components/main-shell";
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
      <body className="bg-[#0b1120] text-slate-100 min-h-screen antialiased">
        <AppSidebar />
        <MainShell>{children}</MainShell>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}