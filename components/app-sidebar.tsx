"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  PiggyBank,
  UserCircle,
  Wallet,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Giao dịch", icon: ArrowLeftRight },
  { href: "/budgets", label: "Ngân sách", icon: PiggyBank },
  { href: "/wishlist", label: "Wishlist", icon: Target },
  { href: "/login", label: "Tài khoản", icon: UserCircle },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#151e32] text-slate-100 border-r border-slate-800/80">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block">
              Finance Planner
            </span>
            <span className="text-[11px] text-slate-400 block">
              Personal Fintech
            </span>
          </div>
        </div>

        <div className="px-6 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </div>

        <nav className="flex-1 px-3 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 text-xs text-slate-500">
          PHY10615 • v1.0
        </div>
      </aside>

      <header className="md:hidden bg-[#151e32] text-white px-4 py-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-base flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            Finance Planner
          </span>
        </div>
        <nav className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}