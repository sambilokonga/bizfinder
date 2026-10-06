"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  CreditCard,
  ShieldCheck,
  Loader2,
  RefreshCw,
  XCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Bell,
} from "lucide-react";
import { Business, BusinessExistenceStatus, BusinessSubscriptionStatus } from "@/types/business";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

const FOUR_MONTHS_MS = 120 * 24 * 60 * 60 * 1000; // 120 days

interface BusinessAuditStatusCardProps {
  business: Business;
  onRefresh?: () => void;
  compact?: boolean;
  className?: string;
}

interface AuditMetrics {
  effectiveStartDate: Date;
  nextAuditDate: Date;
  daysSinceStart: number;
  isDueForReview: boolean;
  isOverdue: boolean;
  daysOverdue: number;
  daysUntilDue: number;
  existenceStatus: BusinessExistenceStatus;
  subscriptionStatus: BusinessSubscriptionStatus;
  progressPercent: number;
}

function calcAuditMetrics(biz: Business): AuditMetrics {
  const now = new Date();

  const regDate = biz.registeredAt
    ? new Date(biz.registeredAt)
    : biz.createdAt
    ? new Date(biz.createdAt)
    : new Date();

  const valDate = biz.validationDate
    ? new Date(biz.validationDate)
    : biz.approvedBySuperAdmin?.at
    ? new Date(biz.approvedBySuperAdmin.at)
    : undefined;

  const effectiveStartDate = valDate || regDate;

  const nextAuditDate = biz.nextAuditDate
    ? new Date(biz.nextAuditDate)
    : new Date(effectiveStartDate.getTime() + FOUR_MONTHS_MS);

  const diffMs = now.getTime() - effectiveStartDate.getTime();
  const daysSinceStart = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));

  const isOverdue = now.getTime() >= nextAuditDate.getTime();
  const daysOverdue = isOverdue
    ? Math.max(0, Math.floor((now.getTime() - nextAuditDate.getTime()) / (24 * 60 * 60 * 1000)))
    : 0;
  const daysUntilDue = !isOverdue
    ? Math.max(0, Math.ceil((nextAuditDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
    : 0;

  const isDueForReview =
    isOverdue ||
    biz.existenceStatus === "pending_confirmation" ||
    biz.subscriptionStatus === "due" ||
    biz.subscriptionStatus === "past_due";

  const progressPercent = Math.min(100, Math.round((daysSinceStart / 120) * 100));

  const existenceStatus: BusinessExistenceStatus = biz.existenceStatus || "confirmed";
  const subscriptionStatus: BusinessSubscriptionStatus = biz.subscriptionStatus || "trial";

  return {
    effectiveStartDate,
    nextAuditDate,
    daysSinceStart,
    isDueForReview,
    isOverdue,
    daysOverdue,
    daysUntilDue,
    existenceStatus,
    subscriptionStatus,
    progressPercent,
  };
}

export function BusinessAuditStatusCard({
  business,
  onRefresh,
  compact = false,
  className,
}: BusinessAuditStatusCardProps) {
  const [metrics, setMetrics] = useState<AuditMetrics>(() => calcAuditMetrics(business));
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMetrics(calcAuditMetrics(business));
  }, [business]);

  const handleConfirmExistence = async () => {
    setIsConfirming(true);
    try {
      const res = await fetch(`/api/businesses/${business.id}/confirm-existence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Confirmed active via dashboard audit card" }),
      });
      if (res.ok) {
        toast.success("✅ Existence Confirmed!", {
          description: `"${business.name}" is confirmed active for the next 4-month cycle.`,
        });
        onRefresh?.();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Confirmation Failed", { description: err.error || "Please try again." });
      }
    } catch (err: any) {
      toast.error("Network Error", { description: err.message || "Could not reach server." });
    } finally {
      setIsConfirming(false);
    }
  };

  const handlePaySubscription = async () => {
    setIsPaying(true);
    try {
      const res = await fetch(`/api/businesses/${business.id}/subscription-pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 1499,
          currency: "ETB",
          provider: "telebirr",
          reference: `SUB-${Date.now()}`,
        }),
      });
      if (res.ok) {
        toast.success("🎉 Subscription Activated!", {
          description: `"${business.name}" listing renewed for the next 4 months.`,
        });
        onRefresh?.();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Payment Failed", { description: err.error || "Please try again." });
      }
    } catch (err: any) {
      toast.error("Network Error", { description: err.message || "Could not reach server." });
    } finally {
      setIsPaying(false);
    }
  };

  const {
    effectiveStartDate,
    nextAuditDate,
    daysSinceStart,
    daysOverdue,
    daysUntilDue,
    isDueForReview,
    isOverdue,
    existenceStatus,
    subscriptionStatus,
    progressPercent,
  } = metrics;

  const isConfirmedAndActive = existenceStatus === "confirmed" && subscriptionStatus === "active";
  const hasPendingConfirmation = existenceStatus === "pending_confirmation";
  const isUnconfirmed = existenceStatus === "unconfirmed" || existenceStatus === "dormant";
  const isSubscriptionDue = subscriptionStatus === "due" || subscriptionStatus === "past_due";

  const getBorderColor = () => {
    if (isConfirmedAndActive) return "border-emerald-500/30";
    if (isOverdue || isUnconfirmed) return "border-rose-500/40";
    if (hasPendingConfirmation || isSubscriptionDue) return "border-amber-500/40";
    return "border-border/60";
  };

  const getProgressColor = () => {
    if (isOverdue) return "bg-rose-500";
    if (progressPercent > 75) return "bg-amber-500";
    if (progressPercent > 50) return "bg-sky-500";
    return "bg-emerald-500";
  };

  // ─── Compact view ──────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 flex-wrap", className)}>
        {existenceStatus === "confirmed" ? (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active
          </Badge>
        ) : existenceStatus === "pending_confirmation" ? (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" /> Review Required
          </Badge>
        ) : (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-semibold gap-1">
            <XCircle className="w-3 h-3" /> Unconfirmed
          </Badge>
        )}
        {subscriptionStatus === "active" ? (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] font-semibold gap-1">
            <Sparkles className="w-3 h-3" /> Subscribed
          </Badge>
        ) : subscriptionStatus === "trial" ? (
          <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-[10px] font-semibold gap-1">
            <Clock className="w-3 h-3" /> Trial · {daysUntilDue}d left
          </Badge>
        ) : (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-semibold gap-1">
            <CreditCard className="w-3 h-3" /> Fee Due
          </Badge>
        )}
      </div>
    );
  }

  // ─── Full card view ────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 bg-card/60 backdrop-blur-sm transition-all duration-300",
        getBorderColor(),
        isDueForReview && "shadow-md",
        className
      )}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
              isConfirmedAndActive
                ? "bg-emerald-500/15 text-emerald-500"
                : isOverdue || isUnconfirmed
                ? "bg-rose-500/15 text-rose-500"
                : hasPendingConfirmation || isSubscriptionDue
                ? "bg-amber-500/15 text-amber-500"
                : "bg-sky-500/15 text-sky-500"
            )}
          >
            {isConfirmedAndActive ? (
              <ShieldCheck className="w-4 h-4" />
            ) : isOverdue || isUnconfirmed ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-foreground leading-tight">
              4-Month Listing Cycle
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Started:{" "}
              {effectiveStartDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/60"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
          <span>Day {daysSinceStart} of 120</span>
          <span>
            {isOverdue ? (
              <span className="text-rose-500 font-semibold">{daysOverdue} days overdue</span>
            ) : (
              <span>{daysUntilDue} days remaining</span>
            )}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", getProgressColor())}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <Badge
          className={cn(
            "text-[10px] font-semibold gap-1 border",
            existenceStatus === "confirmed"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : existenceStatus === "pending_confirmation"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
          )}
        >
          {existenceStatus === "confirmed" ? (
            <><CheckCircle2 className="w-3 h-3" />Business Active</>
          ) : existenceStatus === "pending_confirmation" ? (
            <><AlertTriangle className="w-3 h-3" />Confirmation Needed</>
          ) : (
            <><XCircle className="w-3 h-3" />Unconfirmed</>
          )}
        </Badge>

        <Badge
          className={cn(
            "text-[10px] font-semibold gap-1 border",
            subscriptionStatus === "active"
              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
              : subscriptionStatus === "trial"
              ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
          )}
        >
          {subscriptionStatus === "active" ? (
            <><Sparkles className="w-3 h-3" />Subscription Active</>
          ) : subscriptionStatus === "trial" ? (
            <><Clock className="w-3 h-3" />Free Trial</>
          ) : (
            <><CreditCard className="w-3 h-3" />Fee Due</>
          )}
        </Badge>
      </div>

      {/* Alert Banner */}
      {isDueForReview && (
        <div
          className={cn(
            "rounded-xl p-3 mb-3 text-xs",
            isOverdue || isUnconfirmed
              ? "bg-rose-500/8 border border-rose-500/25 text-rose-700 dark:text-rose-300"
              : "bg-amber-500/8 border border-amber-500/25 text-amber-700 dark:text-amber-300"
          )}
        >
          <div className="font-bold mb-0.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {isOverdue
              ? `⚠️ 4-Month Review Overdue — ${daysOverdue} days past due`
              : hasPendingConfirmation
              ? "⚠️ Existence Confirmation Required"
              : "💳 Subscription Fee Due"}
          </div>
          <p className="text-[10px] leading-relaxed opacity-90">
            {isOverdue
              ? `Your listing completed its 4-month cycle ${daysOverdue} days ago. Confirm your business is still active and renew your subscription.`
              : hasPendingConfirmation
              ? "Please confirm whether your business is currently operating at its registered address."
              : "Your 4-month listing cycle is complete. Pay the subscription fee to maintain verified status."}
          </p>
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="grid grid-cols-2 gap-2 mb-3 pt-2 border-t border-border/50">
          <div className="p-2 rounded-lg bg-muted/40 text-[10px]">
            <p className="text-muted-foreground font-medium">Registered</p>
            <p className="font-bold text-foreground mt-0.5">
              {effectiveStartDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-muted/40 text-[10px]">
            <p className="text-muted-foreground font-medium">Next Review</p>
            <p className={cn("font-bold mt-0.5", isOverdue ? "text-rose-500" : "text-foreground")}>
              {nextAuditDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-muted/40 text-[10px]">
            <p className="text-muted-foreground font-medium">Days Elapsed</p>
            <p className="font-bold text-foreground mt-0.5">{daysSinceStart} days</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/40 text-[10px]">
            <p className="text-muted-foreground font-medium">Alerts Sent</p>
            <p className="font-bold text-foreground mt-0.5">{business.auditAlertsCount || 0}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isDueForReview && (
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          {(hasPendingConfirmation || isUnconfirmed || isOverdue) && existenceStatus !== "confirmed" && (
            <Button
              size="sm"
              disabled={isConfirming}
              onClick={handleConfirmExistence}
              className="flex-1 text-xs font-bold gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 h-8"
            >
              {isConfirming ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Confirming...</>
              ) : (
                <><ShieldCheck className="w-3.5 h-3.5" />Confirm We&apos;re Open</>
              )}
            </Button>
          )}
          {(isSubscriptionDue || isOverdue) && subscriptionStatus !== "active" && (
            <Button
              size="sm"
              disabled={isPaying}
              onClick={handlePaySubscription}
              className="flex-1 text-xs font-bold gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20 h-8"
            >
              {isPaying ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Processing...</>
              ) : (
                <><CreditCard className="w-3.5 h-3.5" />Pay Subscription (1,499 ETB)</>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Healthy State */}
      {!isDueForReview && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              Next review:{" "}
              {nextAuditDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/60"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
