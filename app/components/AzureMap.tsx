"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronUp } from "lucide-react";
import Link from "next/link";
import { categoryConfig } from "../lib/categories";
import { statusConfig } from "../lib/status";
import { Badge } from "./Badge";
import type { Report } from "../lib/reports";
import type { IssueCategory } from "../lib/categories";

const INDIA_CENTER = { lat: 22.9734, lng: 78.6569 };

let atlasCache: any = null;
async function getAtlas() {
    if (!atlasCache) atlasCache = await import("azure-maps-control");
    return atlasCache;
}

// Lucide icon paths as raw SVG path strings for use inside HtmlMarker
const iconPaths: Record<IssueCategory, string> = {
    pothole:     "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", // Construction-like
    streetlight: "M9 21h6M12 3v1M12 7a4 4 0 0 1 0 8M12 7V4M8.5 8.5A4 4 0 0 0 12 15",
    garbage:     "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
    water:       "M12 2C6 8 4 13 4 16a8 8 0 0 0 16 0c0-3-2-8-8-14z",
    drainage:    "M2 6c3 0 5 2 8 2s5-2 8-2M2 12c3 0 5 2 8 2s5-2 8-2M2 18c3 0 5 2 8 2s5-2 8-2",
    traffic:     "M10 3H6l-2 7h12l-2-7h-4zM4 10v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8M9 14h6",
    dumping:     "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
    other:       "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01",
};

const categoryColors: Record<IssueCategory, string> = {
    pothole:     "#ef4444",
    streetlight: "#f59e0b",
    garbage:     "#10b981",
    water:       "#3b82f6",
    drainage:    "#6366f1",
    traffic:     "#f97316",
    dumping:     "#8b5cf6",
    other:       "#64748b",
};

function makePinHtml(category: IssueCategory): string {
    const color = categoryColors[category] ?? "#64748b";
    const path = iconPaths[category] ?? iconPaths.other;
    return `
<div style="
  display:flex;flex-direction:column;align-items:center;
  filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));
  cursor:pointer;
">
  <div style="
    background:${color};
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    width:36px;height:36px;
    display:flex;align-items:center;justify-content:center;
    border:2.5px solid white;
  ">
    <svg style="transform:rotate(45deg)" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="${path}"/>
    </svg>
  </div>
  <div style="
    width:2px;height:8px;background:${color};
    border-radius:0 0 2px 2px;margin-top:-1px;
  "></div>
</div>`;
}

function showUserDot(atlas: any, map: any, lng: number, lat: number) {
    const id = "__user_location__";
    if (map.sources.getById(id)) {
        (map.sources.getById(id) as any).setShapes([
            new atlas.data.Feature(new atlas.data.Point([lng, lat])),
        ]);
        return;
    }
    const ds = new atlas.source.DataSource(id);
    ds.add(new atlas.data.Feature(new atlas.data.Point([lng, lat])));
    map.sources.add(ds);
    map.layers.add(new atlas.layer.BubbleLayer(ds, id + "_pulse", {
        color: "rgba(59,130,246,0.2)", radius: 18, strokeWidth: 0,
    }));
    map.layers.add(new atlas.layer.BubbleLayer(ds, id + "_dot", {
        color: "#3b82f6", radius: 8, strokeColor: "#ffffff", strokeWidth: 2.5,
    }));
}

type Props = {
    reports: Report[];
    onSelect: (report: Report) => void;
    selectedReport?: Report | null;
    onDismiss?: () => void;
    flyTo?: { lat: number; lng: number } | null;
};

export function AzureMap({ reports, onSelect, selectedReport: controlledReport, onDismiss, flyTo }: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const atlasRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const mapReadyRef = useRef(false);
    const markerClickedRef = useRef(false);
    const prePinCameraRef = useRef<{ center: [number, number]; zoom: number } | null>(null);
    const pendingReportsRef = useRef<Report[]>(reports);
    const pendingFlyRef = useRef<{ lat: number; lng: number } | null>(null);
    const onSelectRef = useRef(onSelect);
    const [locating, setLocating] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    // Use controlled prop if provided, otherwise internal state (for standalone map page)
    const [internalReport, setInternalReport] = useState<Report | null>(null);
    const selectedReport = controlledReport !== undefined ? controlledReport : internalReport;
    function selectReport(r: Report | null) {
        if (controlledReport !== undefined) { if (r === null) onDismiss?.(); }
        else setInternalReport(r);
    }

    useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

    // Restore camera when pin is dismissed from outside (e.g. tab tap or back nav)
    useEffect(() => {
        if (controlledReport === null && prePinCameraRef.current && mapInstanceRef.current && mapReadyRef.current) {
            mapInstanceRef.current.setCamera({
                center: prePinCameraRef.current.center,
                zoom: prePinCameraRef.current.zoom,
                type: "fly",
                duration: 500,
            });
            prePinCameraRef.current = null;
        }
    }, [controlledReport]);

    // Fly to coordinates when requested from outside (e.g. list tap)
    useEffect(() => {
        if (!flyTo) return;
        if (!mapInstanceRef.current || !mapReadyRef.current) {
            // Map not ready yet — queue it
            pendingFlyRef.current = flyTo;
            return;
        }
        const cam = mapInstanceRef.current.getCamera();
        prePinCameraRef.current = { center: cam.center as [number, number], zoom: cam.zoom as number };
        mapInstanceRef.current.setCamera({ center: [flyTo.lng, flyTo.lat], zoom: 15, type: "fly", duration: 600 });
    }, [flyTo]);

    // Re-render markers when reports change
    useEffect(() => {
        pendingReportsRef.current = reports;
        const atlas = atlasRef.current;
        const map = mapInstanceRef.current;
        if (!atlas || !map || !mapReadyRef.current) return;
        renderMarkers(atlas, map, reports);
    }, [reports]);

    function renderMarkers(atlas: any, map: any, items: Report[]) {
        // Remove old markers
        for (const m of markersRef.current) map.markers.remove(m);
        markersRef.current = [];

        for (const report of items) {
            if (!report.lat || !report.lng) continue;
            const marker = new atlas.HtmlMarker({
                htmlContent: makePinHtml(report.category as IssueCategory),
                position: [report.lng, report.lat],
                anchor: "bottom",
            });
            map.markers.add(marker);
            map.events.add("click", marker, () => {
                markerClickedRef.current = true;
                // Save current camera so we can restore it on dismiss
                const cam = map.getCamera();
                prePinCameraRef.current = { center: cam.center as [number, number], zoom: cam.zoom as number };
                map.setCamera({ center: [report.lng!, report.lat!], zoom: 15, type: "fly", duration: 600 });
                selectReport(report);
                onSelectRef.current(report);
            });
            markersRef.current.push(marker);
        }
    }

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        async function init() {
            const atlas = await getAtlas();
            atlasRef.current = atlas;

            const map = new atlas.Map(mapRef.current, {
                center: [INDIA_CENTER.lng, INDIA_CENTER.lat],
                zoom: 5,
                language: "en-US",
                authOptions: {
                    authType: atlas.AuthenticationType.subscriptionKey,
                    subscriptionKey: process.env.NEXT_PUBLIC_AZURE_MAPS_KEY!,
                },
                style: "road",
                renderWorldCopies: false,
                preserveDrawingBuffer: false,
                fadeDuration: 0,
            });

            mapInstanceRef.current = map;

            map.events.add("ready", () => {
                mapReadyRef.current = true;
                setMapReady(true);
                if (navigator.geolocation) {
                    // Snap to cached position instantly if fresh (< 1 hour old)
                    const cached = localStorage.getItem("user_location");
                    if (cached) {
                        try {
                            const { lat, lng, ts } = JSON.parse(cached);
                            if (Date.now() - ts < 3_600_000) {
                                showUserDot(atlas, map, lng, lat);
                                map.setCamera({ center: [lng, lat], zoom: 13 });
                            }
                        } catch { localStorage.removeItem("user_location"); }
                    }
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            const { longitude: lng, latitude: lat } = pos.coords;
                            localStorage.setItem("user_location", JSON.stringify({ lat, lng, ts: Date.now() }));
                            showUserDot(atlas, map, lng, lat);
                            const cam = map.getCamera();
                            const [cLng, cLat] = cam.center as [number, number];
                            if (Math.hypot(lng - cLng, lat - cLat) > 0.001) {
                                map.setCamera({ center: [lng, lat], zoom: 13, type: "fly" });
                            }
                        },
                        () => {},
                        { timeout: 4000, maximumAge: 30000 }
                    );
                }
                // Dismiss pin card when tapping empty map area (not a marker)
                map.events.add("click", () => {
                    if (markerClickedRef.current) {
                        markerClickedRef.current = false;
                        return;
                    }
                    selectReport(null);
                    onDismiss?.();
                });

                // Use pendingReportsRef in case reports arrived before ready fired
                renderMarkers(atlas, map, pendingReportsRef.current);

                // Flush any flyTo that arrived before ready
                if (pendingFlyRef.current) {
                    const { lat, lng } = pendingFlyRef.current;
                    pendingFlyRef.current = null;
                    const cam = map.getCamera();
                    prePinCameraRef.current = { center: cam.center as [number, number], zoom: cam.zoom as number };
                    map.setCamera({ center: [lng, lat], zoom: 15, type: "fly", duration: 600 });
                }
            });
        }

        init();

        return () => {
            mapInstanceRef.current?.dispose();
            mapInstanceRef.current = null;
            markersRef.current = [];
            mapReadyRef.current = false;
        };
    }, []);

    async function locateMe() {
        if (!navigator.geolocation || !mapInstanceRef.current) return;
        setLocating(true);
        const atlas = await getAtlas();

        // Snap to cached position immediately so button feels instant
        const cached = localStorage.getItem("user_location");
        if (cached) {
            try {
                const { lat, lng, ts } = JSON.parse(cached);
                if (Date.now() - ts < 3_600_000) {
                    showUserDot(atlas, mapInstanceRef.current, lng, lat);
                    mapInstanceRef.current.setCamera({ center: [lng, lat], zoom: 14, type: "fly" });
                }
            } catch { localStorage.removeItem("user_location"); }
        }

        try {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { longitude: lng, latitude: lat } = pos.coords;
                    localStorage.setItem("user_location", JSON.stringify({ lat, lng, ts: Date.now() }));
                    showUserDot(atlas, mapInstanceRef.current, lng, lat);
                    mapInstanceRef.current.setCamera({ center: [lng, lat], zoom: 14, type: "fly" });
                    setLocating(false);
                },
                () => setLocating(false),
                { maximumAge: 30000 }
            );
        } catch {
            setLocating(false);
        }
    }

    const cfg = selectedReport ? categoryConfig[selectedReport.category as IssueCategory] : null;
    const statusCfg = selectedReport ? (statusConfig[selectedReport.status] ?? statusConfig.submitted) : null;

    return (
        <div className="relative h-full w-full">
            <div ref={mapRef} className="h-full w-full" />

            {/* Loading skeleton — shown until map ready event fires */}
            {!mapReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                    {/* Fake road grid */}
                    <div className="absolute inset-0 opacity-40">
                        {[20, 40, 60, 80].map((p) => (
                            <div key={`h${p}`} className="absolute w-full h-px bg-slate-300" style={{ top: `${p}%` }} />
                        ))}
                        {[15, 35, 55, 75].map((p) => (
                            <div key={`v${p}`} className="absolute h-full w-px bg-slate-300" style={{ left: `${p}%` }} />
                        ))}
                    </div>
                    <div className="flex flex-col items-center gap-3 z-10">
                        <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
                        <p className="text-sm font-medium text-slate-500">Loading map…</p>
                    </div>
                </div>
            )}

            {/* Locate me button */}
            <button
                onClick={locateMe}
                className="absolute bottom-48 right-4 flex size-12 items-center justify-center rounded-full bg-teal-600 shadow-lg active:scale-95 transition-transform"
                title="My location"
            >
                {locating ? (
                    <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                    <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                )}
            </button>

            {/* Report popup card — tap anywhere to open full report */}
            {selectedReport && cfg && statusCfg && (
                <Link
                    href={`/report/${selectedReport.id}`}
                    className="absolute bottom-20 inset-x-4 z-30 rounded-2xl bg-white shadow-xl overflow-hidden active:scale-[0.98] transition-transform"
                >
                    <div className="flex gap-3 p-3">
                        {/* Thumbnail */}
                        {(selectedReport.imageUrls?.[0] ?? selectedReport.imageUrl) ? (
                            <img
                                src={selectedReport.imageUrls?.[0] ?? selectedReport.imageUrl}
                                alt={selectedReport.title}
                                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                            />
                        ) : (
                            <div
                                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
                                style={{ backgroundColor: cfg.bg }}
                            >
                                <cfg.icon className="size-7" style={{ color: cfg.color }} />
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                            <p className="truncate text-sm font-bold text-slate-900">{selectedReport.title}</p>
                            {selectedReport.location && (
                                <p className="truncate text-xs text-slate-400">{selectedReport.location}</p>
                            )}
                            <div className="flex items-center gap-2">
                                <Badge {...statusCfg} />
                                <span className="flex items-center gap-0.5 text-xs font-medium text-slate-500">
                                    <ChevronUp className="size-3" />
                                    {selectedReport.upvoteCount}
                                </span>
                            </div>
                        </div>

                        {/* Close */}
                        <button
                            onClick={(e) => { e.preventDefault(); selectReport(null); onDismiss?.(); }}
                            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 self-start"
                        >
                            <X className="size-4 text-slate-500" />
                        </button>
                    </div>

                    {/* Hint */}
                    <div className="flex items-center justify-center border-t border-slate-100 py-2 gap-1">
                        <span className="text-xs text-slate-400">Tap to see full report</span>
                        <span className="text-xs text-teal-700 font-medium">→</span>
                    </div>
                </Link>
            )}
        </div>
    );
}
