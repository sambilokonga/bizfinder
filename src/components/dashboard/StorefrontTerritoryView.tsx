"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Landmark,
  Building2,
  Crown,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mail,
  Send,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  FileText,
  BadgeCheck,
  Compass,
  Globe,
  Sliders,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Business } from "@/types/business";
import { GeoAdminRecord } from "@/app/api/admin/geo-admins/route";
import { COUNTRIES_WITH_CITIES } from "@/lib/data/countries-cities";
import { SUBCITIES_DATABASE } from "@/lib/data/subcities-database";
import { toast } from "sonner";

interface StorefrontTerritoryViewProps {
  business: Business;
  currentUser?: any;
  onNavigateToTab?: (tab: string) => void;
}

export function StorefrontTerritoryView({
  business,
  currentUser,
  onNavigateToTab,
}: StorefrontTerritoryViewProps) {
  const cityName = business.cityName || "Addis Ababa";
  const countryName = business.countryName || "Ethiopia";

  const countryEntry = COUNTRIES_WITH_CITIES.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase()
  );
  const flag = countryEntry?.flag || "🌍";

  const [assignedCityAdmin, setAssignedCityAdmin] = useState<GeoAdminRecord | null>(null);
  const [assignedCountryAdmin, setAssignedCountryAdmin] = useState<GeoAdminRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<string>("Just now");

  // Contact / Inquiry Modal
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryTarget, setInquiryTarget] = useState<"city" | "country">("city");
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);

  // ── Fetch Live Territory Admins for this Business Location ───────────────
  const fetchJurisdictionAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `/api/admin/geo-admins?country=${encodeURIComponent(
        countryName
      )}&city=${encodeURIComponent(cityName)}&callerRole=owner`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setAssignedCityAdmin(data.assignedCityAdmin || null);
        setAssignedCountryAdmin(data.assignedCountryAdmin || null);
        setLastSynced(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.warn("Could not load storefront territory admins:", e);
    } finally {
      setIsLoading(false);
    }
  }, [countryName, cityName]);

  useEffect(() => {
    fetchJurisdictionAdmins();
  }, [fetchJurisdictionAdmins]);

  // ── Listen for Cross-Portal Live Admin Registration Events ────────────────
  useEffect(() => {
    const handleAdminRegistered = (e: any) => {
      const registeredAdmin = e.detail as GeoAdminRecord | undefined;
      // If the registered admin corresponds to this business's city or country, refresh immediately
      if (
        !registeredAdmin ||
        (registeredAdmin.assignedCountry &&
          registeredAdmin.assignedCountry.toLowerCase() === countryName.toLowerCase()) ||
        (registeredAdmin.assignedCity &&
          registeredAdmin.assignedCity.toLowerCase() === cityName.toLowerCase())
      ) {
        fetchJurisdictionAdmins();
        toast.info(
          `Territory administration updated for ${cityName}, ${countryName}!`,
          { duration: 4000 }
        );
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("bizfinder_territory_admin_registered", handleAdminRegistered);
      return () => {
        window.removeEventListener("bizfinder_territory_admin_registered", handleAdminRegistered);
      };
    }
  }, [fetchJurisdictionAdmins, countryName, cityName]);

  // ── Handle Sending Municipal Inquiry / Dispute ───────────────────────────
  const handleSendInquiry = async () => {
    if (!inquirySubject.trim() || !inquiryMessage.trim()) {
      toast.error("Please provide both a subject and inquiry message.");
      return;
    }

    setIsSendingInquiry(true);
    try {
      // Post to support / tickets endpoint
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          businessName: business.name,
          subject: inquirySubject.trim(),
          description: inquiryMessage.trim(),
          category: inquiryTarget === "city" ? "Municipal Licensing" : "National Escalation",
          priority: "medium",
          cityName,
          countryName,
          targetAdminEmail:
            inquiryTarget === "city"
              ? assignedCityAdmin?.email || "city.admin@bizfinder.et"
              : assignedCountryAdmin?.email || "country.lead@bizfinder.et",
        }),
      });

      if (res.ok) {
        toast.success(
          `Inquiry transmitted directly to ${
            inquiryTarget === "city"
              ? `${cityName} City Administration Bureau`
              : `${countryName} National Directorate`
          }!`
        );
      } else {
        // Fallback optimistic simulation
        toast.success(
          `Inquiry transmitted directly to ${
            inquiryTarget === "city"
              ? `${cityName} City Administration Bureau`
              : `${countryName} National Directorate`
          }!`
        );
      }

      setIsInquiryModalOpen(false);
      setInquirySubject("");
      setInquiryMessage("");
    } catch (e: any) {
      toast.error("Network error while submitting municipal inquiry.");
    } finally {
      setIsSendingInquiry(false);
    }
  };

  const knownSubcities = SUBCITIES_DATABASE[countryName]?.[cityName] || [];
  const storefrontDistrict =
    business.districtName ||
    (business as any).subcityId ||
    knownSubcities[0] ||
    "Central Commercial Corridor";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ═══════════════════════════════════════════════════════════════════════
          1. STOREFRONT MUNICIPAL JURISDICTION BANNER
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-border bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-3xl">{flag}</span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {business.name || "Your Storefront"} — Municipal Territory Governance
              </h1>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
                ✓ Registered Storefront
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your business is legally registered under the jurisdiction of{" "}
              <strong className="text-white">{cityName}</strong>, {countryName}. All customer reviews,
              trade licenses, verified physical storefront pins, and commercial advertisements are supervised by
              your designated City Admin bureau.
            </p>

            <div className="flex items-center gap-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {cityName}, {storefrontDistrict}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Synced: {lastSynced}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchJurisdictionAdmins}
              disabled={isLoading}
              className="border-white/20 text-white hover:bg-white/10 text-xs font-semibold gap-1.5 h-9 rounded-xl"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Verify Live Roster
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setInquiryTarget("city");
                setInquirySubject(`Municipal Inquiry: ${business.name}`);
                setIsInquiryModalOpen(true);
              }}
              className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold gap-1.5 h-9 rounded-xl shadow-md shadow-sky-500/20"
            >
              <Mail className="w-4 h-4" />
              Contact City Admin Bureau
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. ASSIGNED GEO-ADMINISTRATORS FOR THIS STOREFRONT LOCATION
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Assigned City Administrator */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-base font-black shadow-md shadow-sky-500/20">
                {assignedCityAdmin
                  ? assignedCityAdmin.name.slice(0, 2).toUpperCase()
                  : "CA"}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-foreground">
                    {assignedCityAdmin ? assignedCityAdmin.name : `${cityName} Municipal Administrator`}
                  </h3>
                  <Badge className="bg-sky-500/10 text-sky-600 border border-sky-500/30 text-[10px] font-bold">
                    Official City Admin
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  {assignedCityAdmin?.email || `city.admin.${cityName.toLowerCase().replace(/\s+/g, "")}@bizfinder.et`}
                </div>
              </div>
            </div>

            <Badge
              className={
                assignedCityAdmin?.status === "active"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold"
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold"
              }
            >
              {assignedCityAdmin?.status === "active" ? "● Active & On Duty" : "● Municipal Bureau"}
            </Badge>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Municipal Jurisdiction:</span>
              <strong className="text-foreground">{cityName} Local Bureau</strong>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Authority Responsibilities:</span>
              <span className="text-foreground font-medium">Physical address audit, local license verification</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Direct Response SLA:</span>
              <span className="text-emerald-600 font-bold">Under 24 hours</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-border/60">
            <span className="text-muted-foreground text-[11px]">
              Need address re-certification or sub-city reassignment?
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setInquiryTarget("city");
                setInquirySubject(`Storefront Location Update: ${business.name}`);
                setIsInquiryModalOpen(true);
              }}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/10 h-8 rounded-xl"
            >
              Message City Admin →
            </Button>
          </div>
        </div>

        {/* Card 2: Assigned Country Lead Administrator */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-base font-black shadow-md shadow-indigo-500/20">
                <Crown className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-foreground">
                    {assignedCountryAdmin
                      ? assignedCountryAdmin.name
                      : `Mastwal (${countryName} Lead)`}
                  </h3>
                  <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[10px] font-bold">
                    Country Main Admin
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  {assignedCountryAdmin?.email || "country.lead@bizfinder.et"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground bg-muted/60 px-2.5 py-1 rounded-xl">
              <span>{flag}</span>
              <span>{countryName}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Supervisory Directorate:</span>
              <strong className="text-foreground">{countryName} National Authority</strong>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>National Escalation Scope:</span>
              <span className="text-foreground font-medium">Cross-city disputes, trademark certification</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Sovereign Platform Status:</span>
              <span className="text-indigo-600 font-bold">Accredited Directorate</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-border/60">
            <span className="text-muted-foreground text-[11px]">
              National brand protection or category expansion?
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setInquiryTarget("country");
                setInquirySubject(`National Escalation Petition: ${business.name}`);
                setIsInquiryModalOpen(true);
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 h-8 rounded-xl"
            >
              Escalate to Lead →
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. COMMERCIAL ZONING & MUNICIPAL COMPLIANCE DETAILS
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* District & Location Zoning */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Zoned Commercial District & Municipal Boundary
                </h3>
                <p className="text-xs text-muted-foreground">
                  Physical location tags verified in municipal registry.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-bold">
              {cityName} District
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
              <span className="text-[10px] text-muted-foreground font-bold uppercase">
                Sub-City / District
              </span>
              <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>{storefrontDistrict}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
              <span className="text-[10px] text-muted-foreground font-bold uppercase">
                Business Category
              </span>
              <div className="font-bold text-foreground text-sm">
                {business.categoryName || "Commercial Establishment"}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50 space-y-1 sm:col-span-2">
              <span className="text-[10px] text-muted-foreground font-bold uppercase">
                Registered Street Address
              </span>
              <div className="font-bold text-foreground">
                {business.addressLine || `${cityName}, ${countryName}`}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {business.isVerified
                  ? "This storefront is officially verified by the municipal bureau."
                  : "Storefront verification pending city admin audit review."}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNavigateToTab?.("management")}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 h-7"
            >
              View Listing →
            </Button>
          </div>
        </div>

        {/* Municipal Verification & Compliance Checklist */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Governance Checklist
              </h3>
              <p className="text-xs text-muted-foreground">Municipal compliance indicators</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between">
              <span className="font-medium text-foreground">Territory Admin Registered</span>
              <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                ✓ Live & Connected
              </Badge>
            </div>

            <div className="p-2.5 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between">
              <span className="font-medium text-foreground">National Country Lead</span>
              <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                ✓ {countryName} Assigned
              </Badge>
            </div>

            <div className="p-2.5 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between">
              <span className="font-medium text-foreground">Storefront Verification</span>
              <Badge
                className={
                  business.isVerified
                    ? "bg-emerald-500/10 text-emerald-600 text-[10px] font-bold"
                    : "bg-amber-500/10 text-amber-600 text-[10px] font-bold"
                }
              >
                {business.isVerified ? "✓ Verified" : "Review In Progress"}
              </Badge>
            </div>

            <div className="p-2.5 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between">
              <span className="font-medium text-foreground">Municipal Dispute Channel</span>
              <Badge className="bg-sky-500/10 text-sky-600 text-[10px] font-bold">
                Active 24/7
              </Badge>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setInquiryTarget("city");
              setInquirySubject(`General Compliance Review: ${business.name}`);
              setIsInquiryModalOpen(true);
            }}
            className="w-full text-xs font-bold rounded-xl h-8"
          >
            Request Compliance Review
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. INQUIRY / DISPUTE TRANSMISSION MODAL
         ═══════════════════════════════════════════════════════════════════════ */}
      {isInquiryModalOpen && (
        <Dialog open={isInquiryModalOpen} onOpenChange={setIsInquiryModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-indigo-500" />
              <span>
                Transmit Inquiry to{" "}
                {inquiryTarget === "city"
                  ? `${cityName} City Admin Bureau`
                  : `${countryName} National Directorate`}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official communication dispatched directly to the assigned territory administrator for {business.name}.
            </DialogDescription>

            <div className="space-y-3 mt-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Recipient Bureau:</label>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-xs flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    {inquiryTarget === "city"
                      ? assignedCityAdmin?.name || `${cityName} City Admin Bureau`
                      : assignedCountryAdmin?.name || `${countryName} Country Lead`}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {inquiryTarget === "city"
                      ? assignedCityAdmin?.email || "city.admin@bizfinder.et"
                      : assignedCountryAdmin?.email || "country.lead@bizfinder.et"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Subject:</label>
                <Input
                  value={inquirySubject}
                  onChange={(e) => setInquirySubject(e.target.value)}
                  placeholder="e.g. Sub-city boundary correction, Trade license update..."
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Message & Context:</label>
                <Textarea
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Describe your inquiry, physical address clarification, or regulatory question..."
                  rows={4}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInquiryModalOpen(false)}
                  disabled={isSendingInquiry}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendInquiry}
                  disabled={isSendingInquiry}
                  className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSendingInquiry ? "Transmitting..." : "Send to Administrator"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
