"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, MapPin, List } from "lucide-react";
import { ReportCard } from "../components/ReportCard";
import { AzureMap } from "../components/AzureMap";
import type { Report } from "../lib/reports";

type SheetSnap = "peek" | "half" | "full";

const PEEK_TOP = () => window.innerHeight - 140 - 56;
const HALF_TOP = () => Math.round(window.innerHeight * 0.45);
const FULL_TOP = () => 64;
// Mini tab height when a pin is selected — just the handle + one line of text
const MINI_TOP = () => window.innerHeight - 56 - 56;

export default function NearbyPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [snap, setSnap] = useState<SheetSnap>("peek");
    const [mounted, setMounted] = useState(false);
    const [pinReport, setPinReport] = useState<Report | null>(null);
    const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; t: number } | null>(null);

    const sheetRef = useRef<HTMLDivElement>(null);
    const dragStartY = useRef<number | null>(null);
    const dragStartTop = useRef<number>(0);
    const isDragging = useRef(false);

    useEffect(() => {
        setMounted(true);
        if (sheetRef.current) sheetRef.current.style.top = `${PEEK_TOP()}px`;
        fetch("/api/reports")
            .then((r) => r.json())
            .then((data) => setReports(data.items ?? []));
    }, []);

    function animateTo(px: number) {
        if (sheetRef.current) {
            sheetRef.current.style.transition = "top 0.35s cubic-bezier(0.32,0.72,0,1)";
            sheetRef.current.style.top = `${px}px`;
        }
    }

    function snapTo(next: SheetSnap) {
        setSnap(next);
        animateTo(next === "full" ? FULL_TOP() : next === "half" ? HALF_TOP() : PEEK_TOP());
    }

    function onPointerDown(e: React.PointerEvent) {
        if (pinReport) return; // no drag in mini mode
        dragStartY.current = e.clientY;
        dragStartTop.current = sheetRef.current?.getBoundingClientRect().top ?? 0;
        isDragging.current = true;
        sheetRef.current?.setPointerCapture(e.pointerId);
        if (sheetRef.current) sheetRef.current.style.transition = "none";
    }

    function onPointerMove(e: React.PointerEvent) {
        if (!isDragging.current || dragStartY.current === null) return;
        const dy = e.clientY - dragStartY.current;
        const newTop = Math.max(FULL_TOP(), Math.min(PEEK_TOP(), dragStartTop.current + dy));
        if (sheetRef.current) sheetRef.current.style.top = `${newTop}px`;
    }

    function onPointerUp() {
        if (!isDragging.current) return;
        isDragging.current = false;
        const top = sheetRef.current?.getBoundingClientRect().top ?? 0;
        const h = window.innerHeight;
        if (top < h * 0.35) snapTo("full");
        else if (top < h * 0.65) snapTo("half");
        else snapTo("peek");
    }

    function handleMapSelect(report: Report) {
        setPinReport(report);
        if (report.lat && report.lng) setFlyTo({ lat: report.lat, lng: report.lng, t: Date.now() });
        animateTo(MINI_TOP());
    }

    function handleDismissPin() {
        setPinReport(null);
        setFlyTo(null);
        snapTo("peek");
    }

    return (
        <div className="relative h-full w-full">
            <div className="fixed inset-0 bottom-14">
                <AzureMap
                    reports={reports}
                    onSelect={handleMapSelect}
                    selectedReport={pinReport}
                    onDismiss={handleDismissPin}
                    flyTo={flyTo}
                />
            </div>

            <div
                ref={sheetRef}
                className="fixed inset-x-0 bottom-14 z-20 flex flex-col rounded-t-2xl bg-slate-50 shadow-[0_-8px_32px_rgba(15,23,42,0.15)]"
                style={{
                    top: mounted ? `${PEEK_TOP()}px` : "100%",
                    transition: "top 0.35s cubic-bezier(0.32,0.72,0,1)",
                }}
            >
                {pinReport ? (
                    /* ── Mini tab — tap to restore list ── */
                    <button
                        onClick={handleDismissPin}
                        className="flex w-full flex-col items-center gap-1.5 py-3 active:bg-slate-100 transition-colors rounded-t-2xl"
                    >
                        <div className="h-1 w-10 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1.5 text-xs font-medium text-teal-700">
                            <List className="size-3.5" />
                            Tap to see all reports
                        </span>
                    </button>
                ) : (
                    <>
                        {/* Drag handle */}
                        <div
                            className="flex shrink-0 cursor-grab flex-col items-center pt-3 pb-2 active:cursor-grabbing"
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                        >
                            <div className="h-1 w-10 rounded-full bg-slate-300" />
                        </div>

                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between px-5 pb-3">
                            <div>
                                <h1 className="text-base font-bold text-slate-900">Nearby reports</h1>
                                <p className="flex items-center gap-1 text-xs text-slate-500">
                                    <MapPin className="size-3" />
                                    {reports.length} reports
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex rounded-full border border-slate-200 bg-white overflow-hidden">
                                    {(["peek", "half", "full"] as SheetSnap[]).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => snapTo(s)}
                                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${snap === s ? "bg-teal-600 text-white" : "text-slate-500"}`}
                                        >
                                            {s === "peek" ? "Map" : s === "half" ? "Split" : "List"}
                                        </button>
                                    ))}
                                </div>
                                <button className="flex items-center gap-1 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">
                                    <ArrowUpDown className="size-3" />
                                    Sort
                                </button>
                            </div>
                        </div>

                        {/* Report list */}
                        <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
                            {reports.length === 0 ? (
                                <p className="py-8 text-center text-sm text-slate-400">
                                    No reports yet. Be the first to report an issue!
                                </p>
                            ) : (
                                reports.map((report) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        onClick={report.lat && report.lng ? () => handleMapSelect(report) : undefined}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
