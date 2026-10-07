import React from "react";
import Link from "next/link";
import {
  MapPin,
  Shield,
  Globe,
  Utensils,
  Pill,
  Hotel,
  Wrench,
  Laptop,
  Coffee,
  ShoppingBag,
  Stethoscope,
  Navigation,
  Building2,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const TOP_CATEGORIES = [
  {
    name: "Restaurants & Dining",
    hint: "Cafes, Bars, Traditional",
    slug: "restaurants",
    icon: Utensils,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
  },
  {
    name: "Pharmacies & Health",
    hint: "24/7 Meds, Clinics",
    slug: "pharmacies",
    icon: Pill,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  {
    name: "Hotels & Lodging",
    hint: "Suites, Luxury, Resorts",
    slug: "luxury-hotels",
    icon: Hotel,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/50",
  },
  {
    name: "Auto Repair & Care",
    hint: "Garages, Tires, Spares",
    slug: "auto-repair",
    icon: Wrench,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/50",
  },
  {
    name: "Electronics & Tech",
    hint: "Computers, Mobile, Repairs",
    slug: "electronics-computers",
    icon: Laptop,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
  },
  {
    name: "Cafes & Roasteries",
    hint: "Specialty Beans, Pastry",
    slug: "coffee-shops",
    icon: Coffee,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/50",
  },
  {
    name: "Hospitals & Care",
    hint: "Specialists, Dental, Labs",
    slug: "hospitals",
    icon: Stethoscope,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/50",
  },
  {
    name: "Retail & Shopping",
    hint: "Markets, Boutiques, Malls",
    slug: "shopping",
    icon: ShoppingBag,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/50",
  },
];

const POPULAR_LOCATIONS = [
  {
    name: "Bole, Addis Ababa",
    district: "Edna Mall & Medhanialem",
    query: "bole",
    city: "Addis Ababa",
  },
  {
    name: "Kazanchis, Addis Ababa",
    district: "UN-ECA & Interluxury",
    query: "kazanchis",
    city: "Addis Ababa",
  },
  {
    name: "Sarbet / Old Airport",
    district: "Embassies & International",
    query: "sarbet",
    city: "Addis Ababa",
  },
  {
    name: "Piassa & Arada",
    district: "Heritage, Jewelry, Central",
    query: "piassa",
    city: "Addis Ababa",
  },
  {
    name: "Westlands, Nairobi",
    district: "Sarit, Westgate & Tech Hub",
    query: "westlands",
    city: "Nairobi",
  },
  {
    name: "Kilimani, Nairobi",
    district: "Yaya Center & Commercial",
    query: "kilimani",
    city: "Nairobi",
  },
  {
    name: "Haya Hulet & 22",
    district: "Hotels, Shopping & Transit",
    query: "haya-hulet",
    city: "Addis Ababa",
  },
  {
    name: "CMC & Summit",
    district: "Residential, Centers & Malls",
    query: "cmc",
    city: "Addis Ababa",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-slate-50/70 dark:bg-slate-950 text-foreground transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12">
        
        {/* ─── Modern Visual Discovery Showcase: Top Categories & Urban Hubs ─── */}
        <div className="space-y-8 sm:space-y-10">
          
          {/* Top Categories Showcase */}
          <div>
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3.5 sm:mb-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs xs:text-sm font-black text-foreground uppercase tracking-wider">
                  Top Business Categories
                </h3>
              </div>
              <Link
                href="/categories"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start xs:self-auto"
              >
                <span>View All 70 Sectors</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Responsive Category Grid: 2 cols on XS/S, 3-4 cols on M, 4 cols on L/XL */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-3">
              {TOP_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.slug}
                    href={`/search?category=${cat.slug}`}
                    className="group p-2.5 xs:p-3 rounded-xl sm:rounded-2xl border border-border/80 bg-card hover:bg-accent/60 hover:border-indigo-500/40 hover:shadow-md transition-all flex items-center gap-2.5 min-w-0"
                  >
                    <div
                      className={`w-7 h-7 xs:w-8 xs:h-8 rounded-lg xs:rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
                    >
                      <Icon className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate hidden xs:block">
                        {cat.hint}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Cities & Areas Geographic Showcase */}
          <div>
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3.5 sm:mb-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Navigation className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs xs:text-sm font-black text-foreground uppercase tracking-wider">
                  Popular Cities & Urban Areas
                </h3>
              </div>
              <Link
                href="/search"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start xs:self-auto"
              >
                <span>Live GPS Map</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Responsive Cities Grid: 2 cols on XS/S, 3-4 cols on M, 4 cols on L/XL */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-3">
              {POPULAR_LOCATIONS.map((loc) => (
                <Link
                  key={loc.query}
                  href={`/search?location=${loc.query}`}
                  className="group p-2.5 xs:p-3 rounded-xl sm:rounded-2xl border border-border/80 bg-card hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 hover:border-emerald-500/40 hover:shadow-md transition-all flex items-center gap-2.5 min-w-0"
                >
                  <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg xs:rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <MapPin className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {loc.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate hidden xs:block">
                      {loc.district}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Secondary Footer Grid: Brand & Business Portals ─── */}
        <div className="pt-6 sm:pt-8 border-t border-border/70 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* Brand Info & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-foreground">
                Biz<span className="text-indigo-600 dark:text-indigo-400">Finder</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              The premier hyper-local business search engine and verified registry. Find top-rated restaurants, pharmacies, mechanics, hotels, and professional services with live hours and map routing.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verified
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                <Globe className="w-3.5 h-3.5" /> Multi-City Directory
              </span>
            </div>
          </div>

          {/* Quick Business Portals */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              For Business Owners
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground font-medium">
              <li>
                <Link href="/dashboard/listings/new" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <ArrowUpRight className="w-3 h-3 text-indigo-500" />
                  <span>Claim or Add Your Business</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <ArrowUpRight className="w-3 h-3 text-indigo-500" />
                  <span>Owner Dashboard & Analytics</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/boost" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <ArrowUpRight className="w-3 h-3 text-indigo-500" />
                  <span>Promoted Listings & Boost</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Operations & Administration */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              Platform & Administration
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground font-medium">
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-amber-500" />
                  <span>Operations & Admin Portal</span>
                </Link>
              </li>
              <li>
                <Link href="/city-admin" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-sky-500" />
                  <span>City Administrator Console</span>
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-emerald-500" />
                  <span>Geo-Synchronized Discovery Map</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Bottom Copyright Bar ─── */}
        <div className="pt-5 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} BizFinder Engine. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline font-semibold">Theme:</span>
            <ThemeToggle variant="pill" />
          </div>
        </div>
      </div>
    </footer>
  );
}
