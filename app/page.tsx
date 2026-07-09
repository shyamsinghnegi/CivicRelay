import { MapPin, Camera, Map, List } from "lucide-react";
import { Logo } from "./components/Logo";
import { ReportCard } from "./components/ReportCard";
import { db } from "./lib/db";
import type { Report } from "./lib/reports";
import Link from "next/link";

async function getLatestReports(): Promise<Report[]> {
  try {
    const { resources } = await db.items
      .query({ query: "SELECT * FROM c ORDER BY c._ts DESC OFFSET 0 LIMIT 5" })
      .fetchAll();
    return resources as Report[];
  } catch {
    return [];
  }
}

export default async function Home() {
  const latest = await getLatestReports();

  return (
    <div className="min-h-full flex flex-col gap-8 px-5 py-6 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between">
        <Logo />
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
          <MapPin className="size-4 text-teal-700" />
          Ranchi
        </span>
      </div>

      <div>
        <h1 className="text-[36px] font-bold leading-[1.15] tracking-[-0.02em] text-slate-900">
          What needs fixing around you today?
        </h1>
        <p className="mt-2 text-base text-slate-500">
          See it. Report it. Fix it.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Link
          href="/report"
          className="flex items-center gap-4 rounded-[20px] bg-teal-700 p-5 text-left text-white shadow-[0_10px_24px_rgba(15,118,110,0.32)]"
        >
          <Camera className="size-8 shrink-0" />
          <div>
            <div className="text-lg font-semibold">Report a problem</div>
            <div className="text-sm text-teal-50">
              Snap a photo — we detect &amp; route it
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/map"
            className="flex flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="flex size-11 items-center justify-center rounded-[10px] bg-teal-100">
              <Map className="size-5 text-teal-700" />
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Explore map
            </span>
          </Link>

          <Link
            href="/nearby"
            className="flex flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="flex size-11 items-center justify-center rounded-[10px] bg-cat-streetlight-bg">
              <List className="size-5 text-cat-streetlight" />
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Nearby reports
            </span>
            <span className="text-xs text-slate-500">{latest.length} recent</span>
          </Link>
        </div>
      </div>

      {/* Live feed */}
      {latest.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Latest reports</h2>
            <Link href="/nearby" className="text-xs text-teal-700 font-medium">
              See all
            </Link>
          </div>
          {latest.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
