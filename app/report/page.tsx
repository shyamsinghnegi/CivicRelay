"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Camera, ImagePlus, MapPin, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CategoryTile } from "../components/CategoryTile";
import { Button } from "../components/Button";
import type { IssueCategory } from "../lib/categories";

type Step = 1 | 2 | 3;

export default function ReportPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<Step>(1);
    const [selectedCategory, setSelectedCategory] = useState<IssueCategory | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const categories: IssueCategory[] = [
        "pothole", "streetlight", "garbage", "water",
        "drainage", "traffic", "dumping", "other",
    ];

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setImagePreview(URL.createObjectURL(file));
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        setUploading(false);

        if (!res.ok) {
            setError("Upload failed. Please try again.");
            return;
        }

        setImageUrl(data.url);
        setStep(2);
    }

    async function handleSubmit() {
        if (!selectedCategory || !title || !description) return;

        setSubmitting(true);
        setError(null);

        const res = await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                description,
                category: selectedCategory,
                location: "Ranchi",
                imageUrl: imageUrl ?? undefined,
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
        <div className="flex min-h-screen flex-col bg-slate-50">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4">
                {step === 1 ? (
                    <Link
                        href="/"
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"
                    >
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
                        {step === 1 && "Add a photo"}
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

            {/* Step 1 — Photo */}
            {step === 1 && (
                <div className="flex flex-1 flex-col gap-5 px-5 py-6">
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16">
                        {imagePreview ? (
                            <Image
                                src={imagePreview}
                                alt="Preview"
                                width={600}
                                height={160}
                                className="h-40 w-full rounded-xl object-cover"
                            />
                        ) : (
                            <>
                                <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100">
                                    {uploading ? (
                                        <Loader2 className="size-8 animate-spin text-teal-600" />
                                    ) : (
                                        <ImagePlus className="size-8 text-slate-400" />
                                    )}
                                </div>
                                <p className="text-sm font-medium text-slate-500">
                                    {uploading ? "Uploading…" : "Tap to add a photo"}
                                </p>
                            </>
                        )}
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex flex-col gap-3">
                        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            <Camera className="size-4" />
                            Take photo
                        </Button>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            <ImagePlus className="size-4" />
                            Choose from gallery
                        </Button>
                        <button
                            onClick={() => setStep(2)}
                            className="text-sm text-slate-400 underline"
                        >
                            Skip photo
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2 — Category picker */}
            {step === 2 && (
                <div className="flex flex-col gap-5 px-5 py-6">
                    <p className="text-sm text-slate-500">
                        Select the issue category
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setStep(3);
                                }}
                                className={[
                                    "flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all",
                                    selectedCategory === cat
                                        ? "ring-2 ring-teal-600 ring-offset-2"
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

                    <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
                        <MapPin className="size-4 shrink-0 text-teal-700" />
                        <span className="flex-1 text-left text-sm text-slate-700">
                            Ranchi · auto-detected
                        </span>
                        <ChevronRight className="size-4 text-slate-400" />
                    </button>

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
