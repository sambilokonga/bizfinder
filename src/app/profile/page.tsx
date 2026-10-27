"use client";

import React, { useState } from "react";
import {
  User,
  Settings,
  Bell,
  Globe,
  Shield,
  MapPin,
  Pencil,
  CheckCircle2,
  Languages,
  ChevronRight,
  Tag,
  Heart,
  Bookmark,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useSavedBusinesses } from "@/hooks/useSavedBusinesses";

const INTEREST_CATEGORIES = [
  { emoji: "🍽️", label: "Restaurants" },
  { emoji: "☕", label: "Cafes" },
  { emoji: "🏥", label: "Healthcare" },
  { emoji: "🛍️", label: "Shopping" },
  { emoji: "💇", label: "Beauty & Spa" },
  { emoji: "🔧", label: "Auto Services" },
  { emoji: "🏋️", label: "Fitness" },
  { emoji: "🎓", label: "Education" },
  { emoji: "🏨", label: "Hotels" },
  { emoji: "💼", label: "Professional Services" },
  { emoji: "🎉", label: "Events & Entertainment" },
  { emoji: "📚", label: "Bookshops" },
];

const CITIES = ["Addis Ababa", "Nairobi", "Kampala", "Dar es Salaam", "Kigali"];
const DISTANCE_OPTIONS = ["1 km", "3 km", "5 km", "10 km", "25 km", "50 km"];

export default function ProfilePage() {
  const { user } = useUser();
  const { totalSaved, favoritesList } = useSavedBusinesses();

  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "notifications" | "privacy"
  >("profile");

  // Profile state
  const [displayName, setDisplayName] = useState(user?.fullName || "");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("Addis Ababa");
  const [isSaved, setIsSaved] = useState(false);

  // Preferences
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Restaurants",
    "Cafes",
  ]);
  const [defaultRadius, setDefaultRadius] = useState("5 km");
  const [preferOpenNow, setPreferOpenNow] = useState(true);
  const [language, setLanguage] = useState("English");

  // Notifications
  const [notifNewReviews, setNotifNewReviews] = useState(true);
  const [notifPromos, setNotifPromos] = useState(false);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(true);
  const [notifClaimsUpdates, setNotifClaimsUpdates] = useState(true);

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleSaveProfile = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-950/50 min-h-screen py-3 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 lg:space-y-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 pb-4 sm:pb-5 border-b border-border">
          {/* Avatar + name row */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-base sm:text-xl lg:text-2xl font-black shadow-lg">
                {user?.firstName?.charAt(0) || "U"}
              </div>
              <button className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 sm:w-6 sm:h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Pencil className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl lg:text-2xl font-black text-foreground tracking-tight truncate">
                {user?.fullName || "Your Profile"}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">
                {user?.primaryEmailAddress?.emailAddress || "Manage your BizFinder account"}
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex items-center divide-x divide-border rounded-xl border border-border bg-slate-100/70 dark:bg-slate-900/70 overflow-hidden">
            {[
              { icon: Bookmark, label: "Saved", value: totalSaved.toString() },
              { icon: Star, label: "Reviews", value: "0" },
              { icon: Heart, label: "Favorites", value: favoritesList.length.toString() },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex-1 flex flex-col items-center py-2 sm:py-2.5 gap-0.5">
                <span className="text-sm sm:text-base font-black text-foreground">{value}</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold flex items-center gap-0.5">
                  <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab Bar ────────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 sm:gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-border overflow-x-auto no-scrollbar">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "preferences", label: "Preferences", icon: Settings },
            { id: "notifications", label: "Alerts", icon: Bell },
            { id: "privacy", label: "Privacy", icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                activeTab === id
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Profile ──────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-5 lg:p-7 space-y-4 shadow-sm">
            <h2 className="text-xs sm:text-sm font-bold text-foreground">
              Public Profile Information
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-foreground block mb-1">
                    Display Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-foreground block mb-1">
                    City / Location
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-8 sm:h-9 rounded-xl border border-input bg-background px-2.5 sm:px-3 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] sm:text-xs font-bold text-foreground block mb-1">
                  Bio <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the community about yourself..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="gradient"
                  onClick={handleSaveProfile}
                  className="h-7 sm:h-8 text-[11px] sm:text-xs font-bold gap-1.5 px-3 sm:px-4"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Saved!
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </div>

            {/* Linked Account */}
            <div className="pt-3.5 sm:pt-5 border-t border-border">
              <h3 className="text-[9px] sm:text-[10px] font-bold text-foreground mb-2 uppercase tracking-widest text-muted-foreground">
                Linked Account
              </h3>
              <div className="flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border gap-2">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-bold text-foreground truncate">
                      Clerk Authentication
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                      {user?.primaryEmailAddress?.emailAddress || "Connected"}
                    </p>
                  </div>
                </div>
                <Badge variant="success" className="text-[9px] sm:text-[10px] font-bold shrink-0 px-1.5">
                  Connected
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Preferences ──────────────────────────────────── */}
        {activeTab === "preferences" && (
          <div className="space-y-3.5 sm:space-y-5">
            {/* Category Interests */}
            <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-5 lg:p-6 shadow-sm space-y-3">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500" />
                  Category Interests
                </h2>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
                  Select your interests to personalise recommendations
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_CATEGORIES.map(({ emoji, label }) => (
                  <button
                    key={label}
                    onClick={() => toggleInterest(label)}
                    className={`flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold border transition-all ${
                      selectedInterests.includes(label)
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                        : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-xs">{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Defaults */}
            <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-5 lg:p-6 shadow-sm space-y-3.5">
              <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500" />
                Search Defaults
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-foreground block mb-1.5">
                    Default Search Radius
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DISTANCE_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDefaultRadius(d)}
                        className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold border transition-all ${
                          defaultRadius === d
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-foreground block">
                    Search Filters
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => setPreferOpenNow(!preferOpenNow)}
                      className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 ${
                        preferOpenNow ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          preferOpenNow ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-foreground">
                      Prefer "Open Now" by default
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Display & Language */}
            <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-5 lg:p-6 shadow-sm space-y-3.5">
              <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500" />
                Display & Language
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-foreground block mb-1.5">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-8 sm:h-9 rounded-lg sm:rounded-xl border border-input bg-background px-2.5 sm:px-3 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {["English", "Amharic", "Oromo", "Swahili", "French"].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <Button
                variant="gradient"
                className="h-7 sm:h-8 text-[11px] sm:text-xs font-bold gap-1.5 px-3 sm:px-4 mt-1"
                onClick={handleSaveProfile}
              >
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Save Preferences
              </Button>
            </div>
          </div>
        )}

        {/* ── Tab: Notifications ────────────────────────────────── */}
        {activeTab === "notifications" && (
          <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-5 lg:p-7 shadow-sm space-y-3.5 sm:space-y-5">
            <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
              <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500" />
              Notification Preferences
            </h2>

            <div className="space-y-2.5">
              {[
                {
                  label: "New reviews on saved businesses",
                  sub: "Get notified when a business you saved receives a new review",
                  value: notifNewReviews,
                  set: setNotifNewReviews,
                },
                {
                  label: "Promotions & special offers",
                  sub: "Receive deals and promotional updates from featured businesses",
                  value: notifPromos,
                  set: setNotifPromos,
                },
                {
                  label: "Weekly discovery digest",
                  sub: "A curated weekly email of new businesses and top picks near you",
                  value: notifWeeklyDigest,
                  set: setNotifWeeklyDigest,
                },
                {
                  label: "Claim & ownership updates",
                  sub: "Updates on the status of your business claim verification",
                  value: notifClaimsUpdates,
                  set: setNotifClaimsUpdates,
                },
              ].map(({ label, sub, value, set }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-3 p-2.5 sm:p-3.5 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] sm:text-xs font-bold text-foreground">{label}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                      {sub}
                    </p>
                  </div>
                  <button
                    onClick={() => set(!value)}
                    className={`shrink-0 w-9 sm:w-10 h-5 rounded-full transition-all relative mt-0.5 ${
                      value ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                        value ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Privacy ──────────────────────────────────────── */}
        {activeTab === "privacy" && (
          <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-5 lg:p-7 shadow-sm space-y-3.5 sm:space-y-5">
            <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500" />
              Privacy & Data Settings
            </h2>

            <div className="space-y-2">
              {[
                {
                  label: "Public profile",
                  sub: "Allow others to see your reviews and saved places",
                  icon: User,
                  action: "Manage",
                },
                {
                  label: "Location permissions",
                  sub: "Control how BizFinder uses your GPS location for searches",
                  icon: MapPin,
                  action: "Configure",
                },
                {
                  label: "Download my data",
                  sub: "Export all your saved places, reviews, and preferences",
                  icon: Globe,
                  action: "Export",
                },
                {
                  label: "Delete account",
                  sub: "Permanently remove your account and all associated data",
                  icon: Shield,
                  action: "Delete",
                  danger: true,
                },
              ].map(({ label, sub, icon: Icon, action, danger }) => (
                <div
                  key={label}
                  className={`flex items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl border transition-colors ${
                    danger
                      ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20"
                      : "border-border bg-slate-50/50 dark:bg-slate-900/50"
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        danger
                          ? "bg-red-100 dark:bg-red-950/50 text-red-500"
                          : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-[10px] sm:text-xs font-bold truncate ${
                          danger ? "text-red-600 dark:text-red-400" : "text-foreground"
                        }`}
                      >
                        {label}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {sub}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={danger ? "destructive" : "outline"}
                    className="shrink-0 h-6 sm:h-7 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 gap-0.5 sm:gap-1"
                  >
                    {action}
                    {!danger && <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
