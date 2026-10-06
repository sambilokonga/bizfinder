"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Sparkles, CheckCircle2, Loader2, Building2, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Review } from "@/types/review";

interface BusinessOption {
  id: string;
  name: string;
}

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewRegistered?: (newReview: Review) => void;
  businesses?: BusinessOption[];
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
      setIsSubmitting(false);
      setIsSaved(false);

      if (!businesses || businesses.length === 0) {
        fetch("/api/businesses?limit=100")
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
  }, [isOpen, preselectedBusinessId, preselectedBusinessName, businesses]);

  const activeBusinesses = businesses.length > 0 ? businesses : internalBusinesses;

  const handleBusinessSelect = (id: string) => {
    setBusinessId(id);
    const b = activeBusinesses.find((item) => item.id === id);
    if (b) setBusinessName(b.name);
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
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          businessName: businessName || undefined,
          userName: userName.trim(),
          rating,
          comment: comment.trim(),
          status,
        }),
      });

      const data = await res.json();
      if (data?.success && data.review) {
        setIsSaved(true);
        toast.success(`Review for "${businessName || 'Business'}" successfully registered!`);
        if (onReviewRegistered) {
          onReviewRegistered(data.review);
        }
        setTimeout(() => {
          onClose();
        }, 600);
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
      <DialogContent className="max-w-md sm:max-w-lg bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-6 sm:p-7">
        <DialogTitle className="sr-only">Register Actual User Review</DialogTitle>
        <DialogDescription className="sr-only">
          Register a verified customer rating and feedback comment in MongoDB.
        </DialogDescription>

        {isSaved ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Review Registered!</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              The review and rating have been permanently recorded and business metrics updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30 shadow-sm">
                <Star className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <h3 className="font-black text-lg text-foreground tracking-tight flex items-center gap-2">
                  <span>Register Customer Review</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h3>
                <p className="text-xs text-muted-foreground">
                  Record an authentic user review and rating directly into the live database.
                </p>
              </div>
            </div>

            {/* Target Business Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Target Business</span>
                <span className="text-red-500">*</span>
              </label>

              {activeBusinesses.length > 0 ? (
                <select
                  value={businessId}
                  onChange={(e) => handleBusinessSelect(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                >
                  <option value="">Select a business to review...</option>
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
                <select
                  value={businessId}
                  onChange={(e) => handleBusinessSelect(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-2xl bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                >
                  <option value="">Select a business to review...</option>
                </select>
              )}
            </div>

            {/* Reviewer Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-500" />
                <span>Reviewer / Customer Name</span>
                <span className="text-red-500">*</span>
              </label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Selamawit Haile"
                className="h-10 text-xs rounded-2xl"
                required
              />
            </div>

            {/* Star Rating Selector */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-muted/30 border border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>Rating Assessment</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-xs font-bold text-amber-500 font-mono">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
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
                            : "text-muted-foreground/40 hover:text-amber-300"
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
                  <span>Customer Feedback Comment</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-muted-foreground">
                  {comment.length} characters (min 10)
                </span>
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share specific details about the service, products, atmosphere, or customer experience..."
                rows={3}
                className="text-xs rounded-2xl resize-none"
                required
              />
            </div>

            {/* Moderation Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Initial Publication Status</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("published")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    status === "published"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 shadow-sm"
                      : "bg-background border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  ✓ Published Live
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("pending")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    status === "pending"
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-600 shadow-sm"
                      : "bg-background border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  ⏳ Pending Moderation
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
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
                    <span>Register Review</span>
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
