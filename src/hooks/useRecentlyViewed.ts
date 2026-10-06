import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Business } from "@/types/business";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";

const MAX_ITEMS = 12;

export interface RecentlyViewedEntry {
  businessId: string;
  viewedAt: string; // ISO string
}

export function useRecentlyViewed() {
  const { user, isSignedIn, isLoaded } = useUser();
  const storageKey = isLoaded && isSignedIn && user?.id
    ? `bizfinder_recently_viewed_${user.id}`
    : "bizfinder_recently_viewed_guest";

  const [entries, setEntries] = useState<RecentlyViewedEntry[]>([]);
  const hasLoadedRef = useRef(false);

  // Load from localStorage whenever storageKey changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setEntries(JSON.parse(raw));
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    } finally {
      hasLoadedRef.current = true;
    }
  }, [storageKey]);

  // Persist whenever entries change (only after initial load)
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch {
      // localStorage unavailable (SSR / private mode)
    }
  }, [entries, storageKey]);

  const trackView = useCallback((businessId: string) => {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.businessId !== businessId);
      const next = [
        { businessId, viewedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_ITEMS);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  // Hydrate with full Business objects
  const businesses: Business[] = entries
    .map((e) => SEED_BUSINESSES.find((b) => b.id === e.businessId))
    .filter((b): b is Business => Boolean(b));

  return { entries, businesses, trackView, clearHistory };
}

