"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Globe,
  Building2,
  Search,
  Share2,
  Bell,
  CreditCard,
  Shield,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Send,
  Download,
  Trash2,
  Layers,
  Sparkles,
  Lock,
  Eye,
  RefreshCw,
  ExternalLink,
  MapPin,
  Sliders,
  Server,
  Mail,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ISystemSettingsData, DEFAULT_SYSTEM_SETTINGS } from "@/types/settings";

interface AdminSettingsViewProps {
  isSuperAdmin: boolean;
  currentRole: string;
  assignedCountry?: string;
  assignedCity?: string;
  initialSubnav?: string;
}

export function AdminSettingsView({
  isSuperAdmin,
  currentRole,
  assignedCountry,
  assignedCity,
  initialSubnav = "general",
}: AdminSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<string>(initialSubnav);
  const [settings, setSettings] = useState<ISystemSettingsData>(DEFAULT_SYSTEM_SETTINGS);
  const [initialSettings, setInitialSettings] = useState<ISystemSettingsData>(DEFAULT_SYSTEM_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Test Email Modal
  const [isTestEmailOpen, setIsTestEmailOpen] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("admin@bizfinder.et");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Reset Defaults Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Fetch settings from API
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data?.settings) {
        setSettings(data.settings);
        setInitialSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      toast.error("Failed to load platform settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update a single setting
  const updateSetting = <K extends keyof ISystemSettingsData>(key: K, value: ISystemSettingsData[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      setHasChanges(JSON.stringify(next) !== JSON.stringify(initialSettings));
      return next;
    });
  };

  // Discard changes
  const handleDiscard = () => {
    setSettings(initialSettings);
    setHasChanges(false);
    toast.info("Unsaved changes discarded.");
  };

  // Save changes to backend
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data?.settings) {
        setSettings(data.settings);
        setInitialSettings(data.settings);
        setHasChanges(false);
        toast.success("Platform settings saved successfully!");
      } else {
        toast.error(data?.error || "Failed to save settings.");
      }
    } catch (err: any) {
      toast.error("Network error while saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger test email
  const handleSendTestEmail = async () => {
    if (!testEmailRecipient.trim()) {
      toast.error("Please provide a valid recipient email.");
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_email", payload: { email: testEmailRecipient } }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Test email sent successfully!");
        setIsTestEmailOpen(false);
      } else {
        toast.error(data.error || "Failed to send test email.");
      }
    } catch {
      toast.error("Network error sending test email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Purge CDN Cache
  const handlePurgeCache = async () => {
    const toastId = toast.loading("Purging CDN and memory cache...");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "purge_cache" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Cache purged successfully!", { id: toastId });
      } else {
        toast.error(data.error || "Cache purge failed.", { id: toastId });
      }
    } catch {
      toast.error("Failed to purge cache.", { id: toastId });
    }
  };

  // Export JSON configuration
  const handleExportConfig = async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export_config" }),
      });
      const data = await res.json();
      if (res.ok && data?.data) {
        const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.data, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", jsonStr);
        downloadAnchor.setAttribute("download", `bizfinder_settings_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success("Settings snapshot downloaded!");
      }
    } catch {
      toast.error("Failed to export settings.");
    }
  };

  // Reset to default factory baseline
  const handleResetDefaults = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });
      const data = await res.json();
      if (res.ok && data?.settings) {
        setSettings(data.settings);
        setInitialSettings(data.settings);
        setHasChanges(false);
        setIsResetModalOpen(false);
        toast.success("Settings restored to factory defaults!");
      } else {
        toast.error(data?.error || "Reset failed.");
      }
    } catch {
      toast.error("Failed to reset settings.");
    } finally {
      setIsResetting(false);
    }
  };

  const tabs = [
    { key: "general", label: "General", icon: Globe },
    { key: "business", label: "Business Rules", icon: Building2 },
    { key: "search", label: "Search & Map", icon: Search },
    { key: "seo", label: "SEO & Social", icon: Share2 },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "payments", label: "Payments", icon: CreditCard, superOnly: true },
    { key: "security", label: "Security & Access", icon: Shield, superOnly: true },
    { key: "maintenance", label: "Maintenance", icon: Server, superOnly: true },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* ─── Header & Scope ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-foreground">Global Platform & Ecosystem Settings</h2>
            {isSuperAdmin ? (
              <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[11px] font-bold">
                👑 Super Admin Root
              </Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[11px] font-bold">
                🛡️ {currentRole.replace("_", " ").toUpperCase()}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure system rules, search parameters, monetization gateways, and real-time environment variables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportConfig}
              className="gap-1.5 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </Button>
          )}
          <Button
            variant="gradient"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="gap-1.5 text-xs font-bold"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* ─── Maintenance Mode Alert Banner ─────────────────────────────────────── */}
      {settings.maintenanceMode && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300 animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <span className="font-bold">MAINTENANCE MODE IS ACTIVATED:</span> Public traffic is currently restricted.
              Message: &ldquo;{settings.maintenanceNotice}&rdquo;
            </div>
          </div>
          {isSuperAdmin && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateSetting("maintenanceMode", false)}
              className="text-xs font-bold shrink-0"
            >
              Deactivate Mode
            </Button>
          )}
        </div>
      )}

      {/* ─── Subnav Tab Bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-card/80 backdrop-blur border border-border rounded-2xl shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const isRestricted = tab.superOnly && !isSuperAdmin;

          return (
            <button
              key={tab.key}
              onClick={() => !isRestricted && setActiveTab(tab.key)}
              disabled={isRestricted}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : isRestricted
                  ? "opacity-40 cursor-not-allowed text-muted-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.superOnly && !isSuperAdmin && <Lock className="w-3 h-3 text-muted-foreground" />}
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          1. GENERAL & PLATFORM IDENTITY
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-500" />
              <h3 className="font-bold text-foreground text-sm">Platform Brand & Identity</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Platform Brand Name</label>
                <Input
                  value={settings.platformName}
                  onChange={(e) => updateSetting("platformName", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Public Slogan / Tagline</label>
                <Input
                  value={settings.tagline}
                  onChange={(e) => updateSetting("tagline", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Primary Canonical Domain</label>
                <Input
                  value={settings.siteUrl}
                  onChange={(e) => updateSetting("siteUrl", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-foreground text-sm">Official Contact & Support</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Public Inquiries Email</label>
                <Input
                  value={settings.contactEmail}
                  onChange={(e) => updateSetting("contactEmail", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">System Administrator Email</label>
                <Input
                  value={settings.adminEmail}
                  onChange={(e) => updateSetting("adminEmail", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Hotline Phone Support</label>
                <Input
                  value={settings.supportPhone}
                  onChange={(e) => updateSetting("supportPhone", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-500" />
              <h3 className="font-bold text-foreground text-sm">Regional & Locale Defaults</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Default Currency</label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => updateSetting("defaultCurrency", e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary"
                >
                  <option value="ETB">ETB (Ethiopian Birr)</option>
                  <option value="USD">USD ($ United States Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="KES">KES (Kenyan Shilling)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Default Timezone</label>
                <select
                  value={settings.defaultTimezone}
                  onChange={(e) => updateSetting("defaultTimezone", e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary"
                >
                  <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (UTC+3)</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Default Language</label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => updateSetting("defaultLanguage", e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary"
                >
                  <option value="en">English (Global)</option>
                  <option value="am">Amharic (አማርኛ)</option>
                  <option value="om">Afaan Oromoo</option>
                  <option value="ti">Tigrinya (ትግርኛ)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          2. BUSINESS LISTING & MODERATION RULES
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "business" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-foreground text-sm">Listing Submission & Validation Parameters</h3>
              <p className="text-xs text-muted-foreground">Control limits, thresholds, and automated review safeguards.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Max Photos Per Listing</span>
                  <Badge variant="outline" className="font-mono text-primary font-bold">
                    {settings.maxPhotosPerListing} photos
                  </Badge>
                </div>
                <Slider
                  value={[settings.maxPhotosPerListing]}
                  min={5}
                  max={50}
                  step={5}
                  onValueChange={([val]) => updateSetting("maxPhotosPerListing", val)}
                  className="mt-2"
                />
                <p className="text-[11px] text-muted-foreground">Limits media uploads to prevent storage abuse.</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Verification Expiry Period</span>
                  <Badge variant="outline" className="font-mono text-primary font-bold">
                    {settings.verificationExpiryDays} days
                  </Badge>
                </div>
                <Slider
                  value={[settings.verificationExpiryDays]}
                  min={90}
                  max={730}
                  step={30}
                  onValueChange={([val]) => updateSetting("verificationExpiryDays", val)}
                  className="mt-2"
                />
                <p className="text-[11px] text-muted-foreground">Verified badges require owner renewal after this duration.</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Minimum Review Length</span>
                  <Badge variant="outline" className="font-mono text-primary font-bold">
                    {settings.minReviewLength} chars
                  </Badge>
                </div>
                <Slider
                  value={[settings.minReviewLength]}
                  min={10}
                  max={100}
                  step={5}
                  onValueChange={([val]) => updateSetting("minReviewLength", val)}
                  className="mt-2"
                />
                <p className="text-[11px] text-muted-foreground">Ensures reviews contain meaningful feedback.</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Featured Boost Duration</span>
                  <Badge variant="outline" className="font-mono text-primary font-bold">
                    {settings.featuredListingDurationDays} days
                  </Badge>
                </div>
                <Slider
                  value={[settings.featuredListingDurationDays]}
                  min={7}
                  max={90}
                  step={7}
                  onValueChange={([val]) => updateSetting("featuredListingDurationDays", val)}
                  className="mt-2"
                />
                <p className="text-[11px] text-muted-foreground">Standard promotional campaign duration.</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Automated Policies</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border">
                  <div>
                    <div className="font-bold text-foreground">Auto-Approve New Listings</div>
                    <div className="text-[11px] text-muted-foreground">Bypass manual moderation for new claims.</div>
                  </div>
                  <Switch
                    checked={settings.autoApproveListings}
                    onCheckedChange={(checked) => updateSetting("autoApproveListings", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border">
                  <div>
                    <div className="font-bold text-foreground">Profanity & Spam Filter</div>
                    <div className="text-[11px] text-muted-foreground">Auto-flag inappropriate content in reviews.</div>
                  </div>
                  <Switch
                    checked={settings.profanityFilter}
                    onCheckedChange={(checked) => updateSetting("profanityFilter", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border">
                  <div>
                    <div className="font-bold text-foreground">Allow Business Claiming</div>
                    <div className="text-[11px] text-muted-foreground">Enable owners to request verification badges.</div>
                  </div>
                  <Switch
                    checked={settings.allowUserClaiming}
                    onCheckedChange={(checked) => updateSetting("allowUserClaiming", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border">
                  <div>
                    <div className="font-bold text-foreground">Multi-Branch Management</div>
                    <div className="text-[11px] text-muted-foreground">Permit multiple physical branches per company.</div>
                  </div>
                  <Switch
                    checked={settings.maxBranchesPerBusiness > 0}
                    onCheckedChange={(checked) => updateSetting("maxBranchesPerBusiness", checked ? 15 : 1)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          3. SEARCH ENGINE & MAP DISCOVERY
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "search" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-foreground text-sm">Geospatial & Search Engine Tuning</h3>
              <p className="text-xs text-muted-foreground">Fine-tune the ranking algorithm and map cluster mechanics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Default Discovery Radius</span>
                  <Badge variant="outline" className="font-mono text-primary font-bold">
                    {settings.defaultRadiusKm} km
                  </Badge>
                </div>
                <Slider
                  value={[settings.defaultRadiusKm]}
                  min={5}
                  max={100}
                  step={5}
                  onValueChange={([val]) => updateSetting("defaultRadiusKm", val)}
                  className="mt-2"
                />
                <p className="text-[11px] text-muted-foreground">Default proximity range when GPS location is acquired.</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Featured Listing Boost Multiplier</span>
                  <Badge variant="outline" className="font-mono text-primary font-bold">
                    {settings.featuredBoostWeight}x
                  </Badge>
                </div>
                <Slider
                  value={[settings.featuredBoostWeight * 10]}
                  min={10}
                  max={30}
                  step={1}
                  onValueChange={([val]) => updateSetting("featuredBoostWeight", val / 10)}
                  className="mt-2"
                />
                <p className="text-[11px] text-muted-foreground">Weight applied to sponsored items in search ranking score.</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <label className="text-[11px] font-bold text-foreground">Map Tile Provider</label>
                <select
                  value={settings.mapTileProvider}
                  onChange={(e) => updateSetting("mapTileProvider", e.target.value as any)}
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-card border border-border text-xs focus:ring-2 focus:ring-primary font-semibold"
                >
                  <option value="osm">OpenStreetMap Standard (High Performance / CDN)</option>
                  <option value="carto">CartoDB Voyager (Ultra Sleek Minimalist)</option>
                  <option value="mapbox">Mapbox Streets (Vector High Density)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">Renders tiles across interactive listings and discovery maps.</p>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Autocomplete Character Trigger</span>
                  <Badge variant="outline" className="font-mono text-primary font-bold">
                    {settings.minCharsAutocomplete} chars
                  </Badge>
                </div>
                <Slider
                  value={[settings.minCharsAutocomplete]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([val]) => updateSetting("minCharsAutocomplete", val)}
                  className="mt-2"
                />
                <p className="text-[11px] text-muted-foreground">Minimum keystrokes before search predictions trigger.</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border text-xs">
              <div>
                <div className="font-bold text-foreground">Geofencing & Territory Filtering</div>
                <div className="text-[11px] text-muted-foreground">Strictly isolate city and regional searches to local bounds.</div>
              </div>
              <Switch
                checked={settings.enableGeofencing}
                onCheckedChange={(checked) => updateSetting("enableGeofencing", checked)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          4. SEO, OPENGRAPH & SOCIAL
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "seo" && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-foreground text-sm">Search Engine Optimization & Social Sharing</h3>
            <p className="text-xs text-muted-foreground">Manage automated meta tags, OpenGraph previews, and crawling directives.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-muted-foreground">Meta Title Template</label>
                <span className="text-[10px] text-muted-foreground font-mono">Available: &#123;business_name&#125;, &#123;city&#125;</span>
              </div>
              <Input
                value={settings.metaTitleTemplate}
                onChange={(e) => updateSetting("metaTitleTemplate", e.target.value)}
                className="mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground">Meta Description Template</label>
              <Textarea
                value={settings.metaDescriptionTemplate}
                onChange={(e) => updateSetting("metaDescriptionTemplate", e.target.value)}
                className="mt-1 font-mono text-xs"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Default OpenGraph Image URL</label>
                <Input
                  value={settings.ogImageUrl}
                  onChange={(e) => updateSetting("ogImageUrl", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Twitter / X Brand Handle</label>
                <Input
                  value={settings.twitterHandle}
                  onChange={(e) => updateSetting("twitterHandle", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
              <div>
                <div className="font-bold text-foreground">Robots & Search Engine Indexing</div>
                <div className="text-[11px] text-muted-foreground">Allow Google, Bing, and search crawlers to index listings.</div>
              </div>
              <Switch
                checked={settings.enableRobotsIndexing}
                onCheckedChange={(checked) => updateSetting("enableRobotsIndexing", checked)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          5. EMAIL & NOTIFICATION GATEWAY
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground text-sm">Transactional Messaging & Delivery</h3>
                <p className="text-xs text-muted-foreground">Configure automated email dispatches and verify delivery health.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTestEmailOpen(true)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5 text-primary" /> Test Email Dispatch
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
                <div>
                  <div className="font-bold text-foreground">Send Welcome Onboarding Email</div>
                  <div className="text-[11px] text-muted-foreground">Dispatched when new users or owners register.</div>
                </div>
                <Switch
                  checked={settings.sendWelcomeEmail}
                  onCheckedChange={(checked) => updateSetting("sendWelcomeEmail", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
                <div>
                  <div className="font-bold text-foreground">Business Approval Alerts</div>
                  <div className="text-[11px] text-muted-foreground">Notifies owners when verification is approved.</div>
                </div>
                <Switch
                  checked={settings.businessApprovalAlerts}
                  onCheckedChange={(checked) => updateSetting("businessApprovalAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
                <div>
                  <div className="font-bold text-foreground">Weekly Performance Digest</div>
                  <div className="text-[11px] text-muted-foreground">Weekly analytics summary to active owners.</div>
                </div>
                <Switch
                  checked={settings.weeklyDigest}
                  onCheckedChange={(checked) => updateSetting("weeklyDigest", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
                <div>
                  <div className="font-bold text-foreground">Promotional Campaign Emails</div>
                  <div className="text-[11px] text-muted-foreground">Marketing offers and seasonal promotions.</div>
                </div>
                <Switch
                  checked={settings.promotionalCampaigns}
                  onCheckedChange={(checked) => updateSetting("promotionalCampaigns", checked)}
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">SMTP Gateway Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">SMTP Relay Host</label>
                  <Input
                    value={settings.smtpHost}
                    onChange={(e) => updateSetting("smtpHost", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">SMTP Port</label>
                  <Input
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => updateSetting("smtpPort", Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Sender From Email</label>
                  <Input
                    value={settings.smtpSenderEmail}
                    onChange={(e) => updateSetting("smtpSenderEmail", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          6. PAYMENTS & GATEWAYS (SUPER ADMIN ONLY)
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "payments" && isSuperAdmin && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-foreground text-sm">Payment Gateways & Monetization</h3>
              <p className="text-xs text-muted-foreground">Configure payment channels (Telebirr, Chapa, Stripe) and commission rates.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Gateway Environment</span>
                  <Badge className={settings.paymentEnvironment === "production" ? "bg-emerald-500/10 text-emerald-600 font-bold" : "bg-amber-500/10 text-amber-600 font-bold"}>
                    {settings.paymentEnvironment.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={settings.paymentEnvironment === "sandbox" ? "default" : "outline"}
                    onClick={() => updateSetting("paymentEnvironment", "sandbox")}
                    className="text-xs flex-1"
                  >
                    Sandbox / Test
                  </Button>
                  <Button
                    size="sm"
                    variant={settings.paymentEnvironment === "production" ? "default" : "outline"}
                    onClick={() => updateSetting("paymentEnvironment", "production")}
                    className="text-xs flex-1"
                  >
                    Live Production
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Platform Commission Fee</span>
                  <Badge variant="outline" className="font-mono text-primary font-bold">
                    {settings.platformCommissionPercent}%
                  </Badge>
                </div>
                <Slider
                  value={[settings.platformCommissionPercent]}
                  min={0}
                  max={25}
                  step={0.5}
                  onValueChange={([val]) => updateSetting("platformCommissionPercent", val)}
                  className="mt-2"
                />
                <p className="text-[11px] text-muted-foreground">Fee deducted on sponsored listings and subscription bookings.</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3 text-xs">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Active Payment Channels</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-foreground">Telebirr (Ethio Telecom)</div>
                    <div className="text-[11px] text-muted-foreground">USSD & Mobile App checkout</div>
                  </div>
                  <Switch
                    checked={settings.telebirrEnabled}
                    onCheckedChange={(checked) => updateSetting("telebirrEnabled", checked)}
                  />
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-foreground">Chapa Payments</div>
                    <div className="text-[11px] text-muted-foreground">Local cards & CBE Birr</div>
                  </div>
                  <Switch
                    checked={settings.chapaEnabled}
                    onCheckedChange={(checked) => updateSetting("chapaEnabled", checked)}
                  />
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-foreground">Stripe International</div>
                    <div className="text-[11px] text-muted-foreground">Global Visa / Mastercard / Amex</div>
                  </div>
                  <Switch
                    checked={settings.stripeEnabled}
                    onCheckedChange={(checked) => updateSetting("stripeEnabled", checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          7. SECURITY & ACCESS (SUPER ADMIN ONLY)
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "security" && isSuperAdmin && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-foreground text-sm">Security, Auth & Session Lockdown</h3>
              <p className="text-xs text-muted-foreground">System-wide security enforcement, timeout limits, and emergency maintenance.</p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Emergency Maintenance Mode
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    When active, public visitors see a maintenance screen. Only authenticated admins can log in.
                  </div>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
                />
              </div>

              {settings.maintenanceMode && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-bold text-muted-foreground">Maintenance Notice Message</label>
                  <Input
                    value={settings.maintenanceNotice}
                    onChange={(e) => updateSetting("maintenanceNotice", e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
                <div>
                  <div className="font-bold text-foreground">Enforce 2FA for Administrators</div>
                  <div className="text-[11px] text-muted-foreground">Requires OTP for all admin and staff accounts.</div>
                </div>
                <Switch
                  checked={settings.require2FAForAdmins}
                  onCheckedChange={(checked) => updateSetting("require2FAForAdmins", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
                <div>
                  <div className="font-bold text-foreground">API Rate Limiting & DDoS Shield</div>
                  <div className="text-[11px] text-muted-foreground">Throttles abusive client IP requests.</div>
                </div>
                <Switch
                  checked={settings.enableRateLimiting}
                  onCheckedChange={(checked) => updateSetting("enableRateLimiting", checked)}
                />
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Admin Session Timeout</span>
                  <Badge variant="outline" className="font-mono text-primary font-bold">
                    {settings.sessionTimeoutMinutes} mins
                  </Badge>
                </div>
                <Slider
                  value={[settings.sessionTimeoutMinutes]}
                  min={15}
                  max={480}
                  step={15}
                  onValueChange={([val]) => updateSetting("sessionTimeoutMinutes", val)}
                  className="mt-2"
                />
              </div>

              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Max Failed Login Attempts</span>
                  <Badge variant="outline" className="font-mono text-primary font-bold">
                    {settings.maxFailedLoginAttempts} attempts
                  </Badge>
                </div>
                <Slider
                  value={[settings.maxFailedLoginAttempts]}
                  min={3}
                  max={10}
                  step={1}
                  onValueChange={([val]) => updateSetting("maxFailedLoginAttempts", val)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          8. MAINTENANCE & BACKUPS (SUPER ADMIN ONLY)
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "maintenance" && isSuperAdmin && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-foreground text-sm">System Operations & Maintenance Workstation</h3>
            <p className="text-xs text-muted-foreground">Execute cache flushes, download configurations, or reset baseline.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-background border border-border space-y-3 flex flex-col justify-between">
              <div>
                <Zap className="w-5 h-5 text-amber-500 mb-2" />
                <h4 className="font-bold text-sm text-foreground">Flush System Cache</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Purges global CDN, Next.js incremental ISR cache, and memory state.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handlePurgeCache} className="w-full text-xs font-semibold">
                Purge Cache
              </Button>
            </div>

            <div className="p-5 rounded-2xl bg-background border border-border space-y-3 flex flex-col justify-between">
              <div>
                <Download className="w-5 h-5 text-sky-500 mb-2" />
                <h4 className="font-bold text-sm text-foreground">Export Configuration</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Download a complete timestamped JSON dump of all platform settings.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleExportConfig} className="w-full text-xs font-semibold">
                Export JSON
              </Button>
            </div>

            <div className="p-5 rounded-2xl bg-background border border-rose-500/20 space-y-3 flex flex-col justify-between">
              <div>
                <RotateCcw className="w-5 h-5 text-rose-500 mb-2" />
                <h4 className="font-bold text-sm text-foreground">Factory Reset</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Revert all platform parameters to their original seed defaults.
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setIsResetModalOpen(true)}
                className="w-full text-xs font-bold"
              >
                Reset Defaults
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Floating Unsaved Changes Bar ───────────────────────────────────── */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3.5 rounded-2xl bg-card/95 border border-primary/40 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-xs font-bold text-foreground">You have unsaved changes</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDiscard}
              disabled={isSaving}
              className="text-xs font-semibold h-8"
            >
              Discard
            </Button>
            <Button
              size="sm"
              variant="gradient"
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs font-bold h-8 gap-1.5"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* ─── Test Email Modal ───────────────────────────────────────────────── */}
      {isTestEmailOpen && (
        <Dialog open={isTestEmailOpen} onOpenChange={setIsTestEmailOpen}>
          <DialogContent className="max-w-md">
            <DialogTitle>Send Test Transactional Email</DialogTitle>
            <DialogDescription>
              Verify that the platform SMTP relay and notification pipeline are actively delivering.
            </DialogDescription>
            <div className="space-y-3 py-2 text-xs">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Recipient Email Address</label>
                <Input
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="mt-1"
                  placeholder="name@example.com"
                />
              </div>
              <div className="p-3 rounded-xl bg-muted/40 text-[11px] text-muted-foreground">
                Relay: <span className="font-mono text-foreground">{settings.smtpHost}:{settings.smtpPort}</span>
                <br />
                From: <span className="font-mono text-foreground">{settings.smtpSenderEmail}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsTestEmailOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleSendTestEmail}
                disabled={isSendingEmail}
                className="gap-1.5"
              >
                {isSendingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── Reset Defaults Modal ───────────────────────────────────────────── */}
      {isResetModalOpen && (
        <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
          <DialogContent className="max-w-md">
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" /> Reset to Factory Baseline?
            </DialogTitle>
            <DialogDescription>
              This will overwrite all customized settings (currencies, search rules, SEO, and email config) back to
              original defaults. This cannot be undone.
            </DialogDescription>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetDefaults}
                disabled={isResetting}
                className="gap-1.5"
              >
                {isResetting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Yes, Reset All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
