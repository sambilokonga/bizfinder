"use client";

import React, { useState, use, useEffect, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  Globe,
  Mail,
  Bookmark,
  Share2,
  CheckCircle2,
  Clock,
  Car,
  Wifi,
  CreditCard,
  Truck,
  Armchair,
  Sparkles,
  Play,
  ThumbsUp,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Image as ImageIcon,
  Check,
  ExternalLink,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEED_BUSINESSES, SEED_REVIEWS } from "@/lib/db/seed-data/businesses";
import {
  getLiveOpeningStatus,
  getFormattedWeekSchedule,
} from "@/lib/utils/opening-hours";
import { Review } from "@/types/review";
import { extractYoutubeVideoId, isYoutubeUrl, getYoutubeThumbnail } from "@/lib/utils/youtube";
import { PhotoGalleryModal } from "@/components/business/PhotoGalleryModal";
import { MiniProfileMap } from "@/components/business/MiniProfileMap";
import { WriteReviewModal } from "@/components/business/WriteReviewModal";
import { BusinessBranchesSection } from "@/components/business/BusinessBranchesSection";
import { Business } from "@/types/business";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useSavedBusinesses } from "@/hooks/useSavedBusinesses";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { useCurrentRole } from "@/components/layout/RoleSwitcher";

function normalizeUrl(url?: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function getSocialHandle(url?: string, platform?: "facebook" | "instagram" | "tiktok"): string {
  if (!url) return "";
  const cleaned = url.trim().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  if (platform === "facebook") {
    const handle = cleaned.replace(/^facebook\.com\/?/i, "");
    return handle ? (handle.startsWith("@") ? handle : `@${handle}`) : "Facebook Page";
  }
  if (platform === "instagram") {
    const handle = cleaned.replace(/^instagram\.com\/?/i, "");
    return handle ? (handle.startsWith("@") ? handle : `@${handle}`) : "Instagram Profile";
  }
  if (platform === "tiktok") {
    const handle = cleaned.replace(/^tiktok\.com\/?/i, "");
    return handle ? (handle.startsWith("@") ? handle : `@${handle}`) : "TikTok Profile";
  }
  return cleaned;
}

export default function BusinessProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentRole } = useCurrentRole();

  const seedBiz = SEED_BUSINESSES.find((b) => b.id === id || b.slug === id);
  const [business, setBusiness] = useState<Business | null>(seedBiz || null);
  const [isLoading, setIsLoading] = useState(!seedBiz);
  const [isNotFound, setIsNotFound] = useState(false);

  const { trackView } = useRecentlyViewed();
  const { isSaved: checkSaved, toggleSave } = useSavedBusinesses();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<"photos" | "video">("photos");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [likedReviewIds, setLikedReviewIds] = useState<string[]>([]);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/businesses/${id}`)
      .then((res) => {
        if (!res.ok) {
          if (!seedBiz) setIsNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.business) {
          setBusiness(data.business);
          setIsSaved(checkSaved(data.business.id));
        } else if (!seedBiz) {
          setIsNotFound(true);
        }
      })
      .catch(() => {
        if (!seedBiz) setIsNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [id, seedBiz, checkSaved]);

  // Track this page view in recently viewed history and fire stats counter
  useEffect(() => {
    if (!business) return;
    trackView(business.id);
    fetch(`/api/businesses/${business.id}/stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: "viewCount" }),
    }).catch(() => {});

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "view",
        businessId: business.id,
        businessName: business.name,
        city: business.cityName || "Addis Ababa",
        country: business.countryName || "Ethiopia",
        registeredBy: "client_telemetry",
      }),
    }).catch(() => {});

    fetch(`/api/businesses/${business.id}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        } else {
          setReviews(SEED_REVIEWS.filter((r) => r.businessId === business.id));
        }
      })
      .catch(() => {
        setReviews(SEED_REVIEWS.filter((r) => r.businessId === business.id));
      });
  }, [business?.id]);

  // ── Hooks must be called unconditionally, before any early returns ──────────
  const effectiveYoutubeVideoId = useMemo(() => {
    if (!business) return null;
    return (
      extractYoutubeVideoId(business?.youtubeVideoId) ||
      extractYoutubeVideoId(business?.media?.find((m) => m.type === "video" || isYoutubeUrl(m.url))?.url) ||
      null
    );
  }, [business?.youtubeVideoId, business?.media]);

  const allPhotos = useMemo(() => {
    if (!business) return [];
    const list: Array<{ url: string; title: string; type?: string; thumbnailUrl?: string }> = [];
    if (business.coverUrl) {
      list.push({ url: business.coverUrl, title: `${business.name} Exterior / Main`, type: "cover" });
    }
    (business.media || []).forEach((m) => {
      const isVid = m.type === "video" || isYoutubeUrl(m.url);
      list.push({
        url: m.url,
        thumbnailUrl: m.thumbnailUrl || (isVid ? getYoutubeThumbnail(m.url) : undefined),
        title: m.title || `${business.name} Showcase`,
        type: isVid ? "video" : m.type,
      });
    });
    if (effectiveYoutubeVideoId && !list.some((item) => extractYoutubeVideoId(item.url) === effectiveYoutubeVideoId)) {
      list.push({
        url: `https://www.youtube.com/watch?v=${effectiveYoutubeVideoId}`,
        thumbnailUrl: getYoutubeThumbnail(effectiveYoutubeVideoId),
        title: `${business.name} Video Tour`,
        type: "video",
      });
    }
    return list;
  }, [business, effectiveYoutubeVideoId]);
  // ────────────────────────────────────────────────────────────────────────────

  if (isNotFound) {
    notFound();
  }

  if (isLoading || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Loading business profile…</p>
        </div>
      </div>
    );
  }

  const liveStatus = getLiveOpeningStatus(business.openingHours);
  const weekSchedule = getFormattedWeekSchedule(business.openingHours);
  const similarBusinesses = SEED_BUSINESSES.filter(
    (b) => b.id !== business.id && b.categoryId === business.categoryId
  );

  const handleOpenGallery = (index: number = 0) => {
    setGalleryStartIndex(index);
    setIsGalleryOpen(true);
  };

  const handleToggleLikeReview = (reviewId: string) => {
    setLikedReviewIds((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || newComment.trim().length < 20) return;

    setIsSubmittingReview(true);
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      businessId: business.id,
      userId: "user-current",
      userName: "You (Verified User)",
      userAvatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      rating: newRating,
      comment: newComment.trim(),
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch(`/api/businesses/${business.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment.trim(),
        }),
      });
    } catch (e) {}

    setReviews([newRev, ...reviews]);
    setNewComment("");
    setIsSubmittingReview(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: business.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
    // Fire share analytics event
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "share",
        businessId: business.id,
        businessName: business.name,
        city: business.cityName || "Addis Ababa",
        country: business.countryName || "Ethiopia",
        registeredBy: "client_telemetry",
      }),
    }).catch(() => {});
  };

  /** Fire-and-forget analytics tracker for interaction buttons */
  const trackInteraction = (eventType: "click_phone" | "click_direction" | "click_website") => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        businessId: business.id,
        businessName: business.name,
        city: business.cityName || "Addis Ababa",
        country: business.countryName || "Ethiopia",
        registeredBy: "client_telemetry",
      }),
    }).catch(() => {});
  };

  return (
    <div className="w-full bg-slate-50/60 dark:bg-slate-950 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/search?category=${business.categoryId}`}
            className="hover:text-primary transition-colors"
          >
            {business.categoryName}
          </Link>
          {business.subcategoryName && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-muted-foreground">
                {business.subcategoryName}
              </span>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-semibold truncate max-w-xs">
            {business.name}
          </span>
        </div>
      </div>

      {/* Header Banner & Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl overflow-hidden border border-border bg-card shadow-sm">
          {/* Main Media Showcase */}
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full bg-slate-900 overflow-hidden group">
            {activeMediaTab === "photos" ? (
              <div
                onClick={() => handleOpenGallery(0)}
                className="w-full h-full cursor-pointer relative"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={business.coverUrl || "/placeholder-business.jpg"}
                  alt={business.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />

                {/* View Photos Overlay Button */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenGallery(0);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md text-xs font-bold transition-all border border-white/20 shadow-lg"
                  >
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    View All {allPhotos.length} Photos
                  </button>
                  {effectiveYoutubeVideoId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMediaTab("video");
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white backdrop-blur-md text-xs font-bold transition-all shadow-lg animate-pulse"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Play Video Tour
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black relative">
                {effectiveYoutubeVideoId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${effectiveYoutubeVideoId}?autoplay=1&mute=0&rel=0`}
                    title="Business Showcase Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <p className="text-white text-sm">No video tour available</p>
                )}
              </div>
            )}

            {/* Media Toggle Switch (Photos vs Video Tour) */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 z-10">
              <button
                onClick={() => setActiveMediaTab("photos")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMediaTab === "photos"
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Photos ({allPhotos.length})
              </button>
              {effectiveYoutubeVideoId && (
                <button
                  onClick={() => setActiveMediaTab("video")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeMediaTab === "video"
                      ? "bg-red-600 text-white shadow-md"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Video Tour
                </button>
              )}
            </div>
          </div>

          {/* Profile Header Info & Action Controls */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Title & Badges */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-border overflow-hidden bg-background shadow-md shrink-0 -mt-12 sm:-mt-14 relative z-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={business.logoUrl || business.coverUrl || "/placeholder-business.jpg"}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                      {business.name}
                    </h1>
                    {business.isVerified && (
                      <Badge variant="verified" className="gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                        Verified Business
                      </Badge>
                    )}
                    <Badge
                      variant={
                        liveStatus.statusColor === "emerald"
                          ? "success"
                          : liveStatus.statusColor === "amber"
                          ? "warning"
                          : "destructive"
                      }
                      className="font-bold text-xs"
                    >
                      {liveStatus.statusText}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {business.categoryName}
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-1 font-bold text-foreground">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{business.ratingAvg.toFixed(1)}</span>
                      <span className="font-normal text-muted-foreground">
                        ({reviews.length} reviews)
                      </span>
                    </div>
                    <span>•</span>
                    <span className="font-bold">
                      {business.attributes.priceTier || "$$"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      {business.districtName || business.cityName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {business.telephone && (
                  <a href={`tel:${business.telephone}`} onClick={() => trackInteraction("click_phone")}>
                    <Button
                      variant="gradient"
                      className="gap-2 font-bold shadow-md"
                    >
                      <Phone className="w-4 h-4" />
                      Call Now
                    </Button>
                  </a>
                )}

                {business.whatsapp && (
                  <a
                    href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                      `Hello ${business.name}, I found your business on BizFinder!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-bold"
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  </a>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackInteraction("click_direction")}
                >
                  <Button variant="outline" className="gap-2 font-semibold">
                    <Navigation className="w-4 h-4 text-indigo-500" />
                    Directions
                  </Button>
                </a>

                <FavoriteButton
                  businessId={business.id}
                  businessName={business.name}
                  businessCity={business.cityName}
                  businessCountry={business.countryName}
                  variant="button"
                  size="md"
                />

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative"
                  title="Share"
                >
                  {shareCopied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Details, Services, Amenities, Reviews */}
        <div className="lg:col-span-8 space-y-8">
          {/* About Section */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-3">
              About This Business
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {business.description}
            </p>
          </div>

          {/* Services / Menu / Products */}
          {business.services && business.services.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Services & Menu Highlights
                </h2>
                <Badge variant="outline" className="font-semibold text-xs">
                  {business.services.length} items
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {business.services.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border/70 flex flex-col justify-between hover:border-primary/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {item.name}
                        </span>
                        {item.price && (
                          <span className="font-bold text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                            {item.price}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Multi-Branch Locations & Outlets Network */}
          {((business.branches && business.branches.length > 0) || business.hasMultipleBranches) && (
            <BusinessBranchesSection
              businessName={business.name}
              branches={business.branches || []}
            />
          )}

          {/* Photo Gallery Grid Preview */}
          {allPhotos.length > 1 && (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Photo Gallery
                </h2>
                <button
                  onClick={() => handleOpenGallery(0)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View all ({allPhotos.length}) →
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allPhotos.slice(0, 4).map((photo: { url: string; title?: string; type?: string; thumbnailUrl?: string }, i: number) => {
                  const isItemVid = photo.type === "video" || isYoutubeUrl(photo.url);
                  const thumb = isItemVid ? (photo.thumbnailUrl || getYoutubeThumbnail(photo.url)) : photo.url;

                  return (
                    <button
                      key={i}
                      onClick={() => handleOpenGallery(i)}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-border hover:border-primary/50 transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb}
                        alt={photo.title || `Gallery image ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isItemVid && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow">
                            <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                      )}
                      {i === 3 && allPhotos.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm">
                          +{allPhotos.length - 4} more
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amenities & Attributes */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Amenities & Key Features
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold">
              {business.attributes.delivery && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border/60">
                  <Truck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Delivery Available</span>
                </div>
              )}
              {business.attributes.parking && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border/60">
                  <Car className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Dedicated Parking</span>
                </div>
              )}
              {business.attributes.wifi && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border/60">
                  <Wifi className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>High-speed Wi-Fi</span>
                </div>
              )}
              {business.attributes.acceptsCards && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border/60">
                  <CreditCard className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Accepts Credit/Debit Cards</span>
                </div>
              )}
              {business.attributes.outdoorSeating && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border/60">
                  <Armchair className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Outdoor Patio Seating</span>
                </div>
              )}
              {business.attributes.airConditioning && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border/60">
                  <Sparkles className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Air Conditioning</span>
                </div>
              )}
              {business.attributes.petFriendly && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border/60">
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Pet Friendly</span>
                </div>
              )}
              {business.attributes.accessible && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border/60">
                  <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
                  <span>Wheelchair Accessible</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Ratings & Reviews
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(business.ratingAvg)
                            ? "fill-current"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {business.ratingAvg.toFixed(1)} out of 5
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {reviews.length} total reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Write a Review Box */}
            <form
              onSubmit={handleAddReview}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border/70 space-y-3.5 shadow-inner"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Share Your Experience
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsWriteReviewOpen(true)}
                    className="h-7 text-xs font-bold gap-1 text-primary hover:text-primary"
                  >
                    <Star className="w-3.5 h-3.5" /> Full Review Wizard
                  </Button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Rating:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newRating
                              ? "text-amber-500 fill-amber-500"
                              : "text-slate-300 dark:text-slate-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a helpful review (food quality, service, ambiance, pricing, parking)..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  variant="gradient"
                  disabled={!newComment.trim() || isSubmittingReview}
                  className="gap-2 font-bold shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Review
                </Button>
              </div>
            </form>

            {/* Reviews Feed */}
            <div className="space-y-4 pt-2 divide-y divide-border/60">
              {reviews.map((rev) => {
                const isLiked = likedReviewIds.includes(rev.id);
                return (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              rev.userAvatar ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                            }
                            alt={rev.userName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">
                            {rev.userName}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                        <div className="flex items-center text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating
                                  ? "fill-current"
                                  : "text-slate-300 dark:text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                      {rev.comment}
                    </p>

                    {/* Photos in Review */}
                    {rev.photos && rev.photos.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        {rev.photos.map((photo, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={photo}
                            alt="Review photo"
                            className="w-16 h-16 rounded-xl object-cover border border-border"
                          />
                        ))}
                      </div>
                    )}

                    {/* Helpful Thumbs Up Action */}
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <button
                        onClick={() => handleToggleLikeReview(rev.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                          isLiked
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>
                          Helpful ({(rev.likesCount ?? 0) + (isLiked ? 1 : 0)})
                        </span>
                      </button>
                    </div>

                    {/* Owner Response */}
                    {rev.reply && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 ml-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Response from {rev.reply.ownerName}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {rev.reply.comment}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Opening Hours, Location Map, Contact Info, Claim Box, Similar Businesses */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mini Interactive Map */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-foreground uppercase tracking-wider">
              <span>Location & Pin</span>
              <span className="text-primary font-semibold">Live GPS</span>
            </div>
            <MiniProfileMap
              latitude={business.latitude}
              longitude={business.longitude}
              name={business.name}
              addressLine={business.addressLine}
            />
            <div className="text-xs text-muted-foreground space-y-1 pt-1">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{business.addressLine}</span>
              </div>
              {(business.building || business.floorNumber) && (
                <div className="text-[11px] text-muted-foreground pl-5">
                  Building: {business.building || "—"} | Floor: {business.floorNumber || "—"}
                </div>
              )}
            </div>
          </div>

          {/* Opening Hours Widget */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-base text-foreground">
                <Clock className="w-4 h-4 text-indigo-500" />
                Opening Hours
              </div>
              <Badge
                variant={
                  liveStatus.statusColor === "emerald"
                    ? "success"
                    : liveStatus.statusColor === "amber"
                    ? "warning"
                    : "destructive"
                }
                className="text-[10px] font-bold"
              >
                {liveStatus.isOpen ? "Open Now" : "Closed"}
              </Badge>
            </div>

            <div className="space-y-2.5 divide-y divide-border/40 text-xs">
              {weekSchedule.map((slot) => (
                <div
                  key={slot.day}
                  className={`pt-2 first:pt-0 flex items-center justify-between ${
                    slot.isToday
                      ? "font-bold text-primary bg-primary/5 -mx-2 px-2 py-1.5 rounded-xl"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {slot.isToday && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                    {slot.day}
                  </span>
                  <span>{slot.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Business Overview & Registration Card */}
          {(business.businessType || business.yearEstablished || business.businessLevel) && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3.5 text-xs">
              <h3 className="font-bold text-base text-foreground mb-1">
                Business Information
              </h3>

              {business.businessType && (
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Business / Legal Type</div>
                    <div className="font-semibold text-foreground text-sm">{business.businessType}</div>
                  </div>
                </div>
              )}

              {business.yearEstablished && (
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Year Established</div>
                    <div className="font-semibold text-foreground text-sm">Founded in {business.yearEstablished}</div>
                  </div>
                </div>
              )}

              {business.businessLevel && (
                <div className="flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Business Scale</div>
                    <div className="font-semibold text-foreground capitalize text-sm">{business.businessLevel} Enterprise</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contact & Location Info */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3.5 text-xs">
            <h3 className="font-bold text-base text-foreground mb-1">
              Direct Contact
            </h3>

            {business.telephone && (
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <a
                  href={`tel:${business.telephone}`}
                  className="hover:text-primary font-medium"
                >
                  {business.telephone}
                </a>
              </div>
            )}

            {business.whatsapp && (
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                <a
                  href={`https://wa.me/${business.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary font-medium"
                >
                  WhatsApp: +{business.whatsapp}
                </a>
              </div>
            )}

            {business.email && (
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <a
                  href={`mailto:${business.email}`}
                  className="hover:text-primary font-medium"
                >
                  {business.email}
                </a>
              </div>
            )}

            {business.website && (
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                <a
                  href={normalizeUrl(business.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary font-medium truncate max-w-[220px]"
                >
                  {business.website}
                </a>
              </div>
            )}
          </div>

          {/* Social Media Card */}
          {(business.facebookUrl || business.instagramUrl || business.tiktokUrl) && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-base text-foreground">Social Media</h3>
                <span className="text-[11px] text-muted-foreground font-medium">Official Links</span>
              </div>

              {business.facebookUrl && (
                <a
                  href={normalizeUrl(business.facebookUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#1877F2]/10 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="#1877F2" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-xs">Facebook</div>
                      <div className="text-[11px] text-muted-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {getSocialHandle(business.facebookUrl, "facebook")}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 ml-2" />
                </a>
              )}

              {business.instagramUrl && (
                <a
                  href={normalizeUrl(business.instagramUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40 hover:border-pink-300 dark:hover:border-pink-700 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4">
                        <defs><linearGradient id="card-ig-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FFDC80"/><stop offset="20%" stopColor="#FCAF45"/><stop offset="40%" stopColor="#F77737"/><stop offset="60%" stopColor="#F56040"/><stop offset="80%" stopColor="#FD1D1D"/><stop offset="100%" stopColor="#833AB4"/></linearGradient></defs>
                        <path fill="url(#card-ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-xs">Instagram</div>
                      <div className="text-[11px] text-muted-foreground truncate group-hover:text-pink-600 dark:group-hover:text-pink-400">
                        {getSocialHandle(business.instagramUrl, "instagram")}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-pink-600 dark:group-hover:text-pink-400 shrink-0 ml-2" />
                </a>
              )}

              {business.tiktokUrl && (
                <a
                  href={normalizeUrl(business.tiktokUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border hover:border-slate-400 dark:hover:border-slate-600 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                  {/* TikTok */}
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-foreground"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.98a8.19 8.19 0 004.79 1.54V7.07a4.85 4.85 0 01-1.03-.38z"/></svg>
                  </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-xs">TikTok</div>
                      <div className="text-[11px] text-muted-foreground truncate group-hover:text-foreground">
                        {getSocialHandle(business.tiktokUrl, "tiktok")}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
                </a>
              )}
            </div>
          )}

          {/* Claim This Business Widget */}
          <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-6 shadow-sm space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Business Owner?
            </span>
            <h4 className="font-bold text-sm text-foreground">
              Own or manage {business.name}?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify your ownership to manage contact details, post menus/services, and respond directly to customer reviews.
            </p>
            <Link href={`/claim/${business.id}`}>
              <Button
                size="sm"
                variant="gradient"
                className="w-full mt-2 font-bold shadow-md shadow-indigo-500/10"
              >
                Claim This Business
              </Button>
            </Link>
          </div>

          {/* Similar Businesses Nearby */}
          {similarBusinesses.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Similar Places Nearby
              </h3>
              <div className="space-y-3">
                {similarBusinesses.slice(0, 3).map((sim) => (
                  <Link
                    key={sim.id}
                    href={`/business/${sim.id}`}
                    className="group flex items-center gap-3 p-2 rounded-2xl hover:bg-accent transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sim.coverUrl || "/placeholder-business.jpg"}
                      alt={sim.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                        {sim.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{sim.ratingAvg.toFixed(1)}</span>
                        <span>•</span>
                        <span className="truncate">
                          {sim.districtName || sim.cityName}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Photo Gallery Lightbox */}
      <PhotoGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        photos={allPhotos}
        initialIndex={galleryStartIndex}
        businessName={business.name}
      />

      {/* Multi-Step Review Submission Modal */}
      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        business={business}
        onSubmit={(submitted) => {
          const newRev: Review = {
            id: `rev-${Date.now()}`,
            businessId: business.id,
            userId: "user-current",
            userName: submitted.authorName || "You (Verified Customer)",
            userAvatar:
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
            rating: submitted.rating,
            comment: `${submitted.title ? `**${submitted.title}** - ` : ""}${submitted.body}${
              submitted.tags?.length ? ` [${submitted.tags.join(", ")}]` : ""
            }`,
            likesCount: 0,
            createdAt: submitted.submittedAt || new Date().toISOString(),
          };
          setReviews((prev) => [newRev, ...prev]);
        }}
      />
    </div>
  );
}

