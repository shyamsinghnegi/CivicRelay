"use client";

import { useState } from "react";
import { ArrowLeft, Camera, ImagePlus, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CategoryTile } from "../components/CategoryTile";
import { Button } from "../components/Button";
import type { IssueCategory } from "../lib/categories";

type Step = 1 | 2 | 3;

export default function ReportPage() {
    const [step, setStep] = useState<Step>(1);
    const [selectedCategory, setSelectedCategory] = useState<IssueCategory | null>(null);

    const categories: IssueCategory[] = [
        "pothole", "streetlight", "garbage", "water",
        "drainage", "traffic", "dumping", "other",
    ];

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
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
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100">
                            <ImagePlus className="size-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                            Tap to add a photo
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button onClick={() => setStep(2)}>
                            <Camera className="size-4" />
                            Take photo
                        </Button>
                        <Button variant="outline" onClick={() => setStep(2)}>
                            <ImagePlus className="size-4" />
                            Choose from gallery
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2 — Category picker */}
            {step === 2 && (
                <div className="flex flex-col gap-5 px-5 py-6">
                    <p className="text-sm text-slate-500">
                        AI detected:{" "}
                        <span className="font-semibold text-teal-700">Pothole</span>
                        {" "}— tap to change
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
                            placeholder="e.g. Deep pothole on main road"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">
                            Description
                        </label>
                        <textarea
                            rows={4}
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

                    <Button className="mt-auto">Submit report</Button>
                </div>
            )}
        </div>
    );
}