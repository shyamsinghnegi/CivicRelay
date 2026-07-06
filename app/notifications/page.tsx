import { ArrowLeft, CheckCircle2, Clock, MessageSquare, AlertCircle } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string;
  icon: "resolved" | "progress" | "comment" | "submitted";
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const mockNotifications: Notification[] = [
  {
    id: "n1",
    icon: "progress",
    title: "Report in progress",
    body: "Your pothole report CR-4471 has been assigned to the roads department.",
    time: "2h ago",
    read: false,
  },
  {
    id: "n2",
    icon: "comment",
    title: "Official response",
    body: "A field officer has commented on your streetlight report CR-4468.",
    time: "Yesterday",
    read: false,
  },
  {
    id: "n3",
    icon: "resolved",
    title: "Issue resolved",
    body: "Garbage overflow CR-4455 in Lalpur Colony has been marked resolved.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "n4",
    icon: "submitted",
    title: "Report received",
    body: "Your drainage report CR-4440 was successfully submitted.",
    time: "5 days ago",
    read: true,
  },
];

const iconMap = {
  resolved: { Icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  progress: { Icon: Clock, color: "text-teal-700", bg: "bg-teal-100" },
  comment: { Icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-100" },
  submitted: { Icon: AlertCircle, color: "text-slate-500", bg: "bg-slate-100" },
};

export default function NotificationsPage() {
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
        <h1 className="flex-1 text-base font-bold text-slate-900">Notifications</h1>
        <span className="rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-semibold text-white">
          2 new
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col px-5 pb-6">
        {mockNotifications.map((n) => {
          const { Icon, color, bg } = iconMap[n.icon];
          return (
            <div
              key={n.id}
              className={[
                "flex gap-4 border-b border-slate-100 py-4",
                !n.read ? "opacity-100" : "opacity-60",
              ].join(" ")}
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${bg}`}
              >
                <Icon className={`size-5 ${color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  <span className="shrink-0 text-xs text-slate-400">{n.time}</span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">{n.body}</p>
              </div>
              {!n.read && (
                <div className="mt-1.5 size-2 shrink-0 rounded-full bg-teal-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
