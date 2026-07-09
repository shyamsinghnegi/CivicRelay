"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type UpvoteButtonProps = {
  reportId: string;
  initialCount: number;
};

export function UpvoteButton({ reportId, initialCount }: UpvoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpvote() {
    if (voted || loading) return;
    setLoading(true);

    const res = await fetch(`/api/reports/${reportId}/upvote`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setCount(data.upvoteCount);
      setVoted(true);
    } else if (res.status === 409) {
      // already voted on a previous visit
      setVoted(true);
    }

    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">
          {count} {count === 1 ? "person" : "people"} reported this
        </p>
        <p className="text-xs text-slate-500">Upvote to raise priority</p>
      </div>
      <button
        onClick={handleUpvote}
        disabled={voted || loading}
        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : voted ? (
          "Voted ✓"
        ) : (
          "Upvote"
        )}
      </button>
    </div>
  );
}
