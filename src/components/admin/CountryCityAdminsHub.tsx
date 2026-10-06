"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Globe,
  MapPin,
  Building2,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Search,
  ExternalLink,
  Mail,
  Phone,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  SlidersHorizontal,
  Users,
  Sparkles,
  ChevronRight,
  Clock,
  Check,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { COUNTRIES_WITH_CITIES, getCitiesForCountry } from "@/lib/data/countries-cities";
import { AssignGeoAdminModal } from "@/components/admin/AssignGeoAdminModal";
import { GeoAdminRecord } from "@/app/api/admin/geo-admins/route";
import { toast } from "sonner";

interface CountryCityAdminsHubProps {
  currentCountry?: string;
  currentRole?: "super_admin" | "country_admin" | "city_admin" | "admin";
  compactView?: boolean;
  onNavigateToFullView?: () => void;
  onOpenAssignModal?: (city?: string) => void;
}

export function CountryCityAdminsHub({
  currentCountry = "Ethiopia",
  currentRole = "country_admin",
  compactView = false,
  onNavigateToFullView,
  onOpenAssignModal,
}: CountryCityAdminsHubProps) {
  const [adminsList, setAdminsList] = useState<GeoAdminRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "appointed" | "vacant">(
    compactView ? "appointed" : "all"
  );

  // Local appointment modal state (if parent didn't provide onOpenAssignModal)
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);
  const [selectedCityForAppointment, setSelectedCityForAppointment] = useState<string>("");

  // Get country flag and all cities
  const countryObj = useMemo(() => {
    return (
      COUNTRIES_WITH_CITIES.find(
        (c) => c.name.toLowerCase() === currentCountry.toLowerCase()
      ) || { name: currentCountry, flag: "🌍", cities: getCitiesForCountry(currentCountry) }
    );
  }, [currentCountry]);

  const allCitiesInCountry = useMemo(() => {
    return countryObj.cities || getCitiesForCountry(currentCountry);
  }, [countryObj, currentCountry]);

  // Fetch geo-admins specifically for this country
  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set("country", currentCountry);
      params.set("callerRole", currentRole);
      params.set("callerCountry", currentCountry);

      const res = await fetch(`/api/admin/geo-admins?${params.toString()}`);
      const data = await res.json();
      if (data?.admins && Array.isArray(data.admins)) {
        // Keep city admins under this country
        const cityAdmins = data.admins.filter(
          (a: GeoAdminRecord) =>
            a.role === "city_admin" &&
            (!a.assignedCountry || a.assignedCountry.toLowerCase() === currentCountry.toLowerCase())
        );
        setAdminsList(cityAdmins);
      }
    } catch (e) {
      console.error("[CountryCityAdminsHub] Failed to fetch city admins:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [currentCountry, currentRole]);

  // Map of City -> AdminRecord
  const cityAdminMap = useMemo(() => {
    const map = new Map<string, GeoAdminRecord>();
    adminsList.forEach((admin) => {
      if (admin.assignedCity) {
        map.set(admin.assignedCity.toLowerCase(), admin);
      }
    });
    return map;
  }, [adminsList]);

  // Stats calculation
  const totalCitiesCount = allCitiesInCountry.length || 30;
  const appointedCount = cityAdminMap.size;
  const vacantCount = Math.max(0, totalCitiesCount - appointedCount);
  const coveragePercent = totalCitiesCount > 0 ? ((appointedCount / totalCitiesCount) * 100).toFixed(1) : "0.0";

  // Filtered cities list
  const filteredCities = useMemo(() => {
    return allCitiesInCountry.filter((cityName) => {
      const admin = cityAdminMap.get(cityName.toLowerCase());
      const isAppointed = Boolean(admin);

      if (filterTab === "appointed" && !isAppointed) return false;
      if (filterTab === "vacant" && isAppointed) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCity = cityName.toLowerCase().includes(q);
        const matchesAdmin =
          admin &&
          (admin.name.toLowerCase().includes(q) ||
            admin.email.toLowerCase().includes(q));
        if (!matchesCity && !matchesAdmin) return false;
      }

      return true;
    });
  }, [allCitiesInCountry, cityAdminMap, filterTab, searchQuery]);

  const handleAppointClick = (city?: string) => {
    if (onOpenAssignModal) {
      onOpenAssignModal(city);
    } else {
      setSelectedCityForAppointment(city || (allCitiesInCountry[0] ?? ""));
      setIsLocalModalOpen(true);
    }
  };

  const handleExportRoster = (format: "csv" | "json") => {
    const records = allCitiesInCountry.map((cityName) => {
      const admin = cityAdminMap.get(cityName.toLowerCase());
      return {
        country: currentCountry,
        city: cityName,
        status: admin ? "Appointed" : "Vacant",
        adminName: admin?.name || "N/A",
        adminEmail: admin?.email || "N/A",
        adminStatus: admin?.status || "unassigned",
        appointedAt: admin?.createdAt || "N/A",
        lastActive: admin?.lastActive || "N/A",
      };
    });

    if (format === "json") {
      const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `city-admins-${currentCountry.toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Municipal roster exported to JSON");
    } else {
      const headers = ["Country", "City", "Status", "Admin Name", "Admin Email", "Admin Status", "Appointed Date", "Last Active"];
      const rows = records.map((r) => [
        `"${r.country}"`,
        `"${r.city}"`,
        `"${r.status}"`,
        `"${r.adminName}"`,
        `"${r.adminEmail}"`,
        `"${r.adminStatus}"`,
        `"${r.appointedAt}"`,
        `"${r.lastActive}"`,
      ]);
      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `city-admins-${currentCountry.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Municipal roster exported to CSV");
    }
  };

  return (
    <div className={`space-y-4 ${compactView ? "" : "max-w-7xl mx-auto"}`}>
      {/* ─── Header & Telemetry Card ─── */}
      <div className="p-5 sm:p-6 rounded-3xl border border-indigo-500/25 bg-gradient-to-r from-card/90 via-card to-indigo-950/20 dark:from-slate-900/90 dark:via-indigo-950/40 dark:to-slate-900 shadow-sm relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl" title={currentCountry}>{countryObj.flag}</span>
              <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <span>{currentCountry} Municipal City Admins Hub</span>
                <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-[10px] font-bold">
                  Territory Governance
                </Badge>
              </h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              City Administrators oversee municipal business listings, fast-track local verifications, and moderate citizen reviews for their assigned city. They operate under your national oversight as <strong>{currentCountry} Country Lead</strong> and are kept strictly distinct from regular consumers and merchant accounts.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="px-2.5 py-1 rounded-xl bg-background/80 border border-border font-bold text-foreground flex items-center gap-1.5 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>{totalCitiesCount} Municipalities</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{appointedCount} Appointed Admins</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>{vacantCount} Vacant Cities</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                {coveragePercent}% National Coverage
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button
              size="sm"
              variant="gradient"
              onClick={() => handleAppointClick()}
              className="gap-1.5 text-xs font-bold shadow-md shadow-primary/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Appoint City Admin</span>
            </Button>

            {!compactView && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportRoster("csv")}
                  className="gap-1.5 text-xs font-bold border-border hover:bg-muted text-foreground"
                  title="Export Roster to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Export CSV</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchAdmins()}
                  disabled={isLoading}
                  className="gap-1.5 text-xs font-bold border-border hover:bg-muted text-foreground"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
                  <span>Refresh</span>
                </Button>
              </>
            )}

            {compactView && onNavigateToFullView && (
              <Button
                size="sm"
                variant="outline"
                onClick={onNavigateToFullView}
                className="gap-1.5 text-xs font-bold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
              >
                <span>Full Directory ({totalCitiesCount}) →</span>
              </Button>
            )}
          </div>
        </div>

        {/* Coverage Progress Bar */}
        <div className="mt-4 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Municipal Governance Penetration</span>
            </span>
            <span className="font-mono text-muted-foreground">
              {appointedCount} of {totalCitiesCount} cities assigned ({coveragePercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(5, parseFloat(coveragePercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── Filter Tabs & Search Bar ─── */}
      <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={`Search across ${totalCitiesCount} cities in ${currentCountry} or admin name…`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9 bg-background/60"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl shrink-0 overflow-x-auto">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === "all"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>All Cities</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-mono">{totalCitiesCount}</span>
          </button>
          <button
            onClick={() => setFilterTab("appointed")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === "appointed"
                ? "bg-background text-foreground shadow-xs text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Appointed</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 font-mono">
              {appointedCount}
            </span>
          </button>
          <button
            onClick={() => setFilterTab("vacant")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === "vacant"
                ? "bg-background text-foreground shadow-xs text-amber-600 dark:text-amber-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Vacant</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 font-mono">
              {vacantCount}
            </span>
          </button>
        </div>
      </div>

      {/* ─── Municipalities Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
            <p className="text-xs">Loading municipal administrators for {currentCountry}…</p>
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="col-span-full p-8 rounded-3xl bg-card border border-border text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-foreground">No municipalities matching filter</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search query or switching tabs between Appointed and Vacant.
            </p>
            <Button size="sm" variant="outline" onClick={() => { setSearchQuery(""); setFilterTab("all"); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredCities.slice(0, compactView ? 6 : filteredCities.length).map((cityName) => {
            const admin = cityAdminMap.get(cityName.toLowerCase());
            const isAppointed = Boolean(admin);

            return (
              <div
                key={cityName}
                className={`p-4 sm:p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                  isAppointed
                    ? "bg-card border-border hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5"
                    : "bg-card/60 border-border/80 border-dashed hover:border-amber-500/40 hover:bg-card"
                }`}
              >
                <div>
                  {/* City Title & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                        <h4 className="text-sm font-black text-foreground">{cityName}</h4>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {currentCountry} Municipality
                      </span>
                    </div>

                    {isAppointed ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active City Admin
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Vacant
                      </Badge>
                    )}
                  </div>

                  {/* Body Content */}
                  {isAppointed && admin ? (
                    <div className="space-y-3 py-2 border-y border-border/50">
                      {/* Admin Identity */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center justify-center shrink-0">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                            <span>{admin.name}</span>
                            <span title="Municipal Authority" className="text-[10px] text-emerald-500 font-bold">
                              ✓
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                            <span>{admin.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Operational Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                        <div className="p-2 rounded-xl bg-muted/40 border border-border/50">
                          <span className="text-muted-foreground block">City Listings</span>
                          <span className="font-bold text-foreground text-xs mt-0.5 block">
                            {admin.managedListingsCount ? `${admin.managedListingsCount} listings` : "Active Queue"}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-muted/40 border border-border/50">
                          <span className="text-muted-foreground block">Appointed</span>
                          <span className="font-bold text-foreground text-xs mt-0.5 block">
                            {admin.createdAt ? admin.createdAt.slice(0, 10) : "2024"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 px-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 my-2 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <Shield className="w-3.5 h-3.5 text-amber-500" />
                        <span>Unassigned Municipal Seat</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Businesses submitted in {cityName} are currently routed directly to you as the Country Lead.
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 flex items-center justify-between gap-2">
                  {isAppointed && admin ? (
                    <>
                      <a
                        href={`/city-admin?city=${encodeURIComponent(cityName)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        title={`Open Municipal Portal for ${cityName}`}
                      >
                        <span>Open City Portal</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`mailto:${admin.email}?subject=${encodeURIComponent(`[GlobalBiz ${currentCountry}] Municipal Administration - ${cityName}`)}`}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title={`Email ${admin.name}`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAppointClick(cityName)}
                          className="h-7 text-[10px] font-semibold"
                        >
                          Reassign
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAppointClick(cityName)}
                      className="w-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Appoint City Admin for {cityName}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {compactView && filteredCities.length > 6 && (
        <div className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Showing 6 of {totalCitiesCount} municipalities in {currentCountry}.
          </span>
          {onNavigateToFullView && (
            <Button
              size="sm"
              variant="outline"
              onClick={onNavigateToFullView}
              className="text-xs font-bold gap-1 text-primary"
            >
              <span>View All {totalCitiesCount} Cities →</span>
            </Button>
          )}
        </div>
      )}

      {/* Internal Modal Fallback if parent didn't supply onOpenAssignModal */}
      {isLocalModalOpen && (
        <AssignGeoAdminModal
          isOpen={isLocalModalOpen}
          onClose={() => setIsLocalModalOpen(false)}
          onAdminAssigned={() => {
            fetchAdmins();
            setIsLocalModalOpen(false);
          }}
          initialRole="city_admin"
          initialCountry={currentCountry}
          initialCity={selectedCityForAppointment}
          currentAdminRole={currentRole}
          currentAdminCountry={currentCountry}
        />
      )}
    </div>
  );
}
