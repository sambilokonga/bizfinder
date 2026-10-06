"use client";

import React from "react";
import {
  Globe,
  Building2,
  Crown,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COUNTRIES_WITH_CITIES, getCitiesForCountry } from "@/lib/data/countries-cities";

interface GeoScopeBannerProps {
  currentRole: "super_admin" | "country_admin" | "city_admin" | "admin";
  onRoleChange: (role: "super_admin" | "country_admin" | "city_admin" | "admin") => void;
  selectedCountry: string; // "all" or specific country name
  onCountryChange: (country: string) => void;
  selectedCity: string; // "all" or specific city name
  onCityChange: (city: string) => void;
}

export function GeoScopeBanner({
  currentRole,
  onRoleChange,
  selectedCountry,
  onCountryChange,
  selectedCity,
  onCityChange,
}: GeoScopeBannerProps) {
  const isSuperAdmin = currentRole === "super_admin";
  const isCountryAdmin = currentRole === "country_admin";
  const isCityAdmin = currentRole === "city_admin";

  const countryEntry = COUNTRIES_WITH_CITIES.find(
    (c) => c.name.toLowerCase() === selectedCountry.toLowerCase()
  );

  const availableCities = selectedCountry !== "all" ? getCitiesForCountry(selectedCountry) : [];

  return (
    <div className="rounded-3xl border border-border bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Role Title & Territory Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner">
            {isSuperAdmin && "👑"}
            {isCountryAdmin && (countryEntry?.flag || "🌍")}
            {isCityAdmin && "🏙️"}
            {currentRole === "admin" && "🛡️"}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-black tracking-tight text-white">
                {isSuperAdmin && "Worldwide Super Admin Portal"}
                {isCountryAdmin && `${selectedCountry} National Administration`}
                {isCityAdmin && `${selectedCity || "City"} Municipal Portal`}
                {currentRole === "admin" && "Operations Admin Portal"}
              </span>

              <Badge
                variant="outline"
                className="bg-white/10 text-white border-white/30 text-[11px] font-bold py-0.5"
              >
                {isSuperAdmin && "👑 Global (195 Nations)"}
                {isCountryAdmin && `🌍 National Lead (${countryEntry?.flag} ${selectedCountry})`}
                {isCityAdmin && `🏙️ City Lead (${selectedCity || "City"})`}
                {currentRole === "admin" && "🛡️ Operations"}
              </Badge>
            </div>

            <p className="text-xs text-slate-300 max-w-xl">
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
        <div className="flex flex-wrap items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 text-xs">
          <span className="text-[11px] font-bold text-slate-400 pl-2 pr-1 hidden sm:inline">
            Simulate Role:
          </span>

          <button
            type="button"
            onClick={() => {
              onRoleChange("super_admin");
              onCountryChange("all");
              onCityChange("all");
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              isSuperAdmin
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            👑 Super Admin
          </button>

          <button
            type="button"
            onClick={() => {
              onRoleChange("country_admin");
              if (selectedCountry === "all") onCountryChange("Ethiopia");
              onCityChange("all");
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              isCountryAdmin
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            🌍 Country Lead
          </button>

          <button
            type="button"
            onClick={() => {
              onRoleChange("city_admin");
              if (selectedCountry === "all") onCountryChange("Ethiopia");
              if (selectedCity === "all") onCityChange("Addis Ababa");
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              isCityAdmin
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            🏙️ City Admin
          </button>
        </div>
      </div>

      {/* ─── Territory Filter Bar ────────────────────────────────────────────── */}
      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Dashboard Scope:</span>
          </div>

          {/* Country Scope Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Country:</span>
            {isCountryAdmin || isCityAdmin ? (
              <div className="h-8 rounded-xl bg-indigo-950/80 border border-indigo-400/40 px-3 flex items-center gap-1.5 text-xs font-bold text-white shadow-inner">
                <span>{countryEntry?.flag || "🌍"}</span>
                <span>{selectedCountry}</span>
                <span className="text-[10px] text-indigo-300 font-semibold">(Jurisdiction Locked)</span>
              </div>
            ) : (
              <select
                value={selectedCountry}
                onChange={(e) => {
                  onCountryChange(e.target.value);
                  onCityChange("all");
                }}
                className="h-8 rounded-xl bg-slate-800 border border-white/20 px-2.5 text-xs font-bold text-white focus:ring-2 focus:ring-indigo-400"
              >
                <option value="all">🌐 All 195 Countries (Worldwide Global)</option>
                {COUNTRIES_WITH_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* City Scope Dropdown */}
          {selectedCountry !== "all" && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">City:</span>
              {isCityAdmin ? (
                <div className="h-8 rounded-xl bg-sky-950/80 border border-sky-400/40 px-3 flex items-center gap-1.5 text-xs font-bold text-white shadow-inner">
                  <span>🏙️</span>
                  <span>{selectedCity || "Addis Ababa"}</span>
                  <span className="text-[10px] text-sky-300 font-semibold">(Municipal Locked)</span>
                </div>
              ) : (
                <select
                  value={selectedCity}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="h-8 rounded-xl bg-slate-800 border border-white/20 px-2.5 text-xs font-bold text-white focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="all">🏙️ All {availableCities.length || 30} Cities in {selectedCountry}</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Territory Status Tag & Direct Municipal Dashboard CTA */}
        <div className="flex items-center gap-3">
          <div className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Filtering for:{" "}
              <strong className="text-white">
                {selectedCountry === "all"
                  ? "Worldwide (All 195 Countries)"
                  : selectedCity === "all"
                  ? `${selectedCountry} (Nationwide)`
                  : `${selectedCity}, ${selectedCountry}`}
              </strong>
            </span>
          </div>

          {isCityAdmin && (
            <a
              href="/city-admin"
              className="px-2.5 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-colors shrink-0"
            >
              <span>Open Municipal Portal →</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
