"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings } from "lucide-react";

const links = [
    { href: "/admin",          label: "Dashboard",   icon: LayoutDashboard, exact: true  },
    { href: "/admin/reports",  label: "Reports",     icon: FileText,        exact: false },
    { href: "/admin/settings", label: "Admin Access",icon: Settings,        exact: false },
];

export function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-1 flex-col gap-1 p-3">
            {links.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                    <Link
                        key={href}
                        href={href}
                        className={[
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                            active
                                ? "bg-teal-50 text-teal-700"
                                : "text-slate-700 hover:bg-slate-100",
                        ].join(" ")}
                    >
                        <Icon className={`size-4 ${active ? "text-teal-600" : "text-slate-400"}`} />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
