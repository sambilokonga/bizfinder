"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  UserPlus,
  Calendar,
  Building2,
  MapPin,
  Users,
  Shield,
  Crown,
  Sparkles,
  Phone,
  Mail,
  Send,
  Flag,
  Navigation,
  ExternalLink,
  Eye,
  CheckCircle2,
  FileText,
  Search,
  Laptop,
  Smartphone,
  Compass,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { GLOBAL_VISITOR_ORIGINS, getCountryFlag, getCountryCode } from "@/types/globalVisitors";

const GLOBAL_TARGET_COUNTRIES = [
  "Ethiopia",
  "United States",
  "Kenya",
  "United Arab Emirates",
  "United Kingdom",
  "Germany",
  "Canada",
  "Rwanda",
  "South Africa",
  "Djibouti",
  "Saudi Arabia",
  "France",
  "Sweden",
  "China",
  "India",
];

const ETHIOPIA_MAJOR_CITIES = [
  "Addis Ababa",
  "Hawassa",
  "Dire Dawa",
  "Bahir Dar",
  "Bishoftu",
  "Mekelle",
  "Adama",
  "Gondar",
  "Jimma",
  "Harar",
  "Arba Minch",
  "Dessie",
  "Shashamane",
  "Jijiga",
];

const DEVICE_OPTIONS = [
  "Mobile Safari (iOS 18)",
  "Chrome Mobile (Android 15)",
  "Chrome Desktop (macOS Sonoma)",
  "Edge Desktop (Windows 11)",
  "Safari Desktop (macOS)",
  "Firefox Desktop (Windows 11)",
  "Samsung Internet (Android 14)",
];

const REFERRER_CHANNELS = [
  "Direct Navigation / Bookmark",
  "Google Global Search",
  "Diaspora Business Network",
  "LinkedIn Business Referral",
  "Embassy Commercial Section",
  "African Chamber of Commerce Portal",
  "Ethiopian Airlines In-Flight Portal",
  "TripAdvisor & Travel Directories",
  "Global Investment Summit 2026",
];

interface RegisterGlobalVisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVisitorRegistered: (visitor: any) => void;
  targetCity: string;
  targetCountry: string;
  currentRole?: string;
  businessesList?: Array<{ id: string; name: string }>;
}

export function RegisterGlobalVisitorModal({
  isOpen,
  onClose,
  onVisitorRegistered,
  targetCity,
  targetCountry,
  currentRole = "super_admin",
  businessesList = [],
}: RegisterGlobalVisitorModalProps) {
  const isSuperAdmin = currentRole === "super_admin";
  const isOperationsAdmin = currentRole === "admin";
  const isCountryAdmin = currentRole === "country_admin";
  const isCityAdmin = currentRole === "city_admin";

  // Target Location State
  const [selectedTargetCountry, setSelectedTargetCountry] = useState(
    targetCountry && targetCountry !== "all" ? targetCountry : "Ethiopia"
  );
  const [selectedTargetCity, setSelectedTargetCity] = useState(
    targetCity && targetCity !== "all" ? targetCity : "Addis Ababa"
  );

  // Visitor Core State
  const [visitorType, setVisitorType] = useState<"actual" | "future">("actual");
  const [visitorName, setVisitorName] = useState("");
  const [visitorCountry, setVisitorCountry] = useState("United States");
  const [visitorCity, setVisitorCity] = useState("Washington, D.C.");
  const [visitorDevice, setVisitorDevice] = useState(DEVICE_OPTIONS[0]);
  const [visitorIp, setVisitorIp] = useState("");
  const [referrer, setReferrer] = useState(REFERRER_CHANNELS[0]);

  // Target Business State
  const [targetBusinessName, setTargetBusinessName] = useState("");
  const [targetBusinessId, setTargetBusinessId] = useState("");
  const [availableBusinesses, setAvailableBusinesses] = useState<Array<{ id: string; name: string }>>(businessesList);
  const [isSearchingBiz, setIsSearchingBiz] = useState(false);

  // Action & Commercial Intent
  const [action, setAction] = useState<
    "view" | "call" | "direction" | "website" | "saved" | "share" | "inquiry" | "meeting" | "delegation"
  >("inquiry");
  const [purpose, setPurpose] = useState("Diaspora Commercial & Investment Inquiry");
  const [status, setStatus] = useState<"active" | "completed" | "scheduled" | "confirmed" | "in_transit">("active");

  // Future Delegation Specifics
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [delegationSize, setDelegationSize] = useState<number>(1);

  // Contact & Special Notes
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Governance Tier & Escalation
  const [escalatedTo, setEscalatedTo] = useState<"none" | "country_admin" | "super_admin">(
    isSuperAdmin ? "none" : "none"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync props when modal opens
  useEffect(() => {
    if (isOpen) {
      if (targetCountry && targetCountry !== "all") {
        setSelectedTargetCountry(targetCountry);
      }
      if (targetCity && targetCity !== "all") {
        setSelectedTargetCity(targetCity);
      }
      // Generate a realistic diaspora IP address
      const randomIp = `${198 + Math.floor(Math.random() * 20)}.${40 + Math.floor(Math.random() * 150)}.${10 + Math.floor(Math.random() * 80)}.${10 + Math.floor(Math.random() * 200)}`;
      setVisitorIp(randomIp);
    }
  }, [isOpen, targetCountry, targetCity]);

  // Fetch real registered businesses dynamically when modal opens or target location changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsSearchingBiz(true);
    const params = new URLSearchParams({ limit: "50" });
    if (selectedTargetCountry && selectedTargetCountry !== "all") {
      params.set("country", selectedTargetCountry);
    }
    if (selectedTargetCity && selectedTargetCity !== "all") {
      params.set("city", selectedTargetCity);
    }

    fetch(`/api/businesses?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.businesses && Array.isArray(data.businesses) && data.businesses.length > 0) {
          const list = data.businesses.map((b: any) => ({
            id: b.id || b._id,
            name: b.name,
          }));
          setAvailableBusinesses(list);
          if (!list.some((b: any) => b.name === targetBusinessName)) {
            setTargetBusinessName(list[0].name);
            setTargetBusinessId(list[0].id);
          }
        } else {
          // If no businesses in that specific city, provide country fallbacks or initial list
          if (businessesList.length > 0) {
            setAvailableBusinesses(businessesList);
          } else {
            const fallbacks = [
              { id: "cbe-central", name: "Commercial Bank of Ethiopia - Head Office" },
              { id: "skylight-addis", name: "Ethiopian Skylight Hotel" },
              { id: "bole-pharmacy", name: "Bole Medhanialem Pharmacy" },
              { id: "kuriftu-resort", name: "Kuriftu Resort & Spa Bishoftu" },
              { id: "kategna-rest", name: "Kategna Traditional Restaurant" },
              { id: "tomoca-coffee", name: "Tomoca Coffee Roasters" },
            ];
            setAvailableBusinesses(fallbacks);
            if (!targetBusinessName) {
              setTargetBusinessName(fallbacks[0].name);
              setTargetBusinessId(fallbacks[0].id);
            }
          }
        }
      })
      .catch((err) => {
        console.warn("[RegisterGlobalVisitorModal] Error fetching businesses:", err);
      })
      .finally(() => {
        if (isMounted) setIsSearchingBiz(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedTargetCountry, selectedTargetCity]);

  // Sync business selection
  const handleBusinessSelect = (bizName: string) => {
    setTargetBusinessName(bizName);
    const found = availableBusinesses.find((b) => b.name === bizName);
    if (found) {
      setTargetBusinessId(found.id);
    }
  };

  // Country Quick Selector handler
  const handleOriginCountrySelect = (cName: string) => {
    setVisitorCountry(cName);
    const origin = GLOBAL_VISITOR_ORIGINS.find((o) => o.country === cName);
    if (origin && origin.cities.length > 0) {
      setVisitorCity(origin.cities[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorCountry || !visitorCity || !targetBusinessName) {
      toast.error("Please fill in visitor origin country, origin city, and target business name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const registeredBy = isSuperAdmin
        ? "Super Admin (Global Root)"
        : isOperationsAdmin
        ? "Operations Admin (Platform Operations)"
        : isCountryAdmin
        ? `Country Admin (${selectedTargetCountry})`
        : `City Admin (${selectedTargetCity})`;

      const jurisdictionLevel = isSuperAdmin || isOperationsAdmin
        ? "global"
        : isCountryAdmin
        ? "country"
        : "city";

      const payload = {
        visitorType,
        visitorName: visitorName.trim() || (visitorType === "future" ? "Upcoming Inbound Delegation" : "International Visitor"),
        visitorCountry,
        visitorCountryCode: getCountryCode(visitorCountry),
        visitorCity: visitorCity.trim(),
        visitorFlag: getCountryFlag(visitorCountry),
        visitorDevice,
        visitorIp: visitorIp || "198.51.100.22",
        targetBusinessId: targetBusinessId || undefined,
        targetBusinessName: targetBusinessName.trim(),
        targetBusinessCity: selectedTargetCity,
        targetBusinessCountry: selectedTargetCountry,
        action: visitorType === "future" ? "delegation" : action,
        purpose: purpose.trim(),
        status: visitorType === "future" ? (status === "active" ? "scheduled" : status) : status,
        scheduledDate: visitorType === "future" ? new Date(scheduledDate).toISOString() : undefined,
        delegationSize: visitorType === "future" ? Number(delegationSize) || 1 : 1,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        registeredBy,
        jurisdictionLevel,
        escalatedTo,
        escalationNotes: escalatedTo !== "none"
          ? `Registered by ${registeredBy} and flagged for ${escalatedTo.replace("_", " ")} strategic follow-up.`
          : undefined,
        referrer,
      };

      const res = await fetch("/api/admin/global-visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          visitorType === "future"
            ? `Future Delegation "${payload.visitorName}" registered & scheduled successfully!`
            : `Actual Global Visitor from ${visitorCountry} successfully registered into database!`
        );
        onVisitorRegistered(data.data);
        onClose();
      } else {
        toast.error(data.error || "Failed to register visitor.");
      }
    } catch (err: any) {
      console.error("[RegisterGlobalVisitorModal] Error:", err);
      toast.error(err.message || "Failed to register visitor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 bg-card border border-border shadow-2xl rounded-3xl">
        <DialogTitle className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Globe className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            Register Global Visitor
            <span className="block text-xs font-normal text-muted-foreground mt-0.5">
              Record live foreign visitor telemetry or schedule upcoming international delegations
            </span>
          </div>
        </DialogTitle>

        <DialogDescription className="sr-only">
          Modal form to register actual or future global visitors to platform businesses.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-5 mt-3">
          {/* ── 1. Role & Scope Banner ── */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isSuperAdmin ? (
                <Crown className="w-4 h-4 text-purple-500 shrink-0" />
              ) : isOperationsAdmin ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCountryAdmin ? (
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Building2 className="w-4 h-4 text-cyan-500 shrink-0" />
              )}
              <span className="text-xs font-bold text-foreground">
                Registering as:{" "}
                <strong className="text-primary">
                  {isSuperAdmin
                    ? "Super Admin (Worldwide Directory Scope)"
                    : isOperationsAdmin
                    ? "Operations Admin (Platform Operations Scope)"
                    : isCountryAdmin
                    ? `Country Admin (${selectedTargetCountry})`
                    : `City Admin (${selectedTargetCity}, ${selectedTargetCountry})`}
                </strong>
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono font-bold bg-background/60">
              {isSuperAdmin ? "Global Tier" : isOperationsAdmin ? "Operations Tier" : isCountryAdmin ? "National Tier" : "Municipal Tier"}
            </Badge>
          </div>

          {/* ── 2. Type Switcher: Actual Live Visitor vs Future Delegation ── */}
          <div className="p-1 rounded-2xl bg-muted/70 border border-border flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setVisitorType("actual");
                setStatus("active");
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                visitorType === "actual"
                  ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Actual Global Visitor (Live Telemetry)
            </button>
            <button
              type="button"
              onClick={() => {
                setVisitorType("future");
                setStatus("scheduled");
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                visitorType === "future"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Future Delegation (Scheduled Visit)
            </button>
          </div>

          {/* ── 3. Target Business & Location Routing ── */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                Target Business & Jurisdiction
              </span>
              <span className="text-[11px] text-muted-foreground">Listing receiving interaction</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Target Country */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Target Country</label>
                {isSuperAdmin || isOperationsAdmin ? (
                  <select
                    value={selectedTargetCountry}
                    onChange={(e) => setSelectedTargetCountry(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs font-semibold"
                  >
                    {GLOBAL_TARGET_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={selectedTargetCountry}
                    disabled
                    className="h-9 text-xs rounded-xl bg-muted/60 font-semibold"
                  />
                )}
              </div>

              {/* Target City */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Target City</label>
                {isSuperAdmin || isOperationsAdmin || isCountryAdmin ? (
                  <div className="relative">
                    <Input
                      placeholder="e.g. Addis Ababa or Hawassa"
                      value={selectedTargetCity}
                      onChange={(e) => setSelectedTargetCity(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                      list="target-city-options"
                      required
                    />
                    <datalist id="target-city-options">
                      {ETHIOPIA_MAJOR_CITIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                ) : (
                  <Input
                    value={selectedTargetCity}
                    disabled
                    className="h-9 text-xs rounded-xl bg-muted/60 font-semibold"
                  />
                )}
              </div>
            </div>

            {/* Target Business Selector with instant search / custom type */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground flex items-center justify-between">
                <span>Target Business Name</span>
                {isSearchingBiz && <span className="text-[10px] text-primary animate-pulse">Loading businesses...</span>}
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Commercial Bank of Ethiopia or Ethiopian Skylight Hotel"
                  value={targetBusinessName}
                  onChange={(e) => handleBusinessSelect(e.target.value)}
                  className="h-9 text-xs rounded-xl flex-1"
                  list="registered-businesses-options"
                  required
                />
                <datalist id="registered-businesses-options">
                  {availableBusinesses.map((b) => (
                    <option key={b.id} value={b.name} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* ── 4. Origin International Nation & Hub ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-500" />
                Visitor International Origin
              </label>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
                Diaspora & Bilateral Trade Hubs
              </span>
            </div>

            {/* Quick Country Pills */}
            <div className="flex flex-wrap gap-1.5">
              {GLOBAL_VISITOR_ORIGINS.slice(0, 10).map((origin) => (
                <button
                  key={origin.code}
                  type="button"
                  onClick={() => handleOriginCountrySelect(origin.country)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    visitorCountry === origin.country
                      ? "bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-300 shadow-sm"
                      : "bg-muted/40 border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <span>{origin.flag}</span>
                  <span>{origin.country}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Origin Nation</label>
                <Input
                  placeholder="e.g. United States"
                  value={visitorCountry}
                  onChange={(e) => setVisitorCountry(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Origin Hub / City</label>
                <Input
                  placeholder="e.g. Washington, D.C. or London"
                  value={visitorCity}
                  onChange={(e) => setVisitorCity(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          {/* ── 5. Persona & Visitor Information ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">
                {visitorType === "future" ? "Delegation / Mission Name" : "Visitor Name / Persona"}
              </label>
              <Input
                placeholder={
                  visitorType === "future"
                    ? "e.g. Frankfurt Chamber of Commerce Mission"
                    : "e.g. Dawit Hailu (Diaspora Investor)"
                }
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">Commercial Sector / Purpose</label>
              <Input
                placeholder="e.g. Diaspora Real Estate, FinTech, Medical Tourism"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* ── 6. Mode Specific Fields ── */}
          {visitorType === "future" ? (
            <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <Calendar className="w-4 h-4" />
                <span>Future Inbound Delegation Schedule</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Expected Arrival</label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="h-9 text-xs rounded-xl bg-background"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Delegation Size</label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={delegationSize}
                    onChange={(e) => setDelegationSize(Number(e.target.value))}
                    className="h-9 text-xs rounded-xl bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Delegation Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs font-semibold"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_transit">In Transit</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Action Taken</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="w-full h-9 px-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
                >
                  <option value="inquiry">💼 Direct Trade Inquiry</option>
                  <option value="meeting">🤝 B2B Investment Meeting</option>
                  <option value="call">📞 Phone Call Inquiry</option>
                  <option value="view">👁️ Viewed Profile</option>
                  <option value="direction">📍 Directions Navigation</option>
                  <option value="website">🌐 Visited Website</option>
                  <option value="saved">⭐ Saved Listing</option>
                  <option value="delegation">🏢 Official Delegation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Device / OS</label>
                <select
                  value={visitorDevice}
                  onChange={(e) => setVisitorDevice(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
                >
                  {DEVICE_OPTIONS.map((dev) => (
                    <option key={dev} value={dev}>
                      {dev}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Visitor Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-9 px-2.5 rounded-xl border border-border bg-background text-xs font-semibold"
                >
                  <option value="active">Active Live Session</option>
                  <option value="completed">Completed / Handled</option>
                </select>
              </div>
            </div>
          )}

          {/* ── 7. Contact Info & Referral Channel ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">Contact Email</label>
              <Input
                type="email"
                placeholder="delegate@chamber.org"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">Phone / WhatsApp</label>
              <Input
                placeholder="+1-202-555-0199"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">Referral Channel</label>
              <select
                value={referrer}
                onChange={(e) => setReferrer(e.target.value)}
                className="w-full h-9 px-2 rounded-xl border border-border bg-background text-xs font-semibold"
              >
                {REFERRER_CHANNELS.map((ref) => (
                  <option key={ref} value={ref}>
                    {ref}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── 8. Special Intent / Notes ── */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground">Special Notes & Context</label>
            <textarea
              rows={2}
              placeholder="e.g. Visitor is seeking joint venture partnership for agro-processing facility..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border bg-background text-xs outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* ── 9. Administrative Escalation Flag ── */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                Administrative Tier & Governance
              </span>
              <Badge variant="outline" className="text-[10px] font-bold">
                Multi-Tier Governance
              </Badge>
            </div>

            <div className={`grid grid-cols-1 ${isCountryAdmin || isOperationsAdmin ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-2`}>
              <button
                type="button"
                onClick={() => setEscalatedTo("none")}
                className={`p-2 rounded-xl border text-left transition-all ${
                  escalatedTo === "none"
                    ? "bg-card border-primary ring-2 ring-primary/20"
                    : "bg-background/60 border-border hover:border-foreground/30"
                }`}
              >
                <div className="text-xs font-bold text-foreground">
                  {isSuperAdmin
                    ? "🌐 Global Standard"
                    : isOperationsAdmin
                    ? "🛡️ Operations Standard"
                    : isCountryAdmin
                    ? "🌍 National Standard"
                    : "🏙️ Municipal Standard"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {isSuperAdmin
                    ? "Direct Super Admin level"
                    : isOperationsAdmin
                    ? "Platform Operations & Moderation scope"
                    : isCountryAdmin
                    ? `Country Admin (${selectedTargetCountry}) tier`
                    : `City Admin (${selectedTargetCity}) tier`}
                </div>
              </button>

              {!isCountryAdmin && !isSuperAdmin && !isOperationsAdmin && (
                <button
                  type="button"
                  onClick={() => setEscalatedTo("country_admin")}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    escalatedTo === "country_admin"
                      ? "bg-card border-emerald-500 ring-2 ring-emerald-500/20"
                      : "bg-background/60 border-border hover:border-foreground/30"
                  }`}
                >
                  <div className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Country Admin
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Escalate to National Directorate</div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setEscalatedTo("super_admin")}
                className={`p-2 rounded-xl border text-left transition-all ${
                  escalatedTo === "super_admin"
                    ? "bg-card border-purple-500 ring-2 ring-purple-500/20"
                    : "bg-background/60 border-border hover:border-foreground/30"
                }`}
              >
                <div className="text-xs font-bold text-purple-500 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Super Admin
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {isCountryAdmin
                    ? "Escalate to Global Root"
                    : isOperationsAdmin
                    ? "Escalate to Global Root"
                    : isCityAdmin
                    ? "Escalate to Global Headquarters"
                    : "Global Headquarters"}
                </div>
              </button>
            </div>
          </div>

          {/* ── 10. Actions ── */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-black rounded-xl gap-2 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <span>Registering into DB...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {visitorType === "future"
                      ? "Schedule Future Delegation"
                      : "Register Actual Global Visitor"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
