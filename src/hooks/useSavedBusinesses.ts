import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const BASE_STORAGE_KEY = "bizfinder_saved";
const EVENT_KEY = "bizfinder_favorites_updated";

export interface SavedCollection {
  id: string;
  name: string;
  emoji: string;
  businessIds: string[];
  createdAt: string;
}

const DEFAULT_COLLECTIONS: SavedCollection[] = [
  {
    id: "col-favorites",
    name: "Favorites",
    emoji: "❤️",
    businessIds: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "col-want-to-try",
    name: "Want to Try",
    emoji: "🔖",
    businessIds: [],
    createdAt: new Date().toISOString(),
  },
];

function getStoredCollections(key: string): SavedCollection[] {
  if (typeof window === "undefined") return DEFAULT_COLLECTIONS;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_COLLECTIONS;
}

export function useSavedBusinesses() {
  const { user, isSignedIn, isLoaded } = useUser();
  const currentUserId = isLoaded && isSignedIn && user?.id ? user.id : "guest";
  const userStorageKey = `${BASE_STORAGE_KEY}_${currentUserId}`;

  const [collections, setCollections] = useState<SavedCollection[]>(() => {
    return getStoredCollections(userStorageKey);
  });

  // Load user-isolated collections from LocalStorage and sync with MongoDB
  useEffect(() => {
    // 1. Initial read from user-scoped storage
    const localCols = getStoredCollections(userStorageKey);
    setCollections(localCols);

    // 2. For authenticated users, sync authoritative favorites from MongoDB
    if (isSignedIn && user?.id) {
      fetch("/api/favorites")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && Array.isArray(data.savedBusinessIds)) {
            const cleanServerIds = data.savedBusinessIds.map((id: any) => String(id).trim());
            setCollections((prev) => {
              const currentLocal = getStoredCollections(userStorageKey);
              const baseCols = currentLocal.length > 0 ? currentLocal : prev;

              const updated = baseCols.map((c) =>
                c.id === "col-favorites"
                  ? { ...c, businessIds: cleanServerIds }
                  : c
              );

              // If col-favorites wasn't present, add it
              if (!updated.some((c) => c.id === "col-favorites")) {
                updated.unshift({
                  id: "col-favorites",
                  name: "Favorites",
                  emoji: "❤️",
                  businessIds: cleanServerIds,
                  createdAt: new Date().toISOString(),
                });
              }

              try {
                localStorage.setItem(userStorageKey, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        })
        .catch(() => {});
    }
  }, [userStorageKey, isSignedIn, user?.id]);

  // Listen for custom event and storage event for cross-component sync
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      const localCols = getStoredCollections(userStorageKey);
      setCollections(localCols);
    };

    window.addEventListener(EVENT_KEY, handleFavoritesUpdate);
    window.addEventListener("storage", handleFavoritesUpdate);
    return () => {
      window.removeEventListener(EVENT_KEY, handleFavoritesUpdate);
      window.removeEventListener("storage", handleFavoritesUpdate);
    };
  }, [userStorageKey]);

  const isSaved = useCallback(
    (businessId: string) => {
      if (!businessId) return false;
      const cleanId = String(businessId).trim();
      return collections.some((c) =>
        c.businessIds.some((id) => String(id).trim() === cleanId)
      );
    },
    [collections]
  );

  const toggleSave = useCallback(
    (businessId: string, businessName?: string, collectionId = "col-favorites") => {
      if (!businessId) return;
      const cleanId = String(businessId).trim();

      // Read current authoritative collections from storage (fallback to state)
      const currentStored = getStoredCollections(userStorageKey);
      const activeCols = currentStored.length > 0 ? currentStored : collections;

      // Check whether business is currently saved in target collection or ANY collection
      const inTarget = activeCols.some(
        (c) => c.id === collectionId && c.businessIds.some((id) => String(id).trim() === cleanId)
      );
      const inAny = activeCols.some((c) =>
        c.businessIds.some((id) => String(id).trim() === cleanId)
      );

      // If toggling general favorites and it is saved anywhere, or in target: unsave it!
      const wasAlreadySaved = collectionId === "col-favorites" ? (inAny || inTarget) : inTarget;
      const isNowSaved = !wasAlreadySaved;

      let nextCols: SavedCollection[];

      if (wasAlreadySaved) {
        // UNSAVE: Remove cleanId from collection(s)
        if (collectionId === "col-favorites") {
          // General unsave from heart icon removes from all collections
          nextCols = activeCols.map((c) => ({
            ...c,
            businessIds: c.businessIds.filter((id) => String(id).trim() !== cleanId),
          }));
        } else {
          // Specific collection unsave
          nextCols = activeCols.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  businessIds: c.businessIds.filter((id) => String(id).trim() !== cleanId),
                }
              : c
          );
        }
      } else {
        // SAVE: Add cleanId to the target collection
        let found = false;
        nextCols = activeCols.map((c) => {
          if (c.id === collectionId) {
            found = true;
            const alreadyIn = c.businessIds.some((id) => String(id).trim() === cleanId);
            return {
              ...c,
              businessIds: alreadyIn ? c.businessIds : [...c.businessIds, cleanId],
            };
          }
          return c;
        });

        if (!found) {
          nextCols.unshift({
            id: collectionId,
            name: collectionId === "col-favorites" ? "Favorites" : "Custom Collection",
            emoji: "❤️",
            businessIds: [cleanId],
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Synchronously write to localStorage
      try {
        localStorage.setItem(userStorageKey, JSON.stringify(nextCols));
      } catch {}

      // Update local state immediately
      setCollections(nextCols);

      // Broadcast immediately across all components on page
      window.dispatchEvent(
        new CustomEvent(EVENT_KEY, {
          detail: { businessId: cleanId, isSaved: isNowSaved },
        })
      );

      // Toast feedback
      const targetName = businessName ? `"${businessName}"` : "Business";
      if (isNowSaved) {
        toast.success(`❤️ ${targetName} added to your Favorites!`, {
          description: "Saved to your places and synced to your profile.",
          duration: 3000,
        });
      } else {
        toast.info(`Removed ${targetName} from Favorites.`, {
          description: "Removed from your saved places.",
          duration: 2500,
        });
      }

      // Sync with MongoDB backend
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: cleanId,
          collectionId,
          action: isNowSaved ? "add" : "remove",
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && Array.isArray(data.savedBusinessIds)) {
            const cleanServerIds = data.savedBusinessIds.map((id: any) => String(id).trim());
            setCollections((prev) => {
              const current = getStoredCollections(userStorageKey);
              const base = current.length > 0 ? current : prev;
              const synced = base.map((c) =>
                c.id === "col-favorites"
                  ? { ...c, businessIds: cleanServerIds }
                  : c
              );
              try {
                localStorage.setItem(userStorageKey, JSON.stringify(synced));
              } catch {}
              return synced;
            });
            window.dispatchEvent(new CustomEvent(EVENT_KEY));
          }
        })
        .catch((err) => {
          console.error("Failed to sync favorite to MongoDB:", err);
        });
    },
    [userStorageKey, collections]
  );

  const addCollection = useCallback((name: string, emoji: string) => {
    const newCol: SavedCollection = {
      id: `col-${Date.now()}`,
      name,
      emoji,
      businessIds: [],
      createdAt: new Date().toISOString(),
    };
    setCollections((prev) => {
      const next = [...prev, newCol];
      try {
        localStorage.setItem(userStorageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent(EVENT_KEY));
    });
    toast.success(`Collection "${emoji} ${name}" created!`);
    return newCol;
  }, [userStorageKey]);

  const deleteCollection = useCallback((collectionId: string) => {
    setCollections((prev) => {
      const next = prev.filter((c) => c.id !== collectionId);
      try {
        localStorage.setItem(userStorageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent(EVENT_KEY));
    });
    toast.info("Collection deleted.");
  }, [userStorageKey]);

  const moveToCollection = useCallback(
    (businessId: string, fromId: string, toId: string) => {
      setCollections((prev) => {
        const next = prev.map((c) => {
          if (c.id === fromId)
            return {
              ...c,
              businessIds: c.businessIds.filter((id) => id !== businessId),
            };
          if (c.id === toId && !c.businessIds.includes(businessId))
            return { ...c, businessIds: [...c.businessIds, businessId] };
          return c;
        });
        try {
          localStorage.setItem(userStorageKey, JSON.stringify(next));
        } catch {}
        return next;
      });
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(EVENT_KEY));
      });
      toast.success("Moved to collection!");
    },
    [userStorageKey]
  );

  const totalSaved = collections.reduce(
    (sum, c) => sum + c.businessIds.length,
    0
  );

  const favoritesList = collections.find((c) => c.id === "col-favorites")?.businessIds || [];

  return {
    collections,
    favoritesList,
    isSaved,
    toggleSave,
    addCollection,
    deleteCollection,
    moveToCollection,
    totalSaved,
  };
}
