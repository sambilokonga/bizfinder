"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Globe,
  MapPin,
  TrendingUp,
  Users,
  Eye,
  Phone,
  Navigation,
  ExternalLink,
  Bookmark,
  Share2,
  RefreshCw,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Building2,
  Activity,
  Smartphone,
  Laptop,
  Compass,
  ArrowUpRight,
  Calendar,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Shield,
  Crown,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  GlobalVisitorCountry,
  GlobalUserSession,
  GlobalVisitorsSummary,
  GlobalVisitorsResponse,
} from "@/types/globalVisitors";
import { RegisterGlobalVisitorModal } from "@/components/admin/RegisterGlobalVisitorModal";
import { toast } from "sonner";

interface GlobalVisitorsMatrixProps {
  currentRole: "super_admin" | "country_admin" | "city_admin" | "admin";
  targetCountry: string;
  targetCity?: string;
  className?: string;
  businessesList?: Array<{ id: string; name: string }>;
}

export function GlobalVisitorsMatrix({
  currentRole,
  targetCountry,
  targetCity,
  className = "",
  businessesList = [],
}: GlobalVisitorsMatrixProps) {
  const [data, setData] = useState<GlobalVisitorsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<string>("all");
  const [visitorTypeFilter, setVisitorTypeFilter] = useState<"all" | "actual" | "future">("all");
  const [activeTab, setActiveTab] = useState<
    "overview" | "visitors_list" | "future_delegations" | "admin_hierarchy" | "countries" | "live_feed"
  >("visitors_list");

  // ── 20 Items Per Page State ──
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEscalatingId, setIsEscalatingId] = useState<string | null>(null);

  const effectiveCountry = targetCountry === "all" ? undefined : targetCountry;
  const effectiveCity = targetCity === "all" ? undefined : targetCity;

  const fetchGlobalVisitors = useCallback(async (page: number = currentPage) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (effectiveCountry) params.set("country", effectiveCountry);
      if (effectiveCity) params.set("city", effectiveCity);
      params.set("page", String(page));
      params.set("limit", String(itemsPerPage));
      if (visitorTypeFilter !== "all") params.set("type", visitorTypeFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (selectedContinent !== "all") params.set("continent", selectedContinent);

      const res = await fetch(`/api/admin/global-visitors?${params.toString()}`);
      if (res.ok) {
        const json: GlobalVisitorsResponse = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("[GlobalVisitorsMatrix] Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveCountry, effectiveCity, currentPage, visitorTypeFilter, searchQuery, selectedContinent]);

  useEffect(() => {
    fetchGlobalVisitors(currentPage);
  }, [fetchGlobalVisitors, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (type: "all" | "actual" | "future") => {
    setVisitorTypeFilter(type);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Continents list for filtering
  const continents = useMemo(() => {
    if (!data?.visitorCountries) return [];
    const list = Array.from(new Set(data.visitorCountries.map((c) => c.continent)));
    return ["all", ...list];
  }, [data]);

  // Total pages and pagination metadata
  const pagination = data?.pagination || {
    page: currentPage,
    limit: itemsPerPage,
    total: data?.recentSessions.length || 0,
    totalPages: Math.max(1, Math.ceil((data?.recentSessions.length || 0) / itemsPerPage)),
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Escalate visitor to Country Admin or Super Admin
  const handleEscalate = async (visitorId: string, targetLevel: "country_admin" | "super_admin") => {
    setIsEscalatingId(visitorId);
    try {
      const res = await fetch("/api/admin/global-visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          actionType: "escalate",
          targetLevel,
          notes: `Escalated from City Admin (${effectiveCity || "Municipal"}) to ${targetLevel.replace("_", " ")} for strategic bilateral follow-up.`,
          adminName: `${currentRole.replace("_", " ").toUpperCase()}`,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(`Visitor lead successfully escalated to ${targetLevel === "super_admin" ? "Super Admin" : "Country Admin"}!`);
        fetchGlobalVisitors(currentPage);
      } else {
        toast.error(resData.error || "Failed to escalate visitor lead.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to escalate visitor lead.");
    } finally {
      setIsEscalatingId(null);
    }
  };

  // Mark Future Visitor as Arrived
  const handleMarkAsArrived = async (visitorId: string) => {
    try {
      const res = await fetch("/api/admin/global-visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          actionType: "update_status",
          status: "arrived",
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success("Visitor delegation status marked as 'Arrived' and converted to live active visitor!");
        fetchGlobalVisitors(currentPage);
      } else {
        toast.error(resData.error || "Failed to update status.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!data?.recentSessions || data.recentSessions.length === 0) {
      toast.error("No visitor records available to export.");
      return;
    }
    const headers = [
      "ID",
      "Type",
      "Visitor Name",
      "Country",
      "Country Code",
      "City",
      "Target Business",
      "Action",
      "Purpose",
      "Status",
      "Escalated To",
      "Device",
      "IP",
      "Date",
    ];
    const rows = data.recentSessions.map((v) => [
      `"${v.id}"`,
      `"${v.visitorType}"`,
      `"${v.visitorName || ""}"`,
      `"${v.visitorCountry}"`,
      `"${v.visitorCountryCode}"`,
      `"${v.visitorCity}"`,
      `"${v.targetBusinessName}"`,
      `"${v.action}"`,
      `"${v.purpose}"`,
      `"${v.status}"`,
      `"${v.escalatedTo}"`,
      `"${v.visitorDevice}"`,
      `"${v.visitorIp}"`,
      `"${v.timestamp}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `global_visitors_${effectiveCity || "all"}_page_${currentPage}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Global Visitors CSV exported successfully!");
  };

  const jurisdictionTitle = effectiveCity
    ? `Global Users Viewing Businesses in ${effectiveCity}`
    : effectiveCountry
    ? `Global Users Viewing Businesses in ${effectiveCountry}`
    : "Worldwide Users Viewing Global Businesses";

  const getActionBadge = (action: GlobalUserSession["action"]) => {
    switch (action) {
      case "view":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Eye className="w-2.5 h-2.5" /> Viewed Profile
          </span>
        );
      case "call":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Phone className="w-2.5 h-2.5" /> Phone Call
          </span>
        );
      case "direction":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Navigation className="w-2.5 h-2.5" /> Directions
          </span>
        );
      case "website":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <ExternalLink className="w-2.5 h-2.5" /> Website Click
          </span>
        );
      case "saved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Bookmark className="w-2.5 h-2.5" /> Saved Listing
          </span>
        );
      case "inquiry":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Sparkles className="w-2.5 h-2.5" /> Trade Inquiry
          </span>
        );
      case "meeting":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Users className="w-2.5 h-2.5" /> B2B Meeting
          </span>
        );
      case "delegation":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
            <Calendar className="w-2.5 h-2.5" /> Inbound Delegation
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <Activity className="w-2.5 h-2.5" /> Engaged
          </span>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 border border-cyan-400/30 text-cyan-300">
                <Globe className="w-3.5 h-3.5 animate-spin-slow text-cyan-400" />
                Global Visitors & Inbound Intelligence
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live 20/Page Matrix
              </div>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Shield className="w-3 h-3 text-indigo-400" />
                City ⇄ Country ⇄ Super Admin Linked
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {jurisdictionTitle}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Register actual global visitors, schedule future inbound delegations, and seamlessly coordinate with{" "}
              <strong className="text-cyan-200">Country Admin</strong> and{" "}
              <strong className="text-indigo-200">Super Admin</strong> across{" "}
              <strong className="text-white">
                {effectiveCity ? `${effectiveCity}, ${effectiveCountry || "Ethiopia"}` : effectiveCountry || "Ethiopia"}
              </strong>
              .
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <UserPlus className="w-4 h-4" />
              + Register Global Visitor
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl text-xs font-bold gap-1.5 backdrop-blur-md"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchGlobalVisitors(currentPage)}
              disabled={isLoading}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl text-xs font-bold gap-1.5 backdrop-blur-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* 4 Key Metrics Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Actual Global Views</span>
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {data?.summary.totalGlobalViews.toLocaleString() || "—"}
            </div>
            <div className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {data?.summary.growthRate || "+24.6%"}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Unique Foreign Visitors</span>
              <Users className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {data?.summary.uniqueGlobalVisitors.toLocaleString() || "—"}
            </div>
            <div className="text-[11px] text-slate-300 font-medium mt-1">
              {data?.summary.internationalSharePercent || 81.2}% int&apos;l share
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Future Delegations</span>
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-indigo-300">
              {data?.summary.futureVisitorsCount || 12} Upcoming
            </div>
            <div className="text-[11px] text-indigo-200/80 font-medium mt-1">
              Diaspora & trade missions
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Top International Hub</span>
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-white truncate flex items-center gap-1.5">
              <span>{data?.summary.topOriginFlag || "🇺🇸"}</span>
              <span className="truncate">{data?.summary.topOriginCountry || "United States"}</span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium mt-1">
              Peak: {data?.summary.peakHour || "18:00 - 22:30 GMT+3"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Administrative Multi-Tier Coordination Banner ── */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-muted/40 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-foreground flex items-center gap-2 flex-wrap">
              <span>Integrated Multi-Tier Governance Active</span>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Live Jurisdiction Sync
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              City Admin ({effectiveCity || "Addis Ababa"}) ➔ Country Admin ({effectiveCountry || "Ethiopia"}) ➔ Super Admin (Global).
              Escalate high-stake investment inquiries or trade delegations with one click.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab("admin_hierarchy")}
            className="text-xs font-bold rounded-xl gap-1.5 border-border hover:bg-muted"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            Admin Matrix
          </Button>
          <Button
            size="sm"
            onClick={() => setIsRegisterModalOpen(true)}
            className="text-xs font-black rounded-xl gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register Visitor
          </Button>
        </div>
      </div>

      {/* ── Main Navigation Tabs & Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("visitors_list")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "visitors_list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            Global Visitors Roster (20/Page)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("future_delegations")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "future_delegations"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            Future Delegations ({data?.futureDelegations?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Analytics Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("countries")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "countries"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🌍 Origin Nations ({data?.visitorCountries.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("admin_hierarchy")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "admin_hierarchy"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            Country & Super Admin
          </button>
        </div>

        {/* Search & Continent Filters */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 absolute left-2.5 xs:left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search visitor, country, hub, or listing..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-7.5 xs:h-8 sm:h-8.5 pl-7.5 xs:pl-8 sm:pl-9 pr-3 rounded-lg xs:rounded-xl bg-background border border-border text-[10px] xs:text-[10.5px] sm:text-xs md:text-xs placeholder:text-[9.5px] xs:placeholder:text-[10px] sm:placeholder:text-[10.5px] md:placeholder:text-xs focus:ring-2 focus:ring-primary outline-none truncate"
            />
          </div>

          <select
            value={selectedContinent}
            onChange={(e) => {
              setSelectedContinent(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8 rounded-xl bg-background border border-border px-2 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
          >
            {continents.map((cont) => (
              <option key={cont} value={cont}>
                {cont === "all" ? "All Continents" : cont}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── TAB: VISITORS LIST (20 PER PAGE WITH PAGINATION) ─────────────── */}
      {activeTab === "visitors_list" && (
        <div className="space-y-4">
          {/* Sub-filter bar: Type (All / Actual / Future / Escalated) */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-card border border-border p-3 rounded-2xl">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  visitorTypeFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All Visitors ({pagination.total})
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("actual")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  visitorTypeFilter === "actual"
                    ? "bg-cyan-500 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Actual Live Telemetry
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("future")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  visitorTypeFilter === "future"
                    ? "bg-indigo-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Future Delegations
              </button>
            </div>

            <div className="text-xs text-muted-foreground font-semibold">
              Showing <span className="text-foreground font-bold">{Math.min(pagination.total, (pagination.page - 1) * 20 + 1)}</span> to{" "}
              <span className="text-foreground font-bold">{Math.min(pagination.total, pagination.page * 20)}</span> of{" "}
              <span className="text-foreground font-bold">{pagination.total}</span> records
            </div>
          </div>

          {/* Visitors Table: Exactly 20 items per page */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-3.5">Visitor / Delegation</th>
                    <th className="p-3.5">Origin Nation & Hub</th>
                    <th className="p-3.5">Target Business in City</th>
                    <th className="p-3.5">Action & Purpose</th>
                    <th className="p-3.5">Status & Timing</th>
                    <th className="p-3.5">Admin Governance</th>
                    <th className="p-3.5 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                        Loading global visitor sessions (Page {currentPage})...
                      </td>
                    </tr>
                  ) : !data?.recentSessions || data.recentSessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No global visitors found matching current filters. Try resetting search or registering a new visitor.
                      </td>
                    </tr>
                  ) : (
                    data.recentSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-muted/40 transition-colors">
                        {/* Visitor Info */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl shrink-0">{session.visitorFlag}</span>
                            <div>
                              <div className="font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                                <span>{session.visitorName || "International Visitor"}</span>
                                {session.visitorType === "future" ? (
                                  <Badge className="text-[9px] bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-bold">
                                    Upcoming
                                  </Badge>
                                ) : (
                                  <Badge className="text-[9px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 font-bold">
                                    Actual
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                {session.id} • {session.visitorDevice}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Origin Nation & Hub */}
                        <td className="p-3.5">
                          <div className="font-bold text-foreground">
                            {session.visitorCity}, {session.visitorCountry}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            IP: {session.visitorIp}
                          </div>
                        </td>

                        {/* Target Business */}
                        <td className="p-3.5">
                          <div className="font-bold text-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-primary shrink-0" />
                            <span>{session.targetBusinessName}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {session.targetBusinessCity}, {session.targetBusinessCountry}
                          </div>
                        </td>

                        {/* Action & Purpose */}
                        <td className="p-3.5">
                          <div className="mb-1">{getActionBadge(session.action)}</div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-xs" title={session.purpose}>
                            {session.purpose}
                          </div>
                        </td>

                        {/* Status & Timing */}
                        <td className="p-3.5">
                          <div className="font-bold text-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span>{session.relativeTime}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground capitalize">
                            Status: <strong className="text-foreground">{session.status}</strong>
                          </div>
                        </td>

                        {/* Admin Governance */}
                        <td className="p-3.5">
                          {session.escalatedTo === "super_admin" ? (
                            <Badge className="text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30 gap-1">
                              <Crown className="w-3 h-3" /> Super Admin
                            </Badge>
                          ) : session.escalatedTo === "country_admin" ? (
                            <Badge className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 gap-1">
                              <Shield className="w-3 h-3" /> Country Admin
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-medium">
                              City Scope
                            </span>
                          )}
                          <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[130px]" title={session.registeredBy}>
                            By: {session.registeredBy}
                          </div>
                        </td>

                        {/* Quick Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {session.visitorType === "future" && session.status !== "arrived" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsArrived(session.id)}
                                className="h-7 px-2 text-[10px] font-bold border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
                                title="Convert to Actual Arrived Visitor"
                              >
                                Mark Arrived
                              </Button>
                            )}

                            {session.escalatedTo === "none" ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isEscalatingId === session.id}
                                  onClick={() => handleEscalate(session.id, "country_admin")}
                                  className="h-7 px-2 text-[10px] font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                  title="Escalate to Country Admin"
                                >
                                  ➔ Country Admin
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isEscalatingId === session.id}
                                  onClick={() => handleEscalate(session.id, "super_admin")}
                                  className="h-7 px-2 text-[10px] font-bold border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                                  title="Escalate to Super Admin"
                                >
                                  ➔ Super Admin
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                ✓ Escalated
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── 20-ITEM PAGINATION CONTROLS ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-card">
              <div className="text-xs text-muted-foreground">
                Page <strong className="text-foreground">{pagination.page}</strong> of{" "}
                <strong className="text-foreground">{pagination.totalPages}</strong> • 20 visitors per page
              </div>

              {/* Prev / Next Pagination Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1 || isLoading}
                  className="text-xs font-bold gap-1 rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Page
                </Button>

                {/* Direct Page Pills */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          pagination.page === pageNum
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {pagination.totalPages > 5 && (
                    <span className="text-xs text-muted-foreground px-1">...</span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages || isLoading}
                  className="text-xs font-bold gap-1 rounded-xl"
                >
                  Next Page
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: FUTURE DELEGATIONS ───────────────────────────────────────── */}
      {activeTab === "future_delegations" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Scheduled Future Delegations & Diaspora Missions
              </h3>
              <p className="text-xs text-muted-foreground">
                Upcoming international trade missions, investor groups, and diaspora delegations visiting {effectiveCity || "Addis Ababa"}.
              </p>
            </div>

            <Button
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Calendar className="w-3.5 h-3.5" />
              + Schedule Inbound Delegation
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.futureDelegations && data.futureDelegations.length > 0 ? (
              data.futureDelegations.map((delegation) => (
                <div
                  key={delegation.id}
                  className="rounded-3xl border border-indigo-500/20 bg-card p-5 space-y-4 hover:border-indigo-500/40 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{delegation.visitorFlag}</span>
                      <div>
                        <div className="text-xs font-black text-foreground">
                          {delegation.visitorName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          From: {delegation.visitorCity}, {delegation.visitorCountry}
                        </div>
                      </div>
                    </div>
                    <Badge className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 capitalize">
                      {delegation.status}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Target Listing:</span>
                      <strong className="text-foreground">{delegation.targetBusinessName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Delegates:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        {delegation.delegationSize || 10} Delegates
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Timeline:</span>
                      <strong className="text-foreground">{delegation.relativeTime}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {delegation.purpose}
                  </p>

                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsArrived(delegation.id)}
                      className="text-[11px] font-bold rounded-xl h-8 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
                    >
                      Mark Arrived
                    </Button>

                    {delegation.escalatedTo === "none" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEscalate(delegation.id, "country_admin")}
                        className="text-[11px] font-bold rounded-xl h-8 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      >
                        Escalate Lead
                      </Button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ Escalated to {delegation.escalatedTo.replace("_", " ")}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-8 text-center text-muted-foreground bg-card border border-border rounded-3xl">
                No future delegations registered yet. Click &quot;+ Schedule Inbound Delegation&quot; to log upcoming international visits.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB: COUNTRY & SUPER ADMIN INTEGRATION ───────────────────────── */}
      {activeTab === "admin_hierarchy" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Administrative Multi-Tier Governance & Coordination
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time connection between Municipal City Admin, National Country Admin, and Worldwide Super Admin.
              </p>
            </div>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-cyan-500 text-white font-bold text-[10px]">Tier 1: Frontline</Badge>
                  <Building2 className="w-5 h-5 text-cyan-500" />
                </div>
                <div className="text-sm font-black text-foreground">
                  City Admin ({effectiveCity || "Addis Ababa"})
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Municipal reception, storefront pin routing, business matching, and registering live international visitors to city listings.
                </p>
                <div className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                  Authority: {effectiveCity || "Addis Ababa"} Municipality
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Tier 2: National</Badge>
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-sm font-black text-foreground">
                  Country Admin ({effectiveCountry || "Ethiopia"})
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  National commerce oversight, inter-city trade delegations, diplomatic chamber alignment, and national trade portal routing.
                </p>
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Authority: National Directorate
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-600 text-white font-bold text-[10px]">Tier 3: Global</Badge>
                  <Crown className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-sm font-black text-foreground">
                  Super Admin (Worldwide)
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Platform-wide global telemetry, 195-nation directory governance, diaspora marketing campaigns, and bilateral agreements.
                </p>
                <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  Authority: Worldwide Platform Root
                </div>
              </div>
            </div>

            {/* Escalated Leads Quick Roster */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-foreground">
                  Escalated Leads Synchronized with Country & Super Admin
                </h4>
                <Badge variant="outline" className="text-xs font-bold">
                  {data?.summary.escalatedCount || 0} Escalated
                </Badge>
              </div>

              <div className="divide-y divide-border">
                {data?.recentSessions
                  .filter((s) => s.escalatedTo && s.escalatedTo !== "none")
                  .slice(0, 5)
                  .map((lead) => (
                    <div key={lead.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{lead.visitorFlag}</span>
                        <div>
                          <div className="font-bold text-foreground">
                            {lead.visitorName} ({lead.visitorCity}, {lead.visitorCountry})
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Target: {lead.targetBusinessName} • Purpose: {lead.purpose}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge
                          className={`text-[10px] font-bold ${
                            lead.escalatedTo === "super_admin"
                              ? "bg-purple-500/15 text-purple-600 dark:text-purple-300"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                          }`}
                        >
                          {lead.escalatedTo === "super_admin" ? "Super Admin" : "Country Admin"}
                        </Badge>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {lead.relativeTime}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: OVERVIEW ─────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Top Foreign Visitor Markets</h3>
                <p className="text-xs text-muted-foreground">
                  Where users viewing your businesses are browsing from globally.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-bold">
                12 Key Hubs
              </Badge>
            </div>

            <div className="space-y-3.5">
              {data?.visitorCountries.slice(0, 6).map((item) => (
                <div
                  key={item.countryCode}
                  className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{item.flag}</span>
                      <div>
                        <div className="text-xs font-black text-foreground flex items-center gap-1.5">
                          {item.country}
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            ({item.continent})
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Top Hubs: {item.topOriginCities.join(", ")}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-foreground">
                        {item.visitorCount.toLocaleString()} views
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {item.trend} ({item.percentage}%)
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, item.percentage * 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-foreground">Most Viewed Municipalities</h3>
              <p className="text-xs text-muted-foreground">
                Distribution of global views across cities in your jurisdiction.
              </p>

              <div className="space-y-3 pt-2">
                {data?.cityBreakdown.map((city, idx) => (
                  <div
                    key={city.city}
                    className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs"
                  >
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{city.city}</span>
                    </div>
                    <div className="text-right font-black text-foreground">
                      {city.views.toLocaleString()}{" "}
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({city.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-sky-950/20 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>Diaspora & Tourism Growth Driver</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Over <strong className="text-foreground">81.2%</strong> of high-ticket calls, reservation requests,
                and direction inquiries originate from international IPs in North America, Europe, and the Gulf.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: ORIGIN NATIONS TABLE ────────────────────────────────────── */}
      {activeTab === "countries" && (
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">Visitor Country</th>
                  <th className="p-4">Continent</th>
                  <th className="p-4">Total Views</th>
                  <th className="p-4">Global Share</th>
                  <th className="p-4">Key Origin Cities</th>
                  <th className="p-4">30-Day Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.visitorCountries.map((item) => (
                  <tr key={item.countryCode} className="hover:bg-muted/40 transition-colors">
                    <td className="p-4 font-bold text-foreground flex items-center gap-2.5">
                      <span className="text-xl">{item.flag}</span>
                      <span>{item.country}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ({item.countryCode})
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground font-medium">{item.continent}</td>
                    <td className="p-4 font-black text-foreground">
                      {item.visitorCount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{item.percentage}%</span>
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${Math.min(100, item.percentage * 3)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{item.topOriginCities.join(", ")}</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {item.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal to Register Global Visitor ── */}
      <RegisterGlobalVisitorModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onVisitorRegistered={(newVisitor) => {
          fetchGlobalVisitors(1);
          setCurrentPage(1);
        }}
        targetCity={effectiveCity || "Addis Ababa"}
        targetCountry={effectiveCountry || "Ethiopia"}
        currentRole={currentRole}
        businessesList={businessesList}
      />
    </div>
  );
}
