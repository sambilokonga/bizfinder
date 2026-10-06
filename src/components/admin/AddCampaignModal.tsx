"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Megaphone, CheckCircle2 } from "lucide-react";

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
}

export function AddCampaignModal({
  isOpen,
  onClose,
  onAddCampaign,
}: AddCampaignModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [placement, setPlacement] = useState<AdminAdCampaign["placement"]>("search_top");
  const [targetLocation, setTargetLocation] = useState("Addis Ababa");
  const [dailyBudgetETB, setDailyBudgetETB] = useState(500);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !campaignName.trim()) return;

    const newCampaign: AdminAdCampaign = {
      id: `camp-${Date.now()}`,
      businessName: businessName.trim(),
      name: campaignName.trim(),
      placement,
      targetLocation: targetLocation.trim(),
      dailyBudgetETB: Number(dailyBudgetETB),
      totalSpentETB: 0,
      impressions: 0,
      clicks: 0,
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
    };

    onAddCampaign(newCampaign);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setBusinessName("");
      setCampaignName("");
      onClose();
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 bg-card border-border rounded-3xl">
        <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <span>Launch Sponsored Campaign</span>
        </DialogTitle>

        {isSaved ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-sm text-foreground">
              Campaign Created & Activated!
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div>
              <label className="font-bold text-foreground block mb-1">
                Target Business Name
              </label>
              <Input
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Kategna Ethiopian Restaurant"
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">
                Campaign Title
              </label>
              <Input
                required
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
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="gradient">
                Launch Campaign
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
