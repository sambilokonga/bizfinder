"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Navigation,
  Crown,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BusinessBranch } from "@/types/business";

interface BusinessBranchesSectionProps {
  businessName: string;
  branches: BusinessBranch[];
}

export function BusinessBranchesSection({
  businessName,
  branches = [],
}: BusinessBranchesSectionProps) {
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(branches.map((b) => b.cityName).filter(Boolean)));
  }, [branches]);

  const filteredBranches = useMemo(() => {
    return branches.filter((br) => {
      if (selectedCity !== "all" && br.cityName !== selectedCity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          br.name.toLowerCase().includes(q) ||
          br.cityName.toLowerCase().includes(q) ||
          (br.subcityName || "").toLowerCase().includes(q) ||
          (br.addressLine || "").toLowerCase().includes(q) ||
          (br.branchCode || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [branches, selectedCity, searchQuery]);

  if (!branches || branches.length === 0) return null;

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-foreground">
                Branch Locations & Outlets
              </h3>
              <Badge className="bg-indigo-600 text-white text-[10px] font-bold">
                {branches.length} Locations
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Official retail branches, corporate centers, and regional outlets across {uniqueCities.length} cities.
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search branches or areas..."
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* City Filter Tabs */}
      {uniqueCities.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCity("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCity === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Cities ({branches.length})
          </button>

          {uniqueCities.map((city) => {
            const count = branches.filter((b) => b.cityName === city).length;
            return (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  selectedCity === city
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{city}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
        {filteredBranches.length === 0 ? (
          <div className="col-span-full p-8 text-center space-y-2">
            <Building2 className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-xs font-bold text-foreground">No branches found in this city.</p>
          </div>
        ) : (
          filteredBranches.map((br, index) => (
            <div
              key={br.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                br.isHeadquarters
                  ? "border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-card shadow-sm ring-1 ring-amber-500/20"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-sm text-foreground">{br.name}</h4>
                      {br.branchCode && (
                        <Badge variant="outline" className="text-[9px] font-mono py-0">
                          {br.branchCode}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary font-bold mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>
                        {br.subcityName ? `${br.subcityName}, ` : ""}
                        {br.cityName}, {br.countryName}
                      </span>
                    </div>
                  </div>

                  {br.isHeadquarters && (
                    <Badge className="bg-amber-500 text-white text-[9px] font-black shrink-0 flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5" />
                      Main HQ
                    </Badge>
                  )}
                </div>

                {br.addressLine && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {br.addressLine}
                  </p>
                )}

                {(br.phone || br.email || br.managerName) && (
                  <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {br.phone && (
                      <a
                        href={`tel:${br.phone}`}
                        className="flex items-center gap-1 text-primary font-bold hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{br.phone}</span>
                      </a>
                    )}
                    {br.email && (
                      <a
                        href={`mailto:${br.email}`}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-mono text-[11px]"
                      >
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[160px]">{br.email}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Direction Button */}
              <div className="pt-2 flex items-center justify-between border-t border-border/50">
                <span className="text-[11px] text-muted-foreground">
                  Status: <strong className="text-emerald-600 dark:text-emerald-400 capitalize">Open for Service</strong>
                </span>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${br.name}, ${br.addressLine || br.cityName}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
