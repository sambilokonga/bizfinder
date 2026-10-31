"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Globe,
  Building2,
  Crown,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COUNTRIES_WITH_CITIES, getCitiesForCountry } from "@/lib/data/countries-cities";

interface GeoScopeBannerProps {
  currentRole: "super_admin" | "country_admin" | "city_admin" | "admin";
  userRole?: string;
  assignedCountry?: string; // the real user's locked country (for country/city admins)
  onRoleChange: (role: "super_admin" | "country_admin" | "city_admin" | "admin") => void;
  selectedCountry: string; // "all" or specific country name
  onCountryChange: (country: string) => void;
  selectedCity: string; // "all" or specific city name
  onCityChange: (city: string) => void;
}

export function GeoScopeBanner({
  currentRole,
  userRole,
  assignedCountry,
  onRoleChange,
  selectedCountry,
  onCountryChange,
  selectedCity,
  onCityChange,
}: GeoScopeBannerProps) {
  const isSuperAdmin = currentRole === "super_admin";
  const isCountryAdmin = currentRole === "country_admin";
  const isCityAdmin = currentRole === "city_admin";
  const isOperationsAdmin = currentRole === "admin";

  // Super Admin option is strictly restricted to the Super Admin portal and only accessible to users with super_admin privileges.
  // It is hidden on the operational admin dashboard, country admin dashboard, and city admin dashboard.
  const showSuperAdminOption =
    isSuperAdmin &&
    !isOperationsAdmin &&
    !isCountryAdmin &&
    !isCityAdmin &&
    userRole !== "admin" &&
    userRole !== "country_admin" &&
    userRole !== "city_admin";

  const countryEntry = COUNTRIES_WITH_CITIES.find(
    (c) => c.name.toLowerCase() === selectedCountry.toLowerCase()
  );

  const availableCities = selectedCountry !== "all" ? getCitiesForCountry(selectedCountry) : [];

  // Country admin and city admin are locked to their assigned country — only super_admin can browse all 195
  const isCountryLocked = (isCountryAdmin || isCityAdmin) && !isSuperAdmin;
  const lockedCountryEntry = isCountryLocked
    ? COUNTRIES_WITH_CITIES.find(
        (c) => c.name.toLowerCase() === (assignedCountry || selectedCountry).toLowerCase()
      )
    : undefined;

  // ── Searchable country combobox state ──────────────────────────────────────
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const comboRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES_WITH_CITIES.filter((c) =>
        c.name.toLowerCase().startsWith(countrySearch.toLowerCase())
      ).concat(
        COUNTRIES_WITH_CITIES.filter(
          (c) =>
            !c.name.toLowerCase().startsWith(countrySearch.toLowerCase()) &&
            c.name.toLowerCase().includes(countrySearch.toLowerCase())
        )
      )
    : COUNTRIES_WITH_CITIES;

  // Current display label for the trigger button
  const selectedLabel =
    selectedCountry === "all"
      ? "🌐 All 195 Countries"
      : `${COUNTRIES_WITH_CITIES.find((c) => c.name === selectedCountry)?.flag ?? ""} ${selectedCountry}`;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setIsCountryOpen(false);
        setCountrySearch("");
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCountry = (name: string) => {
    onCountryChange(name);
    const cEntry = COUNTRIES_WITH_CITIES.find((c) => c.name === name);
    const firstCity = cEntry?.cities[0] || "all";
    onCityChange(isCityAdmin ? firstCity : "all");
    setIsCountryOpen(false);
    setCountrySearch("");
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const listLen = (countrySearch ? 0 : 1) + filteredCountries.length; // +1 for "All" option
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, listLen - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      if (!countrySearch && activeIndex === 0) {
        selectCountry("all");
      } else {
        const idx = countrySearch ? activeIndex : activeIndex - 1;
        if (filteredCountries[idx]) selectCountry(filteredCountries[idx].name);
      }
    } else if (e.key === "Escape") {
      setIsCountryOpen(false);
      setCountrySearch("");
      setActiveIndex(-1);
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-border bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3 xs:p-3.5 sm:p-6 shadow-xl space-y-3 sm:space-y-4 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        {/* Left: Role Title & Territory Badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-lg sm:text-2xl shadow-inner">
            {isSuperAdmin && "👑"}
            {isCountryAdmin && (countryEntry?.flag || "🌍")}
            {isCityAdmin && "🏙️"}
            {currentRole === "admin" && "🛡️"}
          </div>

          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs xs:text-sm sm:text-base lg:text-lg font-black tracking-tight text-white leading-tight truncate max-w-[160px] xs:max-w-[200px] sm:max-w-none">
                {isSuperAdmin && "Super Admin Portal"}
                {isCountryAdmin && `${selectedCountry} Admin`}
                {isCityAdmin && `${selectedCity || "City"} Admin`}
                {currentRole === "admin" && "Operations Admin"}
              </span>

              <Badge
                variant="outline"
                className="bg-white/10 text-white border-white/30 text-[8px] xs:text-[9px] sm:text-[11px] font-bold py-0 px-1 xs:px-1.5 sm:px-2 shrink-0 max-w-[120px] xs:max-w-[150px] sm:max-w-none truncate"
              >
                {isSuperAdmin && "👑 195 Nations"}
                {isCountryAdmin && `🌍 ${countryEntry?.flag || ""} ${selectedCountry}`}
                {isCityAdmin && `🏙️ ${selectedCity || "City"}`}
                {currentRole === "admin" && "🛡️ Ops"}
              </Badge>
            </div>

            <p className="text-[10px] xs:text-xs text-slate-300 max-w-xl leading-relaxed hidden xs:block">
              {isSuperAdmin &&
                "Unrestricted governance across all 195 countries. Appoint Country Main Admins and oversee global operations."}
              {isCountryAdmin &&
                `Full national oversight for ${selectedCountry}. Appoint and manage City Admins across all 30 cities.`}
              {isCityAdmin &&
                `Municipal governance for ${selectedCity}, ${selectedCountry}. Review local listings, claims, and inquiries.`}
              {currentRole === "admin" &&
                "Platform moderation and operations support."}
            </p>
          </div>
        </div>

        {/* Right: Instant Perspective Simulation Controls */}
        <div className="flex flex-wrap items-center gap-1 xs:gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-md p-1 xs:p-1.5 rounded-xl sm:rounded-2xl border border-white/10 text-xs w-full sm:w-auto">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 pl-1 xs:pl-2 pr-0.5 xs:pr-1 hidden sm:inline">
            Simulate Role:
          </span>

          {/* Hide Super Admin option on operational admin, country admin, and city admin dashboards */}
          {showSuperAdminOption && (
            <button
              type="button"
              onClick={() => {
                onRoleChange("super_admin");
                onCountryChange("all");
                onCityChange("all");
              }}
              className={`px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 rounded-lg xs:rounded-xl text-[10px] xs:text-xs font-bold transition-all ${
                isSuperAdmin
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              👑 Super Admin
            </button>
          )}

          {userRole !== "admin" && userRole !== "city_admin" && (
            <button
              type="button"
              onClick={() => {
                onRoleChange("country_admin");
                if (selectedCountry === "all") onCountryChange("Ethiopia");
                onCityChange("all");
              }}
              className={`px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 rounded-lg xs:rounded-xl text-[10px] xs:text-xs font-bold transition-all ${
                isCountryAdmin
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              🌍 Country Lead
            </button>
          )}

          {userRole !== "admin" && (
            <button
              type="button"
              onClick={() => {
                onRoleChange("city_admin");
                if (selectedCountry === "all") onCountryChange("Ethiopia");
                if (selectedCity === "all") onCityChange("Addis Ababa");
              }}
              className={`px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 rounded-lg xs:rounded-xl text-[10px] xs:text-xs font-bold transition-all ${
                isCityAdmin
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              🏙️ City Admin
            </button>
          )}

          {!isCountryAdmin && userRole !== "country_admin" && userRole !== "city_admin" && (
            <button
              type="button"
              onClick={() => {
                onRoleChange("admin");
                onCountryChange("all");
                onCityChange("all");
              }}
              className={`px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 rounded-lg xs:rounded-xl text-[10px] xs:text-xs font-bold transition-all ${
                currentRole === "admin"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              🛡️ <span className="hidden xs:inline">Operations </span>Admin
            </button>
          )}
        </div>
      </div>

      {/* ─── Territory Filter Bar ────────────────────────────────────────────── */}
      <div className="pt-2 sm:pt-2.5 md:pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 sm:gap-2.5 min-w-0 max-w-full">
          <div className="flex items-center gap-1 sm:gap-1.5 text-slate-300 font-bold shrink-0">
            <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[10px] xs:text-[11px] sm:text-xs">Active Scope:</span>
          </div>

          {/* Country Scope Dropdown — Super Admin sees all 195; Country/City Admin sees locked badge */}
          <div className="flex items-center gap-1 xs:gap-1.5 min-w-0">
            <span className="text-[10px] xs:text-[11px] sm:text-xs text-slate-400 shrink-0">Country:</span>
            {isCountryLocked ? (
              /* Locked — show a read-only badge for country/city admins */
              <div className="h-7 sm:h-8 flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 rounded-lg sm:rounded-xl bg-slate-800/80 border border-white/10 text-[10px] xs:text-[11px] sm:text-xs font-semibold text-white cursor-not-allowed select-none min-w-0 max-w-[180px] xs:max-w-[210px] sm:max-w-[240px]">
                <span>{lockedCountryEntry?.flag || "🌍"}</span>
                <span className="truncate">{assignedCountry || selectedCountry}</span>
                <span className="text-[8px] xs:text-[9px] text-slate-400 font-semibold ml-0.5 hidden xs:inline">🔒 Locked</span>
              </div>
            ) : (
              /* Super Admin — searchable 195-country combobox */
              <div ref={comboRef} className="relative min-w-0 w-full sm:w-auto">
                {/* Trigger button — shows selected value, opens dropdown on click */}
                <button
                  type="button"
                  onClick={() => {
                    setIsCountryOpen((o) => !o);
                    if (!isCountryOpen) setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="h-7 sm:h-8 w-full sm:min-w-[190px] sm:max-w-[280px] flex items-center justify-between gap-1.5 rounded-lg sm:rounded-xl bg-slate-800/95 hover:bg-slate-800 border border-white/20 pl-2 xs:pl-2.5 pr-2 text-[10px] xs:text-[11px] sm:text-xs font-medium text-white focus:ring-2 focus:ring-indigo-400 focus:outline-none cursor-pointer transition-colors"
                >
                  <span className="truncate">{selectedLabel}</span>
                  <ChevronDown className={`w-3 h-3 xs:w-3.5 xs:h-3.5 text-slate-400 shrink-0 transition-transform ${isCountryOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown panel */}
                {isCountryOpen && (
                  <div className="absolute z-50 top-full mt-1 left-0 w-[240px] sm:w-[280px] rounded-xl bg-slate-900 border border-white/20 shadow-2xl shadow-black/60 overflow-hidden">
                    {/* Search input */}
                    <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-white/10">
                      <Search className="w-3 h-3 text-slate-400 shrink-0" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={countrySearch}
                        onChange={(e) => {
                          setCountrySearch(e.target.value);
                          setActiveIndex(-1);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search country..."
                        className="flex-1 bg-transparent text-[11px] sm:text-xs text-white placeholder:text-slate-500 outline-none"
                        autoComplete="off"
                      />
                      {countrySearch && (
                        <button
                          type="button"
                          onClick={() => { setCountrySearch(""); setActiveIndex(-1); inputRef.current?.focus(); }}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Country list */}
                    <div className="max-h-52 overflow-y-auto overscroll-contain">
                      {/* "All Countries" option — hidden when searching */}
                      {!countrySearch && (
                        <button
                          type="button"
                          onClick={() => selectCountry("all")}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] sm:text-xs text-left transition-colors ${
                            activeIndex === 0
                              ? "bg-indigo-500 text-white"
                              : selectedCountry === "all"
                              ? "bg-white/10 text-white"
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span>🌐</span>
                          <span>All 195 Countries</span>
                        </button>
                      )}

                      {filteredCountries.length === 0 ? (
                        <p className="text-center text-[11px] text-slate-500 py-4">No countries found</p>
                      ) : (
                        filteredCountries.map((c, idx) => {
                          const listIdx = countrySearch ? idx : idx + 1;
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => selectCountry(c.name)}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] sm:text-xs text-left transition-colors ${
                                activeIndex === listIdx
                                  ? "bg-indigo-500 text-white"
                                  : selectedCountry === c.name
                                  ? "bg-white/10 text-white"
                                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <span>{c.flag}</span>
                              <span className="truncate">{c.name}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* City Scope Dropdown */}
          {selectedCountry !== "all" && (
            <div className="flex items-center gap-1 xs:gap-1.5 min-w-0">
              <span className="text-[10px] xs:text-[11px] sm:text-xs text-slate-400 shrink-0">City:</span>
              <div className="relative min-w-0 inline-flex items-center">
                <select
                  value={selectedCity}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="h-7 sm:h-8 w-auto min-w-[115px] xs:min-w-[135px] sm:min-w-[155px] max-w-[170px] xs:max-w-[200px] sm:max-w-[240px] rounded-lg sm:rounded-xl bg-slate-800/95 hover:bg-slate-800 border border-white/20 pl-2 xs:pl-2.5 pr-6 xs:pr-7 text-[10px] xs:text-[11px] sm:text-xs font-medium text-white focus:ring-2 focus:ring-indigo-400 focus:outline-none cursor-pointer appearance-none shadow-xs truncate transition-colors"
                >
                  {!isCityAdmin && (
                    <option value="all" className="bg-slate-900 text-white">🏙️ All Cities</option>
                  )}
                  {availableCities.map((city) => (
                    <option key={city} value={city} className="bg-slate-900 text-white">
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 xs:w-3.5 xs:h-3.5 absolute right-2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Territory Status Tag & Direct Municipal Dashboard CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-300 font-medium flex items-center gap-1 xs:gap-1.5">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
            <span>
              Filtering:{" "}
              <strong className="text-white">
                {selectedCountry === "all"
                  ? "Worldwide"
                  : selectedCity === "all"
                  ? `${selectedCountry}`
                  : `${selectedCity}, ${selectedCountry}`}
              </strong>
            </span>
          </div>

          {isCityAdmin && (
            <a
              href="/city-admin"
              className="px-2 xs:px-2.5 py-1 rounded-lg xs:rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-[9px] xs:text-[10px] sm:text-xs flex items-center gap-1 shadow-md transition-colors shrink-0"
            >
              <span>Open Municipal Portal →</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
