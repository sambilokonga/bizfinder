"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  ChevronRight,
  RefreshCw,
  Zap,
  CheckCircle2,
  Eye,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Business } from "@/types/business";
import { BusinessConfirmationModal } from "@/components/business/BusinessConfirmationModal";
import { useCurrentRole } from "@/components/layout/RoleSwitcher";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

type AdminRole = "super_admin" | "admin" | "country_admin" | "city_admin";

interface PendingConfirmationsQueueProps {
  role: AdminRole;
  filterCountry?: string;
  filterCity?: string;
  onApproved?: (bizId: string) => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_city: {
    label: "Stage 1 — City Review",
    color: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  },
  pending_country: {
    label: "Stage 2 — Country Lead",
    color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  },
  pending_super_admin: {
    label: "Stage 3 — Super Admin",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },
  revision_requested: {
    label: "Revision Requested",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
};

const TOP_GRADIENT: Record<string, string> = {
  pending_city: "bg-gradient-to-r from-sky-500 to-cyan-400",
  pending_country: "bg-gradient-to-r from-indigo-500 to-blue-400",
  pending_super_admin: "bg-gradient-to-r from-purple-600 to-violet-400",
  revision_requested: "bg-gradient-to-r from-amber-500 to-orange-400",
};

const BORDER_COLOR: Record<string, string> = {
  pending_city: "border-sky-500/25",
  pending_country: "border-indigo-500/25",
  pending_super_admin: "border-purple-500/25",
  revision_requested: "border-amber-500/25",
};

export function PendingConfirmationsQueue({
  role,
  filterCountry,
  filterCity,
  onApproved,
}: PendingConfirmationsQueueProps) {
  const { currentUser } = useCurrentRole();
  const [pendingList, setPendingList] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | "pending_city" | "pending_country" | "pending_super_admin">("all");
  const [confirmingBizId, setConfirmingBizId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const isSuperAdmin = role === "super_admin" || role === "admin";
  const isCountryAdmin = role === "country_admin";
  const isCityAdmin = role === "city_admin";

  const fetchPending = useCallback(
    async (pg = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(pg));
        params.set("limit", "12");
        params.set("status", stageFilter === "all" ? "pending" : stageFilter);
        if (filterCountry && filterCountry !== "all") params.set("country", filterCountry);
        if (filterCity && filterCity !== "all") params.set("city", filterCity);
        if (search.trim()) params.set("q", search.trim());

        const res = await fetch(`/api/businesses?${params.toString()}`);
        const data = await res.json();
        if (data?.businesses) {
          const filtered = (data.businesses as Business[]).filter((b) =>
            ["pending_city", "pending_country", "pending_super_admin", "revision_requested"].includes(
              b.approvalStatus || "pending_city"
            )
          );
          setPendingList(filtered);
          setTotalCount(data.total ?? filtered.length);
          setTotalPages(data.totalPages ?? 1);
          setPage(data.page ?? pg);
        }
      } catch (err) {
        console.error("[PendingConfirmationsQueue] Fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [stageFilter, filterCountry, filterCity, search]
  );

  useEffect(() => {
    const handler = setTimeout(() => fetchPending(1), 300);
    return () => clearTimeout(handler);
  }, [fetchPending]);

  const handleQuickAction = async (
    bizId: string,
    bizName: string,
    action: "city_approve" | "super_admin_override" | "country_approve" | "super_admin_approve"
  ) => {
    setProcessingId(bizId);
    try {
      const res = await fetch(`/api/businesses/${bizId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          actorName: currentUser?.name || "Administrator",
          actorRole: role,
          notes: `Quick confirmation by ${currentUser?.name || role}`,
        }),
      });
      if (res.ok) {
        toast.success(`${bizName} — ${action.replace(/_/g, " ")} completed!`);
        onApproved?.(bizId);
        fetchPending(page);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error((errData as any).error || "Action failed.");
      }
    } catch (e: any) {
      toast.error(e.message || "Network error.");
    } finally {
      setProcessingId(null);
    }
  };

  const stageFilterItems = [
    { key: "all", label: "All Pending" },
    { key: "pending_city", label: "Stage 1: City" },
    { key: "pending_country", label: "Stage 2: Country" },
    { key: "pending_super_admin", label: "Stage 3: Platform" },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            Pending Confirmation Queue
            {totalCount > 0 && (
              <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold text-xs animate-pulse">
                {totalCount} pending
              </Badge>
            )}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Multi-tier business listing confirmations. Stage 1 (City) → Stage 2 (Country) → Stage 3 (Super Admin).
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fetchPending(page)}
          disabled={isLoading}
          className="gap-1.5 text-xs font-bold shrink-0"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-primary")} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by business name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9 bg-background/60"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {stageFilterItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setStageFilter(item.key as typeof stageFilter)}
              className={cn(
                "px-2.5 py-1.5 rounded-xl font-bold transition-all text-xs",
                stageFilter === item.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground border border-border hover:border-foreground/30"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : pendingList.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">All Clear!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No businesses pending confirmation in this queue.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {pendingList.map((biz) => {
            const statusKey = biz.approvalStatus || "pending_city";
            const statusInfo = STATUS_LABELS[statusKey];
            const isProc = processingId === biz.id;
            const cityDone = Boolean((biz as any).approvedByCity?.approved);
            const countryDone = Boolean((biz as any).approvedByCountry?.approved);
            const isNewUser = !cityDone && !countryDone;

            return (
              <div
                key={biz.id}
                className={cn(
                  "group relative p-4 rounded-2xl border bg-card transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 overflow-hidden",
                  BORDER_COLOR[statusKey] || "border-border"
                )}
              >
                {/* Color stripe */}
                <div className={cn("absolute inset-x-0 top-0 h-0.5 rounded-t-2xl", TOP_GRADIENT[statusKey])} />

                <div className="space-y-3 pt-1">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate">{biz.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">{biz.id.slice(0, 14)}…</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <Badge className={cn("text-[9px] font-bold border px-1.5 py-0", statusInfo?.color)}>
                        {statusInfo?.label || statusKey}
                      </Badge>
                      {isNewUser && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] font-bold px-1.5 py-0">
                          ✨ New User
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3 h-3 shrink-0 text-primary/60" />
                      <span className="font-medium text-foreground">{biz.categoryName || "General"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 shrink-0 text-rose-400" />
                      <span>{biz.cityName}, {biz.countryName}</span>
                    </div>
                    {biz.addressLine && (
                      <div className="flex items-center gap-1.5 truncate">
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                        <span className="truncate">{biz.addressLine}</span>
                      </div>
                    )}
                  </div>

                  {/* 3-stage pipeline */}
                  <div className="flex items-center gap-1">
                    {[
                      { label: "City", done: cityDone, active: statusKey === "pending_city" },
                      { label: "Country", done: countryDone, active: statusKey === "pending_country" },
                      { label: "Platform", done: !!biz.isApproved, active: statusKey === "pending_super_admin" },
                    ].map((stage, idx) => (
                      <React.Fragment key={stage.label}>
                        <div
                          className={cn(
                            "flex-1 flex flex-col items-center gap-0.5 py-1 px-1 rounded-lg text-[8px] font-bold transition-all",
                            stage.done
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : stage.active
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-muted/40 text-muted-foreground"
                          )}
                        >
                          {stage.done ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {stage.label}
                        </div>
                        {idx < 2 && <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmingBizId(biz.id)}
                      disabled={isProc}
                      className="h-7 text-[11px] font-bold flex-1 gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Review
                    </Button>

                    {isCityAdmin && statusKey === "pending_city" && (
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction(biz.id, biz.name, "city_approve")}
                        disabled={isProc}
                        className="h-7 text-[11px] font-bold gap-1 bg-sky-600 hover:bg-sky-700 text-white flex-1"
                      >
                        {isProc ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        City Approve
                      </Button>
                    )}

                    {isCountryAdmin && statusKey === "pending_country" && (
                      <Button
                        size="sm"
                        onClick={() => handleQuickAction(biz.id, biz.name, "country_approve")}
                        disabled={isProc}
                        className="h-7 text-[11px] font-bold gap-1 bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
                      >
                        {isProc ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Approve
                      </Button>
                    )}

                    {isSuperAdmin && (
                      <>
                        {statusKey === "pending_super_admin" && (
                          <Button
                            size="sm"
                            onClick={() => handleQuickAction(biz.id, biz.name, "super_admin_approve")}
                            disabled={isProc}
                            className="h-7 text-[11px] font-bold gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex-1"
                          >
                            {isProc ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Final Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleQuickAction(biz.id, biz.name, "super_admin_override")}
                          disabled={isProc}
                          title="Fast-Track: Publish immediately"
                          className="h-7 text-[11px] font-bold gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex-1"
                        >
                          {isProc ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                          Fast-Track
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs pt-2">
          <span className="text-muted-foreground">
            Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, totalCount)} of {totalCount} pending
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchPending(p); }}
              disabled={page <= 1 || isLoading}
              className="h-8 px-3 text-xs"
            >
              Previous
            </Button>
            <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-xs">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); fetchPending(p); }}
              disabled={page >= totalPages || isLoading}
              className="h-8 px-3 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {confirmingBizId && (
        <BusinessConfirmationModal
          businessId={confirmingBizId}
          isOpen={Boolean(confirmingBizId)}
          onClose={() => setConfirmingBizId(null)}
          onSuccess={() => {
            fetchPending(page);
            onApproved?.(confirmingBizId);
          }}
        />
      )}
    </div>
  );
}
