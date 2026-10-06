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

export function useSavedBusinesses() {
  const { user, isSignedIn, isLoaded } = useUser();
  const currentUserId = isLoaded && isSignedIn && user?.id ? user.id : "guest";
  const userStorageKey = `${BASE_STORAGE_KEY}_${currentUserId}`;

  const [collections, setCollections] = useState<SavedCollection[]>(DEFAULT_COLLECTIONS);

  // Load user-isolated collections from LocalStorage and sync with MongoDB
  useEffect(() => {
    // 1. Initial read from user-scoped storage
    try {
      const raw = localStorage.getItem(userStorageKey);
      if (raw) {
        setCollections(JSON.parse(raw));
      } else {
        setCollections(DEFAULT_COLLECTIONS);
      }
    } catch {
      setCollections(DEFAULT_COLLECTIONS);
    }

    // 2. For authenticated users, sync authoritative favorites from MongoDB
    if (isSignedIn && user?.id) {
      fetch("/api/favorites")
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.savedBusinessIds)) {
            setCollections((prev) => {
              // Ensure we start with the current user's existing collections or default
              let baseCols = prev;
              try {
                const raw = localStorage.getItem(userStorageKey);
                if (raw) baseCols = JSON.parse(raw);
              } catch {}

              const updated = baseCols.map((c) =>
                c.id === "col-favorites"
                  ? { ...c, businessIds: data.savedBusinessIds }
                  : c
              );

              // If col-favorites wasn't present, add it
              if (!updated.some((c) => c.id === "col-favorites")) {
                updated.unshift({
                  id: "col-favorites",
                  name: "Favorites",
                  emoji: "❤️",
                  businessIds: data.savedBusinessIds,
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

  // Listen for custom event for cross-component sync
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      try {
        const raw = localStorage.getItem(userStorageKey);
        if (raw) setCollections(JSON.parse(raw));
      } catch {}
    };

    window.addEventListener(EVENT_KEY, handleFavoritesUpdate);
    window.addEventListener("storage", handleFavoritesUpdate);
    return () => {
      window.removeEventListener(EVENT_KEY, handleFavoritesUpdate);
      window.removeEventListener("storage", handleFavoritesUpdate);
    };
  }, [userStorageKey]);

  const isSaved = useCallback(
    (businessId: string) =>
      collections.some((c) => c.businessIds.includes(businessId)),
    [collections]
  );

  const toggleSave = useCallback(
    (businessId: string, businessName?: string, collectionId = "col-favorites") => {
      // Capture wasAlreadySaved BEFORE the update inside the updater fn (gets actual prev state)
      let wasAlreadySaved = false;

      setCollections((prev) => {
        const target = prev.find((c) => c.id === collectionId);
        wasAlreadySaved = target?.businessIds.includes(businessId) ?? false;

        const updated = prev.map((c) => {
          if (c.id !== collectionId) return c;
          return {
            ...c,
            businessIds: wasAlreadySaved
              ? c.businessIds.filter((id) => id !== businessId)
              : [...c.businessIds, businessId],
          };
        });

        try {
          localStorage.setItem(userStorageKey, JSON.stringify(updated));
        } catch {}

        return updated;
      });

      // isNowSaved is the inverse of what we captured above
      const isNowSaved = !wasAlreadySaved;

      // Dispatch after the state update to avoid triggering setState in other
      // components (e.g. Navbar) while React is still rendering this one.
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent(EVENT_KEY));
      });

      // Show immediate Feedback Toast
      const targetName = businessName ? `"${businessName}"` : "Business";
      if (isNowSaved) {
        toast.success(`❤️ ${targetName} added to your Favorites!`, {
          description: "Saved to your places and synced to your profile.",
          duration: 3500,
        });
      } else {
        toast.info(`Removed ${targetName} from Favorites.`, {
          duration: 2500,
        });
      }

      // Sync with MongoDB in the background
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          collectionId,
          action: isNowSaved ? "add" : "remove",
        }),
      }).catch((err) => {
        console.error("Failed to sync favorite to MongoDB:", err);
      });
    },
    [userStorageKey]
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
