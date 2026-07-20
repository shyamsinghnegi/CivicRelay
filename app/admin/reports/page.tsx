"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, FileText } from "lucide-react";
import { Badge } from "../../components/Badge";
import { statusConfig } from "../../lib/status";
import { ReportDetail } from "./ReportDetail";
import type { Report } from "../../lib/reports";
import type { ReportStatus } from "../../lib/status";

const PAGE_SIZE = 25;
const allStatuses: ReportStatus[] = ["submitted", "acknowledged", "progress", "resolved", "rejected"];

export default function AdminReportsList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get("status") ?? "";
    const categoryFilter = searchParams.get("category") ?? "";
    const pageParam = parseInt(searchParams.get("page") ?? "1", 10);

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const offset = (pageParam - 1) * PAGE_SIZE;

    const fetchReports = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
        if (statusFilter) params.set("status", statusFilter);
        if (categoryFilter) params.set("category", categoryFilter);

        const res = await fetch(`/api/admin/reports?${params}`);
        const data = await res.json();
        const items = data.items ?? [];
        setReports(items);
        setHasMore(data.hasMore ?? false);
        setLoading(false);
        // Auto-select first report if none selected
        if (items.length > 0) setSelectedId((prev) => prev ?? items[0].id);
    }, [offset, statusFilter, categoryFilter]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    function setFilter(key: string, value: string) {
        const p = new URLSearchParams(searchParams.toString());
        if (value) p.set(key, value); else p.delete(key);
        p.delete("page");
        setSelectedId(null);
        router.push(`/admin/reports?${p}`);
    }

    const selectedIndex = reports.findIndex((r) => r.id === selectedId);

    function handleStatusChange(id: string, status: ReportStatus) {
        setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    }

    return (
        <div className="flex h-full">
            {/* Left pane — list */}
            <div className="flex w-[380px] shrink-0 flex-col border-r border-slate-200 bg-white">
                {/* List header */}
                <div className="border-b border-slate-200 px-5 py-4">
                    <h1 className="text-base font-bold text-slate-900">Reports</h1>

                    {/* Status filter pills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        <button
                            onClick={() => setFilter("status", "")}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${!statusFilter ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                        >
                            All
                        </button>
                        {allStatuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter("status", statusFilter === s ? "" : s)}
                                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${statusFilter === s ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                            >
                                {statusConfig[s].label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {loading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-2 px-5 py-4">
                                <div className="h-3.5 w-40 animate-pulse rounded bg-slate-200" />
                                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                            </div>
                        ))
                    ) : reports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                            <FileText className="size-8 opacity-40" />
                            <p className="text-sm">No reports match these filters.</p>
                        </div>
                    ) : (
                        reports.map((r) => {
                            const active = r.id === selectedId;
                            return (
                                <button
                                    key={r.id}
                                    onClick={() => setSelectedId(r.id)}
                                    className={[
                                        "w-full px-5 py-3.5 text-left transition-colors",
                                        active ? "bg-teal-50 border-l-2 border-teal-600" : "hover:bg-slate-50 border-l-2 border-transparent",
                                    ].join(" ")}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="line-clamp-2 text-sm font-medium text-slate-900">{r.title}</p>
                                        <Badge {...(statusConfig[r.status] ?? statusConfig.submitted)} />
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <span className="text-xs capitalize text-slate-400">{r.category}</span>
                                        <span className="text-slate-300">·</span>
                                        <span className="font-mono text-[10px] text-slate-300">{r.id}</span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {!loading && (reports.length > 0 || pageParam > 1) && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                        <span className="text-xs text-slate-400">Page {pageParam}</span>
                        <div className="flex gap-1.5">
                            <button
                                disabled={pageParam <= 1}
                                onClick={() => setFilter("page", String(pageParam - 1))}
                                className="flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="size-3.5" />
                            </button>
                            <button
                                disabled={!hasMore}
                                onClick={() => {
                                    const p = new URLSearchParams(searchParams.toString());
                                    p.set("page", String(pageParam + 1));
                                    router.push(`/admin/reports?${p}`);
                                }}
                                className="flex size-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="size-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right pane — detail */}
            <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
                {selectedId ? (
                    <ReportDetail
                        key={selectedId}
                        reportId={selectedId}
                        hasPrev={selectedIndex > 0}
                        hasNext={selectedIndex < reports.length - 1}
                        onPrev={() => selectedIndex > 0 && setSelectedId(reports[selectedIndex - 1].id)}
                        onNext={() => selectedIndex < reports.length - 1 && setSelectedId(reports[selectedIndex + 1].id)}
                        onStatusChange={handleStatusChange}
                    />
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-slate-400">
                        <FileText className="size-10 opacity-30" />
                        <p className="text-sm">Select a report to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
