import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { ReportCard } from "../components/ReportCard";
import { mockNearbyReports } from "../lib/reports";

export default function MyReportsPage() {
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
                <div className="flex flex-col items-center gap-1 rounded-2xl bg-white py-3 shadow-sm">
                    <span className="text-xl font-bold text-slate-900">3</span>
                    <span className="text-xs text-slate-500">Submitted</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-2xl bg-white py-3 shadow-sm">
                    <span className="text-xl font-bold text-teal-700">1</span>
                    <span className="text-xs text-slate-500">In progress</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-2xl bg-white py-3 shadow-sm">
                    <span className="text-xl font-bold text-slate-400">1</span>
                    <span className="text-xs text-slate-500">Resolved</span>
                </div>
            </div>

            {/* Report list */}
            <div className="flex flex-col gap-3 px-5 pb-6">
                {mockNearbyReports.map((report) => (
                    <ReportCard key={report.id} report={report} />
                ))}
            </div>
        </div>
    );
}