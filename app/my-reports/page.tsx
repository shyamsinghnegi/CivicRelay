"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReportCard } from "../components/ReportCard";
import type { Report } from "../lib/reports";
import type { ReportStatus } from "../lib/status";

type Filter = "all" | ReportStatus;

const filterLabels: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "submitted", label: "Submitted" },
    { key: "progress", label: "In progress" },
    { key: "resolved", label: "Resolved" },
];

export default function MyReportsPage() {
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("all");

    useEffect(() => {
        fetch("/api/reports/mine")
            .then((r) => {
                if (r.status === 401) { router.push("/auth/signin"); return null; }
                return r.json();
            })
            .then((data) => {
                if (data) setReports(data.items ?? []);
                setLoading(false);
            });
    }, [router]);

    const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

    const submitted = reports.filter((r) => r.status === "submitted").length;
    const inProgress = reports.filter((r) => r.status === "progress").length;
    const resolved = reports.filter((r) => r.status === "resolved").length;

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4">
                <Link
                    href="/"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"
                >
                    <ArrowLeft className="size-5 text-slate-700" />
                </Link>
                <h1 className="flex-1 text-base font-bold text-slate-900">My reports</h1>
                <Link
                    href="/report"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 shadow-sm"
                >
                    <Plus className="size-5 text-white" />
                </Link>
            </div>

            {/* Status summary strip */}
            <div className="mx-5 mb-4 grid grid-cols-3 gap-3">
                <button
                    onClick={() => setFilter("submitted")}
                    className={`flex flex-col items-center gap-1 rounded-2xl py-3 shadow-sm transition-all ${filter === "submitted" ? "bg-teal-600" : "bg-white"}`}
                >
                    <span className={`text-xl font-bold ${filter === "submitted" ? "text-white" : "text-slate-900"}`}>{submitted}</span>
                    <span className={`text-xs ${filter === "submitted" ? "text-teal-100" : "text-slate-500"}`}>Submitted</span>
                </button>
                <button
                    onClick={() => setFilter("progress")}
                    className={`flex flex-col items-center gap-1 rounded-2xl py-3 shadow-sm transition-all ${filter === "progress" ? "bg-teal-600" : "bg-white"}`}
                >
                    <span className={`text-xl font-bold ${filter === "progress" ? "text-white" : "text-teal-700"}`}>{inProgress}</span>
                    <span className={`text-xs ${filter === "progress" ? "text-teal-100" : "text-slate-500"}`}>In progress</span>
                </button>
                <button
                    onClick={() => setFilter("resolved")}
                    className={`flex flex-col items-center gap-1 rounded-2xl py-3 shadow-sm transition-all ${filter === "resolved" ? "bg-teal-600" : "bg-white"}`}
                >
                    <span className={`text-xl font-bold ${filter === "resolved" ? "text-white" : "text-slate-400"}`}>{resolved}</span>
                    <span className={`text-xs ${filter === "resolved" ? "text-teal-100" : "text-slate-500"}`}>Resolved</span>
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-none">
                {filterLabels.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                            filter === key
                                ? "bg-teal-600 text-white"
                                : "bg-white text-slate-600 shadow-sm"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Report list */}
            <div className="flex flex-col gap-3 px-5 pb-6">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 rounded-xl bg-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            {filter === "all"
                                ? "You haven't submitted any reports yet."
                                : `No ${filter === "progress" ? "in progress" : filter} reports.`}
                        </p>
                        {filter === "all" && (
                            <Link href="/report" className="mt-3 inline-block text-sm font-semibold text-teal-700">
                                Report an issue →
                            </Link>
                        )}
                    </div>
                ) : (
                    filtered.map((report) => (
                        <ReportCard key={report.id} report={report} />
                    ))
                )}
            </div>
        </div>
    );
}
