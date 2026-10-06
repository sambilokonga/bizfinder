"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Eye,
  Search,
  Phone,
  Navigation,
  Globe,
  Bookmark,
  Share2,
  Megaphone,
  Smartphone,
  Laptop,
  Tablet,
  MapPin,
  Building2,
  Sparkles,
  Zap,
  CheckCircle2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AnalyticsEventType, AnalyticsDeviceType, IAnalyticsEvent } from "@/types/analytics";

interface RegisterAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyticsRegistered: (event: IAnalyticsEvent | IAnalyticsEvent[]) => void;
  businessesList?: Array<{ id: string; name: string }>;
  currentAdminName?: string;
  preselectedBusinessId?: string;
  preselectedBusinessName?: string;
}

export function RegisterAnalyticsModal({
  isOpen,
  onClose,
  onAnalyticsRegistered,
  businessesList = [],
  currentAdminName = "Super Admin",
  preselectedBusinessId,
  preselectedBusinessName,
}: RegisterAnalyticsModalProps) {
  const [eventType, setEventType] = useState<AnalyticsEventType>("view");
  const [businessName, setBusinessName] = useState(preselectedBusinessName || "");
  const [businessId, setBusinessId] = useState(preselectedBusinessId || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [city, setCity] = useState("Addis Ababa");
  const [country, setCountry] = useState("Ethiopia");
  const [device, setDevice] = useState<AnalyticsDeviceType>("mobile");
  const [visitorName, setVisitorName] = useState("Local Customer");
  const [duration, setDuration] = useState<number>(45);
  const [batchCount, setBatchCount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if preselected props change
  React.useEffect(() => {
    if (preselectedBusinessName) setBusinessName(preselectedBusinessName);
    if (preselectedBusinessId) setBusinessId(preselectedBusinessId);
  }, [preselectedBusinessName, preselectedBusinessId]);

  const EVENT_OPTIONS: Array<{
    type: AnalyticsEventType;
    label: string;
    icon: React.ReactNode;
    color: string;
    description: string;
  }> = [
    {
      type: "view",
      label: "Profile View",
      icon: <Eye className="w-4 h-4 text-sky-500" />,
      color: "border-sky-500/30 bg-sky-500/5 hover:border-sky-500",
      description: "Customer viewed business profile",
    },
    {
      type: "search",
      label: "Discovery Search",
      icon: <Search className="w-4 h-4 text-blue-500" />,
      color: "border-blue-500/30 bg-blue-500/5 hover:border-blue-500",
      description: "Search keyword query logged",
    },
    {
      type: "click_phone",
      label: "Phone Inquiry",
      icon: <Phone className="w-4 h-4 text-emerald-500" />,
      color: "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500",
      description: "Customer clicked Call button",
    },
    {
      type: "click_direction",
      label: "GPS Navigation",
      icon: <Navigation className="w-4 h-4 text-amber-500" />,
      color: "border-amber-500/30 bg-amber-500/5 hover:border-amber-500",
      description: "Directions requested to location",
    },
    {
      type: "click_website",
      label: "Website Click",
      icon: <Globe className="w-4 h-4 text-indigo-500" />,
      color: "border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500",
      description: "Outbound link to company site",
    },
    {
      type: "favorite",
      label: "Saved Favorite",
      icon: <Bookmark className="w-4 h-4 text-rose-500" />,
      color: "border-rose-500/30 bg-rose-500/5 hover:border-rose-500",
      description: "Added to user bookmarks",
    },
    {
      type: "ad_click",
      label: "Sponsored Ad Click",
      icon: <Megaphone className="w-4 h-4 text-purple-500" />,
      color: "border-purple-500/30 bg-purple-500/5 hover:border-purple-500",
      description: "Interaction from paid spotlight",
    },
    {
      type: "share",
      label: "Social Share",
      icon: <Share2 className="w-4 h-4 text-teal-500" />,
      color: "border-teal-500/30 bg-teal-500/5 hover:border-teal-500",
      description: "Shared listing with contacts",
    },
  ];

  const handleSelectPreset = (
    type: AnalyticsEventType,
    bName: string,
    term: string,
    c: string,
    count = 1
  ) => {
    setEventType(type);
    if (bName) setBusinessName(bName);
    if (term) setSearchTerm(term);
    if (c) setCity(c);
    setBatchCount(count);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (eventType !== "search" && !businessName.trim()) {
      toast.error("Please enter or select a business name for this event.");
      return;
    }

    if (eventType === "search" && !searchTerm.trim()) {
      toast.error("Please enter a search term for discovery query.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        eventType,
        businessId: businessId || undefined,
        businessName: businessName.trim() || undefined,
        searchTerm: searchTerm.trim() || undefined,
        city: city.trim() || "Addis Ababa",
        country: country.trim() || "Ethiopia",
        device,
        userName: visitorName.trim() || "Local Customer",
        duration: eventType === "view" ? Number(duration) || 30 : undefined,
        registeredBy: currentAdminName,
        batchCount: Number(batchCount) || 1,
      };

      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register analytics event");
      }

      const totalRegistered = data.count || 1;
      toast.success(
        totalRegistered > 1
          ? `Successfully registered ${totalRegistered} analytics events to the database!`
          : `Analytics event successfully logged to live database!`
      );

      onAnalyticsRegistered(data.data);
      onClose();

      // Reset form
      if (!preselectedBusinessName) {
        setBusinessName("");
        setBusinessId("");
      }
      setSearchTerm("");
      setBatchCount(1);
    } catch (err: any) {
      console.error("Register analytics error:", err);
      toast.error(err.message || "Failed to register analytics event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl bg-card border border-border shadow-2xl">
        {/* Header with decorative gradient banner */}
        <div className="relative p-6 bg-gradient-to-r from-primary/15 via-indigo-500/10 to-transparent border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                Register Real Analytics Event
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold">
                  Telemetry Engine
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Record real customer interactions, simulated traffic bursts, or discovery queries directly to the database.
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Presets */}
          <div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Quick Action Presets
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(
                    "view",
                    "Bole Medhanialem Pharmacy",
                    "",
                    "Addis Ababa",
                    1
                  )
                }
                className="p-2.5 rounded-2xl border border-border bg-background hover:bg-muted/50 text-left transition-all group"
              >
                <div className="text-xs font-bold text-foreground group-hover:text-primary flex items-center gap-1">
                  <Eye className="w-3 h-3 text-sky-500" /> Profile View
                </div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">Bole Pharmacy</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(
                    "search",
                    "",
                    "luxury hotel near bole airport",
                    "Addis Ababa",
                    1
                  )
                }
                className="p-2.5 rounded-2xl border border-border bg-background hover:bg-muted/50 text-left transition-all group"
              >
                <div className="text-xs font-bold text-foreground group-hover:text-primary flex items-center gap-1">
                  <Search className="w-3 h-3 text-blue-500" /> Hotel Query
                </div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">Airport luxury hotel</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(
                    "click_phone",
                    "Kategna Traditional Restaurant",
                    "",
                    "Addis Ababa",
                    1
                  )
                }
                className="p-2.5 rounded-2xl border border-border bg-background hover:bg-muted/50 text-left transition-all group"
              >
                <div className="text-xs font-bold text-foreground group-hover:text-primary flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-500" /> Direct Call
                </div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">Kategna Restaurant</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(
                    "view",
                    "Tomoca Coffee Piazza",
                    "",
                    "Addis Ababa",
                    25
                  )
                }
                className="p-2.5 rounded-2xl border border-border bg-background hover:bg-muted/50 text-left transition-all group"
              >
                <div className="text-xs font-bold text-foreground group-hover:text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-500" /> Traffic Burst
                </div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">+25 Views (Pagination)</div>
              </button>
            </div>
          </div>

          {/* Event Type Grid */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-2">
              Select Event Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EVENT_OPTIONS.map((opt) => {
                const isSelected = eventType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setEventType(opt.type)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                        : "border-border/70 bg-background hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="p-1.5 rounded-xl bg-card border border-border shadow-xs">
                        {opt.icon}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">{opt.label}</div>
                      <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
                        {opt.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Business or Search Term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Target Business / Listing
                {eventType !== "search" && <span className="text-rose-500 ml-0.5">*</span>}
              </label>
              {businessesList && businessesList.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={businessId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setBusinessId(id);
                      const found = businessesList.find((b) => b.id === id);
                      if (found) setBusinessName(found.name);
                    }}
                    className="w-full text-xs rounded-xl bg-background border border-border p-2.5 font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="">Select a registered business...</option>
                    {businessesList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Or type custom business name..."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                </div>
              ) : (
                <Input
                  placeholder="e.g. Bole Medhanialem Pharmacy"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="text-xs rounded-xl"
                  required={eventType !== "search"}
                />
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Search Query / Keyword {eventType === "search" && <span className="text-rose-500">*</span>}
              </label>
              <Input
                placeholder="e.g. traditional coffee shop or 24hr pharmacy"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs rounded-xl"
                required={eventType === "search"}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Keywords populate the Discovery Search Analytics table.
              </p>
            </div>
          </div>

          {/* Location & Device */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                City / Location
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs rounded-xl bg-background border border-border p-2.5 font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="Addis Ababa">Addis Ababa, Ethiopia</option>
                <option value="Hawassa">Hawassa, Ethiopia</option>
                <option value="Dire Dawa">Dire Dawa, Ethiopia</option>
                <option value="Bahir Dar">Bahir Dar, Ethiopia</option>
                <option value="Bishoftu">Bishoftu, Ethiopia</option>
                <option value="Nairobi">Nairobi, Kenya</option>
                <option value="Mombasa">Mombasa, Kenya</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Device / Platform
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(["mobile", "desktop", "tablet"] as AnalyticsDeviceType[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDevice(d)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold capitalize transition-all flex flex-col items-center gap-1 ${
                      device === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d === "mobile" && <Smartphone className="w-3.5 h-3.5" />}
                    {d === "desktop" && <Laptop className="w-3.5 h-3.5" />}
                    {d === "tablet" && <Tablet className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{d}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Batch Burst Count (1-100)
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={batchCount}
                onChange={(e) => setBatchCount(Number(e.target.value) || 1)}
                className="text-xs rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Add {batchCount} events at once to advance pagination!
              </p>
            </div>
          </div>

          {/* Visitor Name & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Visitor / Customer Tag
              </label>
              <Input
                placeholder="e.g. Local Visitor, Hanna G., Abebe T."
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Session Dwell Duration (seconds)
              </label>
              <Input
                type="number"
                min={5}
                max={600}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 30)}
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Logging as: <strong className="text-foreground">{currentAdminName}</strong>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-xs font-semibold rounded-xl"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="gradient"
                disabled={isSubmitting}
                className="text-xs font-bold gap-1.5 rounded-xl shadow-md shadow-primary/20"
              >
                {isSubmitting ? (
                  <>Registering Event...</>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    Register {batchCount > 1 ? `${batchCount} Events` : "Event"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
