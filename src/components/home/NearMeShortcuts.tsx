"use client";

import React from "react";
import Link from "next/link";
import { Navigation, Utensils, Pill, Landmark, Coffee, Fuel, ShoppingBag } from "lucide-react";

export function NearMeShortcuts() {
  const shortcuts = [
    { label: "Restaurants near me", query: "restaurants near me", icon: <Utensils className="w-3.5 h-3.5" /> },
    { label: "Pharmacies open now", query: "pharmacy open now", icon: <Pill className="w-3.5 h-3.5" /> },
    { label: "ATMs & Banks near me", query: "banks near me", icon: <Landmark className="w-3.5 h-3.5" /> },
    { label: "Cafes & Coffee near me", query: "cafe near me", icon: <Coffee className="w-3.5 h-3.5" /> },
    { label: "Auto repair nearby", query: "auto repair near me", icon: <Fuel className="w-3.5 h-3.5" /> },
    { label: "Supermarkets open now", query: "supermarket open now", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
        <Navigation className="w-3.5 h-3.5 text-indigo-500" />
        Quick Shortcuts:
      </span>
      {shortcuts.map((sc, idx) => (
        <Link
          key={idx}
          href={`/search?q=${encodeURIComponent(sc.query)}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-foreground border border-border/60 transition-all shadow-sm"
        >
          {sc.icon}
          {sc.label}
        </Link>
      ))}
    </div>
  );
}
