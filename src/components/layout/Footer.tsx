import React from "react";
import Link from "next/link";
import { MapPin, Shield, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Footer() {
  return (
    <footer className="border-t border-border bg-slate-50 dark:bg-slate-950 text-foreground transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">
                Biz<span className="text-indigo-600 dark:text-indigo-400">Finder</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The premier local business search engine and verified directory. Discover top-rated restaurants, pharmacies, hotels, auto repair, and professional services near you.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> 100% Verified Listings
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-indigo-500" /> Multi-City Geo Search
              </span>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/search?category=restaurants" className="hover:text-primary transition-colors">
                  Restaurants & Dining
                </Link>
              </li>
              <li>
                <Link href="/search?category=pharmacies" className="hover:text-primary transition-colors">
                  Pharmacies & Health
                </Link>
              </li>
              <li>
                <Link href="/search?category=luxury-hotels" className="hover:text-primary transition-colors">
                  Hotels & Lodging
                </Link>
              </li>
              <li>
                <Link href="/search?category=auto-repair" className="hover:text-primary transition-colors">
                  Auto Repair & Services
                </Link>
              </li>
              <li>
                <Link href="/search?category=electronics-computers" className="hover:text-primary transition-colors">
                  Electronics & Tech
                </Link>
              </li>
            </ul>
          </div>

          {/* Cities & Locations */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">
              Cities & Areas
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/search?location=bole" className="hover:text-primary transition-colors">
                  Bole, Addis Ababa
                </Link>
              </li>
              <li>
                <Link href="/search?location=kazanchis" className="hover:text-primary transition-colors">
                  Kazanchis, Addis Ababa
                </Link>
              </li>
              <li>
                <Link href="/search?location=sarbet" className="hover:text-primary transition-colors">
                  Old Airport / Sarbet
                </Link>
              </li>
              <li>
                <Link href="/search?location=westlands" className="hover:text-primary transition-colors">
                  Westlands, Nairobi
                </Link>
              </li>
              <li>
                <Link href="/search?location=kilimani" className="hover:text-primary transition-colors">
                  Kilimani, Nairobi
                </Link>
              </li>
            </ul>
          </div>

          {/* For Business Owners & Admins */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">
              For Businesses
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard/listings/new" className="hover:text-primary transition-colors">
                  Claim Your Listing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/boost" className="hover:text-primary transition-colors">
                  Sponsored Placement
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} BizFinder Engine. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Theme Preference:</span>
            <ThemeToggle variant="pill" />
          </div>
        </div>
      </div>
    </footer>
  );
}
