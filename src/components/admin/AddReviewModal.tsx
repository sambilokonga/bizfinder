"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Sparkles,
  CheckCircle2,
  Loader2,
  Building2,
  User,
  MessageSquare,
  Calendar,
  History,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Review } from "@/types/review";

interface BusinessOption {
  id: string;
  name: string;
}

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewRegistered?: (newReview: any) => void;
  businesses?: BusinessOption[];
  cityName?: string;
  countryName?: string;
  preselectedBusinessId?: string;
  preselectedBusinessName?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor (1 Star)",
  2: "Fair (2 Stars)",
  3: "Average (3 Stars)",
  4: "Very Good (4 Stars)",
  5: "Exceptional (5 Stars)",
};

export function AddReviewModal({
  isOpen,
  onClose,
  onReviewRegistered,
  businesses = [],
  cityName,
  countryName,
  preselectedBusinessId,
  preselectedBusinessName,
}: AddReviewModalProps) {
  const [businessId, setBusinessId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"published" | "pending">("published");
  const [timeframeType, setTimeframeType] = useState<"recent" | "historical" | "future_scheduled">("recent");
  const [customDate, setCustomDate] = useState("2026-03-24");
  const [isVerifiedCitizen, setIsVerifiedCitizen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Fallback internal business list if not provided
  const [internalBusinesses, setInternalBusinesses] = useState<BusinessOption[]>([]);

  useEffect(() => {
    if (isOpen) {
      setBusinessId(preselectedBusinessId || "");
      setBusinessName(preselectedBusinessName || "");
      setUserName("");
      setRating(5);
      setHoverRating(null);
      setComment("");
      setStatus("published");
      setTimeframeType("recent");
      setCustomDate(new Date().toISOString().slice(0, 10));
      setIsVerifiedCitizen(true);
      setIsSubmitting(false);
      setIsSaved(false);

      if (!businesses || businesses.length === 0) {
        const queryParams = cityName ? `&city=${encodeURIComponent(cityName)}` : "";
        fetch(`/api/businesses?limit=100${queryParams}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.businesses && Array.isArray(data.businesses)) {
              setInternalBusinesses(
                data.businesses.map((b: any) => ({ id: b.id, name: b.name }))
              );
              if (!preselectedBusinessId && data.businesses.length > 0) {
                setBusinessId(data.businesses[0].id);
                setBusinessName(data.businesses[0].name);
              }
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, preselectedBusinessId, preselectedBusinessName, businesses, cityName]);

  const activeBusinesses = businesses.length > 0 ? businesses : internalBusinesses;

  const handleBusinessSelect = (id: string) => {
    setBusinessId(id);
    const b = activeBusinesses.find((item) => item.id === id);
    if (b) setBusinessName(b.name);
  };

  const handleTimeframeChange = (type: "recent" | "historical" | "future_scheduled") => {
    setTimeframeType(type);
    if (type === "historical") {
      setCustomDate("2024-06-18");
      setStatus("published");
    } else if (type === "recent") {
      setCustomDate(new Date().toISOString().slice(0, 10));
      setStatus("published");
    } else if (type === "future_scheduled") {
      setCustomDate("2026-11-20");
      setStatus("pending");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      toast.error("Please choose a business to review.");
      return;
    }
    if (!userName.trim()) {
      toast.error("Please enter the reviewer's name.");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Review comment must be at least 10 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedDateTime = customDate ? new Date(`${customDate}T12:00:00Z`).toISOString() : new Date().toISOString();

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          businessName: businessName || undefined,
          cityName: cityName || undefined,
          countryName: countryName || undefined,
          userName: userName.trim(),
          rating,
          comment: comment.trim(),
          status,
          timeframeType,
          createdAt: selectedDateTime,
          isVerifiedCitizen,
        }),
      });

      const data = await res.json();
      if (data?.success && data.review) {
        setIsSaved(true);
        toast.success(
          `Review for "${businessName || 'Business'}" registered in ${cityName || 'City'}!`
        );
        if (onReviewRegistered) {
          onReviewRegistered(data.review);
        }
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        toast.error(data?.error || "Failed to register review");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error registering review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-6 sm:p-7">
        <DialogTitle className="sr-only">Register Actual City Review</DialogTitle>
        <DialogDescription className="sr-only">
          Register old established, recent, or future scheduled citizen reviews for this city.
        </DialogDescription>

        {isSaved ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Review Registered Successfully!</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              The review has been permanently registered for <strong className="text-foreground">{cityName || "this city"}</strong>, updated on the Country Admin register, and globally synchronized to Super Admin.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-indigo-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30 shadow-sm">
                  <Star className="w-5 h-5 fill-amber-500" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-foreground tracking-tight flex items-center gap-2">
                    <span>Register Actual City Review</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-indigo-500 inline" />
                    <span>Jurisdiction: <strong>{cityName || "Addis Ababa"}</strong>, {countryName || "Ethiopia"}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Timeframe Type Selection (Historical vs Recent vs Future) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                <span>Review Timeframe Category</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTimeframeChange("historical")}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    timeframeType === "historical"
                      ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                      : "bg-background border-border text-muted-foreground hover:bg-muted/40 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <History className="w-3.5 h-3.5" />
                    <span>Historical Record</span>
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">2021 – 2025 Multi-Year</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTimeframeChange("recent")}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    timeframeType === "recent"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm"
                      : "bg-background border-border text-muted-foreground hover:bg-muted/40 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Recent / Live</span>
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">2026 Customer Visits</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTimeframeChange("future_scheduled")}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    timeframeType === "future_scheduled"
                      ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
                      : "bg-background border-border text-muted-foreground hover:bg-muted/40 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Future Scheduled</span>
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">Mystery Audits (2026/27)</div>
                </button>
              </div>
            </div>

            {/* Target Business Selection (Scoped to This City) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Target Business in {cityName || "City"}</span>
                  <span className="text-red-500">*</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {activeBusinesses.length} verified listings
                </span>
              </label>

              {activeBusinesses.length > 0 ? (
                <select
                  value={businessId}
                  onChange={(e) => handleBusinessSelect(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 truncate"
                  required
                >
                  <option value="">Select a business in {cityName || "this city"}...</option>
                  {businessId && !activeBusinesses.some((b) => b.id === businessId) && (
                    <option value={businessId}>
                      {businessName || preselectedBusinessName || businessId}
                    </option>
                  )}
                  {activeBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : preselectedBusinessId ? (
                <div className="px-3.5 py-2.5 rounded-2xl bg-muted/40 border border-border text-xs font-bold text-foreground flex items-center justify-between">
                  <span>{businessName || preselectedBusinessName || preselectedBusinessId}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">ID: {preselectedBusinessId}</span>
                </div>
              ) : (
                <Input
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    setBusinessId(`biz-${(cityName || "city").toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now().toString(36)}`);
                  }}
                  placeholder={`Enter business name in ${cityName || "City"}...`}
                  className="h-10 text-xs rounded-2xl"
                  required
                />
              )}
            </div>

            {/* Two-Column: Reviewer Name & Effective Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-500" />
                  <span>Citizen / Reviewer Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Kenji Sato / Camille L. / Bekele T."
                  className="h-10 text-xs rounded-2xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Review / Audit Date</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="h-10 text-xs rounded-2xl"
                  required
                />
              </div>
            </div>

            {/* Star Rating Assessment */}
            <div className="space-y-2 p-3 sm:p-3.5 rounded-2xl bg-muted/30 border border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>Rating Assessment</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-xs font-bold text-amber-500 font-mono">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = (hoverRating || rating) >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 rounded-xl hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isFilled
                            ? "text-amber-500 fill-amber-500 drop-shadow-sm"
                            : "text-muted-foreground/30 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Comment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                  <span>Review Commentary / Audit Findings</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-muted-foreground">
                  {comment.length} characters (min 10)
                </span>
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  timeframeType === "historical"
                    ? `Describe historical track record, multi-year reliability, and enduring presence in ${cityName || "the city"}...`
                    : timeframeType === "future_scheduled"
                    ? `Outline planned mystery shopper audit focus, compliance parameters, or quality inspection standards...`
                    : `Provide authentic customer feedback on recent visit, service quality, and reception...`
                }
                rows={3}
                className="text-xs rounded-2xl resize-none"
                required
              />
            </div>

            {/* Verified Citizen Toggle & Initial Publication Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsVerifiedCitizen(!isVerifiedCitizen)}
                className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isVerifiedCitizen
                    ? "bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400"
                    : "bg-background border-border text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold">Verified Citizen</span>
                </div>
                <span className="text-[10px] font-mono">{isVerifiedCitizen ? "YES" : "NO"}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatus("published")}
                  className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                    status === "published"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "bg-background border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  ✓ Published
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("pending")}
                  className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                    status === "pending"
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-sm"
                      : "bg-background border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  ⏳ Pending
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-10 px-4 text-xs font-bold rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={isSubmitting || comment.trim().length < 10}
                className="h-10 px-6 text-xs font-bold rounded-2xl shadow-md gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Register Review in {cityName || "City"}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
