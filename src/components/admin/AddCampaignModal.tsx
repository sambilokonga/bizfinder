"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Megaphone, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export interface AdminAdCampaign {
  id: string;
  businessName: string;
  name: string;
  placement: "search_top" | "home_hero" | "category_spotlight" | "map_highlight";
  targetLocation: string;
  dailyBudgetETB: number;
  totalSpentETB: number;
  impressions: number;
  clicks: number;
  status: "active" | "paused" | "scheduled" | "completed";
  startDate: string;
}

interface AddCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCampaign: (campaign: AdminAdCampaign) => void;
  cityName?: string;
  countryName?: string;
}

export function AddCampaignModal({
  isOpen,
  onClose,
  onAddCampaign,
  cityName,
  countryName,
}: AddCampaignModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [placement, setPlacement] = useState<AdminAdCampaign["placement"]>("search_top");
  const [targetLocation, setTargetLocation] = useState(cityName || "Addis Ababa");
  const [dailyBudgetETB, setDailyBudgetETB] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cityName) {
      setTargetLocation(cityName);
    }
  }, [cityName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !campaignName.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      businessName: businessName.trim(),
      name: campaignName.trim(),
      placement,
      targetLocation: targetLocation.trim() || cityName || "All Locations",
      dailyBudgetETB: Number(dailyBudgetETB) || 500,
      durationDays: 30,
      startDate: new Date().toISOString().split("T")[0],
      cityName: cityName || targetLocation.trim(),
      countryName: countryName || "",
    };

    try {
      const res = await fetch("/api/admin/ads/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data?.success && data.campaign) {
        const c = data.campaign;
        const newCampaign: AdminAdCampaign = {
          id: c.id,
          businessName: c.businessName,
          name: c.name,
          placement: c.placement,
          targetLocation: c.targetLocation,
          dailyBudgetETB: c.dailyBudgetETB,
          totalSpentETB: c.totalSpentETB || 0,
          impressions: c.impressions || 0,
          clicks: c.clicks || 0,
          status: c.status || "active",
          startDate: c.startDate || payload.startDate,
        };

        onAddCampaign(newCampaign);
        setIsSaved(true);
        setTimeout(() => {
          setIsSaved(false);
          setBusinessName("");
          setCampaignName("");
          onClose();
        }, 800);
      } else {
        setErrorMsg(data?.error || "Failed to create campaign in database.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error registering campaign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md p-6 bg-card border-border rounded-3xl">
        <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <span>Launch Sponsored Campaign</span>
        </DialogTitle>

        {isSaved ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-sm text-foreground">
              Campaign Created & Registered in Database!
            </h4>
            <p className="text-xs text-muted-foreground">
              Live and synchronized across dashboards.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="font-bold text-foreground block mb-1">
                Target Business Name <span className="text-destructive">*</span>
              </label>
              <Input
                required
                disabled={isSubmitting}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Kategna Ethiopian Restaurant"
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">
                Campaign Title <span className="text-destructive">*</span>
              </label>
              <Input
                required
                disabled={isSubmitting}
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Meskel Holiday Dining Rush Promo"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Ad Placement
                </label>
                <select
                  disabled={isSubmitting}
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value as any)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="search_top">Search Top #1 Sponsor</option>
                  <option value="home_hero">Home Hero Banner</option>
                  <option value="category_spotlight">Category Spotlight</option>
                  <option value="map_highlight">Map Pin Highlight</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Target Location
                </label>
                <Input
                  required
                  disabled={isSubmitting}
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  placeholder="e.g. Bole, Addis Ababa"
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">
                Daily Budget (ETB)
              </label>
              <Input
                type="number"
                min="100"
                step="50"
                disabled={isSubmitting}
                value={dailyBudgetETB}
                onChange={(e) => setDailyBudgetETB(Number(e.target.value))}
                className="text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="gradient"
                disabled={isSubmitting}
                className="gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Launch Campaign</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
