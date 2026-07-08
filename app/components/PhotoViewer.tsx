"use client";

import { useState, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function PhotoViewer({ urls, title }: { urls: string[]; title: string }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    // pinch state
    const lastPinchDist = useRef<number | null>(null);
    const lastTap = useRef<number>(0);
    const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

    function resetZoom() {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }

    function openAt(i: number) {
        resetZoom();
        setActiveIndex(i);
    }

    function close() {
        resetZoom();
        setActiveIndex(null);
    }

    function prev() {
        resetZoom();
        setActiveIndex((i) => (i !== null ? (i - 1 + urls.length) % urls.length : 0));
    }

    function next() {
        resetZoom();
        setActiveIndex((i) => (i !== null ? (i + 1) % urls.length : 0));
    }

    // double-tap to zoom in/out
    function handleTap(e: React.MouseEvent) {
        e.stopPropagation();
        const now = Date.now();
        if (now - lastTap.current < 300) {
            if (scale > 1) resetZoom();
            else setScale(2.5);
        }
        lastTap.current = now;
    }

    const swipeStart = useRef<{ x: number; y: number } | null>(null);

    // touch pinch-to-zoom + swipe
    function handleTouchStart(e: React.TouchEvent) {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastPinchDist.current = Math.hypot(dx, dy);
            swipeStart.current = null;
        } else if (e.touches.length === 1) {
            swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            if (scale > 1) {
                dragStart.current = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    ox: offset.x,
                    oy: offset.y,
                };
            }
        }
    }

    function handleTouchMove(e: React.TouchEvent) {
        if (e.touches.length === 2 && lastPinchDist.current !== null) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx, dy);
            const ratio = dist / lastPinchDist.current;
            setScale((s) => Math.min(Math.max(s * ratio, 1), 5));
            lastPinchDist.current = dist;
        } else if (e.touches.length === 1 && dragStart.current && scale > 1) {
            const dx = e.touches[0].clientX - dragStart.current.x;
            const dy = e.touches[0].clientY - dragStart.current.y;
            setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
        }
    }

    function handleTouchEnd(e: React.TouchEvent) {
        lastPinchDist.current = null;
        dragStart.current = null;
        if (scale < 1.05) resetZoom();

        // swipe to navigate (only when not zoomed)
        if (!zoomed && swipeStart.current && urls.length > 1) {
            const dx = e.changedTouches[0].clientX - swipeStart.current.x;
            const dy = Math.abs(e.changedTouches[0].clientY - swipeStart.current.y);
            if (Math.abs(dx) > 50 && dy < 60) {
                dx < 0 ? next() : prev();
            }
        }
        swipeStart.current = null;
    }

    const zoomed = scale > 1.05;

    return (
        <>
            <div className="flex gap-2 overflow-x-auto px-5 pb-1">
                {urls.map((url, i) => (
                    <button key={i} onClick={() => openAt(i)} className="shrink-0">
                        <img
                            src={url}
                            alt={`${title} photo ${i + 1}`}
                            className="h-52 w-72 rounded-2xl object-cover"
                        />
                    </button>
                ))}
            </div>

            {activeIndex !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                    onClick={zoomed ? undefined : close}
                >
                    {/* Close */}
                    <button
                        className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/10"
                        onClick={close}
                    >
                        <X className="size-5 text-white" />
                    </button>

                    {/* Prev — hide when zoomed */}
                    {urls.length > 1 && !zoomed && (
                        <button
                            className="absolute left-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/10"
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                        >
                            <ChevronLeft className="size-5 text-white" />
                        </button>
                    )}

                    <img
                        src={urls[activeIndex]}
                        alt={`${title} photo ${activeIndex + 1}`}
                        className="max-h-[90dvh] max-w-[95vw] rounded-xl object-contain select-none"
                        style={{
                            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                            transition: scale === 1 ? "transform 0.2s" : "none",
                            cursor: zoomed ? "grab" : "zoom-in",
                        }}
                        onClick={handleTap}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        draggable={false}
                    />

                    {/* Next — hide when zoomed */}
                    {urls.length > 1 && !zoomed && (
                        <button
                            className="absolute right-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/10"
                            onClick={(e) => { e.stopPropagation(); next(); }}
                        >
                            <ChevronRight className="size-5 text-white" />
                        </button>
                    )}

                    {/* Dot indicators */}
                    {urls.length > 1 && !zoomed && (
                        <div className="absolute bottom-6 flex gap-1.5">
                            {urls.map((_, i) => (
                                <div
                                    key={i}
                                    className={`size-1.5 rounded-full transition-all ${i === activeIndex ? "bg-white w-4" : "bg-white/40"}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Zoom hint */}
                    {zoomed && (
                        <p className="absolute bottom-6 text-xs text-white/50">Double-tap to reset</p>
                    )}
                </div>
            )}
        </>
    );
}
