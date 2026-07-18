"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { AzureMap } from "../components/AzureMap";
import { Badge } from "../components/Badge";
import { categoryConfig } from "../lib/categories";
import { statusConfig } from "../lib/status";
import type { Report } from "../lib/reports";

export default function MapPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [selected, setSelected] = useState<Report | null>(null);

    useEffect(() => {
        fetch("/api/reports")
            .then((r) => r.json())
            .then((data) => setReports(data.items ?? []));
    }, []);

    return (
        <div className="relative h-full w-full">
            {/* Map */}
            <AzureMap reports={reports} onSelect={setSelected} />

            {/* Top bar */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-3 p-4">
                <Link
                    href="/"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"
                >
                    <ArrowLeft className="size-5 text-slate-700" />
                </Link>
                <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm">
                    <Search className="size-4 shrink-0 text-slate-400" />
                    <span className="text-sm text-slate-400">Search area or Ward…</span>
                </div>
            </div>

            {/* Selected report card */}
            {selected && (
                <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-2xl bg-slate-50 p-5 shadow-[0_-12px_40px_rgba(15,23,42,0.2)]">
                    <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" />
                    <div className="flex gap-4">
                        {selected.imageUrls?.[0] || selected.imageUrl ? (
                            <img
                                src={selected.imageUrls?.[0] ?? selected.imageUrl}
                                alt={selected.title}
                                className="size-20 shrink-0 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="size-20 shrink-0 rounded-xl bg-slate-200 flex items-center justify-center text-2xl">
                                📍
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <Badge {...statusConfig[selected.status]} />
                            </div>
                            <h3 className="mt-1 truncate text-base font-semibold text-slate-900">
                                {selected.title}
                            </h3>
                            <p className="truncate text-xs text-slate-500">{selected.location}</p>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-700 line-clamp-2">{selected.description}</p>
                    <div className="mt-4 flex gap-2">
                        <Link
                            href={`/report/${selected.id}`}
                            className="flex-1 rounded-xl bg-teal-600 py-2.5 text-center text-sm font-semibold text-white"
                        >
                            View report
                        </Link>
                        <button
                            onClick={() => setSelected(null)}
                            className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 text-sm"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* No reports note */}
            {reports.length === 0 && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 shadow text-xs text-slate-500">
                    No reports yet in this area
                </div>
            )}
        </div>
    );
}
