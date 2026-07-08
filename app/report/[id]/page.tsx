import { ArrowLeft, MapPin, Clock, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "../../lib/db";
import { Badge } from "../../components/Badge";
import { CategoryTile } from "../../components/CategoryTile";
import { TagChip } from "../../components/TagChip";
import { UpvoteButton } from "../../components/UpvoteButton";
import { PhotoViewer } from "../../components/PhotoViewer";
import { statusConfig } from "../../lib/status";
import type { Report } from "../../lib/reports";

async function getReport(id: string): Promise<Report | null> {
  try {
    const { resource } = await db.item(id, id).read<Report>();
    return resource ?? null;
  } catch {
    return null;
  }
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <Link
          href="/nearby"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"
        >
          <ArrowLeft className="size-5 text-slate-700" />
        </Link>
        <h1 className="flex-1 truncate text-base font-bold text-slate-900">
          {report.title}
        </h1>
      </div>

      {/* Photos */}
      {report.imageUrls && report.imageUrls.length > 0 ? (
        <PhotoViewer urls={report.imageUrls} title={report.title} />
      ) : report.imageUrl ? (
        <PhotoViewer urls={[report.imageUrl]} title={report.title} />
      ) : (
        <div className="h-28 w-full flex items-center justify-center bg-slate-200">
          <span className="text-sm text-slate-400">No photo attached</span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-5 px-5 py-5">
        {/* Category + Status */}
        <div className="flex items-center gap-2">
          <CategoryTile category={report.category} size="sm" />
          <Badge {...statusConfig[report.status]} />
        </div>

        {/* Description */}
        <p className="text-sm text-slate-700">{report.description}</p>

        {/* Meta */}
        <div className="flex flex-col gap-2">
          {report.location && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="size-3.5 shrink-0 text-teal-700" />
              {report.location}
            </div>
          )}
          {report.createdAt && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="size-3.5 shrink-0" />
              {new Date(report.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}
          {report.submittedBy && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <User className="size-3.5 shrink-0" />
              {report.submittedBy}
            </div>
          )}
        </div>

        {/* AI Tags */}
        {report.aiTags && report.aiTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {report.aiTags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </div>
        )}

        {/* Upvote */}
        <UpvoteButton reportId={report.id} initialCount={report.upvoteCount} />
      </div>
    </div>
  );
}
