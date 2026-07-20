import { adminsDb } from "./db";

// In-memory cache: email → { result, expiresAt }
// Scoped to the Node.js process — resets on server restart / cold start.
// TTL of 60s means an admin added/removed takes up to 1 min to propagate.
const cache = new Map<string, { result: boolean; expiresAt: number }>();
const TTL_MS = 60_000;

function isEnvAdmin(email: string): boolean {
    const fallback = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    return fallback.includes(email.toLowerCase());
}

export async function isAdmin(email: string | null | undefined): Promise<boolean> {
    if (!email) return false;

    const key = email.toLowerCase();
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && now < cached.expiresAt) return cached.result;

    let result: boolean;
    try {
        const { resources } = await adminsDb.items
            .query({
                query: "SELECT c.email FROM c WHERE c.email = @email",
                parameters: [{ name: "@email", value: key }],
            })
            .fetchAll();

        result = resources.length > 0 || isEnvAdmin(email);
    } catch {
        result = isEnvAdmin(email);
    }

    cache.set(key, { result, expiresAt: now + TTL_MS });
    return result;
}

// Call this after adding/removing an admin so the cache doesn't serve stale data.
export function invalidateAdminCache(email: string) {
    cache.delete(email.toLowerCase());
}
