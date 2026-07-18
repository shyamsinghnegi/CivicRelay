"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, CircleDot, XCircle, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Notification = {
    id: string;
    reportId: string;
    reportTitle: string;
    event: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
};

const eventIcon: Record<string, { Icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
    acknowledged: { Icon: CircleDot,    color: "text-blue-600",   bg: "bg-blue-100"   },
    progress:     { Icon: Clock,        color: "text-teal-700",   bg: "bg-teal-100"   },
    resolved:     { Icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-100"  },
    rejected:     { Icon: XCircle,      color: "text-rose-600",   bg: "bg-rose-100"   },
    submitted:    { Icon: Wrench,       color: "text-slate-500",  bg: "bg-slate-100"  },
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/notifications")
            .then((r) => {
                if (r.status === 401) { router.push("/auth/signin"); return null; }
                return r.json();
            })
            .then((data) => {
                if (data) setNotifications(data.items ?? []);
                setLoading(false);
            });

        // Mark all as read after a short delay so user sees unread state first
        const t = setTimeout(() => {
            fetch("/api/notifications", { method: "PATCH" })
                .then(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))));
        }, 1500);

        return () => clearTimeout(t);
    }, [router]);

    const unreadCount = notifications.filter((n) => !n.read).length;

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
                {unreadCount > 0 && (
                    <span className="rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                        {unreadCount} new
                    </span>
                )}
            </div>

            {/* List */}
            <div className="flex flex-col px-5 pb-6">
                {loading ? (
                    <div className="flex flex-col gap-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 border-b border-slate-100 py-4">
                                <div className="size-10 shrink-0 rounded-full bg-slate-200 animate-pulse" />
                                <div className="flex-1 flex flex-col gap-2 pt-1">
                                    <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
                                    <div className="h-3 w-full rounded bg-slate-200 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-sm font-medium text-slate-500">No notifications yet.</p>
                        <p className="mt-1 text-xs text-slate-400">
                            You'll be notified when your reports are updated.
                        </p>
                    </div>
                ) : (
                    notifications.map((n) => {
                        const cfg = eventIcon[n.event] ?? eventIcon.submitted;
                        const { Icon, color, bg } = cfg;
                        return (
                            <Link
                                key={n.id}
                                href={`/report/${n.reportId}`}
                                className={`flex gap-4 border-b border-slate-100 py-4 transition-opacity ${n.read ? "opacity-60" : "opacity-100"}`}
                            >
                                <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${bg}`}>
                                    <Icon className={`size-5 ${color}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                                        <span className="shrink-0 text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                                    </div>
                                    <p className="mt-0.5 text-sm text-slate-500">{n.body}</p>
                                </div>
                                {!n.read && (
                                    <div className="mt-1.5 size-2 shrink-0 rounded-full bg-teal-600" />
                                )}
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
