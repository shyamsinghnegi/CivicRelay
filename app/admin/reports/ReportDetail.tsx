"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, User, ChevronUp, Loader2, CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge } from "../../components/Badge";
import { CategoryTile } from "../../components/CategoryTile";
import { TagChip } from "../../components/TagChip";
import { PhotoViewer } from "../../components/PhotoViewer";
import { statusConfig } from "../../lib/status";
import type { Report } from "../../lib/reports";
import type { ReportStatus } from "../../lib/status";

const statusOrder: ReportStatus[] = ["submitted", "acknowledged", "progress", "resolved", "rejected"];

type Props = {
    reportId: string;
    onPrev?: () => void;
    onNext?: () => void;
    hasPrev: boolean;
    hasNext: boolean;
    onClose?: () => void;
    onStatusChange?: (id: string, status: ReportStatus) => void;
};

export function ReportDetail({ reportId, onPrev, onNext, hasPrev, hasNext, onClose, onStatusChange }: Props) {
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedStatus, setSavedStatus] = useState<ReportStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setReport(null);
        setSavedStatus(null);
        fetch(`/api/admin/reports/${reportId}`)
            .then((r) => r.json())
            .then((data) => { setReport(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [reportId]);

    async function updateStatus(newStatus: ReportStatus) {
        if (!report || saving) return;
        setSaving(true);
        setError(null);

        const res = await fetch(`/api/reports/${reportId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
            setReport((r) => r ? { ...r, status: newStatus } : r);
            setSavedStatus(newStatus);
            onStatusChange?.(reportId, newStatus);
            setTimeout(() => setSavedStatus(null), 2000);
        } else {
            setError("Failed to update status.");
        }
        setSaving(false);
    }

    const mapsKey = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY;

    if (loading) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="h-8 w-56 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
                Report not found.
            </div>
        );
    }

    const hasCoords = report.lat != null && report.lng != null;
    const staticMapUrl = hasCoords && mapsKey
        ? `https://atlas.microsoft.com/map/static/png?api-version=1.0&layer=basic&style=main&zoom=17&center=${report.lng},${report.lat}&width=800&height=220&pins=default||${report.lng}%20${report.lat}&subscription-key=${mapsKey}`
        : null;

    const photoUrls = report.imageUrls ?? (report.imageUrl ? [report.imageUrl] : []);

    return (
        <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Detail header */}
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3">
                <button
                    onClick={onPrev}
                    disabled={!hasPrev}
                    className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Previous report"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <button
                    onClick={onNext}
                    disabled={!hasNext}
                    className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Next report"
                >
                    <ChevronRight className="size-4" />
                </button>
                <span className="flex-1 truncate font-mono text-xs text-slate-400">{report.id}</span>
                <Badge {...(statusConfig[report.status] ?? statusConfig.submitted)} />
                {onClose && (
                    <button onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                        <X className="size-4" />
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-5 p-6">
                {/* Title */}
                <div className="flex items-start gap-3">
                    <CategoryTile category={report.category} size="lg" />
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{report.title}</h2>
                        <p className="text-xs capitalize text-slate-400">{report.category}</p>
                    </div>
                </div>

                {/* Status update */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                        {statusOrder.map((s) => {
                            const current = report.status === s;
                            const justSaved = savedStatus === s;
                            return (
                                <button
                                    key={s}
                                    disabled={saving}
                                    onClick={() => updateStatus(s)}
                                    className={[
                                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                                        current ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                                        saving ? "opacity-60 cursor-not-allowed" : "",
                                    ].join(" ")}
                                >
                                    {justSaved && <CheckCircle2 className="size-3.5 text-teal-400" />}
                                    {saving && current && !justSaved && <Loader2 className="size-3.5 animate-spin" />}
                                    {statusConfig[s].label}
                                </button>
                            );
                        })}
                    </div>
                    {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                    {savedStatus && (
                        <p className="mt-2 text-xs text-teal-600">
                            Updated to <strong>{statusConfig[savedStatus].label}</strong> — citizen notified.
                        </p>
                    )}
                </div>

                {/* Details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Details</p>
                    <p className="mb-4 text-sm text-slate-700">{report.description}</p>
                    <div className="flex flex-col gap-2">
                        {report.location && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <MapPin className="size-3.5 shrink-0 text-teal-600" />
                                {report.location}
                            </div>
                        )}
                        {report.createdAt && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Clock className="size-3.5 shrink-0" />
                                {new Date(report.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                        )}
                        {report.submittedBy && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <User className="size-3.5 shrink-0" />
                                {report.submittedBy}
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <ChevronUp className="size-3.5 shrink-0" />
                            {report.upvoteCount} upvotes
                        </div>
                    </div>
                    {report.aiTags && report.aiTags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {report.aiTags.map((tag) => <TagChip key={tag} label={tag} />)}
                        </div>
                    )}
                </div>

                {/* Photos */}
                {photoUrls.length > 0 && (
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Photos</p>
                        <PhotoViewer urls={photoUrls} title={report.title} compact />
                    </div>
                )}

                {/* Map — always last */}
                {staticMapUrl && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <img src={staticMapUrl} alt="Report location" className="h-40 w-full object-cover" />
                    </div>
                )}
            </div>
        </div>
    );
}
