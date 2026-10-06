"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useSavedBusinesses } from "@/hooks/useSavedBusinesses";
import { cn } from "@/lib/utils/cn";

interface FavoriteButtonProps {
  businessId: string;
  businessName?: string;
  businessCity?: string;
  businessCountry?: string;
  className?: string;
  variant?: "badge" | "card" | "button" | "minimal" | "floating";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function FavoriteButton({
  businessId,
  businessName,
  businessCity,
  businessCountry,
  className,
  variant = "card",
  size = "md",
  showLabel = false,
}: FavoriteButtonProps) {
  const { isSaved, toggleSave } = useSavedBusinesses();
  const saved = isSaved(businessId);
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    const isAdding = !saved; // capture before toggleSave flips state
    toggleSave(businessId, businessName);
    setTimeout(() => setAnimating(false), 400);
    // Fire analytics only when user is ADDING to favorites (not removing)
    if (isAdding && businessId) {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "favorite",
          businessId,
          businessName: businessName || businessId,
          city: businessCity || "Unknown",
          country: businessCountry || "Ethiopia",
          registeredBy: "client_telemetry",
        }),
      }).catch(() => {});
    }
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm",
          saved
            ? "bg-red-500 text-white border-red-500 shadow-red-500/20 hover:bg-red-600"
            : "bg-background border-border text-foreground hover:border-red-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20",
          animating && "scale-105",
          className
        )}
        title={saved ? "Remove from Favorites" : "Add to Favorites"}
      >
        <Heart
          className={cn(
            iconSizes[size],
            saved ? "fill-current" : "",
            animating && "animate-ping"
          )}
        />
        <span>{saved ? "Saved in Favorites" : "Add to Favorites"}</span>
      </button>
    );
  }

  if (variant === "floating" || variant === "card") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-md",
          saved
            ? "bg-white/95 dark:bg-slate-900/95 text-red-500 ring-2 ring-red-500/30 scale-100"
            : "bg-black/40 hover:bg-black/60 text-white hover:scale-110",
          animating && "scale-125",
          className
        )}
        title={saved ? "Saved in Favorites" : "Add to Favorites"}
      >
        <Heart
          className={cn(
            iconSizes[size],
            saved ? "fill-red-500 text-red-500" : "fill-none",
            animating && "scale-110"
          )}
        />
      </button>
    );
  }

  // Default / Minimal
  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "p-2 rounded-xl border transition-all duration-200 flex items-center gap-1.5",
        saved
          ? "bg-red-50 border-red-200 text-red-500 dark:bg-red-950/30 dark:border-red-900"
          : "border-border text-muted-foreground hover:text-red-500 hover:border-red-300 hover:bg-accent",
        animating && "scale-110",
        className
      )}
      title={saved ? "Saved in Favorites" : "Add to Favorites"}
    >
      <Heart
        className={cn(
          iconSizes[size],
          saved ? "fill-red-500 text-red-500" : "fill-none",
          animating && "scale-125"
        )}
      />
      {showLabel && (
        <span className="text-xs font-semibold">
          {saved ? "Saved" : "Save"}
        </span>
      )}
    </button>
  );
}
