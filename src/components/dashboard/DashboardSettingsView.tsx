"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Globe,
  Bell,
  Lock,
  Users,
  Share2,
  AlertTriangle,
  Save,
  CheckCircle2,
  RefreshCw,
  Trash2,
  UserPlus,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Download,
  Key,
  PauseCircle,
  PlayCircle,
  MessageSquare,
  Mail,
  Phone,
  Sparkles,
  Laptop,
  Camera,
  Upload,
  Send,
  Check,
  Copy,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Business } from "@/types/business";
import { toast } from "sonner";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Manager" | "Staff" | "Editor" | "Billing";
  avatarUrl?: string;
  status: "active" | "invited";
  joinedAt: string;
}

export interface SessionItem {
  id: string;
  device: string;
  ip: string;
  location: string;
  current: boolean;
  lastActive: string;
}

export interface UserSettingsPayload {
  profile: {
    name: string;
    email: string;
    phone: string;
    jobTitle: string;
    avatarUrl: string;
    role: string;
  };
  localization: {
    defaultCurrency: string;
    supportedCurrencies: string[];
    timezone: string;
    language: string;
    dateFormat: string;
    firstDayOfWeek: string;
  };
  notifications: {
    emailReviewAlerts: boolean;
    emailInquiryAlerts: boolean;
    emailTicketAlerts: boolean;
    weeklyPerformanceDigest: boolean;
    smsUrgentAlerts: boolean;
    marketingPromotions: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    passwordLastChanged: string;
    sessions: SessionItem[];
  };
  teamMembers: TeamMember[];
  integrations: {
    googleBusinessSync: boolean;
    whatsappHotline: string;
    telegramAlerts: boolean;
    webhookUrl: string;
  };
  isListingPaused: boolean;
}

const DEFAULT_USER_SETTINGS: UserSettingsPayload = {
  profile: {
    name: "Dawit Solomon",
    email: "owner@bizfinder.et",
    phone: "+251 91 123 4567",
    jobTitle: "Managing Director & Founder",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "owner",
  },
  localization: {
    defaultCurrency: "ETB",
    supportedCurrencies: ["ETB", "USD", "EUR"],
    timezone: "Africa/Addis_Ababa (UTC+3)",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    firstDayOfWeek: "Monday",
  },
  notifications: {
    emailReviewAlerts: true,
    emailInquiryAlerts: true,
    emailTicketAlerts: true,
    weeklyPerformanceDigest: true,
    smsUrgentAlerts: true,
    marketingPromotions: false,
  },
  security: {
    twoFactorEnabled: true,
    passwordLastChanged: "3 months ago",
    sessions: [
      {
        id: "sess-curr",
        device: "Chrome on Windows 11",
        ip: "197.156.104.22",
        location: "Addis Ababa, Ethiopia",
        current: true,
        lastActive: "Active Now",
      },
      {
        id: "sess-2",
        device: "Safari on iPhone 15 Pro",
        ip: "197.156.104.88",
        location: "Addis Ababa, Ethiopia",
        current: false,
        lastActive: "2 hours ago",
      },
    ],
  },
  teamMembers: [
    {
      id: "tm-1",
      name: "Solomon Tadesse",
      email: "solomon@bizfinder.et",
      role: "Manager",
      status: "active",
      joinedAt: "Jan 15, 2024",
    },
    {
      id: "tm-2",
      name: "Bethlehem Alemu",
      email: "bethlehem@bizfinder.et",
      role: "Editor",
      status: "active",
      joinedAt: "Feb 02, 2024",
    },
  ],
  integrations: {
    googleBusinessSync: true,
    whatsappHotline: "+251 91 123 4567",
    telegramAlerts: true,
    webhookUrl: "https://api.mycrm.com/hooks/bizfinder-leads",
  },
  isListingPaused: false,
};

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
];

interface DashboardSettingsViewProps {
  business?: Business;
  onBusinessUpdated?: (updated: Business) => void;
}

export function DashboardSettingsView({ business, onBusinessUpdated }: DashboardSettingsViewProps = {}) {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [data, setData] = useState<UserSettingsPayload>(DEFAULT_USER_SETTINGS);
  const [initialData, setInitialData] = useState<UserSettingsPayload>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteName, setInviteName] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<"Manager" | "Staff" | "Editor" | "Billing">("Staff");
  const [isInviting, setIsInviting] = useState<boolean>(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [currPassword, setCurrPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  const [is2FAModalOpen, setIs2FAModalOpen] = useState<boolean>(false);
  const [twoFactorStep, setTwoFactorStep] = useState<"intro" | "verify">("intro");
  const [twoFactorCode, setTwoFactorCode] = useState<string>("");

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>("");
  const [isAvatarUploading, setIsAvatarUploading] = useState<boolean>(false);
  const avatarFileRef = useRef<HTMLInputElement | null>(null);

  const [isTestingWebhook, setIsTestingWebhook] = useState<boolean>(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ status: number; message: string } | null>(null);

  // Load from API
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/settings");
      if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return;
      const json = await res.json();
      if (json?.settings) {
        setData(json.settings);
        setInitialData(json.settings);
      }
    } catch (err) {
      console.error("Failed to load user settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Update helper
  const updateSection = <K extends keyof UserSettingsPayload>(
    section: K,
    updates: Partial<UserSettingsPayload[K]>
  ) => {
    setData((prev) => {
      const updated = {
        ...prev,
        [section]:
          typeof prev[section] === "object" && !Array.isArray(prev[section])
            ? { ...prev[section], ...updates }
            : updates,
      };
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(initialData));
      return updated;
    });
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: data.profile,
          localization: data.localization,
          notifications: data.notifications,
          integrations: data.integrations,
          security: data.security,
          teamMembers: data.teamMembers,
          isListingPaused: data.isListingPaused,
        }),
      });
      if (!res.ok) return;
      const resJson = res.headers.get("content-type")?.includes("application/json") ? await res.json().catch(() => ({})) : {};
      if (res.ok) {
        setInitialData(data);
        setHasChanges(false);
        toast.success("Account settings saved successfully!");

        // If parent passed business update handler and phone was updated, sync hotline
        if (business && onBusinessUpdated && data.profile.phone) {
          onBusinessUpdated({
            ...business,
            telephone: data.profile.phone,
            mobile: data.profile.phone,
          });
        }
      } else {
        toast.error(resJson?.error || "Failed to save settings.");
      }
    } catch {
      toast.error("Network error while saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setData(initialData);
    setHasChanges(false);
    toast.info("Changes discarded.");
  };

  // 2FA Toggle Action
  const handleToggle2FA = async () => {
    const nextState = !data.security.twoFactorEnabled;
    try {
      const res = await fetch("/api/users/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_2fa", payload: { enabled: nextState } }),
      });
      const json = await res.json();
      if (res.ok) {
        updateSection("security", { twoFactorEnabled: nextState });
        setIs2FAModalOpen(false);
        setTwoFactorStep("intro");
        setTwoFactorCode("");
        toast.success(json.message);
      }
    } catch {
      toast.error("Failed to update 2FA status.");
    }
  };

  // Revoke other sessions
  const handleRevokeSessions = async () => {
    try {
      const res = await fetch("/api/users/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_sessions" }),
      });
      const json = await res.json();
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          security: {
            ...prev.security,
            sessions: prev.security.sessions.filter((s) => s.current),
          },
        }));
        toast.success(json.message);
      }
    } catch {
      toast.error("Failed to revoke sessions.");
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/users/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_password", payload: { newPassword } }),
      });
      const json = await res.json();
      if (res.ok) {
        updateSection("security", { passwordLastChanged: "Just now" });
        toast.success(json.message);
        setIsPasswordModalOpen(false);
        setCurrPassword("");
        setNewPassword("");
      }
    } catch {
      toast.error("Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Invite team member
  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsInviting(true);
    try {
      const res = await fetch("/api/users/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite_team_member",
          payload: { name: inviteName.trim() || "Colleague", email: inviteEmail.trim(), role: inviteRole },
        }),
      });
      const json = await res.json();
      if (res.ok && json.teamMember) {
        setData((prev) => ({
          ...prev,
          teamMembers: [...prev.teamMembers, json.teamMember],
        }));
        setIsInviteModalOpen(false);
        setInviteEmail("");
        setInviteName("");
        toast.success(json.message);
      }
    } catch {
      toast.error("Failed to invite team member.");
    } finally {
      setIsInviting(false);
    }
  };

  // Remove team member
  const handleRemoveMember = async (id: string) => {
    try {
      const res = await fetch("/api/users/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove_team_member", payload: { id } }),
      });
      const json = await res.json();
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          teamMembers: prev.teamMembers.filter((m) => m.id !== id),
        }));
        toast.success(json.message);
      }
    } catch {
      toast.error("Failed to remove team member.");
    }
  };

  // Toggle pause listing
  const handleTogglePause = async () => {
    try {
      const res = await fetch("/api/users/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_pause_listing" }),
      });
      const json = await res.json();
      if (res.ok) {
        setData((prev) => ({ ...prev, isListingPaused: json.isListingPaused }));
        if (business && onBusinessUpdated) {
          onBusinessUpdated({
            ...business,
            status: json.isListingPaused ? ("inactive" as any) : ("active" as any),
          });
        }
        toast.success(json.message);
      }
    } catch {
      toast.error("Failed to update listing status.");
    }
  };

  // Test Webhook
  const handleTestWebhook = async () => {
    const url = data.integrations.webhookUrl;
    if (!url || !url.startsWith("http")) {
      toast.error("Please enter a valid HTTP/HTTPS Webhook URL first.");
      return;
    }

    setIsTestingWebhook(true);
    setWebhookTestResult(null);
    try {
      const res = await fetch("/api/users/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_webhook",
          payload: { webhookUrl: url },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setWebhookTestResult({ status: json.status || 200, message: json.message });
        toast.success(json.message);
      } else {
        toast.error(json.error || "Webhook test failed");
      }
    } catch (err) {
      toast.error("Failed to connect to webhook endpoint.");
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Export business data
  const handleExportData = async () => {
    try {
      const res = await fetch("/api/users/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export_business_data" }),
      });
      const json = await res.json();
      if (res.ok) {
        const payload = {
          exportDate: new Date().toISOString(),
          business: business || { name: "Addis Premier Business" },
          settings: data,
        };
        const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
        const a = document.createElement("a");
        a.href = jsonStr;
        a.download = `bizfinder_account_data_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success("Account & business data archive downloaded!");
      }
    } catch {
      toast.error("Export failed.");
    }
  };

  // Avatar file upload
  const handleAvatarFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    setIsAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) return;
      const json = res.headers.get("content-type")?.includes("application/json") ? await res.json().catch(() => ({})) : {};

      if (res.ok && json.url) {
        updateSection("profile", { avatarUrl: json.url });
        setIsAvatarModalOpen(false);
        toast.success("Avatar updated!");
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          updateSection("profile", { avatarUrl: base64 });
          setIsAvatarModalOpen(false);
          toast.success("Avatar updated from file!");
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        updateSection("profile", { avatarUrl: base64 });
        setIsAvatarModalOpen(false);
        toast.success("Avatar updated!");
      };
      reader.readAsDataURL(file);
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const navItems = [
    { key: "profile", label: "Profile & Account", icon: User },
    { key: "localization", label: "Preferences", icon: Globe },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "security", label: "Security & Login", icon: Lock },
    { key: "team", label: "Team Members", icon: Users },
    { key: "integrations", label: "Integrations", icon: Share2 },
    { key: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Loading account settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-foreground">Business &amp; Account Settings</h2>
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
              Verified Owner
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your owner credentials, operating preferences, team permissions, and security.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              disabled={isSaving}
              className="text-xs font-bold h-8"
            >
              Discard
            </Button>
          )}

          <Button
            variant="gradient"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="gap-1.5 text-xs font-bold h-8 shadow-md shadow-primary/20"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Listing Paused Alert */}
      {data.isListingPaused && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>
              <strong>LISTING PAUSED:</strong> Your business listing is temporarily hidden from public searches and discovery.
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={handleTogglePause} className="text-xs font-bold shrink-0">
            Resume Listing
          </Button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-card/80 backdrop-blur border border-border rounded-2xl shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          const isDanger = item.key === "danger";

          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? isDanger
                    ? "bg-rose-500 text-white shadow-md"
                    : "bg-primary text-primary-foreground shadow-md"
                  : isDanger
                  ? "text-rose-500 hover:bg-rose-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 1. PROFILE & ACCOUNT ───────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-border">
              <div className="relative group">
                <img
                  src={data.profile.avatarUrl}
                  alt={data.profile.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary/30 shadow-md group-hover:opacity-90 transition-opacity"
                />
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-110 transition-transform"
                  title="Change profile avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="font-bold text-lg text-foreground">{data.profile.name}</div>
                <div className="text-xs text-muted-foreground">{data.profile.email}</div>
                <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold">
                    Role: {data.profile.role}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 font-bold border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    2FA {data.security.twoFactorEnabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-xs font-bold gap-1.5 h-8"
              >
                <Camera className="w-3.5 h-3.5 text-primary" />
                Customize Avatar
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">Owner Full Name</label>
                <Input
                  value={data.profile.name}
                  onChange={(e) => updateSection("profile", { name: e.target.value })}
                  placeholder="e.g. Dawit Solomon"
                  className="h-9"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">Email Address</label>
                <Input
                  value={data.profile.email}
                  onChange={(e) => updateSection("profile", { email: e.target.value })}
                  placeholder="owner@example.com"
                  className="h-9"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">Phone Number</label>
                <Input
                  value={data.profile.phone}
                  onChange={(e) => updateSection("profile", { phone: e.target.value })}
                  placeholder="+251 91 123 4567"
                  className="h-9"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">Job Title / Role in Business</label>
                <Input
                  value={data.profile.jobTitle}
                  onChange={(e) => updateSection("profile", { jobTitle: e.target.value })}
                  placeholder="e.g. Managing Director & Founder"
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. LOCALIZATION & PREFERENCES ──────────────────────────────────── */}
      {activeTab === "localization" && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-foreground text-sm">Business Operations &amp; Locale Preferences</h3>
            <p className="text-xs text-muted-foreground">Set how monetary values, dates, and times display on your dashboard.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">Operating Currency</label>
              <select
                value={data.localization.defaultCurrency}
                onChange={(e) => updateSection("localization", { defaultCurrency: e.target.value })}
                className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary font-semibold"
              >
                <option value="ETB">ETB (Ethiopian Birr)</option>
                <option value="USD">USD ($ United States Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">Timezone</label>
              <select
                value={data.localization.timezone}
                onChange={(e) => updateSection("localization", { timezone: e.target.value })}
                className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary font-semibold"
              >
                <option value="Africa/Addis_Ababa (UTC+3)">Africa/Addis_Ababa (UTC+3)</option>
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">Date Format</label>
              <select
                value={data.localization.dateFormat}
                onChange={(e) => updateSection("localization", { dateFormat: e.target.value })}
                className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary font-semibold"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 16/09/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/16/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">First Day of the Week</label>
              <select
                value={data.localization.firstDayOfWeek}
                onChange={(e) => updateSection("localization", { firstDayOfWeek: e.target.value })}
                className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary font-semibold"
              >
                <option value="Monday">Monday (Standard)</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. NOTIFICATIONS ───────────────────────────────────────────────── */}
      {activeTab === "notifications" && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-foreground text-sm">Alerts &amp; Messaging Preferences</h3>
            <p className="text-xs text-muted-foreground">Decide how and when BizFinder notifies you regarding customer activity.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
              <div>
                <div className="font-bold text-foreground">New Review Alerts</div>
                <div className="text-[11px] text-muted-foreground">Immediate email when customers leave feedback.</div>
              </div>
              <Switch
                checked={data.notifications.emailReviewAlerts}
                onCheckedChange={(c) => updateSection("notifications", { emailReviewAlerts: c })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
              <div>
                <div className="font-bold text-foreground">Customer Leads &amp; Inquiries</div>
                <div className="text-[11px] text-muted-foreground">Instant notifications for calls and chats.</div>
              </div>
              <Switch
                checked={data.notifications.emailInquiryAlerts}
                onCheckedChange={(c) => updateSection("notifications", { emailInquiryAlerts: c })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
              <div>
                <div className="font-bold text-foreground">Support Ticket Updates</div>
                <div className="text-[11px] text-muted-foreground">Replies to administrative inquiries.</div>
              </div>
              <Switch
                checked={data.notifications.emailTicketAlerts}
                onCheckedChange={(c) => updateSection("notifications", { emailTicketAlerts: c })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
              <div>
                <div className="font-bold text-foreground">Weekly Performance Digest</div>
                <div className="text-[11px] text-muted-foreground">Weekly email with views and click metrics.</div>
              </div>
              <Switch
                checked={data.notifications.weeklyPerformanceDigest}
                onCheckedChange={(c) => updateSection("notifications", { weeklyPerformanceDigest: c })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
              <div>
                <div className="font-bold text-foreground">Urgent SMS Alerts</div>
                <div className="text-[11px] text-muted-foreground">SMS alerts for critical business updates.</div>
              </div>
              <Switch
                checked={data.notifications.smsUrgentAlerts}
                onCheckedChange={(c) => updateSection("notifications", { smsUrgentAlerts: c })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
              <div>
                <div className="font-bold text-foreground">Promotions &amp; Growth Tips</div>
                <div className="text-[11px] text-muted-foreground">Exclusive opportunities for business promotion.</div>
              </div>
              <Switch
                checked={data.notifications.marketingPromotions}
                onCheckedChange={(c) => updateSection("notifications", { marketingPromotions: c })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. SECURITY & LOGIN ────────────────────────────────────────────── */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-foreground text-sm">Security &amp; Multi-Factor Authentication</h3>
              <p className="text-xs text-muted-foreground">Keep your account protected with modern 2FA and active session tracking.</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-background border border-border gap-3 text-xs">
              <div>
                <div className="font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Two-Factor Authentication (2FA)
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Protect your business account with SMS OTP or an Authenticator App (Google Authenticator / 1Password).
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={data.security.twoFactorEnabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}>
                  {data.security.twoFactorEnabled ? "Enabled" : "Disabled"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTwoFactorStep("intro");
                    setIs2FAModalOpen(true);
                  }}
                  className="text-xs font-semibold h-8"
                >
                  {data.security.twoFactorEnabled ? "Configure" : "Enable 2FA"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-background border border-border gap-3 text-xs">
              <div>
                <div className="font-bold text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  Account Password
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Last updated {data.security.passwordLastChanged}. Use a strong, unique passphrase.
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-xs font-semibold h-8"
              >
                Change Password
              </Button>
            </div>

            {/* Active Sessions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Active Device Sessions</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRevokeSessions}
                  className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-8 font-bold"
                >
                  Revoke Other Sessions
                </Button>
              </div>

              <div className="space-y-2">
                {data.security.sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-2">
                          {sess.device}
                          {sess.current && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">Current Session</Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {sess.location} • IP: {sess.ip}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">{sess.lastActive}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. TEAM & STAFF ACCESS ─────────────────────────────────────────── */}
      {activeTab === "team" && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-foreground text-sm">Team &amp; Staff Access Control</h3>
              <p className="text-xs text-muted-foreground">Invite managers or editors to assist in managing your listing and replying to reviews.</p>
            </div>
            <Button
              size="sm"
              variant="gradient"
              onClick={() => setIsInviteModalOpen(true)}
              className="gap-1.5 text-xs font-bold shrink-0 h-8 shadow-md"
            >
              <UserPlus className="w-3.5 h-3.5" /> Invite Team Member
            </Button>
          </div>

          <div className="space-y-3">
            {data.teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-2">
                      {member.name}
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {member.role}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{member.email} • Joined {member.joinedAt}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      member.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 text-[10px] font-bold"
                        : "bg-amber-500/10 text-amber-600 text-[10px] font-bold"
                    }
                  >
                    {member.status.toUpperCase()}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveMember(member.id)}
                    className="w-7 h-7 text-muted-foreground hover:text-rose-500 rounded-lg"
                    title="Remove Access"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 6. INTEGRATIONS & WEBHOOKS ──────────────────────────────────────── */}
      {activeTab === "integrations" && (
        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-foreground text-sm">Connected Channels &amp; Automation</h3>
            <p className="text-xs text-muted-foreground">Sync your business profile across third-party tools and messaging platforms.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between">
              <div>
                <div className="font-bold text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-500" />
                  Google Business Profile Sync
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Synchronize operating hours, address, and primary photos automatically with Google Maps.
                </div>
              </div>
              <Switch
                checked={data.integrations.googleBusinessSync}
                onCheckedChange={(c) => updateSection("integrations", { googleBusinessSync: c })}
              />
            </div>

            <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    WhatsApp Business Hotline
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Allow visitors on your listing to initiate a 1-tap WhatsApp consultation.
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const cleanPhone = data.integrations.whatsappHotline.replace(/[^0-9]/g, "");
                    window.open(`https://wa.me/${cleanPhone}`, "_blank");
                  }}
                  className="text-xs font-semibold gap-1 h-7"
                >
                  <ExternalLink className="w-3 h-3" /> Test Chat
                </Button>
              </div>
              <Input
                value={data.integrations.whatsappHotline}
                onChange={(e) => updateSection("integrations", { whatsappHotline: e.target.value })}
                placeholder="+251 91 123 4567"
                className="h-9"
              />
            </div>

            <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Real-Time Lead Webhook URL
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Post customer inquiries, bookings, and review events directly to your CRM.
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook || !data.integrations.webhookUrl}
                  className="text-xs font-bold gap-1.5 h-7"
                >
                  {isTestingWebhook ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 text-purple-500" />}
                  Test Webhook Ping
                </Button>
              </div>
              <Input
                value={data.integrations.webhookUrl}
                onChange={(e) => updateSection("integrations", { webhookUrl: e.target.value })}
                placeholder="https://yourcrm.com/api/webhooks/bizfinder"
                className="font-mono text-xs h-9"
              />
              {webhookTestResult && (
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs flex items-center gap-2 text-foreground font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{webhookTestResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. DANGER ZONE ─────────────────────────────────────────────────── */}
      {activeTab === "danger" && (
        <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/30 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-rose-600 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Danger Zone &amp; Data Archive
            </h3>
            <p className="text-xs text-muted-foreground">Irreversible account operations and visibility controls.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-foreground">Pause Public Business Listing</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Temporarily hide your business from search results without losing your reviews or claimed status.
                </div>
              </div>
              <Button
                size="sm"
                variant={data.isListingPaused ? "default" : "outline"}
                onClick={handleTogglePause}
                className="text-xs font-bold shrink-0 h-8"
              >
                {data.isListingPaused ? "Resume Listing" : "Pause Listing"}
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-foreground">Export All Business Data</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Download a complete backup archive containing your listing details, photos, reviews, and analytics.
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportData}
                className="gap-1.5 text-xs font-bold shrink-0 h-8"
              >
                <Download className="w-3.5 h-3.5 text-primary" /> Download JSON Archive
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-rose-700 dark:text-rose-400">Request Account Deletion</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Permanently erase your business profile, staff accounts, and claims from BizFinder.
                </div>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => toast.info("Deletion request sent to administrator for review.")}
                className="text-xs font-bold shrink-0 h-8"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Unsaved Changes Bar */}
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
              className="text-xs font-bold h-8 gap-1.5 shadow-md shadow-primary/20"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* ─── MODAL: Customize Avatar Studio ──────────────────────────────────── */}
      {isAvatarModalOpen && (
        <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
          <DialogContent className="max-w-md p-6 bg-card border-border rounded-3xl space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Customize Profile Avatar
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Choose a professional preset or upload a high-resolution portrait for your owner profile.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              {/* Dropzone File Upload */}
              <div
                onClick={() => avatarFileRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-4 text-center cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <input
                  ref={avatarFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleAvatarFileUpload(e.target.files[0])}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <Upload className="w-5 h-5 text-primary" />
                  <span className="font-bold text-foreground">
                    {isAvatarUploading ? "Uploading photo..." : "Upload photo from device"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">PNG, JPG, or WebP</span>
                </div>
              </div>

              {/* Presets Grid */}
              <div>
                <label className="font-bold text-muted-foreground block mb-2">Or Select Professional Preset</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        updateSection("profile", { avatarUrl: url });
                        setIsAvatarModalOpen(false);
                        toast.success("Avatar preset applied!");
                      }}
                      className={`relative rounded-full overflow-hidden aspect-square border-2 transition-transform hover:scale-105 ${
                        data.profile.avatarUrl === url ? "border-primary ring-2 ring-primary" : "border-border"
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom URL Input */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-muted-foreground block">Or Image URL</label>
                <div className="flex gap-2">
                  <Input
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!customAvatarUrl.trim()}
                    onClick={() => {
                      updateSection("profile", { avatarUrl: customAvatarUrl.trim() });
                      setIsAvatarModalOpen(false);
                      setCustomAvatarUrl("");
                      toast.success("Custom avatar applied!");
                    }}
                    className="text-xs h-8 font-bold"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsAvatarModalOpen(false)} className="text-xs">
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── MODAL: Invite Team Member ───────────────────────────────────────── */}
      {isInviteModalOpen && (
        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogContent className="max-w-md p-6 bg-card border-border rounded-3xl space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Invite Team Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Grant trusted staff members access to manage your business profile and reply to reviews.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1 text-xs">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">Full Name</label>
                <Input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Almaz Bekele"
                  className="h-9"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">Work Email Address</label>
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="almaz@example.com"
                  className="h-9"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">Role Permission</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary font-semibold"
                >
                  <option value="Manager">Manager (Full listing &amp; review management)</option>
                  <option value="Editor">Editor (Edit hours, photos &amp; replies)</option>
                  <option value="Staff">Staff (View leads &amp; reply to reviews)</option>
                  <option value="Billing">Billing (Invoices &amp; payment receipts)</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsInviteModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleInviteMember}
                disabled={isInviting}
                className="gap-1.5 text-xs font-bold shadow-md"
              >
                {isInviting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── MODAL: Change Password ─────────────────────────────────────────── */}
      {isPasswordModalOpen && (
        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
          <DialogContent className="max-w-md p-6 bg-card border-border rounded-3xl space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                Update Password
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter your current password followed by your new password.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1 text-xs">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">Current Password</label>
                <Input
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  className="h-9"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">New Password (min. 8 characters)</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleChangePassword}
                disabled={isUpdatingPassword}
                className="gap-1.5 text-xs font-bold shadow-md"
              >
                {isUpdatingPassword && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Update Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── MODAL: 2FA Interactive Setup ───────────────────────────────────── */}
      {is2FAModalOpen && (
        <Dialog open={is2FAModalOpen} onOpenChange={setIs2FAModalOpen}>
          <DialogContent className="max-w-md p-6 bg-card border-border rounded-3xl space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-black text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Two-Factor Authentication Setup
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {data.security.twoFactorEnabled
                  ? "Two-Factor Authentication is currently active on your account."
                  : "Scan the QR code with Google Authenticator or 1Password to activate 2FA."}
              </DialogDescription>
            </DialogHeader>

            {!data.security.twoFactorEnabled ? (
              <div className="space-y-4 py-1 text-xs">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col items-center text-center space-y-2">
                  <div className="w-28 h-28 rounded-xl bg-white p-2 border border-border flex items-center justify-center shadow-inner">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground select-all bg-background px-2.5 py-1 rounded-lg border border-border">
                    BIZF-7749-2180-SECURE
                  </div>
                  <span className="text-[10px] text-muted-foreground">Scan with any standard TOTP authenticator app</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground block">Enter 6-digit confirmation code</label>
                  <Input
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="font-mono text-center tracking-widest text-sm h-10"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  2FA Active on Account
                </div>
                <p className="text-[11px] opacity-90">
                  Every new login on an unrecognized device requires a 6-digit one-time code.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIs2FAModalOpen(false)} className="text-xs">
                Close
              </Button>
              <Button
                variant={data.security.twoFactorEnabled ? "destructive" : "gradient"}
                size="sm"
                onClick={handleToggle2FA}
                className="text-xs font-bold"
              >
                {data.security.twoFactorEnabled ? "Disable 2FA" : "Confirm & Enable 2FA"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
