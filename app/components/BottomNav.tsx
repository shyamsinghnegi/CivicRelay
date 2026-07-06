"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, FileText, Bell } from "lucide-react";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/nearby", icon: List, label: "Nearby" },
  { href: "/my-reports", icon: FileText, label: "My Reports" },
  { href: "/notifications", icon: Bell, label: "Alerts" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 flex w-full border-t border-slate-200 bg-white">
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-3"
          >
            <Icon
              className={`size-5 ${active ? "text-teal-700" : "text-slate-400"}`}
            />
            <span
              className={`text-[10px] font-medium ${active ? "text-teal-700" : "text-slate-400"}`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
