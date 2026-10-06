"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Camera, Tag, CheckCircle2, Smile, AlertCircle } from "lucide-react";
import { Business } from "@/types/business";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  onSubmit?: (review: SubmittedReview) => void;
}

export interface SubmittedReview {
  businessId: string;
  rating: number;
  title: string;
  body: string;
  tags: string[];
  authorName: string;
  visitedAt: string;
  submittedAt: string;
}

const REVIEW_TAGS = [
  "Great Food",
  "Friendly Staff",
  "Clean & Tidy",
  "Good Value",
  "Fast Service",
  "Nice Ambience",
  "Highly Recommend",
  "Would Return",
  "Good Parking",
  "Great Location",
];

const RATING_LABELS = ["", "Terrible", "Poor", "Average", "Good", "Excellent"];

export function WriteReviewModal({
  isOpen,
  onClose,
  business,
  onSubmit,
}: WriteReviewModalProps) {
  const [step, setStep] = useState<"rating" | "details" | "submitted">("rating");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [visitedAt, setVisitedAt] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setStep("rating");
    setRating(0);
    setHoveredRating(0);
    setTitle("");
    setBody("");
    setAuthorName("");
    setVisitedAt("");
    setSelectedTags([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const validateDetails = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Please add a review title.";
    if (body.trim().length < 20)
      errs.body = "Review must be at least 20 characters.";
    if (!authorName.trim()) errs.authorName = "Please enter your name.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validateDetails()) return;
    const review: SubmittedReview = {
      businessId: business.id,
      rating,
      title: title.trim(),
      body: body.trim(),
      tags: selectedTags,
      authorName: authorName.trim(),
      visitedAt: visitedAt || new Date().toISOString().split("T")[0],
      submittedAt: new Date().toISOString(),
    };
    onSubmit?.(review);
    setStep("submitted");
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg p-0 bg-card border-border rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Write a Review
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reviewing:{" "}
            <span className="font-bold text-foreground">{business.name}</span>
          </p>

          {/* Step indicator */}
          {step !== "submitted" && (
            <div className="flex items-center gap-2 mt-3">
              {["rating", "details"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center transition-all ${
                      step === s
                        ? "bg-primary text-primary-foreground"
                        : (step === "details" && s === "rating")
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step === "details" && s === "rating" ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      step === s ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s === "rating" ? "Rate" : "Details"}
                  </span>
                  {i < 1 && (
                    <div className="w-8 h-px bg-border" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-5 space-y-5">
          {/* Step 1: Star Rating */}
          {step === "rating" && (
            <div className="space-y-5">
              <div className="text-center space-y-3 py-2">
                <p className="text-sm font-bold text-foreground">
                  How would you rate your experience?
                </p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-125 active:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= displayRating
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-200 dark:text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {displayRating > 0 && (
                  <p className="text-sm font-black text-amber-500 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {RATING_LABELS[displayRating]}
                  </p>
                )}
              </div>

              {/* Quick tags at rating step */}
              <div>
                <p className="text-xs font-bold text-foreground mb-2">
                  Quick tags (optional)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {REVIEW_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  disabled={rating === 0}
                  onClick={() => setStep("details")}
                  className="font-bold gap-1.5"
                >
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Review Details */}
          {step === "details" && (
            <div className="space-y-4">
              {/* Display selected rating */}
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= rating
                          ? "text-amber-500 fill-amber-500"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {RATING_LABELS[rating]}
                </span>
                <button
                  onClick={() => setStep("rating")}
                  className="ml-auto text-[11px] text-muted-foreground hover:text-primary underline"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Review Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((p) => ({ ...p, title: "" }));
                  }}
                  placeholder="e.g. Best injera in Bole!"
                  className="text-sm"
                />
                {errors.title && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Your Review
                </label>
                <textarea
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    if (errors.body) setErrors((p) => ({ ...p, body: "" }));
                  }}
                  placeholder="Share your experience in detail — what did you love, or what could be better?"
                  rows={4}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <div className="flex items-center justify-between mt-0.5">
                  {errors.body ? (
                    <p className="text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.body}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-[11px] text-muted-foreground ml-auto">
                    {body.length} chars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Your Name
                  </label>
                  <Input
                    value={authorName}
                    onChange={(e) => {
                      setAuthorName(e.target.value);
                      if (errors.authorName)
                        setErrors((p) => ({ ...p, authorName: "" }));
                    }}
                    placeholder="Abebe T."
                    className="text-sm"
                  />
                  {errors.authorName && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.authorName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Date Visited
                  </label>
                  <Input
                    type="date"
                    value={visitedAt}
                    onChange={(e) => setVisitedAt(e.target.value)}
                    className="text-sm"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {selectedTags.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-foreground mb-1.5">
                    Your tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("rating")}
                >
                  ← Back
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleSubmit}
                  className="font-bold gap-1.5"
                >
                  <Star className="w-3.5 h-3.5" /> Submit Review
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "submitted" && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-lg text-foreground">
                  Review Submitted!
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  Thank you for sharing your experience at{" "}
                  <span className="font-semibold text-foreground">
                    {business.name}
                  </span>
                  . Your review will appear after a quick moderation check.
                </p>
              </div>
              <div className="flex items-center justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= rating
                        ? "text-amber-500 fill-amber-500"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleClose}
                className="font-bold"
              >
                <Smile className="w-4 h-4 mr-1.5" /> Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
