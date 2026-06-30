import { MapPin, Camera, Map, List, ChevronUp } from "lucide-react";
import { Logo } from "./components/Logo";
import { Badge } from "./components/Badge";
import { statusConfig } from "./lib/status";

export default function Home() {
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
        <button className="flex items-center gap-4 rounded-[20px] bg-teal-700 p-5 text-left text-white shadow-[0_10px_24px_rgba(15,118,110,0.32)]">
          <Camera className="size-8 shrink-0" />
          <div>
            <div className="text-lg font-semibold">Report a problem</div>
            <div className="text-sm text-teal-50">
              Snap a photo — we detect &amp; route it
            </div>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex size-11 items-center justify-center rounded-[10px] bg-teal-100">
              <Map className="size-5 text-teal-700" />
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Explore map
            </span>
          </button>

          <button className="flex flex-col items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex size-11 items-center justify-center rounded-[10px] bg-[#FEF9C3]">
              <List className="size-5 text-[#CA8A04]" />
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Nearby reports
            </span>
            <span className="text-xs text-slate-500">12 within 1 km</span>
          </button>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <ChevronUp className="size-4 shrink-0 text-slate-400" />
        <p className="flex-1 text-sm text-slate-700">
          Your pothole report is in progress{" "}
          <Badge {...statusConfig.progress} />
          <span className="ml-1 text-slate-400">· CR-4471 · 2h ago</span>
        </p>
      </div>
    </div>
  );
}
