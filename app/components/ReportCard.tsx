import { Navigation, ChevronUp } from "lucide-react";
import Link from "next/link";
import { CategoryTile } from "./CategoryTile";
import { Badge } from "./Badge";
import { statusConfig } from "../lib/status";
import type { Report } from "../lib/reports";

type ReportCardProps = {
    report: Report;
    onClick?: () => void;
};

export function ReportCard({ report, onClick }: ReportCardProps) {
    const className = "flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm active:scale-[0.98] transition-transform";
    const inner = (
        <>
            <CategoryTile category={report.category} size="lg" />
            <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-slate-900">{report.title}</h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{report.description}</p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700">
                        <Navigation className="size-3" />
                        {report.distanceKm != null ? `${report.distanceKm.toFixed(1)} km` : "nearby"}
                    </span>
                    <Badge {...(statusConfig[report.status] ?? statusConfig.submitted)} />
                </div>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-full bg-slate-100 px-2 py-2">
                <ChevronUp className="size-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">{report.upvoteCount}</span>
            </div>
        </>
    );

    if (onClick) {
        return <button onClick={onClick} className={`w-full text-left ${className}`}>{inner}</button>;
    }
    return <Link href={`/report/${report.id}`} className={className}>{inner}</Link>;
}