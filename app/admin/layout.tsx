import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import { Logo } from "../components/Logo";
import { isAdmin } from "../lib/admin";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession();
    if (!session?.user?.email || !await isAdmin(session.user.email)) {
        redirect("/");
    }

    const user = session.user;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100">
            {/* Sidebar */}
            <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                    <Logo showWordmark={false} />
                    <span className="text-sm font-bold text-slate-900">CivicRelay</span>
                    <span className="ml-auto rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-700">Admin</span>
                </div>

                <AdminNav />

                {/* User profile */}
                <div className="border-t border-slate-100 p-3">
                    <div className="mb-1 flex items-center gap-2.5 rounded-xl px-3 py-2">
                        {user.image ? (
                            <img src={user.image} alt={user.name ?? ""} className="size-7 rounded-full object-cover" />
                        ) : (
                            <div className="flex size-7 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                                {user.name?.charAt(0) ?? user.email?.charAt(0) ?? "?"}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-800">{user.name ?? "Admin"}</p>
                            <p className="truncate text-[10px] text-slate-400">{user.email}</p>
                        </div>
                    </div>
                    <a
                        href="/api/auth/signout"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <LogOut className="size-4" />
                        Sign out
                    </a>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {children}
            </main>
        </div>
    );
}
