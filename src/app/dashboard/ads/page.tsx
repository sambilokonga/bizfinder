"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Crown,
  CheckCircle2,
  MapPin,
  Search,
  Eye,
  MousePointerClick,
  Plus,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  BarChart3,
  Target,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PaymentCheckoutModal } from "@/components/ads/PaymentCheckoutModal";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface AdCampaign {
  id: string;
  name: string;
  businessName: string;
  placement: "search_top" | "home_hero" | "category_spotlight" | "map_highlight";
  targetLocation: string;
  dailyBudgetETB: number;
  totalSpentETB: number;
  impressions: number;
  clicks: number;
  status: "active" | "paused" | "scheduled";
  startDate: string;
}

const AD_PERFORMANCE_DATA = [
  { date: "Mon", impressions: 1840, clicks: 142 },
  { date: "Tue", impressions: 2450, clicks: 198 },
  { date: "Wed", impressions: 3120, clicks: 276 },
  { date: "Thu", impressions: 2980, clicks: 240 },
  { date: "Fri", impressions: 4200, clicks: 385 },
  { date: "Sat", impressions: 5600, clicks: 512 },
  { date: "Sun", impressions: 4900, clicks: 430 },
];

export default function SponsoredAdsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"plans" | "campaigns" | "create">("plans");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({
    name: "Pro Verified Listing",
    usd: 19,
    etb: 2200,
  });

  // Campaign Creator State
  const [campaignName, setCampaignName] = useState("");
  const [placement, setPlacement] = useState<
    "search_top" | "home_hero" | "category_spotlight" | "map_highlight"
  >("search_top");
  const [targetLocation, setTargetLocation] = useState("Bole Sub-City (All Districts)");
  const [dailyBudget, setDailyBudget] = useState(500); // ETB
  const [durationDays, setDurationDays] = useState(14);

  // Active Campaigns State
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([
    {
      id: "camp-1",
      name: "Bole Gourmet Lunch Rush Spotlight",
      businessName: "Kategna Ethiopian Restaurant",
      placement: "search_top",
      targetLocation: "Bole Sub-City",
      dailyBudgetETB: 500,
      totalSpentETB: 4200,
      impressions: 18420,
      clicks: 1680,
      status: "active",
      startDate: "2024-06-10",
    },
    {
      id: "camp-2",
      name: "Weekend Special Home Hero Banner",
      businessName: "Kategna Ethiopian Restaurant",
      placement: "home_hero",
      targetLocation: "Addis Ababa (All Sub-Cities)",
      dailyBudgetETB: 1000,
      totalSpentETB: 7000,
      impressions: 34100,
      clicks: 2950,
      status: "active",
      startDate: "2024-06-15",
    },
  ]);

  // Fetch real campaigns from API on mount
  React.useEffect(() => {
    fetch("/api/ads/campaigns")
      .then((res) => res.json())
      .then((data) => {
        if (data.campaigns && data.campaigns.length > 0) {
          setCampaigns(data.campaigns);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleCampaignStatus = (id: string) => {
    const target = campaigns.find((c) => c.id === id);
    const nextStatus = target?.status === "active" ? "paused" : "active";

    fetch(`/api/ads/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    }).catch(() => {});

    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: nextStatus } : c
      )
    );
  };

  const handleOpenCheckout = (planName: string, usd: number, etb: number) => {
    const finalEtb = billingCycle === "yearly" ? etb * 10 : etb;
    const finalUsd = billingCycle === "yearly" ? usd * 10 : usd;
    setSelectedPlan({ name: planName, usd: finalUsd, etb: finalEtb });
    setIsCheckoutOpen(true);
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) return;

    handleOpenCheckout(
      `Sponsored Campaign: ${campaignName}`,
      Math.round((dailyBudget * durationDays) / 115),
      dailyBudget * durationDays
    );
  };

  const handlePaymentSuccess = async (txId: string) => {
    if (campaignName.trim()) {
      const newCamp: AdCampaign = {
        id: `camp-${Date.now()}`,
        name: campaignName.trim(),
        businessName: "Kategna Ethiopian Restaurant",
        placement,
        targetLocation,
        dailyBudgetETB: dailyBudget,
        totalSpentETB: dailyBudget * durationDays,
        impressions: 0,
        clicks: 0,
        status: "active",
        startDate: new Date().toISOString().split("T")[0],
      };

      try {
        await fetch("/api/ads/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: "biz-1",
            businessName: "Kategna Ethiopian Restaurant",
            name: campaignName.trim(),
            placement,
            targetLocation,
            dailyBudgetETB: dailyBudget,
            durationDays,
            startDate: newCamp.startDate,
          }),
        });
      } catch (err) {}

      setCampaigns((prev) => [newCamp, ...prev]);
      setCampaignName("");
      setActiveTab("campaigns");
    } else {
      // Plan enrollment
      try {
        await fetch("/api/ads/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: "biz-1",
            tier: selectedPlan.name.toLowerCase().includes("spotlight") ? "spotlight" : "pro",
            billingCycle,
            amountETB: selectedPlan.etb,
            amountUSD: selectedPlan.usd,
            txId,
            provider: "telebirr",
          }),
        });
      } catch (err) {}
    }
  };

  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const avgCTR =
    totalImpressions > 0
      ? ((totalClicks / totalImpressions) * 100).toFixed(1)
      : "8.9";

  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-950/50 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Owner Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Crown className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Sponsored Ads & Monetization Engine
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Supercharge your business visibility with prioritized search rankings, top-of-page featured banners, and targeted local customer reach.
            </p>
          </div>

          {/* Tab Switcher & Theme */}
          <div className="flex items-center gap-3">
            <ThemeToggle variant="pill" />
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-border">
              <button
                onClick={() => setActiveTab("plans")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "plans"
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Subscription Tiers
              </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "campaigns"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active Ads ({campaigns.length})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === "create"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-primary hover:bg-primary/10"
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Launch Ad Campaign
            </button>
          </div>
        </div>
      </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 1: SUBSCRIPTION PLANS                                  */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === "plans" && (
          <div className="space-y-8">
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-3">
              <span
                className={`text-xs font-bold ${
                  billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Monthly Billing
              </span>
              <button
                onClick={() =>
                  setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
                }
                className={`w-12 h-6.5 rounded-full transition-all relative p-0.5 ${
                  billingCycle === "yearly" ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transition-transform ${
                    billingCycle === "yearly" ? "translate-x-5.5" : "translate-x-0"
                  }`}
                />
              </button>
              <span
                className={`text-xs font-bold flex items-center gap-1 ${
                  billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Annual Billing{" "}
                <Badge variant="success" className="text-[9px] py-0 px-1.5">
                  Save 20%
                </Badge>
              </span>
            </div>

            {/* 3 Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan 1: Starter */}
              <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">
                      Basic Presence
                    </Badge>
                    <h3 className="text-xl font-black text-foreground mt-2">
                      Starter Free
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Essential presence on the BizFinder local business directory.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground">0 ETB</span>
                    <span className="text-xs text-muted-foreground font-semibold">/ month</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Standard directory listing</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Opening hours & contact details</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Leaflet map pin placement</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-50">
                      <span className="w-4 h-4 text-center">✕</span>
                      <span>Verified merchant checkmark</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-50">
                      <span className="w-4 h-4 text-center">✕</span>
                      <span>Search results prioritization</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" disabled className="w-full font-bold text-xs">
                  Current Free Plan
                </Button>
              </div>

              {/* Plan 2: Pro Verified (Featured) */}
              <div className="p-6 sm:p-8 rounded-3xl border-2 border-primary bg-gradient-to-b from-primary/5 via-card to-card shadow-xl space-y-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-12 top-6 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider py-1 px-12 rotate-45 shadow-md">
                  Most Popular
                </div>

                <div className="space-y-4">
                  <div>
                    <Badge variant="default" className="text-[10px] uppercase font-bold">
                      Verified Growth
                    </Badge>
                    <h3 className="text-xl font-black text-foreground mt-2">
                      Pro Verified
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Verified blue checkmark and prioritized ranking for growing businesses.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary">
                      {billingCycle === "yearly" ? "22,000" : "2,200"} ETB
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      / {billingCycle === "yearly" ? "year" : "month"}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>Official Verified Merchant Blue Badge</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>2x Priority search ranking boost</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>Direct WhatsApp & One-Click Call buttons</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>Full photo menu & YouTube tour embeds</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>Official management reply to all reviews</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="gradient"
                  onClick={() => handleOpenCheckout("Pro Verified Plan", 19, 2200)}
                  className="w-full font-bold text-xs shadow-md shadow-indigo-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Upgrade to Pro Verified
                </Button>
              </div>

              {/* Plan 3: Spotlight Master */}
              <div className="p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 via-card to-card shadow-sm space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <Badge variant="warning" className="text-[10px] uppercase font-bold">
                      Maximum Exposure
                    </Badge>
                    <h3 className="text-xl font-black text-foreground mt-2 flex items-center gap-1.5">
                      Spotlight Master <Crown className="w-4 h-4 text-amber-500" />
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Top-of-page search ad slots, home page feature showcase & competitor conquesting protection.
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                      {billingCycle === "yearly" ? "58,000" : "5,800"} ETB
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      / {billingCycle === "yearly" ? "year" : "month"}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Top 1 "Sponsored Listing" search slot</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Home Page Spotlight Hero Carousel</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Golden Crown Map Pin on Leaflet Map</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Competitor conquesting protection</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Full Recharts conversion funnel metrics</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleOpenCheckout("Spotlight Master Plan", 49, 5800)}
                  className="w-full font-bold text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                >
                  <Crown className="w-3.5 h-3.5 mr-1.5" /> Get Spotlight Master
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 2: ACTIVE CAMPAIGNS & RECHARTS PERFORMANCE             */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl border border-border bg-card shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Total Ad Impressions
                </span>
                <div className="text-2xl font-black text-foreground mt-2">
                  {totalImpressions.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +24% vs last week
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-border bg-card shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Sponsored Ad Clicks
                </span>
                <div className="text-2xl font-black text-primary mt-2">
                  {totalClicks.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground font-semibold mt-1">
                  Direct visits & phone calls
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-border bg-card shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Average Click-Through (CTR)
                </span>
                <div className="text-2xl font-black text-indigo-600 mt-2">
                  {avgCTR}%
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">
                  High engagement rate
                </div>
              </div>

              <div className="p-5 rounded-3xl border border-border bg-card shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Active Ad Slots
                </span>
                <div className="text-2xl font-black text-amber-600 mt-2">
                  {campaigns.filter((c) => c.status === "active").length} Active
                </div>
                <div className="text-xs text-muted-foreground font-semibold mt-1">
                  Across Search & Home
                </div>
              </div>
            </div>

            {/* Recharts Area Performance Graph */}
            <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                    Sponsored Ad Impressions vs Clicks (Last 7 Days)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Live delivery performance across all active placements
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-indigo-600">
                    <span className="w-3 h-3 rounded-full bg-indigo-600" /> Impressions
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <span className="w-3 h-3 rounded-full bg-amber-500" /> Clicks
                  </span>
                </div>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={AD_PERFORMANCE_DATA}>
                    <defs>
                      <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="impressions"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorImp)"
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorClicks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Active Sponsored Campaigns
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Manage budget, targeting location, and real-time delivery
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => setActiveTab("create")}
                  className="font-bold text-xs gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> New Campaign
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold uppercase">
                      <th className="pb-3">Campaign & Placement</th>
                      <th className="pb-3">Target Location</th>
                      <th className="pb-3">Daily Budget</th>
                      <th className="pb-3">Impressions</th>
                      <th className="pb-3">Clicks</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {campaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-accent/40 transition-colors">
                        <td className="py-3.5">
                          <div className="font-bold text-foreground">{camp.name}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Badge variant="outline" className="text-[9px] py-0 capitalize">
                              {camp.placement.replace("_", " ")}
                            </Badge>
                            <span>Started {camp.startDate}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-muted-foreground">
                          {camp.targetLocation}
                        </td>
                        <td className="py-3.5 font-mono font-semibold text-foreground">
                          {camp.dailyBudgetETB} ETB/day
                        </td>
                        <td className="py-3.5 font-mono font-bold text-foreground">
                          {camp.impressions.toLocaleString()}
                        </td>
                        <td className="py-3.5 font-mono font-bold text-primary">
                          {camp.clicks.toLocaleString()}
                        </td>
                        <td className="py-3.5">
                          <Badge
                            variant={camp.status === "active" ? "success" : "secondary"}
                            className="text-[10px] font-bold capitalize"
                          >
                            {camp.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleCampaignStatus(camp.id)}
                            className="h-7 text-[11px] font-bold gap-1"
                          >
                            {camp.status === "active" ? (
                              <>
                                <Pause className="w-3 h-3" /> Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" /> Resume
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* TAB 3: SPONSORED CAMPAIGN CREATOR                          */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeTab === "create" && (
          <form
            onSubmit={handleCreateCampaignSubmit}
            className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl mx-auto"
          >
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Launch Sponsored Ad Campaign
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure your target location, placement slot, and daily budget.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Campaign Name
                </label>
                <Input
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Bole Prime Dinner Rush Promo"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-2">
                  Sponsored Placement Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPlacement("search_top")}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      placement === "search_top"
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                        : "border-border bg-slate-50 dark:bg-slate-900"
                    }`}
                  >
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-indigo-500" />
                      Search Top Sponsored Slot
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Appears as the #1 promoted card above organic search results.
                    </p>
                  </div>

                  <div
                    onClick={() => setPlacement("home_hero")}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      placement === "home_hero"
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                        : "border-border bg-slate-50 dark:bg-slate-900"
                    }`}
                  >
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-500" />
                      Home Hero Carousel
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Featured spotlight on the main BizFinder home landing page.
                    </p>
                  </div>

                  <div
                    onClick={() => setPlacement("category_spotlight")}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      placement === "category_spotlight"
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                        : "border-border bg-slate-50 dark:bg-slate-900"
                    }`}
                  >
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-500" />
                      Category Hub Badge
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Pin at top of dining/shopping category hub pages.
                    </p>
                  </div>

                  <div
                    onClick={() => setPlacement("map_highlight")}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      placement === "map_highlight"
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                        : "border-border bg-slate-50 dark:bg-slate-900"
                    }`}
                  >
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      Golden Map Pin Highlight
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Golden crown pin standout on Leaflet map.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Geo-Targeted Subcity / District
                </label>
                <select
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Bole Sub-City (All Districts)">Bole Sub-City (All Districts)</option>
                  <option value="Kazanchis & Kirkos">Kazanchis & Kirkos</option>
                  <option value="Piassa & Arada">Piassa & Arada</option>
                  <option value="Sarbet & Old Airport">Sarbet & Old Airport</option>
                  <option value="CMC & Ayat">CMC & Ayat</option>
                  <option value="Addis Ababa (Entire Metro)">Addis Ababa (Entire Metro)</option>
                  <option value="Nairobi Westlands & Kilimani">Nairobi Westlands & Kilimani</option>
                </select>
              </div>

              {/* Budget Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground">Daily Ad Spend Budget</label>
                  <span className="font-mono font-black text-sm text-primary">
                    {dailyBudget.toLocaleString()} ETB / day (~${Math.round(dailyBudget / 115)} USD)
                  </span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={3000}
                  step={100}
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Estimated Impressions: ~{((dailyBudget / 10) * 120).toLocaleString()} / day</span>
                  <span>Estimated Clicks: ~{Math.round((dailyBudget / 10) * 8.5)} / day</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Campaign Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDurationDays(days)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        durationDays === days
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-slate-50 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {days} Days ({(dailyBudget * days).toLocaleString()} ETB)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab("campaigns")}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" size="sm" className="font-bold gap-1.5 shadow-md">
                <Zap className="w-3.5 h-3.5 fill-current" /> Proceed to Checkout ({(dailyBudget * durationDays).toLocaleString()} ETB)
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        planName={selectedPlan.name}
        amountUSD={selectedPlan.usd}
        amountETB={selectedPlan.etb}
        billingCycle={billingCycle}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
