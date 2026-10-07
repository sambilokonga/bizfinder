"use client";

import React from "react";
import Link from "next/link";
import {
  Utensils,
  Pill,
  Hotel,
  Wrench,
  Laptop,
  ShoppingCart,
  Sparkles,
  Landmark,
  Dumbbell,
  Car,
  HeartPulse,
  Coffee,
} from "lucide-react";
import { SEED_CATEGORIES } from "@/lib/db/seed-data/categories";

const ICON_MAP: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-5 h-5" />,
  UtensilsCrossed: <Utensils className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Pill: <Pill className="w-5 h-5" />,
  HeartPulse: <HeartPulse className="w-5 h-5" />,
  Hospital: <HeartPulse className="w-5 h-5" />,
  Hotel: <Hotel className="w-5 h-5" />,
  Building2: <Hotel className="w-5 h-5" />,
  Wrench: <Wrench className="w-5 h-5" />,
  Car: <Car className="w-5 h-5" />,
  Laptop: <Laptop className="w-5 h-5" />,
  ShoppingCart: <ShoppingCart className="w-5 h-5" />,
  ShoppingBag: <ShoppingCart className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Landmark: <Landmark className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
};

export function CategoryChips() {
  const topCategories = SEED_CATEGORIES.filter((c) => c.level === 1 || c.featured).slice(0, 10);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-[11px] xs:text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Popular Categories
        </h3>
        <Link
          href="/categories"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
        >
          <span>View all 70+</span>
          <span>&rarr;</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 xs:gap-3 sm:gap-4">
        {topCategories.map((cat) => {
          const icon = (cat.icon && ICON_MAP[cat.icon]) || <Sparkles className="w-5 h-5" />;
          return (
            <Link
              key={cat.id}
              href={`/search?category=${cat.slug}`}
              className="group flex flex-col items-center text-center p-2.5 xs:p-3 sm:p-3.5 rounded-xl xs:rounded-2xl bg-card hover:bg-primary/5 border border-border/80 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="w-10 h-10 xs:w-11 xs:h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-200 shadow-sm shrink-0">
                {icon}
              </div>
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
