"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Layers,
  ChevronRight,
  MapPin,
  Star,
  CheckCircle2,
  Phone,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SEED_CATEGORIES,
  getCategoryBySlug,
  getCategoryBreadcrumbs,
} from "@/lib/db/seed-data/categories";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { getLiveOpeningStatus } from "@/lib/utils/opening-hours";
import { getBusinessCoverUrl, DEFAULT_BUSINESS_COVER } from "@/lib/utils/business-media";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { isBusinessInCategory, getCategoryRelatedTokens } from "@/lib/utils/category-matcher";

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const category = getCategoryBySlug(slug) || getCategoryRelatedTokens(slug).targetCategory;

  if (!category) {
    notFound();
  }

  const breadcrumbs = getCategoryBreadcrumbs(category.id);
  const subcategories = SEED_CATEGORIES.filter((c) => c.parentId === category.id);
  
  // Find matching businesses for this category or its subcategories
  const initialMatching = SEED_BUSINESSES.filter((b) =>
    isBusinessInCategory(b, slug || category.id)
  );

  const [matchingBusinesses, setMatchingBusinesses] = React.useState(initialMatching);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/businesses?category=${encodeURIComponent(category.slug || category.id)}&limit=200`)
      .then((res) => res.json())
      .then((data) => {
        let fetched: any[] = [];
        if (data?.businesses && Array.isArray(data.businesses)) {
          fetched = data.businesses;
        }
        const seedMatches = SEED_BUSINESSES.filter((b) => isBusinessInCategory(b, slug || category.id));
        const existingIds = new Set(fetched.map((b: any) => b.id));
        const combined = [...fetched, ...seedMatches.filter((s) => !existingIds.has(s.id))];
        setMatchingBusinesses(combined);
      })
      .catch(() => {
        const seedMatches = SEED_BUSINESSES.filter((b) => isBusinessInCategory(b, slug || category.id));
        setMatchingBusinesses(seedMatches);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category.id, category.slug, slug]);

  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-950/50 py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/categories" className="hover:text-primary transition-colors">
            Categories
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-3.5 h-3.5" />
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-foreground font-semibold">{crumb.name}</span>
              ) : (
                <Link
                  href={`/category/${crumb.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {crumb.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Category Hero Header */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="secondary" className="gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Level {category.level} Taxonomy Node
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {category.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Find and compare top-rated, verified businesses in {category.name}. Check opening hours, reviews, and interactive map locations.
            </p>
          </div>

          <div>
            <Link href={`/search?category=${category.slug}`}>
              <Button variant="gradient" size="lg" className="font-bold rounded-2xl gap-2 shadow-md">
                Search Map for {category.name}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Subcategories Grid (if any) */}
        {subcategories.length > 0 && (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-foreground">
              Subcategories in {category.name} ({subcategories.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/search?category=${sub.slug}`}
                  className="p-3.5 rounded-2xl border border-border/80 bg-slate-50/50 dark:bg-slate-900/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-xs font-bold text-foreground group flex items-center justify-between"
                >
                  <span className="group-hover:text-primary transition-colors">
                    {sub.name}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Matching Business Listings */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">
            Top Listings in {category.name} ({matchingBusinesses.length})
          </h2>

          {matchingBusinesses.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card">
              <p className="text-sm text-muted-foreground">
                No local listings currently registered under this specific category node.
              </p>
              <Link href="/dashboard/listings/new">
                <Button size="sm" variant="outline" className="mt-3">
                  Be the first to list a business here
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingBusinesses.map((biz) => {
                const liveStatus = getLiveOpeningStatus(biz.openingHours);

                return (
                  <Link
                    key={biz.id}
                    href={`/business/${biz.id}`}
                    className="group rounded-3xl bg-card border border-border/80 hover:border-primary/40 p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getBusinessCoverUrl(biz)}
                          alt={biz.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_BUSINESS_COVER;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <Badge
                            variant={liveStatus.isOpen ? "success" : "destructive"}
                            className="text-[10px] font-bold backdrop-blur-md shadow-sm"
                          >
                            {liveStatus.isOpen ? "Open" : "Closed"}
                          </Badge>
                        </div>
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <FavoriteButton
                            businessId={biz.id}
                            businessName={biz.name}
                            businessCity={biz.cityName}
                            businessCountry={biz.countryName}
                            variant="card"
                            size="sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                          {biz.name}
                        </h3>
                        {biz.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 font-bold text-foreground">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{biz.ratingAvg.toFixed(1)}</span>
                          <span className="font-normal text-muted-foreground">
                            ({biz.reviewCount})
                          </span>
                        </div>
                        <span>•</span>
                        <span className="font-bold">{biz.attributes.priceTier || "$$"}</span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {biz.shortDescription || biz.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 truncate max-w-[180px]">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {biz.districtName || biz.cityName}
                      </span>
                      <span className="font-bold text-primary group-hover:translate-x-1 transition-transform">
                        View →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
