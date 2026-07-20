"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, User, ChevronUp, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "../../../components/Badge";
import { CategoryTile } from "../../../components/CategoryTile";
import { TagChip } from "../../../components/TagChip";
import { statusConfig } from "../../../lib/status";
import type { Report } from "../../../lib/reports";
import type { ReportStatus } from "../../../lib/status";

const statusOrder: ReportStatus[] = ["submitted", "acknowledged", "progress", "resolved", "rejected"];

export default function AdminReportDetail() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedStatus, setSavedStatus] = useState<ReportStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/admin/reports/${id}`)
            .then((r) => r.json())
            .then((data) => { setReport(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    async function updateStatus(newStatus: ReportStatus) {
        if (!report || saving) return;
        setSaving(true);
        setError(null);

        const res = await fetch(`/api/reports/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
            setReport((r) => r ? { ...r, status: newStatus } : r);
            setSavedStatus(newStatus);
            setTimeout(() => setSavedStatus(null), 2000);
        } else {
            setError("Failed to update status. Try again.");
        }
        setSaving(false);
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-200" />
                <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="p-8">
                <p className="text-sm text-slate-400">Report not found.</p>
                <Link href="/admin/reports" className="mt-4 inline-block text-sm text-teal-600 hover:underline">← Back to reports</Link>
            </div>
        );
    }

    const mapsKey = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY;
    const hasCoords = report.lat != null && report.lng != null;
    const staticMapUrl = hasCoords && mapsKey
        ? `https://atlas.microsoft.com/map/static/png?api-version=1.0&layer=basic&style=main&zoom=17&center=${report.lng},${report.lat}&width=800&height=220&pins=default||${report.lng}%20${report.lat}&subscription-key=${mapsKey}`
        : null;

    return (
        <div className="mx-auto max-w-2xl p-8">
            {/* Back */}
            <Link href="/admin/reports" className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
                <ArrowLeft className="size-4" /> Back to reports
            </Link>

            {/* Title row */}
            <div className="mb-6 flex items-start gap-3">
                <CategoryTile category={report.category} size="lg" />
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900">{report.title}</h1>
                    <p className="mt-0.5 font-mono text-xs text-slate-400">{report.id}</p>
                </div>
                <Badge {...(statusConfig[report.status] ?? statusConfig.submitted)} />
            </div>

            {/* Status update panel */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 text-sm font-semibold text-slate-700">Update Status</p>
                <div className="flex flex-wrap gap-2">
                    {statusOrder.map((s) => {
                        const cfg = statusConfig[s];
                        const current = report.status === s;
                        const justSaved = savedStatus === s;
                        return (
                            <button
                                key={s}
                                disabled={saving}
                                onClick={() => updateStatus(s)}
                                className={[
                                    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                                    current
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                                    saving ? "opacity-60 cursor-not-allowed" : "",
                                ].join(" ")}
                            >
                                {justSaved && <CheckCircle2 className="size-4 text-teal-400" />}
                                {saving && savedStatus === null && current && <Loader2 className="size-4 animate-spin" />}
                                {cfg.label}
                            </button>
                        );
                    })}
                </div>
                {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
                {savedStatus && (
                    <p className="mt-3 text-xs text-teal-600">
                        Status updated to <strong>{statusConfig[savedStatus].label}</strong> — citizen notified.
                    </p>
                )}
            </div>

            {/* Details card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-sm font-semibold text-slate-700">Report Details</p>

                <p className="mb-4 text-sm text-slate-600">{report.description}</p>

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
                            {new Date(report.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                            })}
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
                    <div className="mt-4 flex flex-wrap gap-2">
                        {report.aiTags.map((tag) => <TagChip key={tag} label={tag} />)}
                    </div>
                )}
            </div>

            {/* Mini map */}
            {staticMapUrl && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                    <img src={staticMapUrl} alt="Report location" className="h-44 w-full object-cover" />
                </div>
            )}

            {/* Photos */}
            {(report.imageUrls?.length || report.imageUrl) && (
                <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">Photos</p>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                        {(report.imageUrls ?? (report.imageUrl ? [report.imageUrl] : [])).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                                <img
                                    src={url}
                                    alt={`Photo ${i + 1}`}
                                    className="h-36 w-56 shrink-0 rounded-2xl object-cover hover:opacity-90 transition-opacity"
                                />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
