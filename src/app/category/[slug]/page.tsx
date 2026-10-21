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
  Building2,
  Search,
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
import { getBusinessCardLocation } from "@/lib/utils/business-location";
import {
  CategoryIconBadge,
  getCategoryTheme,
} from "@/lib/utils/category-icon-helper";

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
  const theme = getCategoryTheme(category.name, category.slug);

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
    <div className="w-full bg-slate-50/50 dark:bg-slate-950/50 py-4 xs:py-6 sm:py-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 space-y-4 xs:space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation — horizontally scrollable on mobile */}
        <div className="flex items-center gap-1 xs:gap-1.5 text-[11px] xs:text-xs text-muted-foreground overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-primary transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0 text-muted-foreground/60" />
          <Link href="/categories" className="hover:text-primary transition-colors shrink-0">
            Categories
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0 text-muted-foreground/60" />
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-foreground font-semibold shrink-0">{crumb.name}</span>
              ) : (
                <Link
                  href={`/category/${crumb.slug}`}
                  className="hover:text-primary transition-colors shrink-0"
                >
                  {crumb.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Enhanced Category Hero Header with Large Attractive Icon Badge & Glow */}
        <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 xs:p-5 sm:p-8 md:p-10 shadow-sm transition-all duration-300`}>
          {/* Subtle gradient backdrop reflection */}
          <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-40 dark:opacity-20 pointer-events-none`} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 xs:gap-6 sm:gap-8">
            <div className="flex items-start gap-3 xs:gap-4 sm:gap-6">
              {/* Eye-catching Hero Category Icon Badge */}
              <div className="shrink-0 group">
                <CategoryIconBadge
                  iconName={category.icon}
                  categoryName={category.name}
                  categorySlug={category.slug}
                  size="xl"
                  className="shadow-lg ring-2 xs:ring-4 ring-white dark:ring-slate-900 border border-white/40 dark:border-slate-800"
                />
              </div>

              {/* Title & Category Details */}
              <div className="space-y-1.5 xs:space-y-2">
                <div className="flex flex-wrap items-center gap-1.5 xs:gap-2">
                  <Badge variant="secondary" className="gap-1 text-[10px] xs:text-xs font-semibold py-0.5 xs:py-1 px-2 xs:px-2.5">
                    <Layers className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-primary" />
                    Level {category.level} Node
                  </Badge>
                  {subcategories.length > 0 && (
                    <Badge variant="outline" className="text-[10px] xs:text-xs font-medium py-0.5 xs:py-1 px-2 xs:px-2.5 border-dashed">
                      {subcategories.length} Subcategories
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] xs:text-xs font-medium py-0.5 xs:py-1 px-2 xs:px-2.5">
                    {matchingBusinesses.length} Verified Spots
                  </Badge>
                </div>

                <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
                  {category.name}
                </h1>

                <p className="text-[11px] xs:text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Find and compare verified businesses in <strong className="text-foreground">{category.name}</strong>. Check real-time opening hours, authentic reviews, and synchronized interactive map directions.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-start gap-2 xs:gap-2.5 shrink-0 pt-1 xs:pt-0">
              <Link href={`/search?category=${category.slug}`} className="w-full sm:w-auto">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto inline-flex font-bold rounded-xl gap-1.5 xs:gap-2 shadow-md h-8.5 xs:h-9.5 sm:h-11 px-3.5 xs:px-4 sm:px-5 text-xs sm:text-sm">
                  <Search className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                  Search Map for {category.name}
                  <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                </Button>
              </Link>
              <Link href="/categories" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-[11px] xs:text-xs font-semibold h-7.5 xs:h-8.5 sm:h-9 rounded-xl">
                  Browse All Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Subcategories Grid with Attractive Dynamic Icons */}
        {subcategories.length > 0 && (
          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-3.5 xs:p-5 sm:p-8 space-y-3 xs:space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm xs:text-base sm:text-lg font-bold text-foreground flex items-center gap-1.5 xs:gap-2">
                  <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-indigo-500" />
                  Subcategories in {category.name} ({subcategories.length})
                </h2>
                <p className="text-[11px] xs:text-xs text-muted-foreground mt-0.5">
                  Select a specific specialization to filter localized merchants.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-3">
              {subcategories.map((sub) => {
                const subTheme = getCategoryTheme(sub.name, sub.slug);

                return (
                  <Link
                    key={sub.id}
                    href={`/category/${sub.slug}`}
                    className={`group p-2.5 xs:p-3 sm:p-3.5 rounded-xl xs:rounded-2xl border border-border/70 bg-card hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all duration-200 text-xs font-bold text-foreground flex items-center gap-2.5 xs:gap-3 shadow-xs hover:shadow-md ${subTheme.borderHover} hover:-translate-y-0.5`}
                  >
                    {/* Attractive Subcategory Icon Badge */}
                    <CategoryIconBadge
                      iconName={sub.icon}
                      categoryName={sub.name}
                      categorySlug={sub.slug}
                      size="sm"
                    />

                    <div className="flex-1 min-w-0">
                      <span className="block truncate text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {sub.name}
                      </span>
                      <span className="text-[9px] xs:text-[10px] text-muted-foreground font-normal">
                        Explore listings &rarr;
                      </span>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Matching Business Listings */}
        <div className="space-y-2.5 xs:space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm xs:text-base sm:text-lg font-bold text-foreground">
              Top Listings in {category.name} ({matchingBusinesses.length})
            </h2>
            {matchingBusinesses.length > 0 && (
              <span className="text-[10px] xs:text-xs text-muted-foreground">
                Showing real database & verified community entries
              </span>
            )}
          </div>

          {matchingBusinesses.length === 0 ? (
            <div className="p-6 xs:p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card">
              <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-xl xs:rounded-2xl bg-slate-100 dark:bg-slate-800 text-muted-foreground flex items-center justify-center mx-auto mb-2.5 xs:mb-3">
                <Building2 className="w-5 h-5 xs:w-6 xs:h-6" />
              </div>
              <p className="text-xs xs:text-sm font-semibold text-foreground">
                No listings registered under this specific category node yet.
              </p>
              <p className="text-[11px] xs:text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Be the first to list your business in this industry or search related categories across the city.
              </p>
              <div className="mt-3 xs:mt-4 flex items-center justify-center gap-2">
                <Link href="/dashboard/listings/new">
                  <Button size="sm" variant="gradient" className="font-bold h-7.5 xs:h-8.5 text-xs">
                    Add Your Business Here
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button size="sm" variant="outline" className="h-7.5 xs:h-8.5 text-xs">
                    Browse Other Categories
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2.5 xs:gap-3 sm:gap-5">
              {matchingBusinesses.map((biz) => {
                const liveStatus = getLiveOpeningStatus(biz.openingHours);

                return (
                  <Link
                    key={biz.id}
                    href={`/business/${biz.id}`}
                    className="group rounded-2xl xs:rounded-3xl bg-card border border-border/80 hover:border-primary/40 p-3 xs:p-3.5 sm:p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full rounded-xl xs:rounded-2xl overflow-hidden mb-2.5 xs:mb-3.5 bg-slate-100 dark:bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getBusinessCoverUrl(biz)}
                          alt={biz.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_BUSINESS_COVER;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 xs:top-2.5 xs:left-2.5">
                          <Badge
                            variant={liveStatus.isOpen ? "success" : "destructive"}
                            className="text-[9px] xs:text-[10px] font-bold backdrop-blur-md shadow-sm"
                          >
                            {liveStatus.isOpen ? "Open" : "Closed"}
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2 xs:top-2.5 xs:right-2.5 z-10">
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

                      <div className="flex items-start justify-between gap-1.5 xs:gap-2">
                        <h3 className="font-bold text-xs xs:text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {biz.name}
                        </h3>
                        {biz.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-blue-500 shrink-0 mt-0.5" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 xs:gap-2 mt-0.5 xs:mt-1 text-[11px] xs:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 font-bold text-foreground">
                          <Star className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-amber-500 fill-amber-500" />
                          <span>{biz.ratingAvg.toFixed(1)}</span>
                          <span className="font-normal text-muted-foreground text-[10px] xs:text-xs">
                            ({biz.reviewCount})
                          </span>
                        </div>
                        <span>•</span>
                        <span className="font-bold">{biz.attributes?.priceTier || "$$"}</span>
                      </div>

                      <p className="text-[11px] xs:text-xs text-muted-foreground mt-1.5 xs:mt-2 line-clamp-2">
                        {biz.shortDescription || biz.description}
                      </p>
                    </div>

                    <div className="pt-2.5 xs:pt-3 mt-2.5 xs:mt-3 border-t border-border/60 flex items-center justify-between text-[11px] xs:text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 truncate max-w-[150px] xs:max-w-[180px]" title={getBusinessCardLocation(biz)}>
                        <MapPin className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-indigo-500 shrink-0" />
                        {getBusinessCardLocation(biz)}
                      </span>
                      <span className="font-bold text-primary group-hover:translate-x-1 transition-transform">
                        View Details →
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
