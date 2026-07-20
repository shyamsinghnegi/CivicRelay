"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, CheckCircle2, Wrench, CircleDot, XCircle, Eye } from "lucide-react";

type Stats = {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
};

const statusMeta: { key: string; label: string; icon: React.ElementType; color: string }[] = [
    { key: "submitted",   label: "Submitted",    icon: CircleDot,    color: "text-slate-500"  },
    { key: "acknowledged",label: "Acknowledged", icon: Eye,          color: "text-blue-600"   },
    { key: "progress",    label: "In Progress",  icon: Wrench,       color: "text-amber-600"  },
    { key: "resolved",    label: "Resolved",     icon: CheckCircle2, color: "text-teal-600"   },
    { key: "rejected",    label: "Rejected",     icon: XCircle,      color: "text-red-500"    },
];

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then((r) => r.json())
            .then((data) => { setStats(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="mt-1 text-sm text-slate-500">Overview of all civic reports.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
                    ))}
                </div>
            ) : stats ? (
                <>
                    {/* Total */}
                    <div className="mb-6 flex items-center gap-4 rounded-2xl bg-teal-600 px-6 py-5 text-white">
                        <FileText className="size-8 opacity-80" />
                        <div>
                            <p className="text-sm font-medium opacity-80">Total Reports</p>
                            <p className="text-4xl font-bold">{stats.total}</p>
                        </div>
                        <Link
                            href="/admin/reports"
                            className="ml-auto rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30 transition-colors"
                        >
                            View all →
                        </Link>
                    </div>

                    {/* By status */}
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">By Status</h2>
                    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {statusMeta.map(({ key, label, icon: Icon, color }) => (
                            <Link
                                key={key}
                                href={`/admin/reports?status=${key}`}
                                className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <Icon className={`size-5 ${color}`} />
                                <p className="text-2xl font-bold text-slate-900">{stats.byStatus[key] ?? 0}</p>
                                <p className="text-xs font-medium text-slate-500">{label}</p>
                            </Link>
                        ))}
                    </div>

                    {/* By category */}
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">By Category</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {Object.entries(stats.byCategory)
                            .sort((a, b) => b[1] - a[1])
                            .map(([cat, count]) => (
                                <Link
                                    key={cat}
                                    href={`/admin/reports?category=${cat}`}
                                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <span className="text-sm font-medium capitalize text-slate-700">{cat}</span>
                                    <span className="text-sm font-bold text-teal-600">{count}</span>
                                </Link>
                            ))}
                    </div>
                </>
            ) : (
                <p className="text-sm text-slate-400">Failed to load stats.</p>
            )}
        </div>
    );
}
