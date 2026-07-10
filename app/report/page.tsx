"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Camera, ImagePlus, MapPin, ChevronRight, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CategoryTile } from "../components/CategoryTile";
import { Button } from "../components/Button";
import type { IssueCategory } from "../lib/categories";

type Step = 1 | 2 | 3;
type Photo = { preview: string; url: string };

export default function ReportPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<Step>(1);
    const [selectedCategory, setSelectedCategory] = useState<IssueCategory | null>(null);
    const [secondaryCategories, setSecondaryCategories] = useState<IssueCategory[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [aiTags, setAiTags] = useState<string[]>([]);
    const [detectedCategory, setDetectedCategory] = useState<IssueCategory | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            photos.forEach((p) => URL.revokeObjectURL(p.preview));
        };
    }, []);

    const categories: IssueCategory[] = [
        "pothole", "streetlight", "garbage", "water",
        "drainage", "traffic", "dumping", "other",
    ];

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        setUploading(true);
        setError(null);

        const MAX_PHOTOS = 6;
        if (photos.length >= MAX_PHOTOS) {
            setError("You can add up to 6 photos.");
            setUploading(false);
            return;
        }

        // Deduplicate within the batch by name+size, and against already-uploaded URLs
        const existingUrls = new Set(photos.map((p) => p.url));
        const slotsLeft = MAX_PHOTOS - photos.length;
        const seenKeys = new Set<string>();
        const uniqueFiles: File[] = [];
        for (const f of files) {
            if (uniqueFiles.length >= slotsLeft) break;
            const key = `${f.name}-${f.size}`;
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueFiles.push(f);
            }
        }

        const newPhotos: Photo[] = [];

        for (const file of uniqueFiles) {
            const preview = URL.createObjectURL(file);
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();

            if (!res.ok) {
                setError("One or more uploads failed. Please try again.");
                setUploading(false);
                return;
            }

            if (existingUrls.has(data.url)) {
                // Same image content already added — revoke the unused preview blob
                URL.revokeObjectURL(preview);
            } else {
                existingUrls.add(data.url);
                newPhotos.push({ preview, url: data.url });
            }
        }

        const allPhotos = [...photos, ...newPhotos];
        setPhotos(allPhotos);
        setUploading(false);

        if (allPhotos.length === 1) {
            const analyzeRes = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: allPhotos[0].url }),
            });
            const analyzeData = await analyzeRes.json();
            if (analyzeRes.ok && analyzeData.category) {
                setAiTags(analyzeData.tags ?? []);
                setDetectedCategory(analyzeData.category);
                setSelectedCategory(analyzeData.category);
            } else if (analyzeData.error === "blurry") {
                setError("Photo is too blurry to analyse — select the category yourself.");
            }
        }

        e.target.value = "";
    }

    function removePhoto(index: number) {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit() {
        if (!selectedCategory || !title || !description) return;

        setSubmitting(true);
        setError(null);

        const imageUrls = photos.map((p) => p.url);

        // Try to get GPS coordinates — non-blocking, submit anyway if denied
        let lat: number | undefined;
        let lng: number | undefined;
        let location = "India";
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
            );
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
            // Reverse geocode to get city name
            const geo = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
            const geoData = await geo.json();
            location = geoData.location ?? "India";
        } catch {
            // user denied or unavailable — submit without coords
        }

        const res = await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                description,
                category: selectedCategory,
                location,
                imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
                aiTags: aiTags.length > 0 ? aiTags : undefined,
                secondaryCategories: secondaryCategories.length > 0 ? secondaryCategories : undefined,
                lat,
                lng,
            }),
        });

        setSubmitting(false);

        if (!res.ok) {
            setError("Submission failed. Please try again.");
            return;
        }

        router.push("/nearby");
    }

    return (
        <div className="flex h-full flex-col bg-slate-50">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4">
                {step === 1 ? (
                    <Link href="/" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                        <ArrowLeft className="size-5 text-slate-700" />
                    </Link>
                ) : (
                    <button
                        onClick={() => setStep((s) => (s - 1) as Step)}
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"
                    >
                        <ArrowLeft className="size-5 text-slate-700" />
                    </button>
                )}
                <div className="flex-1">
                    <p className="text-xs font-medium text-slate-400">Step {step} of 3</p>
                    <h1 className="text-base font-bold text-slate-900">
                        {step === 1 && "Add photos"}
                        {step === 2 && "What's the issue?"}
                        {step === 3 && "Confirm details"}
                    </h1>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full bg-slate-200">
                <div
                    className="h-full bg-teal-600 transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                />
            </div>

            {/* Step 1 — Photos */}
            {step === 1 && (
                <div className="flex flex-1 flex-col px-5 py-6">
                    {photos.length > 0 ? (
                        <div className="flex flex-1 flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                {photos.map((photo, i) => (
                                    <div key={photo.url} className="relative aspect-square rounded-xl overflow-hidden">
                                        <img src={photo.preview} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                                        <button
                                            onClick={() => removePhoto(i)}
                                            className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/50"
                                        >
                                            <X className="size-3.5 text-white" />
                                        </button>
                                    </div>
                                ))}
                                {photos.length < 6 && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center gap-1"
                                    >
                                        <ImagePlus className="size-6 text-slate-400" />
                                        <span className="text-xs text-slate-400">Add more</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div
                            className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white cursor-pointer mb-5"
                            onClick={() => !uploading && fileInputRef.current?.click()}
                        >
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100">
                                {uploading ? (
                                    <Loader2 className="size-8 animate-spin text-teal-600" />
                                ) : (
                                    <ImagePlus className="size-8 text-slate-400" />
                                )}
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                {uploading ? "Uploading…" : "Tap to add photos from gallery"}
                            </p>
                        </div>
                    )}

                    {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

                    <div className="flex flex-col gap-3 mt-5">
                        {uploading && (
                            <div className="flex items-center justify-center gap-2 text-sm text-teal-600">
                                <Loader2 className="size-4 animate-spin" />
                                Uploading…
                            </div>
                        )}
                        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            <Camera className="size-4" />
                            Take photo
                        </Button>
                        {photos.length > 0 && !uploading && (
                            <Button onClick={() => setStep(2)}>
                                Next →
                            </Button>
                        )}
                        <button onClick={() => setStep(2)} className="text-sm text-slate-400 underline">
                            Skip photo
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2 — Category picker */}
            {step === 2 && (
                <div className="flex flex-col gap-5 px-5 py-6">
                    <p className="text-sm text-slate-500">
                        {detectedCategory ? (
                            <>
                                AI detected:{" "}
                                <span className="font-semibold text-teal-700">
                                    {detectedCategory.charAt(0).toUpperCase() + detectedCategory.slice(1)}
                                </span>
                                {" "}— tap to change
                            </>
                        ) : (
                            "Select the issue category"
                        )}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    if (cat === selectedCategory) {
                                        setSelectedCategory(null);
                                        setSecondaryCategories([]);
                                    } else if (secondaryCategories.includes(cat)) {
                                        setSecondaryCategories(secondaryCategories.filter((c) => c !== cat));
                                    } else if (!selectedCategory) {
                                        setSelectedCategory(cat);
                                    } else {
                                        setSecondaryCategories([...secondaryCategories, cat]);
                                    }
                                }}
                                className={[
                                    "flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all",
                                    selectedCategory === cat
                                        ? "ring-2 ring-teal-600 ring-offset-2"
                                        : secondaryCategories.includes(cat)
                                        ? "ring-2 ring-teal-300 ring-offset-2"
                                        : "",
                                ].join(" ")}
                            >
                                <CategoryTile category={cat} size="sm" />
                                <span className="text-sm font-semibold text-slate-900">
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </span>
                            </button>
                        ))}
                    </div>
                    {selectedCategory && (
                        <button
                            onClick={() => setStep(3)}
                            className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white"
                        >
                            Continue
                        </button>
                    )}
                </div>
            )}

            {/* Step 3 — Details */}
            {step === 3 && (
                <div className="flex flex-col gap-5 px-5 py-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Deep pothole on main road"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">Description</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the issue in a few words…"
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
                        <MapPin className="size-4 shrink-0 text-teal-700" />
                        <span className="flex-1 text-left text-sm text-slate-700">
                            Your location · captured on submit
                        </span>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button
                        className="mt-auto"
                        onClick={handleSubmit}
                        disabled={submitting || !title || !description}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Submitting…
                            </>
                        ) : (
                            "Submit report"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
