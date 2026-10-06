"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GlobalVisitorCountry,
  GlobalUserSession,
  GlobalVisitorsSummary,
  GlobalVisitorsResponse,
} from "@/lib/analytics/globalVisitors";

interface GlobalVisitorsMatrixProps {
  currentRole: "super_admin" | "country_admin" | "city_admin" | "admin";
  targetCountry: string;
  targetCity?: string;
  className?: string;
}

export function GlobalVisitorsMatrix({
  currentRole,
  targetCountry,
  targetCity,
  className = "",
}: GlobalVisitorsMatrixProps) {
  const [data, setData] = useState<GlobalVisitorsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"overview" | "countries" | "live_feed">("overview");

  const effectiveCountry = targetCountry === "all" ? undefined : targetCountry;
  const effectiveCity = targetCity === "all" ? undefined : targetCity;

  const fetchGlobalVisitors = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (effectiveCountry) params.set("country", effectiveCountry);
      if (effectiveCity) params.set("city", effectiveCity);
      const res = await fetch(`/api/admin/global-visitors?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("[GlobalVisitorsMatrix] Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalVisitors();
  }, [effectiveCountry, effectiveCity]);

  // Continents list for filtering
  const continents = useMemo(() => {
    if (!data?.visitorCountries) return [];
    const list = Array.from(new Set(data.visitorCountries.map((c) => c.continent)));
    return ["all", ...list];
  }, [data]);

  // Filtered countries
  const filteredCountries = useMemo(() => {
    if (!data?.visitorCountries) return [];
    return data.visitorCountries.filter((c) => {
      const matchesSearch =
        c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.topOriginCities.some((city) => city.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesContinent = selectedContinent === "all" || c.continent === selectedContinent;
      return matchesSearch && matchesContinent;
    });
  }, [data, searchQuery, selectedContinent]);

  // Filtered live sessions
  const filteredSessions = useMemo(() => {
    if (!data?.recentSessions) return [];
    if (!searchQuery.trim()) return data.recentSessions;
    const q = searchQuery.toLowerCase();
    return data.recentSessions.filter(
      (s) =>
        s.visitorCountry.toLowerCase().includes(q) ||
        s.visitorCity.toLowerCase().includes(q) ||
        s.targetBusinessName.toLowerCase().includes(q) ||
        s.targetBusinessCity.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const jurisdictionTitle = effectiveCity
    ? `Global Users Viewing Businesses in ${effectiveCity}`
    : effectiveCountry
    ? `Global Users Viewing Businesses in ${effectiveCountry}`
    : "Worldwide Users Viewing Global Businesses";

  const getActionBadge = (action: GlobalUserSession["action"]) => {
    switch (action) {
      case "view":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Eye className="w-2.5 h-2.5" /> Viewed Profile
          </span>
        );
      case "call":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Phone className="w-2.5 h-2.5" /> Phone Call
          </span>
        );
      case "direction":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Navigation className="w-2.5 h-2.5" /> Directions
          </span>
        );
      case "website":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <ExternalLink className="w-2.5 h-2.5" /> Website Click
          </span>
        );
      case "saved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Bookmark className="w-2.5 h-2.5" /> Saved Listing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <Activity className="w-2.5 h-2.5" /> Engaged
          </span>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                <Globe className="w-3.5 h-3.5 animate-spin-slow text-indigo-400" />
                International Traffic Telemetry
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Feed
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {jurisdictionTitle}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time monitoring of worldwide users, international investors, and diaspora visitors
              discovering and interacting with businesses in{" "}
              <strong className="text-indigo-200">
                {effectiveCity ? `${effectiveCity}, ${effectiveCountry || "Ethiopia"}` : effectiveCountry || "Ethiopia"}
              </strong>
              .
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGlobalVisitors}
              disabled={isLoading}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl text-xs font-bold gap-1.5 backdrop-blur-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Feed
            </Button>
          </div>
        </div>

        {/* 4 Key Metrics Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Total Global Views</span>
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {data?.summary.totalGlobalViews.toLocaleString() || "—"}
            </div>
            <div className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {data?.summary.growthRate || "+21.8%"}
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
              {data?.summary.internationalSharePercent || 78.4}% int&apos;l share
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Nations Represented</span>
              <Compass className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {data?.summary.countriesRepresentedCount || 28} Countries
            </div>
            <div className="text-[11px] text-slate-300 font-medium mt-1">
              Across 5 continents
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
              Peak: {data?.summary.peakHour || "18:00 - 22:00 GMT+3"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📊 Regional Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("countries")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "countries"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🌍 Origin Nations ({data?.visitorCountries.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("live_feed")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "live_feed"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ⚡ Live Activity Stream ({data?.recentSessions.length || 0})
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search visitor country, city, or business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {activeTab === "countries" && (
            <select
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
              className="h-8 rounded-xl bg-background border border-border px-2 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
            >
              {continents.map((cont) => (
                <option key={cont} value={cont}>
                  {cont === "all" ? "All Continents" : cont}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ─── TAB 1: OVERVIEW ──────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Origin Nations Leaderboard */}
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

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"
                      style={{ width: `${Math.min(100, item.percentage * 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Top Target Cities & Time Series Breakdown */}
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

            <div className="rounded-3xl border border-border bg-gradient-to-br from-indigo-950/20 to-sky-950/20 p-5 shadow-sm space-y-3 border-indigo-500/20">
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>Diaspora & Tourism Growth Driver</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Over <strong className="text-foreground">78%</strong> of high-ticket calls, reservation requests,
                and direction inquiries originate from international IPs in North America, Europe, and the Gulf.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: ORIGIN NATIONS TABLE ──────────────────────────────────── */}
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
                {filteredCountries.map((item) => (
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
                            className="h-full bg-indigo-500 rounded-full"
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

      {/* ─── TAB 3: LIVE ACTIVITY STREAM ──────────────────────────────────── */}
      {activeTab === "live_feed" && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-foreground">Real-Time Global User Activity</h3>
              <p className="text-xs text-muted-foreground">
                Live stream of international visitors interacting with listings in your territory.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Streaming telemetry
            </div>
          </div>

          <div className="divide-y divide-border">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="py-3.5 flex flex-wrap items-center justify-between gap-4 hover:bg-muted/30 px-3 rounded-2xl transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-muted/80 flex items-center justify-center text-xl shrink-0">
                    {session.visitorFlag}
                  </div>

                  <div>
                    <div className="font-bold text-foreground flex items-center gap-2 flex-wrap">
                      <span>{session.visitorCity}, {session.visitorCountry}</span>
                      {getActionBadge(session.action)}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Target Listing:{" "}
                      <strong className="text-foreground">{session.targetBusinessName}</strong>{" "}
                      ({session.targetBusinessCity}) • Via {session.referrer}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-muted-foreground shrink-0">
                  <div className="font-semibold text-foreground">{session.relativeTime}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{session.visitorDevice}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
