import { ArrowLeft, Search, Navigation, ChevronUp } from "lucide-react";
import { Badge } from "../components/Badge";
import { TagChip } from "../components/TagChip";
import { Button } from "../components/Button";
import { categoryConfig } from "../lib/categories";
import { mockNearbyReports } from "../lib/reports";

export default function MapPage() {
    const selectedReport = mockNearbyReports[0];

    return (
        <div className="relative h-screen w-full bg-slate-200">
            <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-3 p-4">
                <button className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <ArrowLeft className="size-5 text-slate-700" />
                </button>
                <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm">
                    <Search className="size-4 shrink-0 text-slate-400" />
                    <span className="text-sm text-slate-400">Search area or Ward...</span>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-2xl bg-slate-50 p-5 shadow-[0_-12px_40px_rgba(15,23,42,0.2)]">
                <div className="flex gap-4">
                    <div className="size-21 shrink-0 rounded-xl bg-slate-300" />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <Badge {...categoryConfig[selectedReport.category]} />
                        </div>
                        <h3 className="mt-1 truncate text-base font-semibold text-slate-900">
                            {selectedReport.title}
                        </h3>
                        <p className="truncate text-xs text-slate-500">
                            {selectedReport.location}
                        </p>
                    </div>
                </div>

                <p className="mt-3 text-sm text-slate-700">
                    {selectedReport.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                    {selectedReport.aiTags?.map((tag) => (
                        <TagChip key={tag} label={tag} />
                    ))}
                </div>
                <div className="mt-4 flex gap-2">
                    <Button className="flex-1">
                        <ChevronUp className="size-4" />
                        Upvote · {selectedReport.upvoteCount}
                    </Button>
                    <button className="flex size-12 shrink-0 items-center justify-center rounded-[10px] border border-slate-200 bg-white">
                        <Navigation className="size-5 text-slate-700" />
                    </button>
                </div>
            </div>
        </div>
    )
}
