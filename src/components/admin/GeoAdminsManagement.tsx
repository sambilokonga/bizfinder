"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Globe,
  Building2,
  Shield,
  Crown,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Users,
  MapPin,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { COUNTRIES_WITH_CITIES, getCitiesForCountry } from "@/lib/data/countries-cities";
import { AssignGeoAdminModal } from "@/components/admin/AssignGeoAdminModal";
import { GeoAdminRecord } from "@/app/api/admin/geo-admins/route";
import { toast } from "sonner";

interface GeoAdminsManagementProps {
  currentRole: "super_admin" | "country_admin" | "city_admin" | "admin";
  currentCountry?: string;
  currentCity?: string;
}

export function GeoAdminsManagement({
  currentRole,
  currentCountry = "Ethiopia",
  currentCity = "Addis Ababa",
}: GeoAdminsManagementProps) {
  const [activeTab, setActiveTab] = useState<"country_leads" | "city_admins">("country_leads");
  const [adminsList, setAdminsList] = useState<GeoAdminRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "assigned" | "unassigned">("all");

  // Selected country for the City Admins tab
  const [selectedCountryForCities, setSelectedCountryForCities] = useState(
    currentRole === "country_admin" ? currentCountry : "Ethiopia"
  );

  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<"country_admin" | "city_admin">("country_admin");
  const [modalCountry, setModalCountry] = useState(currentCountry);
  const [modalCity, setModalCity] = useState("");

  const isCountryAdmin = currentRole === "country_admin";

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/geo-admins");
      const data = await res.json();
      if (data.admins) {
        setAdminsList(data.admins);
      }
    } catch (e) {
      console.error("Failed to load geo admins", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Country Main Admins mapping
  const countryAdminMap = useMemo(() => {
    const map = new Map<string, GeoAdminRecord>();
    adminsList
      .filter((a) => a.role === "country_admin" && a.assignedCountry)
      .forEach((a) => {
        map.set(a.assignedCountry!.toLowerCase(), a);
      });
    return map;
  }, [adminsList]);

  // City Admins mapping: Country -> City -> Admin
  const cityAdminMap = useMemo(() => {
    const map = new Map<string, GeoAdminRecord>();
    adminsList
      .filter((a) => a.role === "city_admin" && a.assignedCountry && a.assignedCity)
      .forEach((a) => {
        const key = `${a.assignedCountry!.toLowerCase()}::${a.assignedCity!.toLowerCase()}`;
        map.set(key, a);
      });
    return map;
  }, [adminsList]);

  // Statistics calculation
  const totalAssignedCountries = countryAdminMap.size;
  const totalCountries = COUNTRIES_WITH_CITIES.length; // 195
  const countryCoveragePercent = ((totalAssignedCountries / totalCountries) * 100).toFixed(1);

  const totalAssignedCityAdmins = adminsList.filter((a) => a.role === "city_admin").length;

  // Filtered countries for Country Main Admins tab
  const filteredCountries = useMemo(() => {
    return COUNTRIES_WITH_CITIES.filter((c) => {
      const isAssigned = countryAdminMap.has(c.name.toLowerCase());
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        countryAdminMap.get(c.name.toLowerCase())?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        countryAdminMap.get(c.name.toLowerCase())?.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterStatus === "assigned") return isAssigned;
      if (filterStatus === "unassigned") return !isAssigned;
      return true;
    });
  }, [searchQuery, filterStatus, countryAdminMap]);

  // Cities for the selected country in City Admins tab
  const selectedCountryCities = useMemo(() => {
    return getCitiesForCountry(selectedCountryForCities);
  }, [selectedCountryForCities]);

  const filteredCities = useMemo(() => {
    return selectedCountryCities.filter((city) => {
      const key = `${selectedCountryForCities.toLowerCase()}::${city.toLowerCase()}`;
      const isAssigned = cityAdminMap.has(key);
      const matchesSearch =
        city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cityAdminMap.get(key)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cityAdminMap.get(key)?.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterStatus === "assigned") return isAssigned;
      if (filterStatus === "unassigned") return !isAssigned;
      return true;
    });
  }, [selectedCountryCities, selectedCountryForCities, searchQuery, filterStatus, cityAdminMap]);

  const handleRevokeAdmin = async (adminId: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke administrative access for ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/geo-admins?id=${adminId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Administrative access revoked for ${name}.`);
        fetchAdmins();
      } else {
        toast.error("Failed to revoke administrator.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to revoke admin.");
    }
  };

  const openAssignModal = (
    role: "country_admin" | "city_admin",
    countryName: string,
    cityName?: string
  ) => {
    setModalRole(role);
    setModalCountry(countryName);
    setModalCity(cityName || "");
    setIsAssignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ─── Top Highlights & Metric Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Country Main Admins Coverage */}
        <div className="p-5 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Country Leadership</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {totalAssignedCountries}{" "}
              <span className="text-xs text-muted-foreground font-normal">/ {totalCountries} Nations</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>{countryCoveragePercent}% Global Country Coverage</span>
            </div>
          </div>
        </div>

        {/* Metric 2: City Admins Appointed */}
        <div className="p-5 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">City Administrators</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{totalAssignedCityAdmins}</div>
            <div className="text-[11px] text-muted-foreground font-medium mt-1">
              Active across 30 cities per country
            </div>
          </div>
        </div>

        {/* Metric 3: Worldwide Jurisdiction Status */}
        <div className="p-5 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Your Authority Scope</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-base font-black text-foreground">
              {currentRole === "super_admin"
                ? "👑 Global Worldwide"
                : isCountryAdmin
                ? `🌍 ${currentCountry} (National Lead)`
                : `🏙️ ${currentCity}, ${currentCountry}`}
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-1">
              {currentRole === "super_admin"
                ? "Full unrestricted 195-country access"
                : isCountryAdmin
                ? `Full oversight of all 30 cities in ${currentCountry}`
                : "City-scoped local moderation"}
            </div>
          </div>
        </div>

        {/* Action Button: Quick Assign */}
        <div className="p-5 rounded-3xl border border-dashed border-indigo-500/40 bg-indigo-500/5 shadow-sm flex flex-col justify-between gap-3">
          <div>
            <div className="font-black text-sm text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Appoint Territory Lead</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isCountryAdmin
                ? `Appoint a City Admin for any city in ${currentCountry}.`
                : "Appoint Country Main Admins or City Admins."}
            </p>
          </div>
          <Button
            size="sm"
            variant="gradient"
            onClick={() =>
              openAssignModal(
                isCountryAdmin ? "city_admin" : "country_admin",
                isCountryAdmin ? currentCountry : selectedCountryForCities
              )
            }
            className="text-xs font-bold gap-1.5 w-full"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {isCountryAdmin ? "Appoint City Admin" : "Assign Territory Admin"}
          </Button>
        </div>
      </div>

      {/* ─── CBE 500 Branches & 30 City Admins Ingestion Banner ───────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">🏦</span>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
              Commercial Bank of Ethiopia (CBE) — 500 Branches & 30 City Admins
            </h3>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
              Real Test Dataset
            </Badge>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Uploads all 500 CBE branches across Ethiopia’s 30 cities with authentic subcities (Bole, Kirkos, Arada, Yeka, Menaharia, Kezira, etc.), coordinates, operating hours, amenities, and assigns <strong>1 Ethiopia Country Main Admin</strong> and <strong>30 dedicated City Admins</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-medium text-slate-300">
            <span className="bg-white/10 px-2.5 py-0.5 rounded-full">🏢 500 Branches</span>
            <span className="bg-white/10 px-2.5 py-0.5 rounded-full">🌍 1 Country Lead</span>
            <span className="bg-white/10 px-2.5 py-0.5 rounded-full">🏙️ 30 City Admins</span>
            <span className="bg-white/10 px-2.5 py-0.5 rounded-full">📍 30 Cities Covered</span>
          </div>
        </div>

        <Button
          size="default"
          onClick={async () => {
            const btn = document.getElementById("cbe-ingest-btn");
            if (btn) btn.innerText = "Ingesting 500 Branches...";
            try {
              toast.info("Starting ingestion of 500 CBE branches and 30 city admins...");
              const res = await fetch("/api/admin/seed-cbe", { method: "POST" });
              const data = await res.json();
              if (data.success) {
                toast.success(data.message || "500 CBE Branches & 30 City Admins uploaded successfully!");
                fetchAdmins();
              } else {
                toast.error(data.error || "Failed to seed CBE branches.");
              }
            } catch (err: any) {
              toast.error(err.message || "Network error during CBE ingestion.");
            } finally {
              if (btn) btn.innerText = "Ingest / Sync 500 CBE Branches";
            }
          }}
          id="cbe-ingest-btn"
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-500/30 shrink-0"
        >
          Ingest / Sync 500 CBE Branches
        </Button>
      </div>

      {/* ─── Clerk Dashboard Integration & Sync Hub ─────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-xs">
              🔐
            </div>
            <h3 className="text-sm sm:text-base font-black text-foreground">
              Clerk Dashboard Role Synchronization & Metadata Integration
            </h3>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
              Clerk PublicMetadata Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Country Main Admins and City Admins assigned in BizFinder are synchronized directly to your <strong>Clerk Dashboard</strong> under <code>publicMetadata</code> (<code>role</code>, <code>assignedCountry</code>, <code>assignedCity</code>, <code>countryFlag</code>, <code>jurisdiction</code>, and <code>permissions</code>).
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            const btn = document.getElementById("clerk-sync-btn");
            if (btn) btn.innerText = "Syncing to Clerk...";
            try {
              toast.info("Synchronizing territory administrators to your Clerk Dashboard...");
              const res = await fetch("/api/admin/clerk-sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "sync_ethiopia_all" }),
              });
              const data = await res.json();
              if (data.success) {
                toast.success("Successfully synchronized all Country Leads & City Admins to Clerk Dashboard!");
              } else {
                toast.info(data.message || "Clerk sync status recorded.");
              }
            } catch (e: any) {
              toast.error(e.message || "Network error during Clerk sync.");
            } finally {
              if (btn) btn.innerText = "🔄 Sync All Admins to Clerk Dashboard";
            }
          }}
          id="clerk-sync-btn"
          className="text-xs font-bold gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 shrink-0"
        >
          🔄 Sync All Admins to Clerk Dashboard
        </Button>
      </div>

      {/* ─── Tabs Navigation & Filter Toolbar ─────────────────────────────────── */}
      <div className="p-4 rounded-3xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            {!isCountryAdmin && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("country_leads");
                  setSearchQuery("");
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === "country_leads"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>1. Country Main Admins (195 Countries)</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {totalAssignedCountries} / 195
                </Badge>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveTab("city_admins");
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "city_admins"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>2. City Admins (30 Cities per Nation)</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {totalAssignedCityAdmins}
              </Badge>
            </button>
          </div>

          {/* Quick Assign Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              openAssignModal(
                activeTab === "country_leads" ? "country_admin" : "city_admin",
                selectedCountryForCities
              )
            }
            className="text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
          >
            <Plus className="w-3.5 h-3.5" />
            {activeTab === "country_leads" ? "New Country Lead" : "New City Admin"}
          </Button>
        </div>

        {/* Toolbar: Search, Country Selector & Status Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Country Selector for City Admins tab */}
          {activeTab === "city_admins" && !isCountryAdmin && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-muted-foreground shrink-0">Select Nation:</label>
              <select
                value={selectedCountryForCities}
                onChange={(e) => setSelectedCountryForCities(e.target.value)}
                className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary shadow-sm"
              >
                {COUNTRIES_WITH_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name} (30 Cities)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "country_leads"
                  ? "Search by nation name or lead administrator email..."
                  : `Search cities in ${selectedCountryForCities} or admin name...`
              }
              className="pl-9 text-xs h-9"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-border">
            {(["all", "assigned", "unassigned"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  filterStatus === st
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TAB 1: 195 Country Main Admins ──────────────────────────────────── */}
      {activeTab === "country_leads" && !isCountryAdmin && (
        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-foreground">
                Worldwide Country Main Admins (195 Sovereign Nations)
              </h3>
              <p className="text-xs text-muted-foreground">
                Each country can have a designated National Lead with full authority over its 30 cities and listing operations.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-bold">
              Showing {filteredCountries.length} of 195 Nations
            </Badge>
          </div>

          <div className="divide-y divide-border">
            {filteredCountries.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Globe className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-xs font-bold text-foreground">No countries match your search.</p>
                <p className="text-xs text-muted-foreground">Try clearing the search bar or changing status filter.</p>
              </div>
            ) : (
              filteredCountries.map((country) => {
                const assignedAdmin = countryAdminMap.get(country.name.toLowerCase());
                return (
                  <div
                    key={country.name}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    {/* Country Details */}
                    <div className="flex items-center gap-3.5">
                      <span className="text-3xl sm:text-4xl select-none">{country.flag}</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-foreground">{country.name}</h4>
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            30 Cities
                          </Badge>
                        </div>
                        {assignedAdmin ? (
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-bold text-primary flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {assignedAdmin.name}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground font-mono">{assignedAdmin.email}</span>
                            <span className="text-muted-foreground">•</span>
                            <Badge variant="success" className="text-[10px] py-0">
                              Active Lead
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>No Country Main Admin assigned yet</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCountryForCities(country.name);
                          setActiveTab("city_admins");
                        }}
                        className="text-xs font-bold gap-1 h-8"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>View 30 Cities</span>
                        <ChevronRight className="w-3 h-3" />
                      </Button>

                      {assignedAdmin ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevokeAdmin(assignedAdmin.id, assignedAdmin.name)}
                          className="text-xs font-bold text-destructive hover:bg-destructive/10 h-8"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Revoke</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="gradient"
                          onClick={() => openAssignModal("country_admin", country.name)}
                          className="text-xs font-bold gap-1.5 h-8"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Assign Lead Admin
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: 30 Cities per Country ────────────────────────────────────── */}
      {activeTab === "city_admins" && (
        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {COUNTRIES_WITH_CITIES.find((c) => c.name.toLowerCase() === selectedCountryForCities.toLowerCase())?.flag || "🌐"}
              </span>
              <div>
                <h3 className="text-sm font-black text-foreground">
                  30 Cities of {selectedCountryForCities} — City Administrators
                </h3>
                <p className="text-xs text-muted-foreground">
                  Assign dedicated City Admins to moderate listings, approve businesses, and manage local inquiries.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="gradient"
              onClick={() => openAssignModal("city_admin", selectedCountryForCities)}
              className="text-xs font-bold gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              Appoint City Admin
            </Button>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCities.length === 0 ? (
              <div className="col-span-full p-12 text-center space-y-2">
                <Building2 className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                <p className="text-xs font-bold text-foreground">No cities found matching your filter.</p>
              </div>
            ) : (
              filteredCities.map((city, idx) => {
                const key = `${selectedCountryForCities.toLowerCase()}::${city.toLowerCase()}`;
                const cityAdmin = cityAdminMap.get(key);

                return (
                  <div
                    key={city}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      cityAdmin
                        ? "border-emerald-500/30 bg-emerald-500/5 shadow-sm"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-black text-sm text-foreground flex items-center gap-1.5">
                          <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                          <span>{city}</span>
                        </div>
                        {cityAdmin ? (
                          <Badge variant="success" className="text-[10px] py-0 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Admin Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 text-muted-foreground">
                            Unassigned
                          </Badge>
                        )}
                      </div>

                      {cityAdmin ? (
                        <div className="text-xs space-y-0.5 pt-1">
                          <div className="font-bold text-foreground flex items-center gap-1">
                            <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{cityAdmin.name}</span>
                          </div>
                          <div className="text-muted-foreground font-mono text-[11px] truncate">
                            {cityAdmin.email}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">
                          No local administrator assigned to {city}.
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                      {cityAdmin ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevokeAdmin(cityAdmin.id, cityAdmin.name)}
                          className="text-xs font-bold text-destructive hover:bg-destructive/10 h-7 px-2"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Revoke
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignModal("city_admin", selectedCountryForCities, city)}
                          className="text-xs font-bold text-primary hover:bg-primary/5 h-7 w-full gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Assign Admin for {city}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── Assign / Appoint Geo Admin Modal ────────────────────────────────── */}
      <AssignGeoAdminModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAdminAssigned={fetchAdmins}
        initialRole={modalRole}
        initialCountry={modalCountry}
        initialCity={modalCity}
        currentAdminRole={currentRole}
        currentAdminCountry={currentCountry}
      />
    </div>
  );
}
