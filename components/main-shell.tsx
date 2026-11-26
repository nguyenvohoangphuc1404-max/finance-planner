"use client";

import { usePathname } from "next/navigation";

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div
      className={
        isAuthPage
          ? "min-h-screen flex flex-col bg-[#0b1120]"
          : "md:pl-64 min-h-screen flex flex-col bg-[#0b1120]"
      }
    >
      <div className="flex-1">{children}</div>
    </div>
  );
}