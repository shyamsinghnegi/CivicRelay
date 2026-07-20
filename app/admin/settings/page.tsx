"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Loader2, ShieldCheck } from "lucide-react";

type Admin = { id: string; email: string; addedAt: string };

export default function AdminSettings() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState("");
    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function fetchAdmins() {
        const res = await fetch("/api/admin/admins");
        const data = await res.json();
        setAdmins(data.items ?? []);
        setLoading(false);
    }

    useEffect(() => { fetchAdmins(); }, []);

    async function addAdmin(e: React.FormEvent) {
        e.preventDefault();
        if (!newEmail.trim()) return;
        setAdding(true);
        setError(null);

        const res = await fetch("/api/admin/admins", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: newEmail.trim() }),
        });

        if (res.ok) {
            setNewEmail("");
            await fetchAdmins();
        } else {
            const data = await res.json();
            setError(data.error ?? "Failed to add admin.");
        }
        setAdding(false);
    }

    async function removeAdmin(email: string) {
        setRemoving(email);
        setError(null);

        const res = await fetch("/api/admin/admins", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (res.ok) {
            await fetchAdmins();
        } else {
            const data = await res.json();
            setError(data.error ?? "Failed to remove admin.");
        }
        setRemoving(null);
    }

    return (
        <div className="mx-auto max-w-xl p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Admin Access</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Manage who has access to the admin portal. Changes take effect immediately.
                </p>
            </div>

            {/* Add admin */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 text-sm font-semibold text-slate-700">Add Admin</p>
                <form onSubmit={addAdmin} className="flex gap-2">
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={adding || !newEmail.trim()}
                        className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                        Add
                    </button>
                </form>
                {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            </div>

            {/* Admin list */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Current Admins
                </div>

                {loading ? (
                    <div className="flex flex-col divide-y divide-slate-100">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center gap-3 px-5 py-4">
                                <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                            </div>
                        ))}
                    </div>
                ) : admins.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-slate-400">No admins found.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {admins.map((admin) => (
                            <div key={admin.id} className="flex items-center gap-3 px-5 py-3.5">
                                <ShieldCheck className="size-4 shrink-0 text-teal-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{admin.email}</p>
                                    <p className="text-xs text-slate-400">
                                        Added {new Date(admin.addedAt).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "short", year: "numeric",
                                        })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeAdmin(admin.email)}
                                    disabled={removing === admin.email}
                                    className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40 transition-colors"
                                    title="Remove admin"
                                >
                                    {removing === admin.email
                                        ? <Loader2 className="size-4 animate-spin" />
                                        : <Trash2 className="size-4" />
                                    }
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="mt-4 text-xs text-slate-400">
                Note: also update <code className="rounded bg-slate-100 px-1">ADMIN_EMAILS</code> in your environment
                variables to keep the middleware gate in sync.
            </p>
        </div>
    );
}
