import { ArrowUpDown, MapPin } from "lucide-react";
import { ReportCard } from "../components/ReportCard";
import { db } from "../lib/db";
import type { Report } from "../lib/reports";

async function getReports(): Promise<Report[]> {
  const { resources } = await db.items
    .query({
      query: "SELECT * FROM c ORDER BY c._ts DESC OFFSET 0 LIMIT 20",
    })
    .fetchAll();
  return resources as Report[];
}

export default async function NearbyReportsPage() {
  const reports = await getReports();

  return (
    <div className="flex h-full min-h-screen flex-col bg-slate-200">
      <div className="h-42.5 shrink-0 bg-slate-300" />

      <div className="-mt-6 flex flex-1 flex-col rounded-t-2xl bg-slate-50 px-5 pt-3 pb-6">
        <div className="mx-auto h-1.5 w-10 shrink-0 rounded-full bg-slate-300" />

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Nearby reports
            </h1>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
              {reports.length} within 1 km
              <MapPin className="size-3.5" />
              Ranchi
            </p>
          </div>
          <button className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
            <ArrowUpDown className="size-3.5" />
            Nearest
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {reports.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No reports yet. Be the first to report an issue!
            </p>
          ) : (
            reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
