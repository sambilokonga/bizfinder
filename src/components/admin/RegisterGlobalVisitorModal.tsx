"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { GLOBAL_VISITOR_ORIGINS, getCountryFlag, getCountryCode } from "@/types/globalVisitors";

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
  currentRole = "city_admin",
  businessesList = [],
}: RegisterGlobalVisitorModalProps) {
  const [visitorType, setVisitorType] = useState<"actual" | "future">("actual");
  const [visitorName, setVisitorName] = useState("");
  const [visitorCountry, setVisitorCountry] = useState("United States");
  const [visitorCity, setVisitorCity] = useState("Washington, D.C.");
  const [targetBusinessName, setTargetBusinessName] = useState(
    businessesList[0]?.name || "Commercial Bank of Ethiopia"
  );
  const [targetBusinessId, setTargetBusinessId] = useState(businessesList[0]?.id || "");
  const [action, setAction] = useState<
    "view" | "call" | "direction" | "website" | "saved" | "share" | "inquiry" | "meeting" | "delegation"
  >("inquiry");
  const [purpose, setPurpose] = useState("Diaspora Investment & Trade Inquiry");
  const [status, setStatus] = useState<"active" | "scheduled" | "confirmed">("active");
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [delegationSize, setDelegationSize] = useState<number>(1);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [escalatedTo, setEscalatedTo] = useState<"none" | "country_admin" | "super_admin">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync business selection
  const handleBusinessChange = (bizName: string) => {
    setTargetBusinessName(bizName);
    const found = businessesList.find((b) => b.name === bizName);
    if (found) {
      setTargetBusinessId(found.id);
    }
  };

  // Country Quick Selector handler
  const handleCountrySelect = (cName: string) => {
    setVisitorCountry(cName);
    const origin = GLOBAL_VISITOR_ORIGINS.find((o) => o.country === cName);
    if (origin && origin.cities.length > 0) {
      setVisitorCity(origin.cities[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorCountry || !visitorCity || !targetBusinessName) {
      toast.error("Please fill in country, origin city, and target business.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        visitorType,
        visitorName: visitorName.trim() || (visitorType === "future" ? "Upcoming Inbound Delegation" : "International Visitor"),
        visitorCountry,
        visitorCountryCode: getCountryCode(visitorCountry),
        visitorCity: visitorCity.trim(),
        visitorFlag: getCountryFlag(visitorCountry),
        targetBusinessId: targetBusinessId || undefined,
        targetBusinessName: targetBusinessName.trim(),
        targetBusinessCity: targetCity,
        targetBusinessCountry: targetCountry,
        action: visitorType === "future" ? "delegation" : action,
        purpose: purpose.trim(),
        status: visitorType === "future" ? (status === "active" ? "scheduled" : status) : "active",
        scheduledDate: visitorType === "future" ? new Date(scheduledDate).toISOString() : undefined,
        delegationSize: Number(delegationSize) || 1,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        registeredBy: `City Admin (${targetCity})`,
        jurisdictionLevel: "city",
        escalatedTo,
        escalationNotes: escalatedTo !== "none"
          ? `Registered by City Admin and escalated to ${escalatedTo.replace("_", " ")} for national trade alignment.`
          : undefined,
        referrer: "Municipal City Admin Portal",
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
            ? `Future Delegation "${payload.visitorName}" successfully registered & scheduled!`
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
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 bg-card border border-border shadow-2xl rounded-3xl">
        <DialogTitle className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
            <Globe className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            Register Global Visitor
            <span className="block text-xs font-normal text-muted-foreground mt-0.5">
              Record live international traffic or schedule upcoming foreign delegations in {targetCity}, {targetCountry}
            </span>
          </div>
        </DialogTitle>

        <DialogDescription className="sr-only">
          Form to register actual or future international visitors to the city
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* ── 1. Type Switcher: Actual vs Future ── */}
          <div className="p-1.5 rounded-2xl bg-muted/60 border border-border flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setVisitorType("actual");
                setStatus("active");
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                visitorType === "actual"
                  ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="w-4 h-4" />
              Actual Global Visitor (Live Telemetry)
            </button>
            <button
              type="button"
              onClick={() => {
                setVisitorType("future");
                setStatus("scheduled");
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                visitorType === "future"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Future Visitor (Scheduled Delegation)
            </button>
          </div>

          {/* Quick Hub Pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
              <span>Quick Select International Origin</span>
              <span className="text-[11px] text-primary">Diaspora & Trade Hubs</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GLOBAL_VISITOR_ORIGINS.slice(0, 8).map((origin) => (
                <button
                  key={origin.code}
                  type="button"
                  onClick={() => handleCountrySelect(origin.country)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    visitorCountry === origin.country
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/40 border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <span>{origin.flag}</span>
                  <span>{origin.country}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── 2. Visitor Profile Details ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {visitorType === "future" ? "Delegation / Organization Name" : "Visitor Name / Persona"}
              </label>
              <Input
                placeholder={
                  visitorType === "future"
                    ? "e.g. Frankfurt Chamber of Commerce Mission"
                    : "e.g. Dawit Hailu (Diaspora Investor)"
                }
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Origin Country</label>
              <Input
                placeholder="e.g. United States"
                value={visitorCountry}
                onChange={(e) => setVisitorCountry(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Origin Hub / City</label>
              <Input
                placeholder="e.g. Washington, D.C. or London"
                value={visitorCity}
                onChange={(e) => setVisitorCity(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Target Business in {targetCity}
              </label>
              <Input
                placeholder="e.g. Commercial Bank of Ethiopia"
                value={targetBusinessName}
                onChange={(e) => handleBusinessChange(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>
          </div>

          {/* ── 3. Mode Specific Fields ── */}
          {visitorType === "future" ? (
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <Calendar className="w-4 h-4" />
                <span>Future Inbound Delegation Schedule</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground">Expected Arrival Date</label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="h-9 text-xs rounded-xl bg-background"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground">Delegation Size</label>
                  <Input
                    type="number"
                    min={1}
                    max={250}
                    value={delegationSize}
                    onChange={(e) => setDelegationSize(Number(e.target.value))}
                    className="h-9 text-xs rounded-xl bg-background"
                  />
                </div>

                <div className="space-y-1.5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Action Type</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold"
                >
                  <option value="inquiry">💼 Direct Commercial Inquiry</option>
                  <option value="meeting">🤝 B2B Investment Meeting</option>
                  <option value="call">📞 Phone Call Inquiry</option>
                  <option value="view">👁️ Business Profile View</option>
                  <option value="direction">📍 Map Directions Navigation</option>
                  <option value="website">🌐 External Website Visit</option>
                  <option value="saved">⭐ Saved Listing</option>
                  <option value="delegation">🏢 Inbound Delegation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Commercial Purpose / Sector</label>
                <Input
                  placeholder="e.g. Import/Export, Real Estate, Tourism"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>
          )}

          {/* ── 4. Contact & Notes ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Contact Email (Optional)</label>
              <Input
                type="email"
                placeholder="e.g. delegate@chamber.org"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Contact Phone / WhatsApp</label>
              <Input
                placeholder="e.g. +1-202-555-0199"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Special Notes / Intent</label>
            <textarea
              rows={2}
              placeholder="e.g. Visitor is seeking joint venture partnership for agro-processing facility in Addis Ababa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-background text-xs outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* ── 5. Integration with Country Admin & Super Admin ── */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black text-foreground">
                  Administrative Hierarchy & Multi-Tier Integration
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold">
                City ──► Country ──► Super Admin
              </Badge>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Enable seamless escalation to National and Global tiers for high-value foreign investments, bilateral delegations, and strategic trade partnerships.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEscalatedTo("none")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  escalatedTo === "none"
                    ? "bg-card border-primary ring-2 ring-primary/20"
                    : "bg-background/60 border-border hover:border-foreground/30"
                }`}
              >
                <div className="text-xs font-bold text-foreground">🏙️ City Only</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Local municipal scope</div>
              </button>

              <button
                type="button"
                onClick={() => setEscalatedTo("country_admin")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  escalatedTo === "country_admin"
                    ? "bg-card border-emerald-500 ring-2 ring-emerald-500/20"
                    : "bg-background/60 border-border hover:border-foreground/30"
                }`}
              >
                <div className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Country Admin
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">National trade liaison</div>
              </button>

              <button
                type="button"
                onClick={() => setEscalatedTo("super_admin")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  escalatedTo === "super_admin"
                    ? "bg-card border-purple-500 ring-2 ring-purple-500/20"
                    : "bg-background/60 border-border hover:border-foreground/30"
                }`}
              >
                <div className="text-xs font-bold text-purple-500 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Super Admin
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Global headquarters</div>
              </button>
            </div>
          </div>

          {/* ── Submit Action ── */}
          <div className="flex items-center justify-end gap-3 pt-2">
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
                      ? "Schedule Future Visitor"
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
