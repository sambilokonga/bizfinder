"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarClock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Send,
  RefreshCw,
  Search,
  Filter,
  Download,
  Sparkles,
  Zap,
  Clock,
  MapPin,
  Globe,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { BusinessAuditMetrics, FourMonthAuditSummary } from "@/lib/audit/four-month-engine";
import { cn } from "@/lib/utils/cn";

interface FourMonthAuditHubProps {
  initialCountry?: string;
  initialCity?: string;
}

export function FourMonthAuditHub({ initialCountry, initialCity }: FourMonthAuditHubProps) {
  const [summary, setSummary] = useState<FourMonthAuditSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "due" | "subscription_due" | "confirmed" | "unconfirmed">("all");
  const [simulatedTestMode, setSimulatedTestMode] = useState(false);

  // Manual payment modal state
  const [paymentModalBiz, setPaymentModalBiz] = useState<BusinessAuditMetrics | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<"telebirr" | "cbebirr" | "mpesa" | "card" | "bank_transfer">("telebirr");
  const [paymentAmount, setPaymentAmount] = useState(1499);
  const [paymentRef, setPaymentRef] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const fetchAuditData = async (forceTest = simulatedTestMode) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (forceTest) params.set("forceTest", "true");
      if (initialCountry && initialCountry !== "all") params.set("country", initialCountry);
      if (initialCity && initialCity !== "all") params.set("city", initialCity);

      const res = await fetch(`/api/admin/audit-cycle?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to load 4-month audit data:", err);
      toast.error("Failed to load 4-month audit listings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData(simulatedTestMode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulatedTestMode, initialCountry, initialCity]);

  const handleRunBatchAudit = async (forceTest = false) => {
    setIsDispatching(true);
    try {
      const res = await fetch("/api/admin/audit-cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forceTest,
          country: initialCountry !== "all" ? initialCountry : undefined,
          city: initialCity !== "all" ? initialCity : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`⚡ 4-Month Automated Audit Complete!`, {
          description: `Dispatched ${data.existenceAlertsCount} existence confirmation alerts and ${data.subscriptionAlertsCount} subscription renewal notices.`,
        });
        fetchAuditData(simulatedTestMode);
      } else {
        toast.error(data.error || "Failed to execute audit cycle.");
      }
    } catch (err) {
      toast.error("Network error while running audit cycle.");
    } finally {
      setIsDispatching(false);
    }
  };

  const handleSendSingleAlert = async (bizId: string, bizName: string) => {
    try {
      const res = await fetch("/api/admin/audit-cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessIds: [bizId],
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Alerts dispatched to "${bizName}"`, {
          description: "Existence confirmation & subscription renewal alerts delivered to owner.",
        });
        fetchAuditData(simulatedTestMode);
      }
    } catch (err) {
      toast.error("Failed to send alert.");
    }
  };

  const handleConfirmExistence = async (bizId: string, bizName: string) => {
    try {
      const res = await fetch(`/api/businesses/${bizId}/confirm-existence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorName: "Super Admin",
          actorRole: "super_admin",
          notes: "Confirmed active by Administrator during 4-month audit review.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Listing Confirmed! "${bizName}" verified active.`, {
          description: "Next audit cycle rescheduled for 4 months from today.",
        });
        fetchAuditData(simulatedTestMode);
      } else {
        toast.error(data.error || "Failed to confirm existence.");
      }
    } catch (err) {
      toast.error("Failed to confirm listing existence.");
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentModalBiz) return;
    setIsRecordingPayment(true);
    try {
      const res = await fetch(`/api/businesses/${paymentModalBiz.business.id}/subscription-pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerName: paymentModalBiz.business.name + " Owner",
          amount: paymentAmount,
          currency: "ETB",
          provider: paymentProvider,
          reference: paymentRef || `SUB-${Date.now().toString().slice(-6)}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Subscription Activated for "${paymentModalBiz.business.name}"!`, {
          description: "Listing renewed with active verified status for 4 months.",
        });
        setPaymentModalBiz(null);
        setPaymentRef("");
        fetchAuditData(simulatedTestMode);
      } else {
        toast.error(data.error || "Failed to record payment.");
      }
    } catch (err) {
      toast.error("Error submitting subscription payment.");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const items = summary?.items || [];

  const filteredItems = items.filter((item) => {
    const biz = item.business;
    const matchesSearch =
      !searchQuery.trim() ||
      biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (biz.categoryName && biz.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (biz.cityName && biz.cityName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (biz.addressLine && biz.addressLine.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "due") return item.isDueForReview;
    if (statusFilter === "subscription_due") return item.subscriptionStatus === "due" || item.subscriptionStatus === "past_due";
    if (statusFilter === "confirmed") return item.existenceStatus === "confirmed";
    if (statusFilter === "unconfirmed") return item.existenceStatus === "unconfirmed" || item.existenceStatus === "dormant";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-background border border-indigo-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge className="bg-indigo-600 text-white font-bold text-xs px-2.5 py-0.5 shadow-sm flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" />
                4-Month Lifecycle Engine
              </Badge>
              <Badge variant="outline" className="text-xs bg-background/50 border-border">
                Automated 120-Day Cadence
              </Badge>
              {simulatedTestMode && (
                <Badge className="bg-amber-500 text-white font-bold text-xs animate-pulse">
                  🧪 Test Simulation Mode Active
                </Badge>
              )}
            </div>

            <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <span>Automated 4-Month Audit & Subscription Hub</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Every registered or validated business enters a 4-month cycle. Listings reaching 120 days automatically receive operational existence confirmation alerts and subscription payment renewal notices.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Test Simulation Switch */}
            <Button
              size="sm"
              variant={simulatedTestMode ? "default" : "outline"}
              onClick={() => {
                const next = !simulatedTestMode;
                setSimulatedTestMode(next);
                toast.info(next ? "Simulation Mode: Enabled (All businesses tested)" : "Simulation Mode: Disabled (Real 120-day threshold)");
              }}
              className={cn(
                "text-xs font-bold gap-1.5 h-9",
                simulatedTestMode
                  ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                  : "border-border text-foreground hover:bg-muted"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{simulatedTestMode ? "Exit Test Mode" : "Simulate 4 Months (Test Mode)"}</span>
            </Button>

            {/* Run Batch Audit Button */}
            <Button
              size="sm"
              onClick={() => handleRunBatchAudit(simulatedTestMode)}
              disabled={isDispatching || isLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md gap-1.5 h-9 px-4"
            >
              <Zap className={cn("w-3.5 h-3.5", isDispatching && "animate-spin")} />
              <span>{isDispatching ? "Running Scan…" : "Run 4-Month Automated Audit"}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchAuditData(simulatedTestMode)}
              disabled={isLoading}
              className="border-border hover:bg-muted text-xs h-9"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-primary")} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI Metrics Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tracked Listings</span>
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">{summary?.totalTracked ?? "—"}</div>
          <div className="text-[10px] text-muted-foreground">Registered or validated</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Due for 4M Review</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {summary?.dueForReviewCount ?? 0}
          </div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300">Needs existence confirmation</div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Subscriptions Due</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {summary?.subscriptionDueCount ?? 0}
          </div>
          <div className="text-[10px] text-indigo-700 dark:text-indigo-300">1,499 ETB fee due</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Confirmed Active</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {summary?.confirmedActiveCount ?? 0}
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-300">Verified operating</div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Alerts Sent</span>
            <Send className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{summary?.totalAlertsDispatched ?? 0}</div>
          <div className="text-[10px] text-muted-foreground">Existence & Fee notices</div>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by business name, category, or address…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9 bg-background/60"
            />
          </div>
          {searchQuery && (
            <Button size="sm" variant="ghost" onClick={() => setSearchQuery("")} className="h-9 px-2 text-xs">
              Clear
            </Button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {[
            { key: "all", label: `All (${items.length})` },
            { key: "due", label: `Due for Review (${summary?.dueForReviewCount ?? 0})` },
            { key: "subscription_due", label: `Subscription Due (${summary?.subscriptionDueCount ?? 0})` },
            { key: "confirmed", label: `Confirmed (${summary?.confirmedActiveCount ?? 0})` },
            { key: "unconfirmed", label: `Unconfirmed (${summary?.unconfirmedCount ?? 0})` },
          ].map((tab: any) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                "px-2.5 py-1 rounded-xl font-bold transition-all text-xs",
                statusFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Listings Table ─────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xs z-20 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-card px-4 py-2.5 rounded-2xl shadow border border-border text-xs font-bold text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              <span>Analyzing 4-month lifecycle data…</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
              <tr>
                <th className="px-5 py-3.5">Business & Location</th>
                <th className="px-5 py-3.5">Registration & Validation</th>
                <th className="px-5 py-3.5">4-Month Cadence</th>
                <th className="px-5 py-3.5">Existence Status</th>
                <th className="px-5 py-3.5">Subscription Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {filteredItems.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <CalendarClock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-foreground">No listings match this filter</p>
                    <p className="text-[11px] mt-0.5">Try toggling Simulation Mode to preview alerts on sample listings.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const biz = item.business;
                  const regDateStr = item.registeredAtDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const valDateStr = item.validationDateDate
                    ? item.validationDateDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : null;

                  const progressPercent = Math.min(100, Math.round((item.daysSinceStart / 120) * 100));

                  return (
                    <tr
                      key={biz.id}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        item.isDueForReview ? "bg-amber-500/[0.02]" : ""
                      )}
                    >
                      {/* Business & Location */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                            <span>{biz.name}</span>
                            {biz.isVerified && (
                              <span title="Verified Listing">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-foreground/80">{biz.categoryName}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {biz.cityName || "Addis Ababa"}, {biz.countryName || "Ethiopia"}
                            </span>
                          </div>
                          {biz.telephone && (
                            <div className="text-[10px] text-muted-foreground">
                              Tel: {biz.telephone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Registration & Validation Dates */}
                      <td className="px-5 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Registered:</span>
                            <span className="font-medium text-foreground">{regDateStr}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Validated:</span>
                            {valDateStr ? (
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                {valDateStr}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                Awaiting sign-off
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Next review: {item.nextAuditDate.toLocaleDateString()}
                          </div>
                        </div>
                      </td>

                      {/* 4-Month Progress Cadence */}
                      <td className="px-5 py-4 min-w-[160px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={cn("font-bold", item.isOverdue ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>
                              {item.daysSinceStart} / 120 Days
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({item.monthsSinceStart} mos)
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-500",
                                item.isOverdue
                                  ? "bg-rose-500"
                                  : progressPercent >= 80
                                  ? "bg-amber-500"
                                  : "bg-indigo-500"
                              )}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          {item.isOverdue && (
                            <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <span>⚠️ Completed 4 months</span>
                              {item.daysOverdue > 0 && <span>(+{item.daysOverdue}d)</span>}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Existence Status */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {item.existenceStatus === "confirmed" ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold gap-1 px-2 py-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              Confirmed Active
                            </Badge>
                          ) : item.existenceStatus === "pending_confirmation" ? (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold gap-1 px-2 py-0.5 animate-pulse">
                              <Clock className="w-3 h-3" />
                              Confirmation Pending
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10px] font-bold gap-1 px-2 py-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              Unconfirmed
                            </Badge>
                          )}

                          {item.auditAlertsCount > 0 && (
                            <div className="text-[10px] text-muted-foreground">
                              {item.auditAlertsCount} alert{item.auditAlertsCount === 1 ? "" : "s"} sent
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Subscription Status */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {item.subscriptionStatus === "active" ? (
                            <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 text-[10px] font-bold gap-1 px-2 py-0.5">
                              <CreditCard className="w-3 h-3" />
                              Active Subscriber
                            </Badge>
                          ) : item.subscriptionStatus === "due" ? (
                            <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10px] font-bold gap-1 px-2 py-0.5 animate-pulse">
                              <CreditCard className="w-3 h-3" />
                              1,499 ETB Due
                            </Badge>
                          ) : item.subscriptionStatus === "trial" ? (
                            <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground border-border px-2 py-0.5">
                              4-Month Trial
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5">
                              Past Due
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Send 4-Month Alerts */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendSingleAlert(biz.id, biz.name)}
                            title="Dispatch existence confirmation and subscription payment alert to owner"
                            className="h-7 text-[11px] font-bold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 gap-1 px-2 rounded-lg"
                          >
                            <Send className="w-3 h-3" />
                            <span>Dispatch Alert</span>
                          </Button>

                          {/* Quick Confirm Existence (Admin Override) */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirmExistence(biz.id, biz.name)}
                            title="Verify and confirm business is operating"
                            className="h-7 text-[11px] font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1 px-2 rounded-lg"
                          >
                            <Check className="w-3 h-3" />
                            <span>Confirm Exists</span>
                          </Button>

                          {/* Record Subscription Payment */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPaymentModalBiz(item)}
                            title="Record subscription fee payment"
                            className="h-7 text-[11px] font-bold border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 gap-1 px-2 rounded-lg"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay Fee</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Record Subscription Payment Modal ──────────────────────────────── */}
      {paymentModalBiz && (
        <Dialog open={Boolean(paymentModalBiz)} onOpenChange={() => setPaymentModalBiz(null)}>
          <DialogContent className="max-w-md rounded-3xl p-6 bg-card border border-border shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-500" />
                Record 4-Month Subscription Payment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Settle directory listing subscription for &ldquo;{paymentModalBiz.business.name}&rdquo;.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1">
                <div className="font-bold text-foreground">{paymentModalBiz.business.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  Location: {paymentModalBiz.business.cityName}, {paymentModalBiz.business.countryName}
                </div>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Standard 4-Month Cycle Renewal: 1,499 ETB
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Payment Provider</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "telebirr", label: "Telebirr" },
                    { id: "cbebirr", label: "CBE Birr" },
                    { id: "mpesa", label: "M-Pesa" },
                    { id: "card", label: "Credit Card" },
                    { id: "bank_transfer", label: "Bank Slip" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentProvider(p.id as any)}
                      className={cn(
                        "p-2 rounded-xl border text-center font-bold transition-all text-xs",
                        paymentProvider === p.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/30 text-muted-foreground border-border hover:bg-muted"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Amount (ETB)</label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="text-xs h-9 bg-background/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Transaction / Slip Reference</label>
                <Input
                  placeholder="e.g. TEL-892184 or CBE-998822"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="text-xs h-9 bg-background/60"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaymentModalBiz(null)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRecordPayment}
                disabled={isRecordingPayment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isRecordingPayment ? "Recording…" : "Complete Renewal"}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
