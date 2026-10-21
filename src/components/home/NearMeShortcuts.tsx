"use client";

import React from "react";
import Link from "next/link";
import { Navigation, Utensils, Pill, Landmark, Coffee, Fuel, ShoppingBag, Sparkles } from "lucide-react";

export function NearMeShortcuts() {
  const shortcuts = [
    {
      label: "Restaurants near me",
      query: "restaurants near me",
      icon: <Utensils className="w-3.5 h-3.5 text-amber-500" />,
      bg: "hover:border-amber-400/40 hover:bg-amber-500/5",
    },
    {
      label: "Pharmacies open now",
      query: "pharmacy open now",
      icon: <Pill className="w-3.5 h-3.5 text-teal-500" />,
      bg: "hover:border-teal-400/40 hover:bg-teal-500/5",
    },
    {
      label: "ATMs & Banks nearby",
      query: "banks near me",
      icon: <Landmark className="w-3.5 h-3.5 text-emerald-500" />,
      bg: "hover:border-emerald-400/40 hover:bg-emerald-500/5",
    },
    {
      label: "Cafés & Coffee",
      query: "cafe near me",
      icon: <Coffee className="w-3.5 h-3.5 text-orange-500" />,
      bg: "hover:border-orange-400/40 hover:bg-orange-500/5",
    },
    {
      label: "Auto repairs & gas",
      query: "auto repair near me",
      icon: <Fuel className="w-3.5 h-3.5 text-blue-500" />,
      bg: "hover:border-blue-400/40 hover:bg-blue-500/5",
    },
    {
      label: "Supermarkets open now",
      query: "supermarket open now",
      icon: <ShoppingBag className="w-3.5 h-3.5 text-fuchsia-500" />,
      bg: "hover:border-fuchsia-400/40 hover:bg-fuchsia-500/5",
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 xs:gap-2 pt-1.5 xs:pt-2">
      <span className="text-[10px] xs:text-[11px] sm:text-xs font-bold text-muted-foreground flex items-center gap-1 xs:gap-1.5 mr-0.5 xs:mr-1">
        <Sparkles className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-indigo-500" />
        Quick Discover:
      </span>
      {shortcuts.map((sc, idx) => (
        <Link
          key={idx}
          href={`/search?q=${encodeURIComponent(sc.query)}`}
          className={`inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 sm:px-3 py-0.5 xs:py-1 sm:py-1.5 rounded-full text-[10px] xs:text-[11px] sm:text-xs font-semibold bg-card text-foreground border border-border/70 ${sc.bg} transition-all duration-200 shadow-xs hover:shadow-xs hover:-translate-y-0.5`}
        >
          {sc.icon}
          <span>{sc.label}</span>
        </Link>
      ))}
    </div>
  );
}
